<script lang='ts'>
    import { H3, H5, Spacer } from '@ollopa/cedar'
    import { onMount } from 'svelte'
    import SimilarityComparedAll from './SimilarityComparedAll.svelte'
    import SimilarityMatrix from './SimilarityMatrix.svelte'
	import * as d3 from 'd3'

    let data, allData, comparedAllId: string
    
    $: comparedAllData = filterComparedAllData(allData, comparedAllId)

    const filterComparedAllData = (_, __) => {
        // Return default blank 5 row array for DOM sizing purposes
        if (!(allData && comparedAllId)) return [[], [], [], [], []]

        return allData.filter(({ id1, id2 }) => 
                (id1 == comparedAllId) || (id2 == comparedAllId)
            )
            .sort((a, b) =>  b[1] - a[1])
            .slice(0, 5)
            .map(({ similarity, id1, id2 }) => 
                // [Other episode id, similarity, other episode high ranking tfidf words]
                ([comparedAllId == id1 ? id2 : id1, similarity, '__'])
            )
    }

    onMount(async () => {
        allData = (await d3.csv('./cosine_similarity.csv'))

        const choice = arr => arr[Math.floor(Math.random() * arr.length)]

        data = [...Array(5)].map(_ => {
            return choice(allData).id1
        })        

        // 5 rows with 5 items each containing [id, similairty]
        data = data.map(id => {
            return data.map(idInner => {
                if (id == idInner) {
                    return [id, 0.0]
                }

                const hit = allData.find(({ id1, id2 }) => 
                    (id1 == id && idInner == id2) || (id2 == id && idInner == id1)
                )

                return [idInner, hit.similarity]
            })
        })

        comparedAllId = data[0][0][0]
    })
</script>

<H3>Podcast Similarity</H3>
<H5>Compare similarities between podcasts.</H5>
<Spacer />

{#if data}
    <div class="container">
        <SimilarityMatrix {data} />
        <Spacer />
        <SimilarityComparedAll id={comparedAllId} data={comparedAllData} />
    </div>
{/if}

<style>
    @media screen and (min-width: 750px) {
        .container {
            display: flex;
        }
    }
</style>

