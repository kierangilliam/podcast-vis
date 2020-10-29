import { writable } from 'svelte/store'

/**
 * Height must be set by SimilarityComparedAll element to 
 * maintain consistency.
 */
export const height = writable<number>(0)