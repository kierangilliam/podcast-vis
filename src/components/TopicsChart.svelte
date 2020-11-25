<script lang='ts'>
    import { onMount } from 'svelte'
    import * as d3 from 'd3'
    import { H5, Spacer } from '@ollopa/cedar'
    import { COLORS } from '@lib/constants'
    import { getTitle } from '@lib/utils'
    import type { Episode } from '@lib/utils'
    
    import Tooltip from './Tooltip.svelte'

    interface DataPoint extends Episode {
        termFrequency: number
    }

    export let word: string
    export let data: DataPoint[]

    const DOT_SIZE = 4

    let element: HTMLElement
    // d3 x y scales and main svg
    let x, y, svg
    let mounted = false
    let tooltip

    $: updateData(data, mounted)

    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom
    
    const updateData = (data: DataPoint[], mounted: boolean) => {
        if (!mounted) return

        const T = svg.transition()

        x.domain(d3.extent(data, (d: DataPoint) => d.published))
        y.domain(d3.extent(data, (d: DataPoint) => d.termFrequency))
        
        const bottomAxis = T.select('.x.axis')
            .duration(750)
            .call(d3.axisBottom(x)
                .tickSize(1)
                .tickFormat((x, i) => {
                    const d = new Date(x)
                    const month = d.toLocaleString('default', { month: 'short' });
                    return i % 2 == 0 ? `${month}, ${d.getFullYear().toString().slice(-2)}'` : ''
                })
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
            .call(d3.axisLeft(y))
        
        svg.selectAll('circle')
            .data(data)      
            .transition()      
            .duration(750)
            .attr('opacity', (d: DataPoint) => d.termFrequency == 0 ? '0' : '1')
            .attr('cx', (d: DataPoint) => x(d.published))
            .attr('cy', (d: DataPoint) => y(d.termFrequency))
            .attr('r', DOT_SIZE)            
    }

    onMount(() => {
        svg = d3.select(element)
            .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
            .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        x = d3.scaleLinear()            
            .range([ 0, width ])

        y = d3.scaleLinear()
            .range([ height, 0 ])

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')            
        
        svg.append('g')
            .attr('class', 'y axis')

        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('fill', COLORS.orange)
            .attr('cx', (d: DataPoint) => x(d.number))
            .attr('cy', (d: DataPoint) => y(d.termFrequency))
            .attr('r', DOT_SIZE)
            .on('mouseover', function({ clientX, clientY }, dataPoint) {
                if (dataPoint.termFrequency == 0) return
                tooltip = { x: clientX, y: clientY, ...dataPoint }
                d3.select(this).attr('r', DOT_SIZE * 1.5).style('fill', COLORS.darkOrange)
            })
            .on('mouseleave', function(e, d) {
                tooltip = null
                d3.select(this).attr('r', DOT_SIZE).style('fill', COLORS.orange)
            })

        mounted = true
    })    
</script>

<Tooltip bind:tooltip>
    <div class='flex between'>
        <p class='tooltip-title'>{getTitle(tooltip.id)}</p>
        <p class='number-chip'>{tooltip.number}</p>
    </div>
    <Spacer s={2} />
    <div class='flex between'>
        <div>
            {tooltip.termFrequency} {tooltip.termFrequency > 1 ? 'occurrences' : 'occurrence'} of {word}
        </div>
        <p class='published'>{tooltip.published.toDateString()}</p>
    </div>
</Tooltip>

<div class='container'>
    <H5><strong><i>{word}</i></strong> term frequency over time</H5>
    <div bind:this={element}></div>
</div>

<style>
    .container {
        text-align: center;
    }    

    .tooltip-title {
        margin-right: var(--s-6);
    }

    .published {
        font-size: var(--textSmall);
        /* TODO really need a light-black / darker gray. same thing in description of compared all */
        opacity: .75;
    }
</style>