<script lang='ts'>
    import { H4, H5, Spacer } from '@ollopa/cedar'
    import { onMount, tick } from 'svelte'
    import { height } from './similarity-state'
    import { episode } from '@lib/utils'
    import Search from './Search.svelte'

    export let id: string
    export let data: [string, number, string][]

    let container: HTMLElement
    let totalWidth = 0
    let mounted = false
    let searchVisible

    const barWidth = (sim) => {
        return totalWidth * sim 
    }

    onMount(async () => {
        totalWidth = container.getBoundingClientRect().width
        mounted = true

        // Wait for progress bars to enter the DOM
        await tick()
        $height = container.getBoundingClientRect().height
    })
</script>

<!-- TODO -->
<!-- {searchableEpisodes} -->
<Search bind:episodeID={id} bind:visible={searchVisible}  />

<div bind:this={container} class='container'>
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

    <Spacer s={8} />

    {#if mounted}
        {#each data as [ID, sim, words]}
            <div class='details'>
                <p class='title' on:click={() => id = ID}>{episode(ID).guests}, {episode(ID).number}</p>
                <p>{Math.round(sim*100)}%</p>
            </div>
            <div class='bar' style='width: {barWidth(sim)}px'></div>
            <!-- TODO -->
            <label class='monospace words'>{words}</label>
            <Spacer s={6} />
        {/each}
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

    .description {
        color: var(--darkGray);
    }

    .details {
        display: flex;
        justify-content: space-between;
    }
    .details .title {
        cursor: pointer;
    }
    .details .title:hover {
        font-weight: bolder;
    }

    .bar {
        background: var(--orange);
        height: 25px;
        transition: all 250ms ease-in-out;
    }
</style>