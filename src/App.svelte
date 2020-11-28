<script lang='ts'>
	import { Theme, Topics, Section, Similarity, ScreenTime, Intro } from '@components'
	import { episodesLoaded } from '@lib/utils'
	import { H1, H5, Flex, Spacer } from '@ollopa/cedar'
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
		<H1>Average Joe.</H1>
		<H5>Here we analyze facets of the Joe Rogan Experience.</H5>
		
		{#if $episodesLoaded}
			<Section intro>
				<Intro />
			</Section>

			<Section>
				<ScreenTime />
			</Section>

			<Section>
				<Topics />
			</Section>

			<Section>
				<Similarity />
			</Section>

			<Spacer s={48} />
		{:else}
			Loading...
		{/if}

		<!-- <Section>
			<Guests />
		</Section> -->
	</Flex>
</Theme>
