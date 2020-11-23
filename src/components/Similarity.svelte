<script lang='ts'>
    import { H3, H5, Spacer } from '@ollopa/cedar'
    import { onMount } from 'svelte'
    import SimilarityComparedAll from './SimilarityComparedAll.svelte'
    import SimilarityMatrix from './SimilarityMatrix.svelte'
	import * as d3 from 'd3'
    import { episode } from '@lib/utils'
    import * as pbf from 'pbf'

    let data, allData, comparedAllId: string
    
    $: comparedAllData = filterComparedAllData(allData, comparedAllId)

    const filterComparedAllData = (_, __) => {
        // Return default blank 5 row array for DOM sizing purposes
        if (!(allData && comparedAllId)) return [[], [], [], [], []]

        return allData.filter(({ id1, id2 }) => 
                (id1 == comparedAllId) || (id2 == comparedAllId)
            )
            .sort((a, b) =>  b[1] - a[1])
            .map(({ similarity, id1, id2 }) => 
                // [Other episode id, similarity, other episode high ranking tfidf words]
                ([comparedAllId == id1 ? id2 : id1, similarity, '__'])
            )
            // Filter non-main episodes
            // TODO should also filter in MMA?
            .filter(([id, _]) => episode(id).main)
            .slice(0, 5)
    }

    onMount(async () => {
        // const buffer = (await fetch('./ep_sim'))
        // console.log(buffer)
        // const proto = new pbf.Pbf(buffer).readFields(readEpSim, {})
        // function readEpSim(tag, data, pbf) {
        //     if (tag === 1) data.rows = pbf.readMessage(readEpSimRow, {})
        // }
        // function readEpSimRow(tag, layer, pbf) {
        //     if (tag === 1) layer.idNum1 = pbf.readFixed32()
        //     else if (tag === 2) layer.idNum2 = pbf.readFixed32()
        //     else if (tag === 3) layer.similarity = pbf.readFloat()
        // }
        // console.log(proto)

        allData = (await d3.csv('./cosine_similarity.csv'))


        // Choose a random main episode
        const choice = () => {
            const isNotMain = true
            let choice
            while (isNotMain) {
                choice = allData[Math.floor(Math.random() * allData.length)]
                if (episode(choice.id1).main) {
                    return choice.id1
                }
            }   
        }

        data = [...Array(5)].map(_ => choice())

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

        comparedAllId = choice()
    })
</script>

<H3>Episode Similarity</H3>
<H5>Compare topic contents between episodes.</H5>
<Spacer />

{#if data}
    <div class="container">
        <SimilarityMatrix {data} />
        <Spacer />
        <SimilarityComparedAll bind:id={comparedAllId} data={comparedAllData} />
    </div>
{/if}

<style>
    @media screen and (min-width: 750px) {
        .container {
            display: flex;
        }
    }
</style>

