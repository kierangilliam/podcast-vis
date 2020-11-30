<script lang='ts'>
    import { getContext, onMount, tick } from 'svelte'
    import * as d3 from 'd3'
    import { formatBigNumber, formatViews, likeRatio } from '@lib/utils'
    import { COLORS } from '@lib/constants'
    import type { Episode } from '@lib/types'
    import { tweened } from 'svelte/motion'
    import type { Readable } from 'svelte/store'
    import EpisodeTooltip from '../EpisodeTooltip.svelte'

    export let previousStart: Date, previousEnd: Date
    export let currentStart: Date, currentEnd: Date
    export let episodes: Episode[]
    export let transitionDuration: number

    const { likeColorGradient, viewsColor, likeRatioColor } = getContext('settings')

    const [minDate, maxDate] = d3.extent(episodes, d => d.published)

    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        height = 350 - margin.top - margin.bottom

    const dotSize = 3
    const strokeWidth = 3
    let tooltip
    let containerWidth: number
    let element: HTMLElement
    let svg
    let x, yLikeRatio, yViews
    let viewsLine, viewsPoints, viewsLines
    let likesPoints, likeRatioLine, likeRatioLines    
    let start: Readable<Date> , end: Readable<Date>
    
    $: [start, end] = handleDateUpdate(currentStart, currentEnd)
    $: width = containerWidth - margin.left - margin.right
    $: highlighted = ($start, $end) && episodes.filter(withinDateExtent)
    $: handleChartUpdate(highlighted)    

    // Transititon and transition linear helper functions
    const t = (e, d) => e.transition().duration(d)

    const withinDateExtent = (ep: Episode) => 
        ep.published >= $start && ep.published <= $end

    const updateDomains = () => {
        yViews.domain([0, d3.max(episodes, (d) => d.views)])
        x.domain([minDate, maxDate])
    }
    
    // start and end only update every 5 seconds
    const handleDateUpdate = (_, __) => {
        const start = tweened(previousStart, { duration: transitionDuration })
        const end = tweened(previousEnd, { duration: transitionDuration })
        start.set(currentStart)
        end.set(currentEnd)

        return [start, end]
    }

    const handleChartUpdate = (_) => {
        if (!svg) return

        if (tooltip?.views === true) {
            viewsLines.attr('stroke-opacity', 1)
            viewsPoints.style('fill', d => d.id === tooltip.id ? viewsColor : 'none')
            return
        } else if (viewsLines.attr('stroke-opacity') == 1) {
            viewsLines.attr('stroke-opacity', 0)
        } else if (tooltip?.likeRatio === true) {
            likeRatioLines.attr('stroke-opacity', 1)            
            likesPoints.style('fill', d => d.id === tooltip.id ? COLORS.gray : 'none')
            return
        } else if (likeRatioLines.attr('stroke-opacity') == 1) {
            likeRatioLines.attr('stroke-opacity', 0)
        }

        updateDomains()

        // TODO d3's transition is extrememly slow
        viewsPoints
            .style('fill', d => withinDateExtent(d) ? viewsColor : COLORS.gray)

        likesPoints
            .style('fill', d => withinDateExtent(d) ? likeRatioColor : COLORS.gray)

        svg.selectAll('axis-lines')
            .attr('opacity', tooltip ? 1 : .7)
        
        svg.selectAll('axis-labels')
            .attr('opacity', tooltip ? 1 : 0)
    }

    const makePoints = ({ name, color, y }) =>
        svg.selectAll(`${name}-points`)
            .data(episodes)
            .enter()
            .append('circle')
            .attr('fill', color)
            .attr('opacity', .9)
            .attr('stroke', 'none')
            .attr('cx', (d) => x(d.published))
            .attr('cy', y)
            .attr('r', dotSize)
            .on('mouseover', function({ clientX, clientY }, dataPoint) {
                if (dataPoint.termFrequency == 0) return
                tooltip = { x: clientX, y: clientY, ...dataPoint }
                tooltip[name] = true
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('r', dotSize * 4)
                    .style('fill', color)
            })
            .on('mouseleave', function(e, d) {
                tooltip = null
                d3.select(this)
                    .transition()
                    .duration(100)
                    .attr('r', dotSize)
                    .style('fill', color)
            })
    
    onMount(async () => {
        // Wait for container to render
        await tick()

        svg = d3.select(element)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        x = d3.scaleTime()
            .range([0, width])

        yViews = d3.scaleLinear()            
            .range([height, 0])

        yLikeRatio = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0])
        
        updateDomains()

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
            .attr('fill', COLORS.darkGray)            
            .attr('opacity', .75)

        // LIKE RATIO
        axisLines
            .append('text')
            .attr('font-size', 10)
            .attr('x', width - 40)
            .attr('y', i => yLikeRatio(i / 10) - axisLineWidth / 2 - 4)
            .text(i => `${Math.round(yLikeRatio.invert(yLikeRatio(i / 10) - axisLineWidth / 2) * 100)}% liked`)
            .attr('fill', COLORS.darkGray)            
            .attr('opacity', .75)

        // View count
        viewsLine = d3.line()
            .x(d => x(d.published))
            .y(d => yViews(d.views))
            .curve(d3.curveCardinal.tension(0.5))

        viewsLines = svg.append('path')
            .datum(episodes)
            .attr('fill', 'none')
            .attr('stroke', likeRatioColor)
            .attr('stroke-width', strokeWidth)
            .attr('d', viewsLine)
            .attr('stroke-opacity', 0)

        likeColorGradient(svg, yLikeRatio)

        // Like ratio
        likeRatioLine = d3.line()                
            .x((d) => x(d.published))
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
    <div bind:this={element}></div>
    <div class='cover'></div>
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