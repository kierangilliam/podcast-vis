<script lang='ts'>	
	import { H3, Spacer } from '@ollopa/cedar'
	import Search from '../Search.svelte'
	import { tick } from 'svelte'
	import DonutChart from './DonutChart.svelte'
	import Timeline from './Timeline.svelte'	
	import { episode, isMobile } from '@lib/utils'
	import { screenTime } from '@lib/data'
	import { COLORS, JRE_BLACKLIST, LEX_WHITELIST } from '@lib/constants'
	import { ID } from '@lib/stores'

	let data
	let segments: {}
	// What search returns
	let episodeID = null
	let searchableEpisodes
	let searchVisible = false
	let containerWidth: number		

	$: onDataUpdate($screenTime)
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

	const onDataUpdate = async (_) => {
		// Wait for width to render
		await tick() 

		if (!$screenTime) return
			
		data = $screenTime
			.sort((a, b) =>
                // @ts-ignore
                episode(a.id).published - episode(b.id).published
			)
			.filter(ep => episode(ep.id).main)
			.filter(({ segments, id }) => {
                const keys = Object.keys(segments)
                // If there is just 1 segment, the video averaging did not go as planned
                if (keys.length == 1) return false
                // If there are two segments but one of the segments makes up for 95%
                // of the time, there was probably an error
                if (keys.length == 2) {
                    const ratio = Math.min(segments[keys[0]], segments[keys[1]]) /
                        Math.max(segments[keys[0]], segments[keys[1]])
                    if (ratio < .05) return false
                }

                return true
            })
		

		searchableEpisodes = data.map(({ id }) => id)
		episodeID = data[Math.floor(data.length * .8)].id

		// TODO refactor to a setting obj
		if ($ID === 'jre') {
			episodeID = 'qxOeWuAHOiw' // Kanye Episode
			data = data.filter(({ id }) => 
				!JRE_BLACKLIST.includes(episode(id).number)
			)			
		} else if ($ID === 'lex') {
			episodeID = '_L3gNaAVjQ4' // George Hotz
			data = data.filter(({ id }) => LEX_WHITELIST.includes(episode(id).number))
		}		
	}
</script>

<Search bind:episodeID bind:visible={searchVisible} {searchableEpisodes} />

<div class='container' bind:clientWidth={containerWidth}>
	<div class='details'>
		<H3>Screen time</H3>	
		<Spacer />
		<div class='explanation'>
			Hover over a picture to see it more clearly. 
			Tap on the below timeline to get a closer look. 
			<Spacer s={2} />
			<p>
				<i>
					Note: The automated method of determining screen time works very well in calm episodes. 
					However, in the minority of episodes with a lot of variance (people coming in and out of the studio, changing seats, etc), the accuracy drops. 
					See the below “methodology” section for more details.
				</i>
			</p>
		</div>	
		<Spacer />
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

	.explanation p {
		font-size: .95rem;
		color: var(--darkGray);
	}

	.navigation {
		display: flex;
		justify-content: space-between;
	}
	
	/* Big screens */
    @media screen and (min-width: 915px) {
        .container {
            flex-direction: row-reverse;
        }
		.spacer {
			--size: var(--s-8);
		}
    }	
</style>