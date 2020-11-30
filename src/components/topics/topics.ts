export interface Bin {
    start: number
    end: number
    startDate: Date
    endDate: Date
    episodeIDs: string[]
    cfd: { [key: string]: number }
    tfidf: [string, number][]
}