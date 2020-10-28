<script lang='ts'>
	import { Theme, Section, Similarity, Topics, ScreenTime } from '@components'
	import { H1, H5, Flex } from '@ollopa/cedar'
</script>

<Theme>
	<Flex column>
		<H1>Average Joe.</H1>
		<H5>Here we analyze facets of the Joe Rogan Experience.</H5>

		<Section>
			<ScreenTime />
		</Section>

		<!-- <Section>
			<Guests />
		</Section> -->

		<Section>
			<Similarity />
		</Section>

		<Section>
			<Topics />
		</Section>
	</Flex>
</Theme>