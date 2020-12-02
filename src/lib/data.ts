import * as Comlink from 'comlink';
import { writable } from 'svelte/store';
import type { Timeline, TopTFIDF, WordOccurrences } from './types';


const protoWorker = new Worker("proto-worker.js")


protoWorker.addEventListener('message', function (event) {
    console.log('event', event, typeof event.data)

    if (event.data instanceof Uint8Array) {
        console.time('Parsing ArrayBuffer to JSON (Main thread)')
        const jsonString = (new TextDecoder("utf-8")).decode(event.data)
        const parsed = JSON.parse(jsonString)
        console.timeEnd('Parsing ArrayBuffer to JSON (Main thread)')

        if (parsed.timelines) {
            console.timeEnd('Load Timelines Data (Worker)')
            timelines.set(parsed.timelines)
            return
        }

        else if (parsed.episodeSimilarityTable && parsed.idLookupTable) {
            // Returns a function that maps from an idNum to an id
            const idLookup = (idNum) =>
                parsed.idLookupTable.find(item => item.idNum === idNum).id

            function reverseIdLookup(id) {
                if (!id) return
                return parsed.idLookupTable.find(item => item.id === id).idNum
            }

            epSims.set(parsed.episodeSimilarityTable)
            epSimReverseIdLookup.set(reverseIdLookup)
            epSimIdLookup.set(idLookup)

            console.timeEnd('Load Episode Similarity Data (Worker)')
            return
        }

        console.error('Unsure what was parsed:', event, parsed)
        return
    }
})


setTimeout(() => {
    console.time('Load Episode Similarity Data (Worker)')
    protoWorker.postMessage('EpisodeSimilarity')
}, 500)


export const CSVFetchWorker = Comlink.wrap(new Worker('./csv-fetch-worker.js'))


export const wordOccurrences = writable<WordOccurrences>(null);
(async () => {
    // @ts-ignore
    const wc = await CSVFetchWorker.wordOccurrences()
    wordOccurrences.set(wc)
})()


export const topTFIDF = writable<TopTFIDF>(null);
(async () => {
    // @ts-ignore
    const d = await CSVFetchWorker.topTfidf()
    topTFIDF.set(d)
})()


export const epSims = writable<any>(null)
export const epSimIdLookup = writable<any>(null)
export const epSimReverseIdLookup = writable<any>(null)


export const timelines = writable<Timeline[]>(null)
export function requestTimelineData() {
    console.time('Load Timelines Data (Worker)')
    protoWorker.postMessage('Timelines')
}