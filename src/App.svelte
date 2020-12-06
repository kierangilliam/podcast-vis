<svelte:head>
	<title>{sites[$ID].metadata.title}</title>
	<link rel='icon' type='image/png' href='/favicon/{$ID}.ico'/>
</svelte:head>

<script lang='ts'>
	import { Theme, Topics, Section, Similarity, ScreenTime, Intro, Methodology } from '@components'
	import { episodes } from '@lib/data'
	import { ID } from '@lib/stores'
	import { Flex, Spacer } from '@ollopa/cedar'
	import { onMount } from 'svelte'

	if (window.location.host === 'localhost:5000') $ID = 'lex'
	if (window.location.host === 'joerogan.faith') $ID = 'jre'
	if (window.location.host === 'lexfridman.faith') $ID = 'lex'

	onMount(() => {
		window.scrollTo(0, 0)
	})

	const defaultSubtitle = '' // TODO

	const sites = {
		jre: {
			metadata: {
				title: 'Average Joe',
				subtitle: '2462 videos, 8,626,908 words, and 699gb of data analyzed.',
			}
		},
		ymh: {
			metadata: {
				title: `Your Mother's House`,
			}
		},
		flagrant2: {
			metadata: {
				title: 'Flagrant 2',
			}
		},
		lex: {
			metadata: {
				title: 'Lex Fridman',
			}
		},
	}
</script>

<Theme>
	<Flex column>
		<Spacer s={8} />
		<h1 class='title'>{sites[$ID].metadata?.title}</h1>
		<div class='subtitle'>
			<i><h5>{sites[$ID].metadata?.subtitle || defaultSubtitle}</h5></i>
		</div>
		
		{#if !$episodes}
			Loading...
		{:else} 
			<Spacer s={24} />
			<Intro />
			<Spacer s={24} />
			
			<Section>
				<ScreenTime />
			</Section>

			<div class='callout'>
				<!-- TODO Hacky -->
				Like this visualization of the {$ID === 'jre' ? 'Joe Rogan Experience' : 'Lex Fridman'} podcast?
				Check out the same visualizations for the 
				<a href={$ID !== 'jre' ? 'https://joerogan.faith' : 'https://lexfridman.faith'}>
					{$ID !== 'jre' ? 'Joe Rogan Experience' : 'Lex Fridman Podcast'}
				</a> podcast.
			</div>

			<Section stretch>
				<Topics />
			</Section>

			<Section stretch>
				<Similarity />
			</Section>
			
			<Section>
				<Methodology />
			</Section>

			<Spacer s={16} />
		{/if}

		<!-- <Section>
			<Guests />
		</Section> -->
	</Flex>
</Theme>

<style>
	.title {
		text-align: center;
	}

	.subtitle {
		text-align: center;
		padding: 0 var(--s-4);
	}

	.callout {
		background: var(--blue);
		color: var(--white);
		padding: var(--s-4) 0;
		width: 100%;
		text-align: center;
		font-size: 1.1rem;
	}
	.callout a {
		color: var(--white);
	}
	.callout a:visited {
		color: var(--green);
	}
</style>