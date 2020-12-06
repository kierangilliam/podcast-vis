<script lang='ts'>
    import { onMount, setContext } from 'svelte'
    import ChartMoving from './ChartMoving.svelte'
    import ChartStatic from './ChartStatic.svelte'
    import * as d3 from 'd3'
    import { episodes as allEpisodes } from '@lib/data'
    import { likeRatio, setCSSVar } from '@lib/utils'
    import { writable } from 'svelte/store'
    import { COLORS } from '@lib/constants'
    import { Spacer } from '@ollopa/cedar'

    const episodes = $allEpisodes && $allEpisodes.filter(({ main }) => main)
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

    setCSSVar(['introChartTransitionDuration', `${transitionDuration}ms`])
	setContext('intersectionObserver', { intersecting })    
	setContext('settings', settings)    

    let element: HTMLElement
    let interval    
    // TODO Base this off of middle data of eps
    let start = new Date(2019, 1, 1)
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
                    { offset: '0%', color: COLORS.red }, 
                    { offset: '40%', color: '#FFC27B' }, 
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
        <ChartMoving {start} {end} {episodes} />
    </div>
    <div class='explanation'>
        Above and below are two charts reiterating the same data from YouTube.
        <ul>
            <li>The higher green line indicates the percentage of likes a video got.</li>
            <li>The lower purple line shows the view count.</li>
        </ul>
        <Spacer />
        The above chart shows the likes-ratio/views for the episodes around
        <i>{formatDateForExplanation(start, end)}</i>.         
         <Spacer s={2} />
        Below, this window is highlighted with color in the following chart.
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
        max-width: 40rem;
        margin-bottom: var(--s-12);
    }

    /* Small screens */
    @media screen and (max-width: 450px) {
        .moving, .static {
            width: 100vw;
        }
        .explanation {
           width: 90vw;
        }
    }
</style>