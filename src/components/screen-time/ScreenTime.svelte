<script lang='ts'>	
	import { H3, Spacer } from '@ollopa/cedar'
	import Search from '../Search.svelte'
	import * as d3 from 'd3'
	import { onMount } from 'svelte'
	import DonutChart from './DonutChart.svelte'
	import Timeline from './Timeline.svelte'	
	import { episode } from '@lib/utils'

	let data
	let segments: {}
	// What search returns
	let episodeID = null
	let searchableEpisodes
	let searchVisible = false	

	$: episodeUpdate(episodeID)

	// Basically build a color scheme for clusters that is monochromatic but in a random order
	// So that similar colors aren't next to eachother
	// const randUniqueRange = (len) => [...Array(len)].map((_, i) => i).sort(() => Math.random() - 0.5)
	// const colorScale = d3.scaleLinear().range(['#ffad8a', '#a33202']).domain([0, 10])
	// const colors = randUniqueRange(10).map(i => colorScale(i))
	const colorScale = d3.schemePaired
	const colors = [...Array(10)].map((_, i) => colorScale[i])

	const episodeUpdate = (_) => {
		if (!episodeID) return 

		segments = data
			.find(({ id }) => id === episodeID)
			.segments

		console.log(episodeID)
	}	

	const navigate = () => {
		const i = () => data.findIndex(({ id }) => id === episodeID) || 0

		return {
			forward: () => episodeID = data[Math.min(i() + 1, data.length - 1) % data.length].id,
			back: () => episodeID = data[Math.max(i() - 1, 0) % data.length].id,
		}
	}

	onMount(async () => {
		const formatData = data => {
			data = (0, eval)('(' + data + ')')

			const total = Object.entries<number>(data)
				.reduce((acc, [_, a]) => acc + a, 0)

			Object.entries<number>(data).forEach(([cluster, amount]) => {
				// Remove items that make up less than 2% of the total
				if (amount / total * 100 < 2) {
					delete data[cluster]
				}
			})
			return data
		}

        data = (await d3.csv('./screen_time.csv'))
            .map(({ id, data }) => ({
				id, 
                segments: formatData(data),
			}))
			.sort((a, b) => 
				episode(a.id).published - episode(b.id).published
			)
			// If there is just 1 segment, the video averaging did not go as planned
			.filter(({ segments }) => Object.keys(segments).length > 1)
			
		searchableEpisodes = data.map(({ id }) => id)

		episodeID = "qxOeWuAHOiw" // Kanye Episode
	})
</script>

<Search bind:episodeID bind:visible={searchVisible} {searchableEpisodes} />

<div class='container'>
	{#if episodeID}
		<div class='chart'>
			<DonutChart 
				width={350}
				height={350}
				imageSize={75}
				{episodeID}
				{segments} 
				{colors}
			/>
		</div>
	{/if}
	<Spacer s={8} />
	<div>
		<H3>Screen time</H3>	
		<p>Some explanatory text yada yada yada. Lorem ipsum yada yada yada.</p>	
		<div class="navigation">
			<p class='inline-button' on:click={navigate().back}>Previous</p>
			<p class='inline-button' on:click={() => searchVisible=true}>
				Search for a different episode
			</p>
			<p class='inline-button' on:click={navigate().forward}>Next</p>
		</div>
	</div>
</div>

{#if episodeID}
	<Spacer s={16} />
	<Timeline {colors} {episodeID} />
{/if}

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.chart {
		width: 450px;
	}

	.navigation {
		display: flex;
		justify-content: space-between;
	}
	
    @media screen and (min-width: 750px) {
        .container {
            flex-direction: row;
        }
    }	
</style>