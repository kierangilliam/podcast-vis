<script lang='ts'>
    import { H3 } from '@ollopa/cedar'
	import * as Comlink from 'comlink'
    import { episode, isMobile } from '@lib/utils'
    import Chart from './TopicsChart.svelte'
    import type { Episode } from '@lib/types'
    import TopicsBins from './TopicsBins.svelte'
    import { wordOccurrences } from '@lib/data'
    import type { Bin } from './topics'
    import { onMount, tick } from 'svelte'
    import { ID } from '@lib/stores'

    type ChartDataPoint = Episode & { termFrequency: number }

    // Episode ids that are emphasized on the chart
    let highlighted: string[]
    let pinnedWord
    let width: number
    let mounted = false
    let bins: Bin[] = null

    $: bin($wordOccurrences)    
    $: chartData = getChartData($wordOccurrences, pinnedWord)
    
    const getChartData = (_, __) => {
        if (!$wordOccurrences || !pinnedWord) return

        return Object.entries($wordOccurrences)
            .map<ChartDataPoint>(([id, topWords]) => ({
                ...episode(id),
                termFrequency: topWords[pinnedWord] || 0,
            }))
            .filter(({ number }) => number != 0)
    }

    /**
     * Turn the word occurrences for episode into bins of {binLength} episodes
     * Then calculate TF-IDF scores, treating bins as 'documents'
    */
    const bin = async (_) => {
        if (!$wordOccurrences) return
        
        const binLength = 10  
        const worker = new Worker('./tfidf-worker.js')
        const remoteTFIDFFunction = Comlink.wrap(worker)
        const data = Object.entries($wordOccurrences).map(([id, topWords]) =>
            ({ ...episode(id), topWords })
        )
        // @ts-ignore
        bins = await remoteTFIDFFunction(binLength, data)
    }

    onMount(async () => {
        // TODO this should be in settings
        if ($ID === 'jre') {
            pinnedWord = 'mask'
        }
        if ($ID === 'lex') {
            pinnedWord = 'death'
        }

        await tick()
        mounted = true
    })
</script>

<div class="title">
    <H3>Topics over time</H3>
    <div class='explanation'>
        How does the conversation change from month to month, year to year?
        Click on a term in the bins to update the 'term frequency' chart. 
        Use the scrollbar to go back / forward in time.
    </div>
</div>

<div class='container' bind:clientWidth={width}>
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

    .title {
        padding: 0 var(--s-4);
        max-width: 700px;
    }    

    .explanation {
        margin-bottom: var(--s-6);
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