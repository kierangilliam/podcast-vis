<script lang='ts'>
    import { fly } from 'svelte/transition'

    export let tooltip: { x: number, y: number }

    let tooltipElem: HTMLElement

    $: tooltipStyle = tooltip && tooltipElem && (() => {
        const { x, y } = tooltip
        const { height, width } = tooltipElem.getBoundingClientRect()
        const tooltipOffset = 25
        return `left: ${x - width / 2}px; top: ${y - height - tooltipOffset}px`
    })()
</script>

{#if tooltip}
    <div 
        bind:this={tooltipElem} 
        class='tooltip' 
        style={tooltipStyle}
        transition:fly={{ y: 20, duration: 150 }}
    >
        <slot />
    </div>
{/if}

<style>
    .tooltip {
        --tooltipSize: 8px;
        --tooltipLeft: calc(50% - var(--tooltipSize) / 2);
        --tooltipBorderWidth: 2px;

        position: fixed;
        z-index: 100;
        background: var(--lightGray);
        border: var(--tooltipBorderWidth) solid var(--black);
        padding: var(--s-3) var(--s-4);        
    }
    /* Triangle */
    .tooltip:before{
        content:'';
        display: block;
        position: absolute;
        width:0;
        height:0;

        border-top: var(--tooltipSize) solid var(--black);
        border-left: var(--tooltipSize) solid transparent; 
        border-right: var(--tooltipSize) solid transparent;
        
        left: var(--tooltipLeft);        
        bottom: calc(-1 * var(--tooltipSize));
    }
    .tooltip:after {
        content: '';
        display: block;  
        position: absolute;
        width: 0;
        height: 0;

        top: 100%; /* bottom: 100% if tooltip is on top */
        left: calc(var(--tooltipLeft) + var(--tooltipBorderWidth) * 1.5);
        border: calc(var(--tooltipSize) - var(--tooltipBorderWidth) * 1.5) solid transparent;
        border-top-color: var(--lightGray);
    }
</style>