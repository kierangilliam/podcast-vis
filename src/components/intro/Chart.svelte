<script lang='ts'>
    import { onMount, tick } from 'svelte'
    import * as d3 from 'd3'
    import { episodes as allEpisodes, formatBigNumber, formatDate, likeRatio } from '@lib/utils'
    import { COLORS } from '@lib/constants'
    import type { Episode } from '@lib/types'
    
    const TRANSITION_DURATION = 5000
    // 120 days
    const DATE_WINDOW = 120 * (24 * 60 * 60 * 1000)
    const episodes = allEpisodes.filter(({ main }) => main)
    const [minDate, maxDate] = d3.extent(episodes, d => d.published)
    const margin = {top: 10, right: 30, bottom: 30, left: 60},
        height = 400 - margin.top - margin.bottom

    let containerWidth: number
    let element: HTMLElement
    let svg
    let x, yLikeRatio, yViews, xAxis, yAxisViews
    let viewsLine, viewsPoints, likeRatioLine
    let strokeWidth = 2.5
    let interval

    let start: Date = new Date('1-1-2018')
    let end = new Date(start.getTime() + DATE_WINDOW)

    const incrementDates = () => {
        start.setDate(start.getDate() + 15)
        end = new Date(start.getTime() + DATE_WINDOW)

        if (end > maxDate) {
            start = minDate
            end = new Date(start.getTime() + DATE_WINDOW)
        }
    }

    $: width = containerWidth - margin.left - margin.right
    $: handleChartUpdate(start, end)

    const withinDateExtent = (ep: Episode) => 
        ep.published >= start && ep.published <= end

    const updateDomains = () => {
        x.domain([start, end])
        yViews.domain([0, d3.max(episodes.filter(withinDateExtent), (d) => d.views)])
    }

    // Transititon and transition linear helper functions
    const t = (e) => e.transition().duration(TRANSITION_DURATION)
    const tl = e => t(e).ease(d3.easeLinear)

    const handleChartUpdate = (_, __) => {
        if (!svg) return

        updateDomains()

        t(yAxisViews).call(d3.axisLeft(yViews).ticks(10).tickFormat(formatBigNumber))
        tl(xAxis).call(d3.axisBottom(x).ticks(8).tickFormat(formatDate))
        tl(likeRatioLine).attr('d', d3.line().x((d) => x(d.published)).y((d) => yLikeRatio(likeRatio(d.id))))
        tl(viewsLine).attr('d', d3.line().x(d => x(d.published)).y(d => yViews(d.views)))
        tl(viewsPoints).attr('cx', (d) => x(d.published)).attr('cy', (d) => yViews(d.views))
    }
    
    onMount(async () => {
        await tick()

        svg = d3.select(element)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                    
        x = d3.scaleTime().range([0, width])
        yViews = d3.scaleLinear().range([height, 0])
        yLikeRatio = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0])

        updateDomains()

        xAxis = svg.append('g')
            .attr("font-family", "times-new-roman")
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x).ticks(8).tickFormat(formatDate))                

        yAxisViews = svg.append('g')
            .attr("font-family", "times-new-roman")
            .call(d3.axisLeft(yViews).ticks(10).tickFormat(formatBigNumber))
        
        svg.append('g')
            .attr('transform', 'translate( ' + width + ', 0 )')
            .attr("font-family", "times-new-roman")
            .call(d3.axisRight(yLikeRatio).ticks(10).tickFormat(x => `${x*100}%`))
        
        // View count
        viewsLine = svg.append('path')
            .datum(episodes)
            .attr('fill', 'none')
            .attr('stroke-opacity', .5)
            .attr('stroke', COLORS.orange)
            .attr('stroke-width', strokeWidth)
            .attr('d', d3.line().x(d => x(d.published)).y(d => yViews(d.views)))
        
        viewsPoints = svg.selectAll('views-points')
            .data(episodes)
            .enter()
            .append('circle')
            .attr('fill', COLORS.orange)
            .attr('stroke', 'none')
            .attr('cx', (d) => x(d.published))
            .attr('cy', (d) => yViews(d.views))
            .attr('r', strokeWidth)
        
        // Like ratio gradient
        svg.append('linearGradient')
            .attr('id', 'like-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('y1', yLikeRatio(d3.min(episodes, d => likeRatio(d.id))))
            .attr('x2', 0)
            .attr('y2', yLikeRatio(1))
            .selectAll('stop')
            .data([{ offset: '25%', color: COLORS.red }, { offset: '100%', color: COLORS.green }])
            .enter()
            .append('stop')
            .attr('offset', (d) => d.offset)
            .attr('stop-color', (d) => d.color)

        // Like ratio
        likeRatioLine = svg.append('path')
            .datum(episodes)
            .attr('fill', 'none')
            .attr('stroke', 'url(#like-gradient)')
            .attr('stroke-width', strokeWidth)
            .attr('d', d3.line().x((d) => x(d.published)).y((d) => yLikeRatio(likeRatio(d.id))))    


        // Clear interval when we leave view of chart
        const observer = new IntersectionObserver(e => {
            if (e[0].isIntersecting) {
                incrementDates()
                interval = setInterval(incrementDates, TRANSITION_DURATION)
            } else {
                clearInterval(interval)
            }
        }, { rootMargin: '0px', threshold: 0.1 })

        observer.observe(element)

        return () => observer.unobserve(element)
    })
</script>

<div class='container' bind:clientWidth={containerWidth}>
    <div bind:this={element}></div>
</div>

<style>
    .container {
        width: 100%;
    }
</style>