<script lang='ts'>
    import { fly } from 'svelte/transition'
    import * as d3 from 'd3'
    import { onMount, tick } from 'svelte'
    import { makeDonutChart } from './donut-chart'
    import { episode, formatViews, getTitle, likeRatio } from '@lib/utils'
    import { H5 } from '@ollopa/cedar'
    import { COLORS } from '@lib/constants';

    export let episodeID: string
    export let segments: { [key: number]: number }
    export let width: number
    export let height: number
    export let imageSize: number

    let element: SVGSVGElement, svg
    let titleSize = width / 2 - 10
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

    const centerOfChart = (offset) => {
        const { top, left, width, height } = element.getBoundingClientRect()
        
        return {
            cx: left + (width / 2) - offset + window.scrollX,
            cy: top + (height / 2) - offset + window.scrollY,
        }
    }

    const imageStyle = ({ x, y }) => {
        const { cx, cy } = centerOfChart(imageSize / 2)
        return `width: ${imageSize}px; height: ${imageSize}px; left: ${x + cx}px; top: ${y + cy}px;`
    }
    
    const titleStyle = () => {
        const { cx, cy } = centerOfChart(titleSize / 2)
        return `width: ${titleSize}px; height: ${titleSize}px; left: ${cx}px; top: ${cy}px;`
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
        {formatViews(episodeID)} views
        <div class="likes"><div class="ratio" style={`--ratio: ${likeRatio(episodeID)}`}></div></div>
    </div>

    <div class="images">
        {#each images as { image, x, y }}
            <img 
                src={image} 
                alt={`Screenshot from episode ${getTitle(episodeID)}`}
                style={imageStyle({ x, y })} 
            />
        {/each}
    </div>
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
    .images:hover img:not(:hover) {
        transform: scale(.4);
    }
    img:hover {
        width: initial;
        transform: scale(3);
        border-radius: 0;
        z-index: 100;
    }

    .likes {
        background: var(--red);
        height: var(--s-2);
        width: 70%;
        border-radius: 999px;
        position: relative;
    }
    .likes .ratio {
        border-radius: 999px;
        width: calc(var(--ratio) * 100%);
        top: 0;
        left: 0;
        height: 100%;
        position: absolute;
        background: var(--green);
        transition: width 500ms ease-out;
    }
</style>