<script lang='ts'>
    import { H3 } from '@ollopa/cedar'
	import * as d3 from 'd3'
    import { onMount } from 'svelte'
    import { chunk } from '@lib/utils'
    import Chart from './TopicsChart.svelte'
    import { episode } from '@lib/utils'
    import type { Episode } from '@lib/utils'
    import TopicsBins from './TopicsBins.svelte'
    
    import type { Bin } from './topics'

    interface Data extends Episode {
        topWords: object
    }            

    let data: Data[]
    // Episode ids that are emphasized on the chart
    let highlighted: string[]
    let pinnedWord = 'mask'

    $: bins = bin(data)    
    $: chartData = getChartData(bins, pinnedWord)
    
    const getChartData = (bins: Bin[], word: string) => {
        if (!bins || !word) return

        return data
            .map(({ topWords, ...rest }) => ({
                ...rest, 
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
                        episodeIDs: bin.map(({ id }) => id)                    
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
            .filter(({ start }) => start != 0)
            .reverse()
    }

    onMount(async () => {
        data = (await d3.csv('./word_occurrences.csv'))
            .map(({ id, top_words }) => ({
                id, 
                topWords: (0, eval)('(' + top_words + ')'),
                ...episode(id), 
            }))
        
        bins = bin(data)        
    })
</script>

<H3>Topics over time</H3>

{#if bins}
    <div class='container'>
        <TopicsBins {bins} bind:pinnedWord bind:highlighted />           

        {#if chartData}
            <div class='chart'>
                <Chart {pinnedWord} data={chartData} {highlighted} />
            </div>
        {/if}
    </div>
{/if}

<style>
    .container {
        display: flex;
    }    
</style>