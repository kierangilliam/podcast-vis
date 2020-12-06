import * as Comlink from 'comlink'
import * as d3 from 'd3'
import { writable } from 'svelte/store'
import { ID } from './stores'
import type { Episode, Timeline, TopTFIDF, WordOccurrences } from './types'


export const episodes = writable<Episode[]>(null)
export const wordOccurrences = writable<WordOccurrences>(null)
export const topTFIDF = writable<TopTFIDF>(null)
export const epSims = writable<any>(null)
export const epSimIdLookup = writable<any>(null)
export const epSimIdLookupTable = writable<any>(null)
export const epSimReverseIdLookup = writable<any>(null)
export const timelines = writable<Timeline[]>(null)
export const screenTime = writable<any>(null)
export let stemToWord = null;


const CSVFetchWorker = Comlink.wrap(new Worker('./csv-fetch-worker.js'))
const protoWorker = new Worker('proto-worker.js')


ID.subscribe(async $ID => {
    if (!$ID) return

    console.log('Updating data for', $ID)

    episodes.set(null)
    topTFIDF.set(null)
    wordOccurrences.set(null)
    epSims.set(null)
    epSimIdLookup.set(null)
    epSimReverseIdLookup.set(null)
    stemToWord = null

    episodes.set((await d3.csv(`./data/${$ID}/episodes.csv`))
        .map(({ published, number, main, views, likes, dislikes, ...rest }) => ({
            published: new Date(published),
            number: +number,
            likes: +likes,
            dislikes: +dislikes,
            views: +views,
            main: main === 'True' ? true : false,
            ...rest,
        })))

    console.time('Loading csv and json data')
    const [_topTFIDF, _wordOccurrences, _screenTime, _stemToWord] = await Promise.all([
        // @ts-ignore
        CSVFetchWorker.topTfidf($ID),
        // @ts-ignore
        CSVFetchWorker.wordOccurrences($ID),
        // @ts-ignore
        CSVFetchWorker.screenTime($ID),
        fetch(`./data/${$ID}/reverse_stem.json`),
    ])
    console.timeEnd('Loading csv and json data')

    topTFIDF.set(_topTFIDF)
    wordOccurrences.set(_wordOccurrences)
    screenTime.set(_screenTime)
    stemToWord = await _stemToWord.json()

    protoWorker.postMessage(`ID${$ID}`)
    setTimeout(() => protoWorker.postMessage('EpisodeSimilarity'), 500)
    // TODO Tweak number
    setTimeout(() => protoWorker.postMessage('Timelines'), 1500)
})

protoWorker.addEventListener('message', function (event) {
    if (event.data instanceof Uint8Array) {
        console.time('Parsing ArrayBuffer to JSON (Main thread)')
        const jsonString = (new TextDecoder('utf-8')).decode(event.data)
        const parsed = JSON.parse(jsonString)
        console.timeEnd('Parsing ArrayBuffer to JSON (Main thread)')

        if (parsed.timelines) {
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
            epSimIdLookupTable.set(parsed.idLookupTable)
            return
        }

        console.error('Unsure what was parsed:', event, parsed)
        return
    }
})