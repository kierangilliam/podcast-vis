import * as d3 from 'd3'
import type { WordOccurrence } from './types'

export const getWordOccurrences = (() => {
    let data: WordOccurrence[]

    return async (): Promise<WordOccurrence[]> => {
        if (data) return data

        data = (await d3.csv('./word_occurrences.csv'))
            .map(({ id, top_words }) => ({
                id,
                topWords: (0, eval)('(' + top_words + ')'),
            }))

        return data
    }
})()