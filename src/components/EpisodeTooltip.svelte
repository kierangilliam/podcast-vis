<script lang='ts'>
    import { episode, getTitle } from '@lib/utils'
    import { Spacer } from '@ollopa/cedar'
    import Tooltip from './Tooltip.svelte'
    import TfidfWords from './TFIDFWords.svelte'

    export let id
    export let x
    export let y
    export let words = false

    $: e = episode(id)
</script>

<Tooltip {x} {y} yOffset={25}>
    <div class='flex between'>
        <p class='tooltip-title'>{getTitle(id)}</p>
        <p class='number-chip'>{e.number}</p>
    </div>

    <Spacer s={6} />

    <div class='flex between'>
        <slot></slot>
        <p class='published'>{e.published.toDateString()}</p>
    </div>    

    {#if words}
        <Spacer s={2} />
        <TfidfWords {id} />
    {/if}
</Tooltip>

<style>
    .tooltip-title {
        margin-right: var(--s-6);
    }
    .published {
        margin-left: var(--s-12);
        font-size: var(--textSmall);
        /* TODO really need a light-black / darker gray. same thing in description of compared all */
        opacity: .75;
    }
</style>