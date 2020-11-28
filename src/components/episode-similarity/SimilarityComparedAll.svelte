<script lang='ts'>
    import { H4, H5, Spacer } from '@ollopa/cedar'
    import { onMount } from 'svelte'
    import { height } from './similarity-state'
    import { episode } from '@lib/utils'
    import Search from '../Search.svelte'    
    import { topTFIDF } from '@lib/data'
    import ReverseStem from '../ReverseStem.svelte'

    export let id: string
    export let data: [string, number, string][]
    
    let container: HTMLElement
    let totalWidth = 0
    let mounted = false
    let searchVisible: boolean

    const barWidth = (sim) => {
        return totalWidth * sim 
    }

    onMount(() => {        
        totalWidth = container.getBoundingClientRect().width
        mounted = true
    })
</script>

<!-- TODO -->
<!-- {searchableEpisodes} -->
<Search bind:episodeID={id} bind:visible={searchVisible}  />

<div bind:this={container} class='container' style='height: {$height}px;'>
    <p class='description'>Most similar podcasts</p>
    
    <div class='title'>
        <H4>{episode(id).guests}</H4>
        <div class='flex between'>
            <H5>{episode(id).number}</H5>
            <p class='inline-button' on:click={() => searchVisible=true}>
                Search for a different episode
            </p>
        </div>
    </div>

    <Spacer s={12} />

    {#if mounted}
        <div class="results">        
            {#each data as [ID, sim]}
                <div class='details'>
                    <div class='title' on:click={() => id = ID}>
                        <p class="number-chip">{episode(ID).number}</p>
                        {episode(ID).guests}
                    </div>
                    <p>{Math.round(sim*100)}%</p>
                </div>
                <div class='bar' style='width: {barWidth(sim)}px'></div>
                
                <div class="words">
                    {#each $topTFIDF ? $topTFIDF[ID].slice(0, 5) : [] as stem}
                        <ReverseStem {stem} />
                        <span />
                    {/each}
                </div>

                <Spacer s={6} />
            {/each}
        </div>  
    {/if}
</div>

<style>
    .container {
        flex: 1;
        width: 100%;
        height: 100%;
        border: var(--line);
        padding: var(--s-3);
    }

    .words {
        display: flex;
        font-size: var(--smallText);
        font-family: monospace;
        overflow-x: hidden;
        flex-wrap: wrap;
        height: 20px;
    }
    .words > span {
        margin-right: var(--s-2);
    }

    .description {
        opacity: .75;
    }

    .results {
        overflow-y: scroll;
        height: 70%;
    }

    .details {
        display: flex;
        justify-content: space-between;
        width: 95%;
        margin-bottom: var(--s-2);
    }
    .details .title {
        cursor: pointer;
        transition: all 250ms ease-in;
        display: flex;
    }
    .details .title .number-chip {
        margin-right: var(--s-2);
    }
    .details .title:hover {
        font-size: 1.1rem;
    }

    .bar {
        background: var(--orange);
        height: 25px;
        transition: all 250ms ease-in-out;
    }
</style>