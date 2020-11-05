<script lang='ts'>
    import { onMount } from 'svelte'
    import { COLORS } from '@lib/constants'
    import { height } from './similarity-state'
    import * as d3 from 'd3'

    export let data
    
    let E, container: HTMLElement 
    let mounted = false

    const cols = data.length
    const rows = data.length
    const PADDING = .15

    $: onHeightChange($height)

    const createGrid = (containerHeight: number) => {    
        const horizontalGrid = d3.scaleBand()
            .range([0, containerHeight])
            .domain(d3.range(cols))
            .padding(PADDING)
    
        const verticalGrid = d3.scaleBand()
            .range([0, containerHeight])
            .domain(d3.range(rows))
            .padding(PADDING)

        return [horizontalGrid, verticalGrid]
    }
    
    const color = d3.scaleLinear()
        .range([COLORS.white, COLORS.orange])
        .domain([0, 1])    

    const onHeightChange = (height) => {
        if (!mounted) return

        const { width } = container.getBoundingClientRect()
        const [horizontalGrid, verticalGrid] = createGrid(Math.min(height, width))

        const svg = d3.select(E)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
        
        // https://codereview.stackexchange.com/a/200524
        const groups = svg.selectAll(null)
            .data(data)
            .enter()
            .append('g')
            .attr('transform', (_, i) => 'translate(' + horizontalGrid(i) + ')')
            
        
        let currentRow = 0
        const rects = groups.selectAll(null)
            .data((d, i) => ([...d, i]))
            .enter()
            .append('rect')
            // Draws upper right matrix only
            .attr('fill', (d, i) => {
                const alpha = 'rgba(0,0,0,0)'
                if (Number.isInteger(d)) {
                    currentRow = d + 1                    
                    return alpha
                }

                const [_, sim] = d
                return i >= currentRow ? alpha : color(sim)
            })
            .attr('y', (d, i) => verticalGrid(i))
            .attr('width', horizontalGrid.bandwidth())
            .attr('height', verticalGrid.bandwidth())
            
        currentRow = 0
        const text = groups.selectAll(null)
            .data((d, i) => ([...d, i]))
            .enter()
            .append('text')
            .attr('y', (d, i) => verticalGrid(i) + (verticalGrid.bandwidth() / 2))
            .attr('dx', '6rem')
            .text(d => d[0])
            .attr('text-anchor', 'end')
            .attr('fill', (d, i) => {
                const alpha = 'rgba(0,0,0,0)'
                if (Number.isInteger(d)) {
                    currentRow = d + 1                    
                    return alpha
                }
                return i != currentRow ? alpha : COLORS.black
            })

        // Legend
        const legendWidth = width / 3
        const legendHeight = 30
        const legend = svg.selectAll('legend')
            .append('g')
            
        legend.data(d3.range(0, 1, 1 / legendWidth))
            .enter()
            .attr('stroke-width', '2px')
            .attr('border-top', '2px solid black')
            .append('rect')
            .attr('height', legendHeight)
            .attr('width', '1px')
            .attr('x', d => d * legendWidth)
            .attr('y', height - (legendHeight * 2))
            .attr('fill', d => color(d))

        legend.append('text')
            .text('ELKs')
    }

    onMount(() => mounted = true)
</script>

<div bind:this={container} class='container' style='height: {$height}px;'>
    <div bind:this={E}></div>
    <label class='monospace'>Calculated using TF-IDF cosime similarity</label>
</div>

<style>
    .container {
        flex: 1.5;
        width: 100%;
        border: var(--line);
        padding: var(--s-3);
    }
</style>

