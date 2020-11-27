<script lang='ts'>
	import { COLORS } from '@lib/constants'
	import { H3, Spacer } from '@ollopa/cedar'
	import Search from '../Search.svelte'
	import * as d3 from 'd3'
	import { onMount } from 'svelte'
	import { episode as getEpisode } from '@lib/utils'
	import Doughnut from 'svelte-chartjs/src/Doughnut.svelte'

	interface Episode {
		id: string
		title: string
		data: object
	}

	let options = {
		responsive: true,
		aspectRatio: 1,
		tooltips: {
			enabled: false,
			custom: () => {
				// TODO: https://www.chartjs.org/docs/latest/configuration/tooltip.html#external-custom-tooltips
			}
		},
		hover: {
			onHover: (event, element) => {
				// TODO
			}
		}
  	}

	let data: Episode[]	
	let episode = null
	// What search returns
	let episodeID = null
	let searchableEpisodes
	let searchVisible = false

	$: episodeUpdate(episodeID)

	const episodeUpdate = (_) => {
		if (!episodeID) return 

		episode = data.find(({ id }) => id === episodeID)
		episode.labels = Object.keys(episode.data)
		episode.datasets = [{
			data: Object.values(episode.data),
			backgroundColor: [
				COLORS.orange, COLORS.blue, COLORS.green, 
				COLORS.purple, COLORS.red, COLORS.black, COLORS.darkOrange
			]
		}]
	}

	onMount(async () => {
		const formatData = data => {
			data = (0, eval)('(' + data + ')')
			// Remove small values
			// TODO Play with the small values number
			Object.entries(data).forEach(([cluster, amount]) => {
				if (amount < 0.002) {
					delete data[cluster]
				}
			})
			return data
		}

        data = (await d3.csv('./screen_time.csv'))
            .map(({ id, data }) => ({
				id, 
				number: getEpisode(id).number, 
				title: getEpisode(id).title,
                data: formatData(data),
			}))
			
		searchableEpisodes = data.map(({ id }) => id)

		episodeID = data[0].id	
	})
</script>

<Search bind:episodeID bind:visible={searchVisible} {searchableEpisodes} />

<div class='container'>
	{#if episode}
		<div class='chart'>
			<Doughnut data={episode} {options}/>
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