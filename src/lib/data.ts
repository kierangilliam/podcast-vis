import { EpisodeSims, IDs } from '@lib/proto/ep-sim'
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

export const epSims = writable<any>(null);
export const epSimIdLookup = writable<any>(null);
export const epSimReverseIdLookup = writable<any>(null);
(async () => {
    function loadSims(buffer) {
        // @ts-ignore
        const pbf = new Pbf(new Uint8Array(buffer));
        // @ts-ignore
        const { rows } = EpisodeSims.read(pbf);
        return rows
    }

    // Returns a function that maps from an idNum to an id
    function loadIDLookup(buffer) {
        // @ts-ignore
        const pbf = new Pbf(new Uint8Array(buffer));
        // @ts-ignore
        const { rows } = IDs.read(pbf);

        function lookup(idNum: number): string {
            return rows.find(item => item.idNum === idNum).id
        }

        function reverseIdLookup(id: string): number {
            if (!id) return
            return rows.find(item => item.id === id).idNum
        }

        return [lookup, reverseIdLookup]
    }

    // TODO Hacky
    console.log('start ep sim loading')
    const fetcher = await getData()
    const [epSimBuffer, idLookupBuffer] = await Promise.all(
        // @ts-ignore
        [fetcher.getBuffer('./ep_sim'), fetcher.getBuffer('./ep_sim_id_lookup')]
    )
    console.log('mid ep sim')
    const allData = loadSims(epSimBuffer)
    const [idLookup, reverseIdLookup] = loadIDLookup(idLookupBuffer)
    console.log('end ep sim loading')

    epSims.set(allData)
    epSimReverseIdLookup.set(reverseIdLookup)
    epSimIdLookup.set(idLookup)
})()