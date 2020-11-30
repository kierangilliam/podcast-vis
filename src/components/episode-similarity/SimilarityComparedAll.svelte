<script lang='ts'>
    import { H5, Spacer } from '@ollopa/cedar'
    import { onMount } from 'svelte'
    import { episode } from '@lib/utils'
    import Search from '../Search.svelte'    
    import TfidfWords from '../TFIDFWords.svelte'

    export let id: string
    export let data: [string, number, string][]
    
    let container: HTMLElement
    let resultsElement: HTMLElement
    let totalWidth = 0
    let mounted = false
    let searchVisible: boolean

    //  Reset scroll on ep change
    $: data && resultsElement && resultsElement.scrollTo(0, 0)

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

<div bind:this={container} class='container'>
    <p class='description'>Most similar podcasts to...</p>
    
    <div class='title'>
        <div class='flex between'>
            <h5>{episode(id).guests}</h5>
            <p class="number-chip">{episode(id).number}</p>
        </div>
        <p class='inline-button' on:click={() => searchVisible=true}>
            Search for a different episode
        </p>
    </div>

    <Spacer s={12} />

    {#if mounted}
        <div class='results' bind:this={resultsElement}>        
            {#each data as [ID, sim]}
                <div class='details'>
                    <div class='title' on:click={() => id = ID}>
                        <p class='number-chip'>{episode(ID).number}</p>
                        {episode(ID).guests}
                    </div>
                    <p>{Math.round(sim*100)}%</p>
                </div>
                <div class='bar' style='width: {barWidth(sim)}px'></div>
                
                <TfidfWords id={ID} />

                <Spacer s={6} />
            {/each}
        </div>  
    {/if}
    <div class='cover'></div>
</div>

<style>
    .container {
        flex: 1;
        width: 100%;
        min-height: 40vh;
        max-height: 70vh;
        border: var(--line);
        padding: var(--s-3);
        border: none;
        position: relative;
    }
    .cover {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
        touch-action: none;
        background: linear-gradient(to bottom, 
            rgba(255,255,255,0) 75%,
            rgba(255,255,255,.9) 90%,
            rgba(255,255,255,1) 100%
        );
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
    .details .title h4 {
        text-decoration: underline;
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

    /* Small screens */
    @media screen and (max-width: 1150px) {
        .container {
            height: 85vh !important;
            max-height: 85vh !important;
        }
    }
</style>