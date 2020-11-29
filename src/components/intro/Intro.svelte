<script lang='ts'>
    import { onMount, setContext } from 'svelte'
    import ChartMoving from './ChartMoving.svelte'
    import ChartStatic from './ChartStatic.svelte'
    import * as d3 from 'd3'
    import { episodes as allEpisodes } from '@lib/utils'
    import { writable } from 'svelte/store'

    const episodes = allEpisodes.filter(({ main }) => main)
    // 90 days
    const DATE_WINDOW = 90 * (24 * 60 * 60 * 1000)
    const transitionDuration = 5000
    const intersecting = writable(false)

	setContext('intersectionObserver', { intersecting })    

    let element: HTMLElement
    let interval    
    let start = new Date('1-1-2018')
    let end = new Date(start.getTime() + DATE_WINDOW)
    let previousStart = start
    let previousEnd = end

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

<div bind:this={element}>
    <div class='container'>
        <ChartMoving {start} {end} {episodes} {transitionDuration} />
    </div>
    <div class='container'>
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
        width: 90vw;
        height: 40vh;
    }
</style>