<script lang='ts'>
	import { Theme, Topics, Section, Similarity, ScreenTime, Intro } from '@components'
	import { episodesLoaded } from '@lib/utils'
	import { Flex, Spacer } from '@ollopa/cedar'
</script>

<!--
TODO add to sections:

1. Give the user a look into the diversity in the guests 
2. Get a general sense of what Joe talks about over time 
3. See how much of the conversation Joe contributes to 
4. 
-->

<Theme>
	<Flex column>
		<Spacer s={8} />
		<h1 class='title'>Average Joe.</h1>
		<i><h5>2462 videos, 8,626,908 words, and 675gb of data analyzed.</h5></i>
		
		{#if $episodesLoaded}
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

			<Spacer s={64} />
		{:else}
			Loading...
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
	}
</style>