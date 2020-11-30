<script lang='ts'>	
	import { H3, Spacer } from '@ollopa/cedar'
	import Search from '../Search.svelte'
	import * as d3 from 'd3'
	import { onMount, tick } from 'svelte'
	import DonutChart from './DonutChart.svelte'
	import Timeline from './Timeline.svelte'	
	import { episode, isMobile } from '@lib/utils'
	import { COLORS } from '@lib/constants'

	let data
	let segments: {}
	// What search returns
	let episodeID = null
	let searchableEpisodes
	let searchVisible = false
	let containerWidth: number	

	$: episodeUpdate(episodeID)

	const colors = [
		COLORS.pink, COLORS.gray, COLORS.green, COLORS.yellow, COLORS.purple,
		COLORS.orange, '#63ACEF', COLORS.red, '#CE6D6D', COLORS.black
	]

	const episodeUpdate = (_) => {
		if (!episodeID) return 

		segments = data
			.find(({ id }) => id === episodeID)
			.segments
	}	

	const navigate = () => {
		const i = () => data.findIndex(({ id }) => id === episodeID) || 0

		return {
			forward: () => episodeID = data[Math.min(i() + 1, data.length - 1) % data.length].id,
			back: () => episodeID = data[Math.max(i() - 1, 0) % data.length].id,
		}
	}

	onMount(async () => {
		// Wait for width to render
		await tick() 

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
				// @ts-ignore
				episode(a.id).published - episode(b.id).published
			)
			// 1521, 1520
			.filter(({ segments }) => {
				const keys = Object.keys(segments)
				// If there is just 1 segment, the video averaging did not go as planned
				if (keys.length == 1) return false
				if (keys.length == 2) {
					const ratio = Math.min(segments[keys[0]], segments[keys[1]]) / 
						Math.max(segments[keys[0]], segments[keys[1]])
					return ratio > .05
				}
			})
			
		searchableEpisodes = data.map(({ id }) => id)

		episodeID = 'qxOeWuAHOiw' // Kanye Episode
	})
</script>

<Search bind:episodeID bind:visible={searchVisible} {searchableEpisodes} />

<div class='container' bind:clientWidth={containerWidth}>
	<div class='details'>
		<H3>Screen time</H3>	
		<p>Hover over a picture to see it more clearly. Tap on the below timeline to get a closer look. </p>	
		<div class='navigation'>
			<p class='inline-button' on:click={navigate().back}>Previous</p>
			<p class='inline-button' on:click={() => searchVisible=true}>
				Search for a different episode
			</p>
			<p class='inline-button' on:click={navigate().forward}>Next</p>
		</div>
	</div>

	<div class="spacer"></div>

	{#if episodeID}
		<div>
			<DonutChart 
				chartSize={isMobile ? containerWidth : 400}
				imageSize={75}
				{episodeID}
				{segments} 
				{colors}
			/>
		</div>
	{/if}
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
	.spacer {
		--size: var(--s-16);
		width: var(--size);
		height: var(--size);
	}

	.navigation {
		display: flex;
		justify-content: space-between;
	}
	
	/* Big screens */
    @media screen and (min-width: 750px) {
        .container {
            flex-direction: row-reverse;
        }
		.spacer {
			--size: var(--s-8);
		}
    }	
</style>