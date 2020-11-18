<script lang='ts'>
	import { COLORS } from '@lib/constants'
    import { H3, Spacer, Search } from '@ollopa/cedar'
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
		<div class='chart'>
			<Doughnut data={episode} {options}/>
		</div>
	{/if}
	<Spacer s={8} />
	<div>
		<H3>Screen time</H3>
		<Search 
			placeholder='lex fridman' 
			bind:search
			stretch
		/>
		<div class='search-results'>
			{#each searchResults as ep}
				<div 
					class='result'
					on:click={() => {
						episode = ep
						searchResults = []
						search = null
					}}
				>
					{ ep.title }
				</div>
			{/each}
		</div>
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

	.search-results {
		overflow: scroll;
		max-width: 30vw;
		max-height: 200px;
	}

	.result {
		cursor: pointer;
		padding: var(--s-2);
	}

	.result:nth-child(odd) {
		background: var(--lightGray);
	}
</style>