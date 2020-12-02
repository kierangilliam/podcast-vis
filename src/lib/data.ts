import * as Comlink from 'comlink';
import { writable } from 'svelte/store';
import type { TopTFIDF, WordOccurrences } from './types';

function arrayBufferToStr(buffer: ArrayBuffer) {
    // Use chunks to not go over call stack
    // chunks of 1024 bytes * 64
    const chunkSize = 1024 * 64
    // To right before the last chunk so the last `String.fromCharCode`
    // can skip passing a byteLength argument 
    const endCondition = buffer.byteLength - (chunkSize * 2)
    let str = ""
    let start = 0

    for (start = 0; start < endCondition; start += chunkSize * 2) {
        str += String.fromCharCode.apply(null, new Uint16Array(buffer, start, chunkSize))
    }

    const view = new Uint16Array(buffer, start)
    buffer = null
    str += String.fromCharCode.apply(null, view)


    return str
}

const w = new Worker("proto-worker.js");
// w.postMessage('Timelines')
w.postMessage('EpisodeSimilarity')

console.time('timelines --')
console.time('ep sim --')

w.addEventListener('message', function (event) {
    // w.postMessage()
    console.log('event', event, typeof event.data)
    if (event.data instanceof Uint8Array) {

        console.time('to str')
        const ab = (new TextDecoder("utf-8")).decode(event.data)
        console.timeEnd('to str')

        console.time('parse')
        const parsed = JSON.parse(ab)
        console.timeEnd('parse')


        if (parsed.timelines) {
            console.log('parsed timelines!')
            console.timeEnd('timelines --')
        } else if (parsed.episodeSimilarityTable && parsed.idLookupTable) {
            // Returns a function that maps from an idNum to an id
            function idLookup(idNum) {
                return parsed.idLookupTable.find(item => item.idNum === idNum).id
            }

            function reverseIdLookup(id) {
                if (!id) return
                return parsed.idLookupTable.find(item => item.id === id).idNum
            }

            epSims.set(parsed.episodeSimilarityTable)
            epSimReverseIdLookup.set(reverseIdLookup)
            epSimIdLookup.set(idLookup)

            console.timeEnd('ep sim --')

        } else {
            console.log('Unsure what was parsed:', parsed)
        }
    }

});

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

// setTimeout((async () => {
//     console.time('Episode similarity: get data (worker)')
//     const [allData, idLookupTable] = await protoWorker.getEpisodeSimilarityData()
//     console.timeEnd('Episode similarity: get data (worker)')

//     // Returns a function that maps from an idNum to an id
//     function idLookup(idNum) {
//         return idLookupTable.find(item => item.idNum === idNum).id
//     }

//     function reverseIdLookup(id) {
//         if (!id) return
//         return idLookupTable.find(item => item.id === id).idNum
//     }

//     epSims.set(allData)
//     epSimReverseIdLookup.set(reverseIdLookup)
//     epSimIdLookup.set(idLookup)
// }), 500)

export async function getTimelineData(): Promise<Timeline[]> {
    //     console.time('Timelines: get data (worker)')
    //     return new Promise((resolve) => {

    //         protoWorker.onready = Comlink.proxy((data) => {
    //             /* ... */
    //             console.log('on ready')
    //             const timelines = await protoWorker.getTimelineData()
    //             console.log(timelines)
    //             console.timeEnd('Timelines: get data (worker)')
    //             // return 
    //             resolve(timelines)
    //         });
    //     })
}