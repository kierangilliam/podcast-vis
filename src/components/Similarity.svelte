<script lang='ts'>
    import { H3, Flex, Spacer } from '@ollopa/cedar'
import SimilarityComparedAll from './SimilarityComparedAll.svelte'
    import SimilarityMatrix from './SimilarityMatrix.svelte'

    const data = [
        [
            ['Lex Fridman', 0.0],
            ['Elon Musk', 0.6014876082652767],
            ['Michael Stevens', 0.5204181171517794],
            ['Kanye West', 0.549210189254557],
            ['Mike Tyson', 0.5440890632512689],
        ],
        [
            ['Lex Fridman', 0.6014876082652767],
            ['Elon Musk', 0.0],
            ['Michael Stevens', 0.5507313736526684],
            ['Kanye West', 0.5559069243804156],
            ['Mike Tyson', 0.5231358671618266],
        ],
        [
            ['Lex Fridman', 0.5204181171517794],
            ['Elon Musk', 0.5507313736526684],
            ['Michael Stevens', 0.0],
            ['Kanye West', 0.49759390310994533],
            ['Mike Tyson', 0.4787550034617063],
        ],
        [
            ['Lex Fridman', 0.549210189254557],
            ['Elon Musk', 0.5559069243804156],
            ['Michael Stevens', 0.9759390310994533],
            ['Kanye West', 0.0, ],
            ['Mike Tyson', 0.50215325905151],
        ],
        [
            ['Lex Fridman', 0.5440890632512689],
            ['Elon Musk', 0.2231358671618266],
            ['Michael Stevens', 0.787550034617063],
            ['Kanye West', 0.50215325905151],
            ['Mike Tyson', 0.0],
        ],
    ]
</script>

<H3>Podcast Similarity</H3>

<!-- <div class="container">
    <SimilarityMatrix {data} />
    <Spacer />
    <SimilarityComparedAll {data} />
</div> -->

<style>
    @media screen and (min-width: 750px) {
        .container {
            display: flex;
        }
    }
</style>

