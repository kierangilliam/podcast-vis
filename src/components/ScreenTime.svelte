<script lang='ts'>
	import { COLORS } from '@lib/constants'
    import { Flex, H3, H5 } from '@ollopa/cedar'
	import * as d3 from 'd3'
	import { onMount } from 'svelte'

	const data1 = {
		'Camera Center': 9, 
		'Camera Left': 20, 
		'Camera Right': 30,
	}
	
	const data2 = {
		'Camera Center': 3, 
		'Camera Left': 21, 
		'Camera Right': 40,
	}
	
	const data3 = {
		'Camera Center': 13, 
		'Camera Left': 13, 
		'Camera Right': 42,
	}

	const data = Array.from([data1, data2, data3])

	const width = 450, height = 450, margin = 40
	const radius = Math.min(width, height) / 2 - margin

	onMount(() => {
		const svg = d3.select('#data')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');		

		const color = d3.scaleOrdinal()
			.domain(d3.extent(Object.values(data1)))
			.range([COLORS.blue, COLORS.green, COLORS.purple, COLORS.red])

		const pie = d3.pie().value(([_, value]) => value)


		const paths = data.map((data, index) => {
			const radiusScaled = (1 - (index * /* gap */ .1)) * radius

			const arc = d3.arc()
				// Donut size
				.innerRadius(radiusScaled - 20)
				.outerRadius(radiusScaled)
	
			const arcData = pie(Object.entries(data))
	
			const arcs = svg
				.selectAll('arcs')
				.data(arcData)
				.enter()
	
			const paths = arcs.append('path')
				.attr('d', arc)
				.attr('fill', d => color(d.data[0]))
				.attr('stroke', COLORS.white)
				.style('stroke-width', '4px')
				.style('opacity', 0.7)
	
			const legendText = arcs.append('text')
				.attr('dx', `-2em`)
				.attr('dy', (d, i) => `${2 * i - 2}em`)
				.style('text-anchor', 'left')
				.style('color', COLORS.black)
				.text(({ data }) => data[0])
	
			const legendColors = arcs.append("rect")
				.attr("x", '-3.75em')
				.attr('y', (_, i) => `${2 * i - 3}em`)
				.attr("rx", "6px")
				.attr("width", 20)
				.attr("height", 20)
				.attr('fill', d => color(d.data[0]))

			return paths	
		})

		paths.forEach(chart => {
			chart.on('mousemove', (e, d) => {
				// return paths.forEach(chart => 
				chart
					.attr("transform", function (d) {
						const x = e.movementX
						const y = e.movementY
						let r = Math.sqrt(x * x + y * y)
						r = x < 0 ? -1 * r : r
						const angle = Math.sin(y / r)
						const a = x < 0 ? 2 * angle : angle 
						let rotate = 180 - a / Math.PI * 180
						
						if (isNaN(rotate)) {
							return `rotate(${0})`
						}

						if (getRotation(this) != null) {
							rotate += getRotation(this) * (1 / x)
						}
						
						
						return `rotate(${rotate})`
					})
				// )
			})
			.on('mouseout', (e, d) => {
				// return paths.forEach(chart => 
				// 	chart
				// 		.attr("transform", d => {
				// 			// const rotate = 180 - (d.startAngle + d.endAngle)/2 / Math.PI * 180
				// 			return "rotate(" + d.endAngle + ")"
				// 		})
				// )
			})
		})

	})

	function getRotation(d3element): null | number {
		const transform: String | null = d3element.getAttribute('transform')

		if (transform == null) { return null }

		const start = transform.indexOf('rotation') + 'rotation('.length
		const end = transform.indexOf(')', start) - 1
		return +transform.substring(start, end) 
	}
</script>

<Flex>
	<div id='data'></div>
	<div>
		<H3>Screen time</H3>
		<H5>On average, Joe is on screen 30% of the time per episode.</H5>
	</div>
</Flex>
