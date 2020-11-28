import * as d3 from 'd3';
import { writable } from 'svelte/store';
import type { TopTFIDF, WordOccurrences } from './types';

export const wordOccurrences = writable<WordOccurrences>(null);
(async () => {
    let wc = {};
    (await d3.csv('./word_occurrences.csv'))
        .forEach(({ id, top_words }) => {
            wc[id] = (0, eval)('(' + top_words + ')')
        })

    wordOccurrences.set(wc)
})()

export const topTFIDF = writable<TopTFIDF>(null);
(async () => {
    let d = {};
    (await d3.csv('./top_tfidf.csv'))
        .forEach(({ id, top_words }) => {
            d[id] = (0, eval)('(' + top_words + ')')
        })

    topTFIDF.set(d)
})()