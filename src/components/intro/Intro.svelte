<script lang='ts'>
    import { onMount, setContext } from 'svelte'
    import ChartMoving from './ChartMoving.svelte'
    import ChartStatic from './ChartStatic.svelte'
    import * as d3 from 'd3'
    import { episodes as allEpisodes, likeRatio } from '@lib/utils'
    import { writable } from 'svelte/store'
    import { COLORS } from '@lib/constants'

    const episodes = allEpisodes.filter(({ main }) => main)
    // 90 days
    const DATE_WINDOW = 90 * (24 * 60 * 60 * 1000)
    const transitionDuration = 5000
    const intersecting = writable(false)

	setContext('intersectionObserver', { intersecting })    
	setContext('settings', { 
        likeColorGradient, 
        likeRatioColor: COLORS.green,
        viewsColor: '#9486F2',
    })    

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

    const [minDate, maxDate] = d3.extent(episodes, d => d.published)

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
    <div class='text'>
        <!--
        PIE
            ON PIE INTRO SHOW NUMBERS
            *WHAT DOES PREVIOUS MEAN
        TOPICS OVER TIME EXPLANATION
            *CHART SHOULD BE ON THE RIGHT
            **SEARCH FOR A KEYWORD
            *TOPICS CHART -> REVERSE STEM HOVER
            WHAT ARE THE GRAYED OUT THIGNS
            *REVERSE STEM STOPS BOUNCING 
            **number - number show ep titles
            **slider - show ep start and end
        COS SIM MATRIX
            *interaction
         -->
        <i><h5>2462 videos, 8,626,908 words, and 675gb of data analyzed.</h5></i>
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

    .text {
        display: flex;
        justify-content: center;
        margin-bottom: var(--s-4);
    }
</style>