<script lang='ts'>
    import { onMount } from 'svelte'
    import * as d3 from 'd3'
    import { H5 } from '@ollopa/cedar'
    import { COLORS } from '@lib/constants'

    interface DataPoint {
        number: number
        termFrequency: number
    }

    export let word: string
    export let data: DataPoint[]

    const DOT_SIZE = 4

    let element: HTMLElement
    let x, y, svg
    let mounted = false

    $: updateData(data, mounted)

    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    const updateData = (data: DataPoint[], mounted: boolean) => {
        if (!mounted) return

        const T = svg.transition()

        x.domain(d3.extent(data, (d: DataPoint) => d.number))
        y.domain(d3.extent(data, (d: DataPoint) => d.termFrequency))
        
        T.select('.x.axis')
            .duration(750)
            .call(d3.axisBottom(x))

        T.select('.y.axis')
            .duration(750)
            .call(d3.axisLeft(y))
        
        svg.selectAll('circle')
            .data(data)      
            .transition()      
            .duration(750)
            .attr('opacity', (d: DataPoint) => d.termFrequency == 0 ? '0' : '1')
            .attr('cx', (d: DataPoint) => x(d.number))
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

        mounted = true
    })
</script>

<div class='container'>
    <H5>{word} term frequency over time</H5>
    <div bind:this={element}></div>
</div>

<style>
    .container {
        text-align: center;
    }
</style>