<script lang='ts'>
    import { getContext, onMount, tick } from 'svelte'
    import * as d3 from 'd3'
    import { formatBigNumber, formatViews, likeRatio } from '@lib/utils'
    import { COLORS } from '@lib/constants'
    import type { Episode } from '@lib/types'
    import { tweened } from 'svelte/motion'
    import type { Writable } from 'svelte/store'
    import EpisodeTooltip from '../EpisodeTooltip.svelte'

    export let previousStart: Date, previousEnd: Date
    export let currentStart: Date, currentEnd: Date
    export let episodes: Episode[]
    export let transitionDuration: number

    const { likeColorGradient, viewsColor, likeRatioColor } = getContext('settings')

    const [minDate, maxDate] = d3.extent(episodes, d => d.published)

    const margin = { top: 10, right: 10, bottom: 10, left: 10 },
        height = 350 - margin.top - margin.bottom

    const dotSize = 3
    const strokeWidth = 3
    let tooltip
    let containerWidth: number
    let element: HTMLElement
    let svg
    let xDate, yLikeRatio, yViews
    let viewsLine, viewsPoints, viewsLines
    let likesPoints, likeRatioLine, likeRatioLines
    let start: Writable<Date> = tweened(previousStart, { duration: transitionDuration })
    let end: Writable<Date> = tweened(previousEnd, { duration: transitionDuration })
    
    $: width = containerWidth - margin.left - margin.right
    $: highlighted = ($start, $end) && episodes.filter(withinDateExtent)
    $: handleDateUpdate(currentStart, currentEnd)
    $: handleChartUpdate(highlighted)    

    const withinDateExtent = (ep: Episode) => 
        ep.published >= $start && ep.published <= $end

    const updateDomains = () => {
        yViews.domain([0, d3.max(episodes, (d) => d.views)])
        xDate.domain([minDate, maxDate])
    }
    
    // currentStart and currentEnd only update every 5 seconds, tween the values
    const handleDateUpdate = async (_, __) => {        
        start.set(previousStart)
        end.set(previousEnd)
        await tick()
        start.set(currentStart)
        end.set(currentEnd)
    }

    const handleChartUpdate = (_) => {
        if (!svg) return

        if (tooltip?.showViews) {
            viewsLines.attr('stroke-opacity', 1)
            viewsPoints.style('fill', d => d.id === tooltip.id ? COLORS.pink : 'none')
            svg.selectAll('.views-labels').attr('fill', COLORS.darkGray)
            return
        } else if (viewsLines.attr('stroke-opacity') == 1) {
            svg.selectAll('.views-labels').attr('fill', COLORS.gray)
            viewsLines.attr('stroke-opacity', 0)
        } 
        
        else if (tooltip?.showLikeRatio) {
            likeRatioLines.attr('stroke-opacity', 1)            
            likesPoints.style('fill', d => d.id === tooltip.id ? COLORS.pink : 'none')
            svg.selectAll('.like-ratio-labels').attr('fill', COLORS.darkGray)
            return
        } else if (likeRatioLines.attr('stroke-opacity') == 1) {
            likeRatioLines.attr('stroke-opacity', 0)
            svg.selectAll('.like-ratio-labels').attr('fill', COLORS.gray)
        }

        updateDomains()

        viewsPoints.style('fill', d => withinDateExtent(d) ? viewsColor : COLORS.gray)

        likesPoints.style('fill', d => withinDateExtent(d) ? likeRatioColor : COLORS.gray)

        // svg.selectAll('axis-lines').attr('opacity', tooltip ? 1 : .7)
    }

    const makePoints = ({ name, color, y }) =>
        svg.selectAll(`${name}-points`)
            .data(episodes)
            .enter()
            .append('circle')
            .attr('class', d => `moving-chart-${d.id}`)
            .attr('fill', color)
            .attr('opacity', .9)
            .attr('stroke', 'none')
            .attr('cx', (d) => xDate(d.published))
            .attr('cy', y)
            .attr('r', dotSize)            
    

    const findPointFrom = (date: Date, views, likeratio) => {
        const thirtyDays = (24 * 60 * 60 * 1000) * 30
        const dateLeft = new Date(date.getTime() - thirtyDays)
        const dateRight = new Date(date.getTime() + thirtyDays)
        
        return episodes
            .filter(({ published }) => published > dateLeft && published < dateRight)
            .map(ep => ({
                ...ep,
                distX: Math.abs(xDate(ep.published) - xDate(date)),
                distViews: Math.abs(yViews(ep.views) - yViews(views)),
                distLikeRatio: Math.abs(yLikeRatio(likeRatio(ep.id)) - yLikeRatio(likeratio)),
            }))
            .map(ep => ({
                ...ep,
                distY: ep.distLikeRatio < ep.distViews ? ep.distLikeRatio : ep.distViews,
                // Used downstream in chart update
                showLikeRatio: ep.distLikeRatio < ep.distViews,
                showViews: ep.distLikeRatio > ep.distViews,
            }))
    }

    const handleMouseMove = (e) => {
        const { layerY, clientY, clientX, layerX } = e

        // Clear last selected
        if (tooltip) {
            svg.selectAll(`.moving-chart-${tooltip.id}`)
                .attr('r', dotSize)
                .style('fill', COLORS.gray)
            tooltip = null
        }

        const x = layerX - margin.left
        const y = layerY - margin.top
        const eps = findPointFrom(
            xDate.invert(x), yViews.invert(y), yLikeRatio.invert(y)
        )
        const ep = eps[d3.minIndex(eps, e => e.distY)]
        
        if (eps.length == 0 || ep.distY > 25) return
        
        tooltip = { ...ep, x: clientX, y: clientY }
        
        svg.selectAll(`.moving-chart-${ep.id}`)
            .attr('r', dotSize * 3)
            .style('fill', COLORS.pink)
    }

    const handleMouseLeave = () => {
        // Clear last selected
        if (tooltip) {
            svg.selectAll(`.moving-chart-${tooltip.id}`)
                .attr('r', dotSize)
                .style('fill', COLORS.gray)
            tooltip = null
        }
    }

    onMount(async () => {
        // Wait for container to render
        await tick()

        xDate = d3.scaleTime()
            .range([0, width])

        yViews = d3.scaleLinear()            
            .range([height, 0])

        yLikeRatio = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0])
        
        updateDomains()

        svg = d3.select(element)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        // Horizontal lines for axis
        const axisLineWidth = 1
        const axisLines = svg.selectAll('axis-lines')
            .data([...Array(4)].map((_, i) => (i + 1) * 2))
            .enter()

        axisLines
            .append('rect')
            .attr('x', 0)
            .attr('y', i => yLikeRatio(i / 10) - axisLineWidth / 2)
            .attr('width', width)
            .attr('height', axisLineWidth)
            .attr('fill', COLORS.gray)
            .attr('opacity', .75)
            
        axisLines
            .append('text')            
            .attr('font-size', 10)
            .attr('x', 0)
            .attr('y', i => yLikeRatio(i / 10) - axisLineWidth / 2 - 4)
            .text(i => `${formatBigNumber(yViews.invert(yLikeRatio(i / 10) - axisLineWidth / 2))} views`)
            .attr('class', 'views-labels')
            .attr('fill', COLORS.darkGray)            
            .attr('opacity', .75)

        // LIKE RATIO
        axisLines
            .append('text')
            .attr('font-size', 10)
            .attr('x', width - 40)
            .attr('y', i => yLikeRatio(i / 10) - axisLineWidth / 2 - 4)
            .text(i => `${Math.round(yLikeRatio.invert(yLikeRatio(i / 10) - axisLineWidth / 2) * 100)}% liked`)
            .attr('class', 'like-ratio-labels')
            .attr('fill', COLORS.darkGray)            
            .attr('opacity', .75)

        // View count
        viewsLine = d3.line()
            .x(d => xDate(d.published))
            .y(d => yViews(d.views))
            .curve(d3.curveCardinal.tension(0.5))

        viewsLines = svg.append('path')
            .datum(episodes)
            .attr('fill', 'none')
            .attr('stroke', viewsColor)
            .attr('stroke-width', strokeWidth)
            .attr('d', viewsLine)
            .attr('stroke-opacity', 0)

        likeColorGradient(svg, yLikeRatio)

        // Like ratio
        likeRatioLine = d3.line()                
            .x((d) => xDate(d.published))
            .y((d) => yLikeRatio(likeRatio(d.id)))
            .curve(d3.curveCardinal.tension(0.5))

        likeRatioLines = svg.append('path')
            .datum(episodes)
            .attr('fill', 'none')
            .attr('stroke', 'url(#like-gradient)')
            .attr('stroke-width', strokeWidth)
            .attr('d', likeRatioLine)    
            .attr('stroke-opacity', 0)

        viewsPoints = makePoints({ 
            name: 'views', 
            color: d => withinDateExtent(d) ? viewsColor : COLORS.gray,
            y: (d) => yViews(d.views),
        })
        
        likesPoints = makePoints({ 
            name: 'likeRatio', 
            color: d => withinDateExtent(d) ? likeRatioColor : COLORS.gray,
            y: d => yLikeRatio(likeRatio(d.id)),
        })
    })
</script>

<EpisodeTooltip id={tooltip?.id} x={tooltip?.x} y={tooltip?.y} words>
    <div>
        <div>{formatViews(tooltip?.id)} views</div>
        <div class='likes'><div class='ratio' style={`--ratio: ${likeRatio(tooltip.id)}`}></div></div>
    </div>
</EpisodeTooltip>

<div class='container' bind:clientWidth={containerWidth}>
    <div 
        bind:this={element}
        on:mousemove={handleMouseMove}
        on:touchstart={handleMouseMove}
        on:touchmove={handleMouseMove}
        on:mouseleave={handleMouseLeave}
        on:touchend={handleMouseLeave}
    ></div>
</div>

<style>
    .container {
        width: 100%;
        position: relative;
    }

    .likes {
        background: var(--red);
        height: var(--s-2);
        width: 100%;
        border-radius: 999px;
        position: relative;
    }
    .likes .ratio {
        border-radius: 999px;
        width: calc(var(--ratio) * 100%);
        top: 0;
        left: 0;
        height: 100%;
        position: absolute;
        background: var(--green);
        transition: width 500ms ease-out;
    }
</style>