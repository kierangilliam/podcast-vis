<script lang='ts'>
	import { COLORS } from '@lib/constants'
	import { H3, Spacer } from '@ollopa/cedar'
	import Search from '../Search.svelte'
	import * as d3 from 'd3'
	import { onMount } from 'svelte'
	import { episode as getEpisode } from '@lib/utils'
	import type { Episode } from '@lib/utils'
	import DonutChart from './DonutChart.svelte'

	let data
	let segments: {}
	let episode: Episode = null
	// What search returns
	let episodeID = null
	let searchableEpisodes
	let searchVisible = false

	$: episodeUpdate(episodeID)

	// TODO set interval to change episode
	// window.setInterval(() => {
	//     if (toggle) {
	//         svg.call(donutChart.data(dataset2))
	//     } else {
	//         svg.call(donutChart.data(dataset1))
	//     }
	//     toggle = !toggle;
	// }, 3500)

	const episodeUpdate = (_) => {
		if (!episodeID) return 

		episode = getEpisode(episodeID)
		segments = data
			.find(({ id }) => id === episodeID)
			.segments
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
			
		searchableEpisodes = data.map(({ id }) => id)

		episodeID = data[0].id	
	})
</script>

<Search bind:episodeID bind:visible={searchVisible} {searchableEpisodes} />

<div class='container'>
	{#if episode}
		<div class='chart'>
			<DonutChart {episode} {segments} />
		</div>
	{/if}
	<Spacer s={8} />
	<div>
		<H3>Screen time</H3>	
		<p>Some explanatory text yada yada yada. Lorem ipsum yada yada yada.</p>	
		<p class='inline-button' on:click={() => searchVisible=true}>
			Search for a different episode
		</p>
	</div>
</div>

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
	
    @media screen and (min-width: 750px) {
        .container {
            flex-direction: row;
        }
    }	
</style>