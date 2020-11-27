import * as d3 from 'd3'
import type { WordOccurrence } from './types'
import { episode } from './utils'

export const wordOccurrences = (() => {
    let data

    return async (): Promise<WordOccurrence[]> => {
        if (data.length > 0) return data

        data = (await d3.csv('./word_occurrences.csv'))
            .map(({ id, top_words }) => ({
                id,
                topWords: (0, eval)('(' + top_words + ')'),
                ...episode(id),
            }))
    }
})()