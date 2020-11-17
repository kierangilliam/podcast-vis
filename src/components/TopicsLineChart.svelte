<script lang='ts'>
    import { onMount } from 'svelte'
    import * as d3 from 'd3'
    import { H5 } from '@ollopa/cedar'
    import { COLORS } from '@lib/constants'

    interface BinData {
        start: number
        end: number
        value: number
    }

    export let word: string
    export let data: BinData[]

    let element: HTMLElement
    let axisBottom, axisLeft, x, y, lines, svg
    let mounted = false

    $: updateData(data, mounted)

    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    const updateData = (data, mounted) => {
        if (!mounted) return

        const T = svg.transition()

        x.domain(d3.extent(data, (d) => d.start))
        y.domain([0, d3.max(data, d => d.value)])
        
        T.select(".x.axis")
            .duration(750)
            .call(d3.axisBottom(x))

        T.select(".y.axis")
            .duration(750)
            .call(d3.axisLeft(y))

        T.select(".lines")
            .duration(750)
            .attr('d', d3.line()
                .x(d => x(d.start))
                .y(d => y(d.value))(data)
            )
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
            .attr("class", "x axis")
            .attr('transform', 'translate(0,' + height + ')')            
        
        svg.append('g')
            .attr("class", "y axis")

        lines = svg.append('path')            
            .attr("class", "lines")
            .attr('fill', 'none')
            .attr('stroke', COLORS.blue)
            .attr('stroke-width', 1.5)

        mounted = true
    })
</script>

<H5>{word} TF-IDF score over time</H5>
<div bind:this={element}></div>