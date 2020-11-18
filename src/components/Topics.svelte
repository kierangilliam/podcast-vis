<script lang='ts'>
    import { H3, H5 } from '@ollopa/cedar'
	import * as d3 from 'd3'
    import { onMount } from 'svelte'
    import { chunk } from '@lib/utils'
    import Chart from './TopicsChart.svelte'
    import { episode } from '@lib/utils'

    interface Data {
        id: string
        number: number
        title: string
        topWords: object
    }

    interface Bin {
        start: number
        end: number
        cfd: {[key: string]: number}
        tfidf: [string, number][]
    }

    // Number of bins visible
    const BIN_COUNT = 5  
    const VISIBLE_WORDS_COUNT = 15

    let data: Data[]
    let selectedWord = 'mask', hoverWord = null

    $: bins = bin(data)
    $: chartData = getChartData(bins, selectedWord)
    
    const getChartData = (bins: Bin[], word: string) => {
        if (!bins || !word) return

        return data
            .map(({ topWords, number }) => ({
                number, 
                termFrequency: topWords[word] || 0,
            }))
            .filter(({ number }) => number != 0)
    }

    /**
     * Bin episode CFDs into
    */
    const bin = (data: Data[]): Bin[] => {
        if (!data) return

        const binLength = 10              

        const bins: Omit<Bin, 'tfidf'>[] = chunk(data, binLength)
            .map((bin: Data[]) => {
                    // Sum items in bin
                    const cfd = bin.reduce((prev, curr) => {
                            Object.entries(curr.topWords).forEach(([key, value]) => {
                                prev[key] = (prev[key] || 0) + value
                            })

                            return prev
                    }, ({}))

                    return {
                        cfd,
                        start: d3.min(bin, d => d.number),
                        end: d3.max(bin, d => d.number),                        
                    }
                })

        const allWords = bins.reduce((prev, curr) => 
            Array.from(new Set(prev.concat(Object.keys(curr.cfd))))
        , [])

        // Document frequency of a word
        let binFrequency = {}
        allWords.forEach(word => {
            bins.forEach(bin => {
                if (word in bin.cfd) {
                    binFrequency[word] = (binFrequency[word] || 0) + 1
                }
            })
        })

        return bins.map(bin => {
            const tfidf = {}
            Object.entries(bin.cfd).forEach(([word, tf]) => {
                const idf = bins.length / (binFrequency[word] + 1)
                tfidf[word] = tf * Math.log(idf)                
            })
            return { 
                ...bin, 
                tfidf: Object.entries<number>(tfidf)
                    .sort((a, b) => b[1] - a[1]) 
            }
        })
    }

    onMount(async () => {
        data = (await d3.csv('./word_occurrences.csv'))
            .map(({ id, number, title, top_words }) => ({
                id, 
                number: episode(id).number, 
                title: episode(id).title,
                topWords: (0, eval)('(' + top_words + ')'),
            }))
    })
</script>

<H3>Topics</H3>

{#if bins}
    <div class="container">
        {#each bins.slice(0, BIN_COUNT) as item}
            <div class="bin">
                <div class="bin-title">
                    <H5>{item.start} - {item.end}</H5>
                </div>
                <div class="bin-inner">
                    {#each item.tfidf.slice(0, VISIBLE_WORDS_COUNT) as [word, _]}
                        <p 
                            class:selected={selectedWord == word}
                            class:hover={selectedWord != word && word == hoverWord}
                            on:click={() => selectedWord = word}
                            on:mouseover={() => hoverWord = word}
                            on:mouseout={() => hoverWord = null}
                        >
                            {word}
                        </p>
                    {/each}
                </div>
            </div>
        {/each}

        {#if chartData}
            <Chart word={selectedWord} data={chartData} />
        {/if}
    </div>
{/if}

<style>
    .container {
        display: flex;
    }

    .bin {
        text-align: center;
        margin-right: var(--s-6);
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