<script lang='ts'>
	import { Theme, Topics, Section, Similarity, ScreenTime, Intro, Methodology } from '@components'
	import { episodes } from '@lib/data'
	import { ID } from '@lib/stores'
	import { Flex, Spacer } from '@ollopa/cedar'

	if (
		window.location.host === 'localhost:5000'
		|| window.location.host === 'joerogan.faith'
	) {
		$ID = 'jre'
	}

	console.log(window.location.pathname)
</script>

<Theme>
	<Flex column>
		<Spacer s={8} />
		<h1 class='title'>Average Joe</h1>
		<div class='subtitle'>
			<i><h5>2462 videos, 8,626,908 words, and 699gb of data analyzed.</h5></i>
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
</style>