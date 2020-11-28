<script lang='ts'>
    import { onMount, tick } from 'svelte'
    import * as d3 from 'd3'
    import { episodes as allEpisodes, likeRatio } from '@lib/utils'
    import { COLORS } from '@lib/constants'
    import type { Episode } from '@lib/types'
    
    const TRANSITION_DURATION = 5000
    // 120 days
    const DATE_WINDOW = 120 * (24 * 60 * 60 * 1000)
    const episodes = allEpisodes.filter(({ main }) => main)
    const highlightedEpisodes = episodes.filter((_, i) => i % 10 == 0)

    const [minDate, maxDate] = d3.extent(episodes, d => d.published)
    const margin = {top: 10, right: 30, bottom: 30, left: 60},
        height = 400 - margin.top - margin.bottom

    let containerWidth: number
    let element: HTMLElement
    let svg
    let x, yLikeRatio, yViews //, xAxis, yAxisViews
    let viewsLine, viewsPoints, viewsLines
    let likesPoints, likeRatioLine, likeRatioLines
    let strokeWidth = 3
    let interval

    let start: Date = new Date('1-1-2018')
    let end = new Date(start.getTime() + DATE_WINDOW)

    const incrementDates = () => {
        start.setDate(start.getDate() + 15)
        end = new Date(start.getTime() + DATE_WINDOW)

        if (end > maxDate) {
            start = minDate
            end = new Date(start.getTime() + DATE_WINDOW)
        }
    }

    $: width = containerWidth - margin.left - margin.right
    $: handleChartUpdate(start, end)

    const withinDateExtent = (ep: Episode) => 
        ep.published >= start && ep.published <= end

    const updateDomains = () => {
        x.domain([start, end])
        yViews.domain([0, d3.max(episodes.filter(withinDateExtent), (d) => d.views)])
    }

    // Transititon and transition linear helper functions
    const t = (e) => e.transition().duration(TRANSITION_DURATION).ease(d3.easeLinear)

    const handleChartUpdate = (_, __) => {
        if (!svg) return

        updateDomains()

        // TODO d3's transition is extrememly
        t(likeRatioLines).attr('d', likeRatioLine)
        t(viewsLines).attr('d', viewsLine)
        t(viewsPoints).attr('cx', (d) => x(d.published)).attr('cy', (d) => yViews(d.views))
        t(likesPoints).attr('cx', (d) => x(d.published)).attr('cy', (d) => yLikeRatio(likeRatio(d.id)))
    }

    const makePoints = ({ name, color, y }) =>
        svg.selectAll(name)
            .data(episodes)
            .enter()
            .append('circle')
            .attr('fill', color)
            .attr('opacity', .9)
            .attr('stroke', 'none')
            .attr('cx', (d) => x(d.published))
            .attr('cy', y)
            .attr('r', strokeWidth * .75)
    
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

        // Horizontal lines for axis
        const axisLineWidth = 1
        svg.selectAll('axis-lines')
            .data([...Array(4)].map((_, i) => (i + 1) * 2))
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', i => yLikeRatio(i / 10) - axisLineWidth / 2)
            .attr('width', width)
            .attr('height', axisLineWidth)
            .attr('fill', COLORS.gray)
            .attr('opacity', .7)

        // View count
        viewsLine = d3.line()
            .x(d => x(d.published))
            .y(d => yViews(d.views))
            .curve(d3.curveCardinal.tension(0.5))

        viewsLines = svg.append('path')
            .datum(episodes)
            .attr('fill', 'none')
            .attr('stroke-opacity', .7)
            .attr('stroke', COLORS.orange)
            .attr('stroke-width', strokeWidth)
            .attr('d', viewsLine)
        
        viewsPoints = makePoints({ 
            name: 'views-points', 
            color: COLORS.orange,
            y: (d) => yViews(d.views),
        })
        
        likesPoints = makePoints({ 
            name: 'likes-points', 
            color: COLORS.green,
            y: d => yLikeRatio(likeRatio(d.id)),
        })
        
        // Like ratio gradient
        svg.append('linearGradient')
            .attr('id', 'like-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('y1', yLikeRatio(d3.min(episodes, d => likeRatio(d.id))))
            .attr('x2', 0)
            .attr('y2', yLikeRatio(1))
            .selectAll('stop')
            .data([{ offset: '25%', color: COLORS.red }, { offset: '100%', color: COLORS.green }])
            .enter()
            .append('stop')
            .attr('offset', (d) => d.offset)
            .attr('stop-color', (d) => d.color)

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
            .attr('stroke-opacity', .7)
            .attr('d', likeRatioLine)    


        // Clear interval when we leave view of chart
        const observer = new IntersectionObserver(e => {
            if (e[0].isIntersecting) {
                incrementDates()
                interval = setInterval(incrementDates, TRANSITION_DURATION)
            } else {
                clearInterval(interval)
            }
        }, { rootMargin: '0px', threshold: 0.1 })

        observer.observe(element)

        return () => observer.unobserve(element)
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
        background: linear-gradient(to right, 
            rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%, 
            rgba(255,255,255,0) 90%, rgba(255,255,255,1) 100%
        );
    }
</style>