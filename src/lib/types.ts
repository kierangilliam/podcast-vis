export interface Episode {
    guests: string
    published: Date
    title: string
    number: number
    id: string
    main: boolean
}

export interface WordOccurrences {
    [id: string]: object
}

export interface TopTFIDF {
    [id: string]: string[]
}