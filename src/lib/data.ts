import * as Comlink from 'comlink';
import { writable } from 'svelte/store';
import type { Timeline, TopTFIDF, WordOccurrences } from './types';

export const CSVFetchWorker = Comlink.wrap(new Worker('./csv-fetch-worker.js'))
const protoWorker = Comlink.wrap(new Worker('./proto-worker.js'))

export const wordOccurrences = writable<WordOccurrences>(null);
(async () => {
    // let w = {}
    // (await d3.csv('./word_occurrences.csv'))
    //     .forEach(({ id, top_words }) => {
    //         wc2[id] = (0, eval)('(' + top_words + ')')
    //     })

    // @ts-ignore
    const wc = await CSVFetchWorker.wordOccurrences()

    wordOccurrences.set(wc)
})()

export const topTFIDF = writable<TopTFIDF>(null);
(async () => {
    // let w = {}
    // (await d3.csv('./top_tfidf.csv'))
    //     .forEach(({ id, top_words }) => {
    //         w[id] = (0, eval)('(' + top_words + ')')
    //     })

    const d = await CSVFetchWorker.topTfidf()
    topTFIDF.set(d)
})()

export const epSims = writable<any>(null)
export const epSimIdLookup = writable<any>(null)
export const epSimReverseIdLookup = writable<any>(null)

setTimeout((async () => {
    console.time('Episode similarity: get data (worker)')
    const [allData, idLookupTable] = await protoWorker.getEpisodeSimilarityData()
    console.timeEnd('Episode similarity: get data (worker)')

    // Returns a function that maps from an idNum to an id
    function idLookup(idNum) {
        return idLookupTable.find(item => item.idNum === idNum).id
    }

    function reverseIdLookup(id) {
        if (!id) return
        return idLookupTable.find(item => item.id === id).idNum
    }

    epSims.set(allData)
    epSimReverseIdLookup.set(reverseIdLookup)
    epSimIdLookup.set(idLookup)
}), 500)

export async function getTimelineData(): Promise<Timeline[]> {
    console.time('Timelines: get data (worker)')
    const timelines = await protoWorker.getTimelineData()
    console.timeEnd('Timelines: get data (worker)')
    return timelines
}