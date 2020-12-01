export interface Episode {
    guests: string
    published: Date
    title: string
    number: number
    id: string
    main: boolean
    likes: number
    dislikes: number
    views: number
}

export interface WordOccurrences {
    [id: string]: object
}

export interface TopTFIDF {
    [id: string]: string[]
}

export interface Timestamp { start: number, end: number }
export interface TimelineCluster { id: string, timestamps: Timestamp[] }
export interface Timeline { id: string, clusters: TimelineCluster[], frames: number }