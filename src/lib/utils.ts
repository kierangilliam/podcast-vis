import * as d3 from 'd3'
import { writable } from 'svelte/store'
import type { Episode } from './types'

export const wait = async (ms: number) =>
    new Promise(res => setTimeout(() => res(), ms))

export const setCSSVar = ([name, value]: [string, string]) =>
    document.documentElement.style.setProperty(`--${name}`, value)

export const getCSSVar = (name: string) =>
    getComputedStyle(document.body).getPropertyValue(`--${name}`)

export const getCSSVarPx = (name: string) =>
    parseInt(getCSSVar(name).split('px')[0])

export let episodesLoaded = writable(false);
export let episodes: Episode[] = [];
(async () => {
    episodes = (await d3.csv('./episodes.csv'))
        .map(({ published, number, main, views, likes, dislikes, ...rest }) => ({
            published: new Date(published),
            number: +number,
            likes: +likes,
            dislikes: +dislikes,
            views: +views,
            main: main === "True" ? true : false,
            ...rest,
        }))
    episodesLoaded.set(true)
})();

export const episode = (id: string) => {
    return episodes.find(e => e.id === id)
}

export const getTitle = (id: string) => {
    let { title, guests } = episode(id)

    if (guests.toLowerCase().includes("part")) {
        guests = guests.replace(/\(Part?.*\)/g, "")
    }

    return guests ? guests : title
}

export const likeRatio = (id: string): number => {
    const { likes, dislikes } = episode(id)
    return likes / (likes + dislikes)
}

export const formatViews = (id: string): string => {
    const { views } = episode(id)
    return formatBigNumber(views)
}

export const formatDate = (x) => {
    const d = new Date(x)
    const month = d.toLocaleString('default', { month: 'short' });
    return `${month}, ${d.getFullYear().toString().slice(-2)}'`
}

export const formatBigNumber = (n: number): string => {
    if (n < 1_000) return `${n}`
    if (n > 999 && n < 1_000_000) return (Math.abs(n) / 1_000).toFixed(1) + 'k'
    if (Math.abs(n) / 1_000_000 % 5 == 0) return Math.round((Math.abs(n) / 1_000_000)) + 'm'
    return (Math.abs(n) / 1_000_000).toFixed(1) + 'm'
}

export let stemToWord = null;
(async () => {
    stemToWord = (await (await fetch('./reverse_stem.json')).json())
})();

/** Dispatch event on click outside of node */
export function clickOutside(node, handler: () => any) {
    const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            handler()
        }
    }

    document.addEventListener('click', handleClick, true)

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    }
}

export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
