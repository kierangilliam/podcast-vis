<script lang='ts'>
    import { H4, Spacer } from '@ollopa/cedar'
    import { onMount, tick } from 'svelte'
    import { height } from './similarity-state'

    export let data

    let container: HTMLElement
    let totalWidth = 0
    let mount

    let episodes: [string, number, string][] = [
        ['Lex Fridmxan, 421', .24, 'Technology, AI, Genome, Race, Gym'],
        ['Elon Musk, 231', .21, 'Technology, AI, Genome, Race, Gym'],
        ['Steve Wozniack, 123', .18,'Technology, AI, Genome, Race, Gym'],
        ['Michael Stevens, 123', .13,'Technology, AI, Genome, Race, Gym'],
        ['Linus Torvalds, 21', .08, 'Technology, Linux, Computing, Hardware'],
    ]

    $: largestSimilarity = episodes.sort((a, b) =>  b[1] - a[1])[0][1]

    const barWidth = (sim) => {
        return totalWidth * sim 
    }

    onMount(async () => {
        totalWidth = container.getBoundingClientRect().width
        mount = true

        // Wait for progress bars to enter the DOM
        await tick()
        $height = container.getBoundingClientRect().height
    })
</script>

<div bind:this={container} class='container'>
    <H4>Elon Musk</H4>
    <p>Most similar podcasts</p>
    <Spacer s={8} />

    {#if mount}
        {#each episodes as [name, sim, words]}
            <div class='details'>
                <p>{name}</p>
                <p>{sim*100}%</p>
            </div>
            <div class='bar' style='width: {barWidth(sim)}px'></div>
            <label class="monospace words">{words}</label>
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

    .details {
        display: flex;
        justify-content: space-between;
    }

    .bar {
        background: var(--orange);
        height: 25px;
    }
</style>