<script lang='ts'>
    import { fly } from 'svelte/transition'

    export let tooltip: { x: number, y: number }

    let tooltipElem: HTMLElement

    $: tooltipStyle = tooltip && tooltipElem && (() => {
        const { x, y } = tooltip
        const { height, width } = tooltipElem.getBoundingClientRect()
        const tooltipOffset = 15
        return `left: ${x - width / 2}px; top: ${y - height - tooltipOffset}px`
    })()
</script>

{#if tooltip}
    <div 
        bind:this={tooltipElem} 
        class='tooltip' 
        style={tooltipStyle}
        in:fly={{ y: 50 }}
    >
        <slot />
    </div>
{/if}

<style>
    .tooltip {
        position: fixed;
        z-index: 100;
        background: var(--lightGray);
        border: 2px solid var(--black);
        padding: var(--s-3) var(--s-4);
    }
    /* Triangle */
    .tooltip:before{
        content:'';
        display: block;
        width:0;
        height:0;
        position: absolute;
        border-top: 8px solid var(--black);
        border-left: 8px solid transparent; 
        border-right: 8px solid transparent;
        left: calc(50% - 4px);        
        bottom: -8px;
    }
</style>