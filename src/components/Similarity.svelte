<script lang='ts'>
    import { H3, H5, Spacer } from '@ollopa/cedar'
    import { onMount } from 'svelte'
    import SimilarityComparedAll from './SimilarityComparedAll.svelte'
    import SimilarityMatrix from './SimilarityMatrix.svelte'
    import { episode } from '@lib/utils'
    import { EpisodeSims, IDs } from '@lib/proto/ep-sim'

    let data, idLookup, allData, comparedAllIdNum: number, comparedAllId: string
    let reverseIdLookup = (_: string): number => {}
    
    $: comparedAllData = filterComparedAllData(allData, comparedAllIdNum)
    $: comparedAllIdNum = reverseIdLookup(comparedAllId)

    const filterComparedAllData = (_, __) => {
        // Return default blank 5 row array for DOM sizing purposes
        if (!(allData && comparedAllIdNum)) return [[], [], [], [], []]

        const items = allData
            .filter(({ idNum1, idNum2 }) => (idNum1 == comparedAllIdNum) || (idNum2 == comparedAllIdNum))
            .map(fillInData)
            .sort((a, b) => b.similarity - a.similairty)
            .map(({ similarity, id1, id2, idNum1 }) => 
                // [Other episode id, similarity, other episode high ranking tfidf words]
                ([comparedAllIdNum == idNum1 ? id2 : id1, similarity, '__'])
            )
            // Filter non-main episodes
            // TODO should also filter in MMA?
            .filter(([id, _]) => episode(id).main)
            .slice(0, 100)
        return items
    }

    // Fill in the protobuf data (idNum1, idNum2, similarity) with more details
    const fillInData = ({ idNum1, idNum2, similarity }) => ({
        idNum1, idNum2,
        id1: idLookup(idNum1),
        id2: idLookup(idNum2),
        similarity,
    })

    // Choose a random main episode, returns its idNum
    const choice = () => {
        const isNotMain = true
        let choice
        while (isNotMain) {
            choice = allData[Math.floor(Math.random() * allData.length)]
            choice = fillInData(choice)
            if (episode(choice.id1).main) {
                return choice.idNum1
            }
        }   
    }

    onMount(async () => {
        async function loadSims() {
            const response = await fetch('./ep_sim')
            const bufferRes = await response.arrayBuffer();
            // @ts-ignore
            const pbf = new Pbf(new Uint8Array(bufferRes));
            // @ts-ignore
            const { rows } = EpisodeSims.read(pbf);
            return rows
        }

        // Returns a function that maps from an idNum to an id
        async function loadIDLookup() {
            const response = await fetch('./ep_sim_id_lookup')
            const bufferRes = await response.arrayBuffer();
            // @ts-ignore
            const pbf = new Pbf(new Uint8Array(bufferRes));
            // @ts-ignore
            const { rows } = IDs.read(pbf);

            function lookup(idNum: number): string {
                return rows.find(item => item.idNum === idNum).id
            }
            
            function reverseIdLookup (id: string): number {
                if (!id) return
                return rows.find(item => item.id === id).idNum
            }

            return [lookup, reverseIdLookup]
        }

        [allData, [idLookup, reverseIdLookup]] = await Promise.all([loadSims(), loadIDLookup()])

        data = [...Array(5)].map(_ => choice())

        // 5 rows with 5 items each containing [id, similairty]
        data = data.map(id => {
                return data.map(idInner => {
                    if (id == idInner) {
                        return [idLookup(id), 0.0]
                    }

                    const hit = allData.find(({ idNum1, idNum2 }) => 
                        (idNum1 == id && idInner == idNum2) || (idNum2 == id && idInner == idNum1)
                    )

                    return [idLookup(idInner), hit.similarity]
                })
            })

        comparedAllIdNum = choice()
        comparedAllId = idLookup(comparedAllIdNum)
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

