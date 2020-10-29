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
        const totalPadding = verticalGrid.bandwidth() * (rows+1) * PADDING

        const svg = d3.select(E)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            // Right align
            // .attr('transform', (_, i) => 
            //     `translate(${(width - (totalPadding + rows * verticalGrid.bandwidth()))}, 
            //         ${-1*verticalGrid.bandwidth() * PADDING})`
            // )
        
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
    }

    onMount(() => mounted = true)
</script>

<div bind:this={container} class='container' style='height: {$height}px;'>
    <div bind:this={E}></div>
    <label class="monospace">Calculated using TF-IDF cosime similarity</label>
</div>

<style>
    .container {
        flex: 1.5;
        width: 100%;
        border: var(--line);
        padding: var(--s-3);
    }
</style>

