<script lang='ts'>
    import { Spacer } from '@ollopa/cedar'
    import { data as clusters } from './data-TEMP-DELETE'
    import { clickOutside } from '@lib/utils'
    import Tooltip from '../Tooltip.svelte'
    
    export let episodeID: string

    const expandAmount = .05
    let expandAt: number
    let element: HTMLElement
    let width: number
    
    $: expanded = clusters && expandAt && filtered()

    const withinExpandedRegion = ([start, end]) => 
        start > expandAt - (expandAmount / 2) && end < expandAt + (expandAmount / 2)
                    
    const filtered = (): [string, number[][]] => {
        // @ts-ignore
        return Object.entries(clusters)
            .map(([cluster, timestamps]) => [cluster, timestamps.filter(withinExpandedRegion)])
            .filter(([ _, timestamps]) => timestamps.length > 0)
    }

    const lineStyle = ([start, end]: [number, number], _) => {
        return `
            width: ${(end - start) * width}px;
            left: ${start * width}px;
        `
    }
    
    const expandedLineStyle = ([start, end]: [number, number], _) => {
        return `
            width: ${(end - start) * width * (1 / expandAmount)}px;
            left: ${(start - expandAt) * width * (1 / expandAmount) + (width / 2)}px;
        `
    }

    const hideExpanded = () => { expandAt = null }
    const setExpanded = ({ offsetX }) => { expandAt = offsetX / width }
</script>

{#if expanded}
    <Tooltip 
        x={width / 2 + element.getBoundingClientRect().left} 
        y={element.getBoundingClientRect().top}
    >
        <div class='expanded-container' style={`width: ${width}px`}>
            {#each expanded as [cluster, timestamps]}
                <Spacer />
                <div class='row'>
                    <!-- TODO Animate with delay -->
                    {#each timestamps as [start, end]}
                        <div 
                            class='expanded-line' 
                            style={expandedLineStyle([start, end], width)}
                        ></div>
                    {/each}
                </div>
                <Spacer />
            {/each}
        </div>
    </Tooltip>
{/if}

<div class='container' bind:this={element} bind:clientWidth={width}>
    <div class="chart">
        {#each Object.entries(clusters) as [cluster, timestamps]}    
            <Spacer />
            <div class='row'>
                <!-- TODO Animate with delay -->
                {#each timestamps as [start, end]}
                    <div 
                        class='line' 
                        class:highlighted={withinExpandedRegion([start, end], expanded)}
                        style={lineStyle([start, end], width)}
                    ></div>
                {/each}
            </div>        
        {/each}
    </div>
    <!-- Psuedo element to capture all interaction -->
    <div 
        class="interaction-capturer" 
        on:mousemove={setExpanded}
        on:click={setExpanded}
        on:mouseleave={hideExpanded}
        use:clickOutside={hideExpanded}
    ></div>
</div>


<style>
    .expanded-container {
        position: relative;
    }

    .container {
        position: relative;
    }

    .interaction-capturer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transition: border 250ms ease-in;
        border-radius: 2px;
    }
    .interaction-capturer:hover {
        border: var(--line);
    }

    .row {
        position: relative;
    }

    .expanded-line {
        position: absolute;
        height: 8px;
        background: var(--orange);
    }

    .line {
        position: absolute;
        height: 8px;
        background: var(--orange);
        border-radius: 1px;
    }
    .line:not(.highlighted) {
        background: var(--gray);
    }
</style>