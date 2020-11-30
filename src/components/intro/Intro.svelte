<script lang='ts'>
    import { onMount, setContext } from 'svelte'
    import ChartMoving from './ChartMoving.svelte'
    import ChartStatic from './ChartStatic.svelte'
    import * as d3 from 'd3'
    import { episodes as allEpisodes, likeRatio } from '@lib/utils'
    import { writable } from 'svelte/store'
    import { COLORS } from '@lib/constants'
    import { Spacer } from '@ollopa/cedar'

    const episodes = allEpisodes.filter(({ main }) => main)
    // 90 days
    const DATE_WINDOW = 90 * (24 * 60 * 60 * 1000)
    const transitionDuration = 5000
    const intersecting = writable(false)
    const [minDate, maxDate] = d3.extent(episodes, d => d.published)
    const settings = { 
        likeColorGradient, 
        likeRatioColor: COLORS.green,
        viewsColor: '#9486F2',
    }

	setContext('intersectionObserver', { intersecting })    
	setContext('settings', settings)    

    let element: HTMLElement
    let interval    
    let start = new Date(2018, 1, 1)
    let end = new Date(start.getTime() + DATE_WINDOW)
    let previousStart = start
    let previousEnd = end
    let firstLoad = true

    function likeColorGradient (svg, y) {
        svg.append('linearGradient')
            .attr('id', 'like-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('y1', y(d3.min(episodes, d => likeRatio(d.id))))
            .attr('x2', 0)
            .attr('y2', y(1))
            .selectAll('stop')
            .data([
                    { offset: '30%', color: COLORS.red }, 
                    { offset: '60%', color: '#FFC27B' }, 
                    { offset: '100%', color: COLORS.green }
            ])
            .enter()
            .append('stop')
            .attr('offset', (d) => d.offset)
            .attr('stop-color', (d) => d.color)
    }    

    const incrementDates = () => {
        previousStart = start
        previousEnd = end
        start.setDate(start.getDate() + 15)
        end = new Date(start.getTime() + DATE_WINDOW)

        if (end > maxDate) {
            start = minDate
            end = new Date(start.getTime() + DATE_WINDOW)
        }
    }      

    const formatDateForExplanation = (..._) => {
        const d = new Date(start.getTime() + (DATE_WINDOW / 2))
        const month = d.toLocaleString('default', { month: 'long' });
        return `${month} ${d.getDate()}, ${d.getFullYear()}`
    }

    onMount(() => {
        // Clear interval when we leave view of chart
        const observer = new IntersectionObserver(e => {
            $intersecting = e[0].isIntersecting
            if (e[0].isIntersecting) {
                if (firstLoad) {
                    setTimeout(() => {
                        incrementDates()
                        interval = setInterval(incrementDates, transitionDuration)
                    }, firstLoad ? 2500 : 0)
                    firstLoad = false
                    return
                }

                incrementDates()
                interval = setInterval(incrementDates, transitionDuration)
            } else {
                clearInterval(interval)
            }
        }, { rootMargin: '0px', threshold: 0.1 })

        observer.observe(element)

        return () => observer.unobserve(element)
    })
</script>

<div bind:this={element} class='container'>
    <div class='moving'>
        <ChartMoving {start} {end} {episodes} {transitionDuration} />
    </div>
    <div class='explanation'>
        <!--
        PIE
            *WHAT DOES PREVIOUS MEAN
        TOPICS OVER TIME EXPLANATION
            *CHART SHOULD BE ON THE RIGHT
            **SEARCH FOR A KEYWORD
            *TOPICS CHART -> REVERSE STEM HOVER
            WHAT ARE THE GRAYED OUT THIGNS
            *REVERSE STEM STOPS BOUNCING 
            **number - number show ep titles
        COS SIM MATRIX
            *interaction
         -->
         Above shows the like ratio (in green) and view count (in purple) for the episodes around 
         {formatDateForExplanation(start, end)}.
         <Spacer s={2} />
         This window is highlighted in the following chart.
         Mouse over a datapoint below to see more details.
    </div>
    <div class='static'>
        <ChartStatic 
            {previousStart} 
            {previousEnd} 
            currentStart={start} 
            currentEnd={end} 
            {transitionDuration}
            {episodes} 
        />
    </div>
</div>

<style>
    .container {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }

    .static, .moving {
        width: 90vw;        
    }

    .static {
        height: 350px;
    }

    .moving {
        height: 250px;
    }

    .explanation {
        text-align: center;
        width: 80%;
        margin-bottom: var(--s-12);
    }
</style>