import * as Comlink from 'comlink'
import { writable } from 'svelte/store'
import type { TopTFIDF, WordOccurrences } from './types'

async function getData() {
    const worker = new Worker('./fetch-worker.js')
    const remoteFetch = Comlink.wrap(worker)
    return remoteFetch
}

export const wordOccurrences = writable<WordOccurrences>(null);
(async () => {
    // (await d3.csv('./word_occurrences.csv'))
    //     .forEach(({ id, top_words }) => {
    //         wc2[id] = (0, eval)('(' + top_words + ')')
    //     })

    // @ts-ignore
    const wc = await (await getData()).wordOccurrences()

    wordOccurrences.set(wc)
})()

export const topTFIDF = writable<TopTFIDF>(null);
(async () => {
    // (await d3.csv('./top_tfidf.csv'))
    //     .forEach(({ id, top_words }) => {
    //         (0, eval)('(' + top_words + ')')
    //     })

    const d = await (await getData()).topTfidf()
    topTFIDF.set(d)
})()