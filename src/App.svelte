<script lang='ts'>
	import { Theme, Topics, Section, Similarity, ScreenTime } from '@components'
	import { H1, H5, Flex } from '@ollopa/cedar'
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

		<Section>
			<Topics />
		</Section>

		<Section>
			<ScreenTime />
		</Section>

		<!-- <Section>
			<Guests />
		</Section> -->

		<Section>
			<Similarity />
		</Section>
	</Flex>
</Theme>
