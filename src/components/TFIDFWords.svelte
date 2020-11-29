<script>
    import { topTFIDF } from '@lib/data'
    import ReverseStem from './ReverseStem.svelte'

    export let id
    export let show = 5

    $: words = $topTFIDF && id && $topTFIDF[id] 
        ? $topTFIDF[id].slice(0, show) 
        : []
</script>

<div class="words">
    {#each words as stem}
        <ReverseStem {stem} />
        <span />
    {/each}
</div>

<style>
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
</style>