<script lang='ts'>
    import { fly } from 'svelte/transition'
    import * as d3 from 'd3'
    import { onMount, tick } from 'svelte'
    import { makeDonutChart } from './donut-chart'
    import { episode, getTitle } from '@lib/utils'
    import { H5, Spacer } from '@ollopa/cedar'
import { COLORS } from '@lib/constants';

    export let episodeID: string
    export let segments: { [key: number]: number }
    export let width: number
    export let height: number
    export let imageSize: number

    let element: SVGSVGElement, svg
    let images: { image: string, x: number, y: number }[] = []

    const donutChart = makeDonutChart({ 
        animationDuration: 750,
        outerRadius: (width / 2),
        innerRadius: (width / 2) - 50
    })

    $: updateData(svg, episodeID)

    const updateData = async (..._) => {
        if (!svg || !segments || !episodeID) return

        const colors = [COLORS.orange, COLORS.blue, COLORS.green, COLORS.purple,
                        COLORS.red, COLORS.black, COLORS.darkOrange]

        const dataset = Object.entries(segments)
            .map(([cluster, value], i) => ({ 
                series: cluster, 
                value,
                image: `images/${episodeID}.cluster.${cluster}.jpg`,
                color: colors[i],
            }))

        svg.call(donutChart.data(dataset))
        await tick()
        images = donutChart.getImages(svg)
    }

    const imageStyle = ({ x, y }) => {
        const { top, left, width, height } = element.getBoundingClientRect()
        return `
            width: ${imageSize}px;
            height: ${imageSize}px;
            left: ${left + x + (width / 2) - (imageSize / 2)}px;
            top: ${top + y + (height / 2) - (imageSize / 2)}px;
        `
    }
    
    const titleStyle = () => {
        const { top, left, width, height } = element.getBoundingClientRect()
        const titleSize = width / 2
        return `
            width: ${titleSize}px;
            height: ${titleSize}px;
            left: ${left + (width / 2) - (titleSize / 2)}px;
            top: ${top + (height / 2) - (titleSize / 2)}px;
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

<svg bind:this={element}></svg>

{#if element}
    <div class='title' style={titleStyle()} in:fly={{ y: 150 }}>
        <H5>{getTitle(episodeID)}</H5> 
        <div class='number-chip'>{episode(episodeID).number}</div>
    </div>

    {#each images as { image, x, y }}
        <img 
            src={image} 
            alt={`Screenshot from episode ${getTitle(episodeID)}`}
            style={imageStyle({ x, y })} 
        />
    {/each}
{/if}


<style>
    .title {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: absolute;
    }
    
    img {
        position: absolute;
        object-fit: cover;
        border-radius: 50%;
        transition: all 175ms ease-in-out;
        box-shadow: var(--level-1);
    }
    img:hover {
        width: initial;
        transform: scale(3);
        border-radius: 0;
    }
</style>