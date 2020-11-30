<script lang='ts'>
    import { getContext, onMount, tick } from 'svelte'
    import * as d3 from 'd3'
    import { likeRatio } from '@lib/utils'
    import { COLORS } from '@lib/constants'
    import type { Episode } from '@lib/types'

    export let start: Date, end: Date
    export let episodes: Episode[]
    export let transitionDuration: number
    
    const { likeColorGradient, viewsColor, likeRatioColor } = getContext('settings')
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        height = 350 - margin.top - margin.bottom

    let containerWidth: number
    let element: HTMLElement
    let svg
    let x, yLikeRatio, yViews
    let viewsLine, viewsPoints, viewsLines
    let likesPoints, likeRatioLine, likeRatioLines
    let strokeWidth = 4

    $: width = containerWidth - margin.left - margin.right
    
    $: handleChartUpdate(start, end)        

    const withinDateExtent = (ep: Episode) => 
        ep.published >= start && ep.published <= end

    const updateDomains = () => {
        x.domain([start, end])
        yViews.domain([0, d3.max(episodes.filter(withinDateExtent), (d) => d.views)])
    }

    // Transititon and transition linear helper functions
    const t = (e) => e.transition().duration(transitionDuration).ease(d3.easeLinear)

    const handleChartUpdate = (_, __) => {
        if (!svg) return

        updateDomains()

        // TODO d3's transition is extrememly slow
        t(likeRatioLines).attr('d', likeRatioLine)
        t(viewsLines).attr('d', viewsLine)
    }
    
    onMount(async () => {
        // Wait for container to render
        await tick()

        svg = d3.select(element)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        x = d3.scaleTime().range([0, width])
        yViews = d3.scaleLinear().range([height, 0])
        yLikeRatio = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0])

        updateDomains()        
        
        likeColorGradient(svg, yLikeRatio)

        // Like ratio
        likeRatioLine = d3.line()                
            .x((d) => x(d.published))
            .y((d) => yLikeRatio(likeRatio(d.id)))
            .curve(d3.curveCardinal.tension(0.5))

        likeRatioLines = svg.append('path')
            .datum(episodes)
            .attr('fill', 'none')
            .attr('stroke', 'url(#like-gradient)')
            .attr('stroke-width', strokeWidth)
            .attr('d', likeRatioLine)    

        // View count
        viewsLine = d3.line()
            .x(d => x(d.published))
            .y(d => yViews(d.views))
            .curve(d3.curveCardinal.tension(0.5))

        viewsLines = svg.append('path')
            .datum(episodes)
            .attr('fill', 'none')
            .attr('stroke', viewsColor)
            .attr('stroke-width', strokeWidth)
            .attr('d', viewsLine)
    })
</script>

<div class='container' bind:clientWidth={containerWidth}>
    <div bind:this={element}></div>
    <div class='cover'></div>
</div>

<style>
    .container {
        width: 100%;
        position: relative;
    }

    .cover {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
        touch-action: none;
        background: linear-gradient(to right, 
            rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%, 
            rgba(255,255,255,0) 90%, rgba(255,255,255,1) 100%
        );
    }
</style>