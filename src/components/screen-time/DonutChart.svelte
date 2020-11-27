<script lang='ts'>
    import * as d3 from 'd3'
    import { onMount, tick } from 'svelte'
    import { makeDonutChart } from './donut-chart'
    import { episode, getTitle } from '@lib/utils'
    import { H5, Spacer } from '@ollopa/cedar'

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

        const dataset = Object.entries(segments)
            .map(([cluster, value]) => ({ 
                series: cluster, 
                value,
                image: `images/${episodeID}.cluster.${cluster}.jpg`
            }))

        svg.call(donutChart.data(dataset))
        await tick()
        images = donutChart.getImages(svg)
    }

    const getImageStyle = ({ x, y }) => {
        const { top, left, width, height } = element.getBoundingClientRect()
        return `
            width: ${imageSize}px;
            height: ${imageSize}px;
            left: ${left + x + (width / 2) - (imageSize / 2)}px;
            top: ${top + y + (height / 2) - (imageSize / 2)}px;
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

<div class="container">
    <svg bind:this={element}></svg>
    <Spacer />
    <div class='title'>
        <div class='number-chip'>{episode(episodeID).number}</div>
        <Spacer s={2} />
        <H5>{getTitle(episodeID)}</H5> 
    </div>
</div>

{#each images as { image, x, y }}
    <img 
        src={image} 
        alt={`Screenshot from episode ${getTitle(episodeID)}`}
        style={getImageStyle({ x, y })} 
    />
{/each}

<style>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .title {

        display: flex;
        justify-content: center;
        align-items: center;
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