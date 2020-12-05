<script lang='ts'>
    import { fly } from 'svelte/transition'

    export let x: number
    export let y: number
    export let yOffset = 0

    let tooltipElem: HTMLElement

    $: tooltipStyle = x && y && tooltipElem && (() => {
        const { height, width } = tooltipElem.getBoundingClientRect()
        return `left: ${x - width / 2}px; top: ${y - height - yOffset}px`
    })()
</script>

{#if x && y}
    <div class='background'>
        <div 
            bind:this={tooltipElem} 
            class='tooltip' 
            style={tooltipStyle}
            transition:fly={{ y: 20, duration: 150 }}
        >
            <slot />
        </div>
    </div>
{/if}

<style>
    .background {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 400;
    }

    .tooltip {
        --tooltipSize: 8px;
        --tooltipLeft: calc(50% - var(--tooltipSize) / 2);
        --tooltipBorderWidth: 2px;

        position: absolute;
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