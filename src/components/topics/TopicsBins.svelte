<script lang='ts'>
    import { H5, Spacer } from '@ollopa/cedar'
    import Slider from './Slider.svelte'
    import ReverseStem from '../ReverseStem.svelte'
    import type { Bin } from './topics'
import { isMobile } from '@lib/utils';

    export let bins: Bin[]
    export let highlighted: string[]
    export let pinnedWord: string

    const VISIBLE_WORDS_COUNT = 15
    // Number of bins visible
    const VISIBLE_BIN_COUNT = 5

    let binsStart = bins.length - VISIBLE_BIN_COUNT
    let hoverWord = null

    $: visibleBins = bins && bins.slice(binsStart, binsStart + VISIBLE_BIN_COUNT)
</script>

<div class='bins'>
    {#if !isMobile}
        <div 
            class='slider'
            on:mousemove={() => highlighted = visibleBins.flatMap(b => b.episodeIDs)}
            on:mouseleave={() => highlighted = null}
        >
            <Slider bind:value={binsStart} min={0} max={bins.length - VISIBLE_BIN_COUNT} />
        </div>
    {/if}

    {#each visibleBins as item}
        <div 
            class='bin' 
            on:mouseover={() => highlighted = item.episodeIDs}
            on:mouseout={() => highlighted = null}
        >
            <h5 class='bin-title'>{item.start} - {item.end}</h5>
            
            <div class='bin-inner'>
                {#each item.tfidf.slice(0, VISIBLE_WORDS_COUNT) as [word, _]}
                    <p 
                        class:selected={pinnedWord == word}
                        class:hover={pinnedWord != word && word == hoverWord}
                        on:click={() => pinnedWord = word}
                        on:mouseover={() => hoverWord = word}
                        on:mouseout={() => hoverWord = null}
                    >
                        <ReverseStem stem={word} />
                    </p>
                {/each}
            </div>
        </div>
    {/each}    
</div> 

{#if isMobile}
    <div 
        class='slider'
        on:touchmove={() => highlighted = visibleBins.flatMap(b => b.episodeIDs)}
        on:touchend={() => highlighted = null}
    >
        <Spacer />
        <Slider bind:value={binsStart} min={0} max={bins.length - VISIBLE_BIN_COUNT} />
    </div>
{/if}

<style>
    .bins {
        display: flex;
        flex: 1.5;
        justify-content: space-between;
        /* So that .slider can be positioned relative to this div */
        position: relative;
    }

    .bin {
        text-align: center;        
        transition: all 250ms ease-in;
        width: 100%;
        margin: 0 var(--s-2);
    }    

    .bin-inner {
        padding: var(--s-2) var(--s-3);
        background-color: var(--lightGray);
        border: var(--line);
    }
    .bin-inner p {
        cursor: pointer;
        font-family: var(--headingFont);
    }

    .slider {
        --sliderHeight: 425px;
        --sliderXOffset: 15px;
        width: 100%;
    }    

    .selected {
        border-radius: var(--s-3);
        background: var(--peach);
    }
    .hover {
        opacity: .75;
        border-radius: var(--s-3);
        background: var(--peach);
    }

    /* Small screens */
    @media screen and (max-width: 750px) {
        .bins, .bin-title {
            font-size: var(--textSmall);
            overflow-x: scroll;            
        }
    }

    /* Big screens */
    @media screen and (min-width: 750px) {
        /* Vertical slider */
        .slider {
            position: absolute;
            width: var(--sliderHeight);
            left: calc(var(--sliderHeight) / -2 - var(--sliderXOffset));
            top: calc(var(--sliderHeight) / 2);
            transform: rotate(270deg);
        }
        .bin:first-of-type {
            margin-left: var(--s-8);
        }
    }
</style>