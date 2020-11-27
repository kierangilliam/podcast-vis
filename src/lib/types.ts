export interface Episode {
    guests: string
    published: Date
    title: string
    number: number
    id: string
    main: boolean
}

export interface WordOccurrence extends Episode {
    topWords: object
}