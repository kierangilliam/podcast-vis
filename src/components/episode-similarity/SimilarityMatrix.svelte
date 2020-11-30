<script lang='ts'>
    import { createEventDispatcher, onMount } from 'svelte'
    import { COLORS } from '@lib/constants'
    import * as d3 from 'd3'
    import { episode, getTitle, isMobile } from '@lib/utils'    
    import { Spacer } from '@ollopa/cedar'

    export let data: [string, number][][]
    
    const PADDING = isMobile ? .05 : .15
    const dispatch = createEventDispatcher()

    let mounted = false
    let size = 0
    // let maxSimilarity = .4
    // Row Col
    let focusHovering: [number, number] = null
    let focusedClicked: [number, number] = null
    let containerHeight: number, containerWidth: number
    let container: HTMLElement

    $: focused = getHoveringDetails(focusHovering)
    
    $: maxSimilarity = d3.max(data, d => d3.max(d, d => d[1]))

    $: onHeightChange(containerHeight)

    $: rows = data.length
    $: color = d3.scaleLinear()
        .range([COLORS.white, COLORS.orange])
        .domain([0, maxSimilarity])    

    const onHeightChange = (_) => {
        if (!mounted) return

        size = d3.scaleBand()
            .range([0, containerWidth])
            .domain(d3.range(rows))
            .padding(PADDING)
            .bandwidth()
    }

    const getStyle = (similarity: number, size: number) => `
            background: ${color(similarity)};
            height: ${size}px !important; 
            width: ${size}px !important;
        `

    // Get details of element being hovered over
    const getHoveringDetails = (_: [number, number]) => {
        if (!focusHovering) return 

        const [row, col] = focusHovering
        const [ep1, ep2] = [data[row][row][0], data[row][col][0]]

        return {
            index: [row, col],
            ep1: episode(ep1),
            ep2: episode(ep2),
            similarity: data[row][col][1],
        }
    }

    onMount(async () => {
        mounted = true
    })
</script>

<div bind:this={container} class='container' bind:clientHeight={containerHeight} bind:clientWidth={containerWidth}>
    {#each data as column, i}
        <div class='row'>        
            <div 
                class='row-title' 
                style={`--size: ${size}px;`}
                class:focused={focused && (focused.index[0] == i || focused.index[1] == i)}
                class:not-focused={focused && focused.index[0] != i && focused.index[1] != i}
            >
                {getTitle(column[i][0])}
                <p class="number-chip">{episode(column[i][0]).number}</p>
            </div>

            {#each column as [_, sim], j}
                {#if i != j && i < j}
                    <div 
                        class='cell' 
                        style={getStyle(sim, size)}
                        on:click={() => focusedClicked = [i, j]}
                        on:mouseenter={() => focusHovering = [i, j]}
                        on:mouseleave={() => focusHovering = null}
                    >
                        <p>{Math.round(sim * 100)}%</p>
                    </div>
                {/if}
            {/each}
        </div>
    {/each}

    <Spacer s={8} />

    <div class='details'>
        <div>
            <div class='legend'>
                <div class='scale-numbers'>
                    <p>0%</p>
                    <p>{Math.round(maxSimilarity * 100)}%</p>
                </div>
                <div 
                    class='scale'
                    style={`background-image: linear-gradient(to right, ${COLORS.white}, ${COLORS.orange});`}
                >
                    {#if focused}
                        <div 
                            class='scale-indicator' 
                            style={`left: ${focused.similarity / maxSimilarity * 100}%`}>
                        </div>
                    {/if}
                </div>
            </div>
            <Spacer s={2} />
            <label class='monospace'>Calculated using TF-IDF cosine similarity</label>
        </div>
        <div>
            <p class="inline-button" on:click={() => dispatch('randomize')}>Randomize</p>
        </div>
    </div>
</div>

<style>
    .container {
        flex: 1.25;
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
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        text-align: center;
        transition: all 250ms;
        width: var(--size);
        height: var(--size);
    }    
    .row-title:last-of-type {
        text-align: center;
        align-items: center;
    }
    .row-title.focused {
        transform: scale(1.15);
    }
    .row-title.not-focused {
        transform: scale(.5);
    }    

    .cell {
        border: none;
        transition: all 250ms ease-in-out;
        margin: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .cell p {
        font-family: var(--headingFont);
        font-size: 1.7rem;
        opacity: 0;
        color: var(--darkOrange);
    }
    .cell:hover {
        border: 4px solid var(--darkOrange);
        box-shadow: var(--level-2);
        cursor: pointer;
    }
    .cell:hover p {
        opacity: 1;
    }

    .details {
        display: flex;
        justify-content: space-between;
    }

    .legend {
        width: 100%;
    }
    .scale-numbers {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--textSmall);
    }
    .scale {
        height: var(--s-6);
        box-shadow: var(--level-1);
    }
    .scale-indicator {
        width: 2px;
        height: 100%;
        position: relative;
        background: var(--darkOrange);
    }

    /* Small screens */
    @media screen and (max-width: 750px) {
        .row-title {
            font-size: var(--textSmall);
        }
        .row-title:first-of-type {
            margin-left: -5%;
        }
        .details {
            flex-direction: column;
        }
        .cell {
            margin: 2px;
        }
    }
</style>

