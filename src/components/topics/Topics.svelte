<script lang='ts'>
    import { H3 } from '@ollopa/cedar'
	import * as d3 from 'd3'
    import { chunk, episode, isMobile } from '@lib/utils'
    import Chart from './TopicsChart.svelte'
    import type { Episode } from '@lib/types'
    import TopicsBins from './TopicsBins.svelte'
    import { wordOccurrences } from '@lib/data'
    import type { Bin } from './topics'
    import { onMount, tick } from 'svelte'

    type ChartDataPoint = Episode & { termFrequency: number }

    // Episode ids that are emphasized on the chart
    let highlighted: string[]
    let pinnedWord = 'mask'
    let width: number
    let height: number
    let mounted = false

    $: bins = bin($wordOccurrences)    
    $: chartData = getChartData(bins, pinnedWord)
    
    const getChartData = (bins: Bin[], word: string) => {
        if (!bins || !word) return

        return Object.entries($wordOccurrences)
            .map<ChartDataPoint>(([id, topWords]) => ({
                ...episode(id),
                termFrequency: topWords[word] || 0,
            }))
            .filter(({ number }) => number != 0)
    }

    /**
     * Bin episode CFDs into
    */
    const bin = (_): Bin[] => {
        if (!$wordOccurrences) return

        const binLength = 10              
        
        let data = Object.entries($wordOccurrences).map(([id, topWords]) => 
            ({ ...episode(id), topWords })
        )

        const bins: Omit<Bin, 'tfidf'>[] = chunk(data, binLength)
            .map((bin: (Episode & { topWords: object })[]) => {
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
                        startDate: d3.min(bin, d => d.published),
                        endDate: d3.max(bin, d => d.published),    
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
        await tick()
        mounted = true
    })
</script>

<H3>Topics over time</H3>

<div class='container' bind:clientWidth={width} bind:clientHeight={height}>
    {#if bins}
        <TopicsBins {bins} bind:pinnedWord bind:highlighted />           

        {#if chartData && mounted}
            <div class='chart'>
                <Chart 
                    {pinnedWord} 
                    data={chartData} 
                    {highlighted} 
                    width={isMobile ? width - 50 : 400} 
                    height={400} 
                />
            </div>
        {/if}
    {/if}
</div>

<style>
    .chart {
        margin-top: var(--s-8);
    }    

    /* Big screens */
    @media screen and (min-width: 1150px) {
        .container {
            display: flex;
        }    
        .chart {
            margin-top: -12px;
        }    
    }
</style>