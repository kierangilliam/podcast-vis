<script lang='ts'>
    import { fly } from 'svelte/transition'
    import * as d3 from 'd3'
    import { onMount, tick } from 'svelte'
    import { makeDonutChart } from './donut-chart'
    import { episode, formatViews, getTitle, likeRatio, clickOutside } from '@lib/utils'
    import { Spacer } from '@ollopa/cedar'
import { ID } from '@lib/stores';

    export let episodeID: string
    export let segments: { [key: number]: number }
    export let chartSize: number
    export let imageSize: number
    export let colors

    let images: { image: string, x: number, y: number, id: string }[] = []
    let element: SVGSVGElement, svg
    let titleSize = chartSize / 2 - 10
    let highlighted

    const donutChart = makeDonutChart({ 
        animationDuration: 750,
        outerRadius: (chartSize / 2),
        innerRadius: (chartSize / 2) - 50
    })

    $: updateData(svg, episodeID)
    $: sum = segments && Object.values(segments).reduce((p, c) => p + c,0)

    const updateData = async (..._) => {
        if (!svg || !segments || !episodeID) return

        const dataset = Object.entries(segments)
            .map(([cluster, value]) => ({ 
                series: cluster, 
                value,
                image: `./data/${$ID}/images/${episodeID}.cluster.${cluster}.jpg`,
                color: colors[cluster],
            }))

        svg.call(donutChart.data(dataset))
        await tick()
        images = donutChart.getImages(svg)
    }

    const centerOfChart = (offset) => {
        const { width, height } = element.getBoundingClientRect()
        
        return {
            cx: (width / 2) - offset,
            cy: (height / 2) - offset
        }
    }

    const imageStyle = ({ x, y }, isIcon=false, highlighted=false) => {
        const size = isIcon ? imageSize / 1.5 : imageSize
        const { cx, cy } = centerOfChart(size / 2)
        return `--size: ${size}px; transform: translate(${x + cx}px, ${y + cy}px) ${highlighted ? 'scale(3)' : ''};`
    }
    
    const titleStyle = () => {
        const { cx, cy } = centerOfChart(titleSize / 2)        
        return `--size: ${titleSize}px; transform: translate(${cx}px, ${cy}px);`
    }

    onMount(() => {
        svg = d3.select(element)
            .attr('width', chartSize)
            .attr('height', chartSize)
            .append('g')
            .attr('transform', 'translate(' + chartSize / 2 + ',' + chartSize / 2 + ')')
    })

</script>

<div class="container">
    {#if element}
        <div class='title' style={titleStyle()} in:fly={{ y: 150 }}>
            <h4>{getTitle(episodeID)}</h4>        
            <Spacer s={3} />
            <span>
                <div>{episode(episodeID).published.toDateString()}</div>
                <Spacer s={2} />
                <span class='number-chip'>{episode(episodeID).number}</span>
            </span>
            <Spacer s={3} />
            <div class="likes"><div class="ratio" style={`--ratio: ${likeRatio(episodeID)}`}></div></div>
            <Spacer s={3} />
            <div>{formatViews(episodeID)} views</div>            
            
        </div>
    
        <div class="images">
            {#each images as { image, x, y, id }}
                <img 
                    src={image} 
                    on:mouseover={() => { highlighted = id }}
                    on:click={() => { highlighted = id }}
                    on:mouseleave={() => { highlighted = null }}
                    use:clickOutside={() => { highlighted = null }}
                    alt={`Screenshot from episode ${getTitle(episodeID)}`}
                    style={imageStyle({ x, y }, false, highlighted === id)} 
                />
                <div class="img-details" style={imageStyle({ x, y }, true)}>
                    {Math.floor(segments && segments[id] / sum * 100)}<span>%</span>
                </div>
            {/each}
        </div>
    {/if}

    <svg bind:this={element}></svg>
</div>


<style>
    .container {
        position: relative;
    }

    .title, img {
        width: var(--size);
        height: var(--size);
    }

    .title {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: absolute;
    }
    .title span {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .title h4 {
        font-family: 'Times New Roman', Times, serif;
        font-style: italic;
        font-weight: bold;
    }

    .images:hover img:not(:hover) {
        transform: scale(.4);
    }
    .images:hover .img-details {
        opacity: 1;
    }
    
    .img-details {
        display: flex;
        width: 50px;
        height: 50px;
        justify-content: center;
        align-items: center;
        position: absolute;
        opacity: 0;
        transition: opacity 250ms ease-out;
        background: var(--lightGray);
        box-shadow: var(--level-1);
        border-radius: 999px;
        font-weight: bolder;
        font-family: 'Times New Roman', Times, serif;
        padding: var(--s-4);
        touch-action: none;
    }
    .img-details span {
        font-size: .7rem;
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