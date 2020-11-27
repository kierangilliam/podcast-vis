<script lang='ts'>
    import * as d3 from 'd3'
    import { onMount, tick } from 'svelte'
    import { makeDonutChart } from './donut-chart'
    import type { Episode } from '@lib/utils'

    export let episode: Episode
    export let segments: { [key: number]: number }
    export let width = 500
    export let height = 500

    const IMAGE_SIZE = 100

    let element: SVGSVGElement, svg
    let images: { image: string, x: number, y: number }[] = []

    const donutChart = makeDonutChart({ 
        animationDuration: 750,
        outerRadius: 220,
        innerRadius: 150
    })

    $: updateData(svg, episode)

    const updateData = async (..._) => {
        if (!svg || !segments || !episode) return

        const dataset = Object.entries(segments)
            .map(([cluster, value]) => ({ 
                series: cluster, 
                value,
                image: `images/${episode.id}.cluster.${cluster}.jpg`
            }))

        svg.call(donutChart.data(dataset))
        await tick()
        images = donutChart.getImages(svg)
    }

    const getImageStyle = ({ x, y }) => {
        const { top, left, width, height } = element.getBoundingClientRect()
        return `
            left: ${left + x + (width / 2) - (IMAGE_SIZE / 2)}px;
            top: ${top + y + (height / 2) + (IMAGE_SIZE / 2)}px;
        `
    }

    onMount(() => {
        svg = d3.select(element)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    })

</script>

<svg bind:this={element} class='container'></svg>

{#each images as { image, x, y }}
    <img 
        src={image} 
        alt={`Screenshot from episode ${episode.title}`}
        style={getImageStyle({ x, y })} 
    />
{/each}

<style>
    img {
        position: absolute;
        object-fit: cover;
        border-radius: 50%;
        height: 100px;
        width: 100px;
        transition: all 100ms ease-in-out;
    }
    img:hover {
        width: initial;
        transform: scale(1.5);
        border-radius: 0;
    }
</style>