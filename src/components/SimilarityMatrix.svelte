<script lang='ts'>
    import { onMount } from 'svelte'
    import { COLORS } from '@lib/constants'
    import { height } from './similarity-state'
    import * as d3 from 'd3'
    import { episode } from '@lib/utils'    

    export let data: [string, number][][]
    
    
    const PADDING = .15

    let container: HTMLElement 
    let mounted = false
    let size = 0

    $: onHeightChange($height)

    $: rows = data.length
    $: maxSimilarity = d3.max(data, d => d3.max(d, d => d[1]))
    $: color = d3.scaleLinear()
        .range([COLORS.white, COLORS.orange])
        .domain([0, maxSimilarity])    

    const onHeightChange = (height) => {
        if (!mounted) return

        const { width } = container.getBoundingClientRect()
        size = d3.scaleBand()
            .range([0, width])
            .domain(d3.range(rows))
            .padding(PADDING)
            .bandwidth()
    }

    const getStyle = (similarity: number, size: number) => `
            background: ${color(similarity)};
            height: ${size}px; 
            width: ${size}px;
        `
    
    const getTitle = (id: string) => {
        const { number, title, guests } = episode(id)
        return guests ? `${guests}, ${number}` : title 
    }

    onMount(() => mounted = true)
</script>

<div bind:this={container} class='container' style='height: {$height}px;'>
    {#each data as column, i}
        <div class="row">        
            <div class="row-title">{getTitle(column[i][0])}</div>
            {#each column as [_, sim], j}
                {#if i != j && i < j}
                    <div 
                        class='cell' 
                        style={getStyle(sim, size)}
                    ></div>
                {/if}
            {/each}
        </div>
    {/each}

    <label class='monospace'>Calculated using TF-IDF cosine similarity</label>
</div>

<style>
    .container {
        flex: 1.5;
        width: 100%;
        border: var(--line);
        padding: var(--s-3);
    }

    .row {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    .row-title {
        text-align: right;
    }

    .cell {
        margin: var(--s-2);
    }
</style>

