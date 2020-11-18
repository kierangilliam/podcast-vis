<script lang='ts'>
    import { H4, Spacer } from '@ollopa/cedar'
    import { onMount, tick } from 'svelte'
    import { height } from './similarity-state'
    import { episode } from '@lib/utils'

    export let id: string
    export let data: [string, number, string][]

    let container: HTMLElement
    let totalWidth = 0
    let mount

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
    <H4>{episode(id).guests}, {episode(id).number}</H4>
    <p>Most similar podcasts</p>
    <Spacer s={8} />

    {#if mount}
        {#each data as [id, sim, words]}
            <div class='details'>
                <p>{episode(id).guests}, {episode(id).number}</p>
                <p>{Math.round(sim*100)}%</p>
            </div>
            <div class='bar' style='width: {barWidth(sim)}px'></div>
            <!-- TODO -->
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