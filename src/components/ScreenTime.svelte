<script lang='ts'>
	import { COLORS } from '@lib/constants'
    import { H3, Search } from '@ollopa/cedar'
	import * as d3 from 'd3'
	import { onMount } from 'svelte'
	import { episode as getEpisode } from '@lib/utils'
	import Doughnut from 'svelte-chartjs/src/Doughnut.svelte'

	interface Episode {
		id: string
		title: string
		data: object
	}

	// const width = 400, height = 400, margin = 40
	// const radius = Math.min(width, height) / 2 - margin
	// const donutThickness = 50

	let options = {
		responsive: true,
		aspectRatio: 1,
		hover: {
			onHover: function (event, element) {
				// if (item.length) {
				// 	const data = item[0]._chart.config.data.datasets[0].data[item[0]._index];
				// 	console.log(item, data);
				// }
			}
		}
  	}

	let data: Episode[]
	let search: string = ''
	let episode = null

	$: searchResults = filterSearch(data, search)
	$: episodeUpdate(episode)

	const filterSearch = (_, __) => {
		if (!search || !data) return []
		return data.filter(({ title }) => 
			title.toLowerCase().includes(search.toLowerCase())
		)
	}

	const episodeUpdate = (_) => {
		if (!episode) return 

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

        data = (await d3.csv('./video_segments.csv'))
            .map(({ id, data }) => ({
				id, 
				number: getEpisode(id).number, 
				title: getEpisode(id).title,
                data: formatData(data),
            }))

		episode = data[0]		
	})
</script>

<div class='container'>
	{#if episode}
		<div class="chart">
			<Doughnut data={episode} {options}/>
		</div>
	{/if}
	<div>
		<H3>Screen time</H3>
		<Search 
			placeholder='lex fridman' 
			bind:search
			stretch
		/>
		{#each searchResults as ep}
			<div 
				class='result'
				on:click={() => {
					episode = ep
					searchResults = []
				}}
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

	.chart {
		width: 250px;
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