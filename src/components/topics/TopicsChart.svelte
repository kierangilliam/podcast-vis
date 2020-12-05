<script lang='ts'>
    import { onMount, tick } from 'svelte'
    import * as d3 from 'd3'
    import { H5 } from '@ollopa/cedar'
    import { COLORS } from '@lib/constants'
    import { formatDate, isMobile } from '@lib/utils'
    import type { Episode } from '@lib/types'
    import ReverseStem from '../ReverseStem.svelte'
    import EpisodeTooltip from '../EpisodeTooltip.svelte'
    import { clickOutside } from '@lib/utils'

    interface DataPoint extends Episode {
        termFrequency: number
    }

    export let pinnedWord: string
    export let data: DataPoint[]
    export let highlighted: string[]
    export let width: number
    export let height: number

    const DOT_SIZE = 4.5

    let element: HTMLElement
    // d3 x y scales and main svg
    let xDate, yTermFrequency, svg
    let mounted = false
    let tooltip

    $: updateData(data, mounted)
    $: updateHighlighted(highlighted)

    const margin = { top: 10, right: 25, bottom: 30, left: 25 }

    const dotOpacity = (d: DataPoint, defaultValue='1') => 
        d.termFrequency == 0 ? '0' : defaultValue
    
    const updateData = async (data: DataPoint[], mounted: boolean) => {
        if (!mounted) return

        await tick()

        const T = svg.transition()

        xDate.domain(d3.extent(data, (d: DataPoint) => d.published)).range([0, width])
        yTermFrequency.domain(d3.extent(data, (d: DataPoint) => d.termFrequency)).range([height, 0])
        
        const bottomAxis = T.select('.x.axis')
            .duration(750)
            .call(d3.axisBottom(xDate)
                .tickSize(4)
                .tickFormat((x, i) => i % 2 == 0 ? formatDate(x) : '')
            )        
           
        // Rotate axis text
        bottomAxis.selectAll('text')
            .attr('x', '0')
            .attr('y', '7')
            .attr('transform', 'rotate(330)')
            .style('text-anchor', 'end')
        
        // Hide the ticks of non i % 2 ticks
        bottomAxis.selectAll('g.tick line')
            .attr("opacity", (d, i) => i % 2 == 0 ? 1 : 0)

        T.select('.y.axis')
            .duration(750)
            .call(d3.axisLeft(yTermFrequency))
        
        svg.selectAll('circle')
            .data(data)      
            .transition()      
            .delay(150)      
            .duration(750)
            .attr('opacity', dotOpacity)
            .attr('cx', (d: DataPoint) => xDate(d.published))
            .attr('cy', (d: DataPoint) => yTermFrequency(d.termFrequency))
            .attr('r', DOT_SIZE)            
    }    

    const updateHighlighted = (_) => {
        if (!mounted) return 
        const toggled = highlighted && highlighted.length > 0

        svg.selectAll('circle')
            .data(data)      
            .transition()      
            .duration(250)
            .attr('opacity', (d: DataPoint) => {
                if (toggled) {
                    return highlighted.includes(d.id) ? dotOpacity(d) : dotOpacity(d, '.25')
                }

                return dotOpacity(d)
            })
            .attr('r', (d: DataPoint) => {
                if (toggled) {
                    return highlighted.includes(d.id) ? DOT_SIZE * 1.5 : DOT_SIZE
                }

                return DOT_SIZE
            })
    }

    const findPointFrom = (x: number, y: number) => {
        const dateWindow = (24 * 60 * 60 * 1000) * 120
        const dateLeft = new Date(xDate.invert(x) - dateWindow)
        const dateRight = new Date(xDate.invert(x) + dateWindow)
        
        return data
            .filter(({ termFrequency }) => termFrequency !== 0)
            .filter(({ published }) => published > dateLeft && published < dateRight)
            .map(ep => ({
                ...ep,
                distX: Math.abs(xDate(ep.published) - x),
                distY: Math.abs(yTermFrequency(ep.termFrequency) - y),
            }))
    }

    const handleMouseMove = (e) => {
        const { offsetX, offsetY, clientX, clientY } = e
        
        // Handle only touch events on mobile
        if (e.type === 'mousemove' && isMobile) return

        // Clear last selected
        if (tooltip) handleMouseLeave()

        const x = offsetX - margin.left
        const y = offsetY - margin.top
        const eps = findPointFrom(x, y)
        const ep = eps[d3.minIndex(eps, e => e.distY)]
        
        if (eps.length == 0 || ep.distY > 25) return

        tooltip = { ...ep, x: clientX, y: clientY }

        svg.select(`#topics-chart-${ep.id}`)
            .transition()
            .duration(100)
            .attr('r', DOT_SIZE * 1.5)
            .style('fill', COLORS.darkOrange)
    }

    const handleMouseLeave = () => {            
        if (tooltip) {
            svg.select(`#topics-chart-${tooltip.id}`)
                .transition()
                .duration(100)
                .attr('r', DOT_SIZE)
                .style('fill', COLORS.orange)
            tooltip = null
        }
    }

    onMount(() => {
        svg = d3.select(element)
            .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
            .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        xDate = d3.scaleLinear()            
            .range([0, width])

        yTermFrequency = d3.scaleLinear()
            .range([height, 0])

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')            
        
        svg.append('g')
            .attr('class', 'y axis')

        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('id', ep => `topics-chart-${ep.id}`)
            .attr('pointer-events', 'none')
            .attr('fill', COLORS.orange)
            .attr('cx', (d: DataPoint) => xDate(d.number))
            .attr('cy', (d: DataPoint) => yTermFrequency(d.termFrequency))
            .attr('r', DOT_SIZE)

        mounted = true
    })    
</script>

<EpisodeTooltip id={tooltip?.id} x={tooltip?.x} y={tooltip?.y}>
    {tooltip.termFrequency} {tooltip.termFrequency > 1 ? 'occurrences' : 'occurrence'} of <span>&nbsp;</span>
    <ReverseStem stem={pinnedWord} />
</EpisodeTooltip>

<div class='container'>
    <H5>
        <strong style="font-family: times-new-roman"><i><ReverseStem stem={pinnedWord} /></i></strong> 
        term frequency over time
    </H5>
    <div 
        bind:this={element}
        on:click={handleMouseMove}
        on:mousemove={handleMouseMove}
        on:touchstart={handleMouseMove}
        on:touchmove={handleMouseMove}

        use:clickOutside={handleMouseLeave}
        on:touchend={handleMouseLeave}
        on:mouseleave={handleMouseLeave}
    ></div>
</div>

<style>
    .container {
        text-align: center;
    }        
</style>