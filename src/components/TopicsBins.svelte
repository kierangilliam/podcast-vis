<script lang='ts'>
    import { H5 } from '@ollopa/cedar'
    import Slider from './Slider.svelte'
    import ReverseStem from './ReverseStem.svelte'
    import type { Bin } from './topics'

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
    <div 
        class='slider'
        on:mousemove={() => highlighted = visibleBins.flatMap(b => b.episodeIDs)}
        on:mouseout={() => highlighted = null}
    >
        <Slider bind:value={binsStart} min={0} max={bins.length - VISIBLE_BIN_COUNT} />
    </div>

    {#each visibleBins as item}
        <div 
            class='bin' 
            on:mouseover={() => highlighted = item.episodeIDs}
            on:mouseout={() => highlighted = null}
        >
            <div class='bin-title'>
                <H5>{item.start} - {item.end}</H5>
            </div>
            
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
    .bin:first-of-type {
        margin-left: var(--s-8);
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
        position: absolute;
        width: var(--sliderHeight);
        left: calc(var(--sliderHeight) / -2 - var(--sliderXOffset));
        top: calc(var(--sliderHeight) / 2);
        transform: rotate(270deg);
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
</style>