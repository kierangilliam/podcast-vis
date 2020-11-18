<script lang='ts'>
	import { COLORS } from '@lib/constants'
    import { H3, Search } from '@ollopa/cedar'
	import * as d3 from 'd3'
	import { onMount } from 'svelte'

	interface Episode {
		id: string
		title: string
		data: object
	}

	const width = 450, height = 450, margin = 40
	const radius = Math.min(width, height) / 2 - margin
	const donutThickness = 50

	let data: Episode[]
	let search: string = ''
	let episode = null
	let svg, pie

	$: searchResults = filterSearch(data, search)
	$: updateGraph(episode)

	const filterSearch = (_, __) => {
		if (!search || !data) return []
		return data.filter(({ title }) => 
			title.toLowerCase().includes(search.toLowerCase())
		)
	}

	const formatData = data => {
		data = (0, eval)('(' + data + ')')
		// Remove small values
		Object.entries(data).forEach(([cluster, amount]) => {
			if (amount < 0.001) {
				delete data[cluster]
			}
		})
		return data
	}

	const updateGraph = (episode: Episode) => {
		if (!episode) return 

		const color = d3.scaleOrdinal()
			.domain(d3.extent(Object.values(episode.data)))
			.range([
				COLORS.orange, COLORS.blue, COLORS.green, 
				COLORS.purple, COLORS.red, COLORS.black, COLORS.darkOrange
			])

		const pie = d3.pie().value(([_, value]) => value)

		const arc = d3.arc()
			.innerRadius(radius - donutThickness)
			.outerRadius(radius)

		const arcData = pie(Object.entries(episode.data))

		const arcs = svg.selectAll('arcs')
			.data(arcData)
			.enter()
			// .transition()
			// .duration(1000)

		const paths = arcs.append('path')
			.attr('d', arc)
			.attr('fill', d => color(d.data[0]))
			.attr('stroke', COLORS.white)
			.style('stroke-width', '4px')
			.style('opacity', 0.7)

		const legendText = arcs.append('text')
			.attr('dx', `-1em`)
			.attr('dy', (d, i) => `${2 * i - 2}em`)
			.style('text-anchor', 'left')
			.style('color', COLORS.black)
			.text(({ data }) => data[0])

		const legendColors = arcs.append("rect")
			.attr("x", '-2.75em')
			.attr('y', (_, i) => `${2 * i - 3}em`)
			.attr("rx", "6px")
			.attr("width", 20)
			.attr("height", 20)
			.attr('fill', d => color(d.data[0]))
		
	}

	onMount(async () => {
        data = (await d3.csv('./video-segments.csv'))
            .map(({ id, number, title, data }) => ({
                id, number: +number, title,
                data: formatData(data),
            }))

		episode = data[0]
		
		pie = d3.pie().value(([_, value]) => value)
		svg = d3.select('#data')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');		

		const arcData = pie(Object.entries(episode.data))		
		const arcs = svg.selectAll('arcs')
			.data(arcData)
			.enter()
	})
</script>

<div class='container'>
	<div id='data'></div>
	<div>
		<H3>Screen time</H3>
		<Search 
			placeholder='lex fridman' 
			bind:search
			stretch
		/>
		{#each searchResults as ep}
			<div 
				class="result"
				on:click={() => episode = ep}
			>
				{ ep.title }
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	
    @media screen and (min-width: 750px) {
        .container {
            flex-direction: row;
        }
    }

	.result {
		cursor: pointer;
	}
</style>