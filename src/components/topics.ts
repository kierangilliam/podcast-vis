export interface Bin {
    start: number
    end: number
    episodeIDs: string[]
    cfd: { [key: string]: number }
    tfidf: [string, number][]
}