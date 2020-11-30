<script lang='ts'>
    import { H3, H5, Spacer } from '@ollopa/cedar'
    import SimilarityComparedAll from './SimilarityComparedAll.svelte'
    import SimilarityMatrix from './SimilarityMatrix.svelte'
    import { episode } from '@lib/utils'
    import { epSimIdLookup, epSimReverseIdLookup, epSims } from '@lib/data';

    let matrixData, comparedAllIdNum: number, comparedAllId: string

    $: dataReady($epSims)
    $: comparedAllData = filterComparedAllData($epSims, comparedAllIdNum)
    $: comparedAllIdNum = $epSimReverseIdLookup && $epSimReverseIdLookup(comparedAllId)

    function dataReady(_) {
        if (!$epSims) return

        randomizeMatrix()

        comparedAllIdNum = choice()
        comparedAllId = $epSimIdLookup(comparedAllIdNum)
    }

    const filterComparedAllData = (_, __) => {
        // Return default blank 5 row array for DOM sizing purposes
        if (!($epSims && comparedAllIdNum)) return [[], [], [], [], []]

        return $epSims
            .filter(({ idNum1, idNum2 }) => (idNum1 == comparedAllIdNum) || (idNum2 == comparedAllIdNum))
            .map(fillInIDs)
            .sort((a, b) => b.similarity - a.similarity)
            // [Other episode id, similarity]
            .map(({ similarity, id1, id2, idNum1 }) => ([comparedAllIdNum == idNum1 ? id2 : id1, similarity]))
            // Filter non-main episodes
            // TODO should also filter in MMA?
            .filter(([id, _]) => episode(id).main)
            .slice(0, 100)
    }

    const fillInIDs = ({ idNum1, idNum2, similarity }) => ({
        idNum1, idNum2,
        id1: $epSimIdLookup(idNum1),
        id2: $epSimIdLookup(idNum2),
        similarity,
    })

    // Choose a random main episode, returns its idNum
    const choice = () => {
        const isNotMain = true
        let choice
        while (isNotMain) {
            choice = $epSims[Math.floor(Math.random() * $epSims.length)]
            choice = fillInIDs(choice)
            if (episode(choice.id1).main) {
                return choice.idNum1
            }
        }   
    }

    const randomizeMatrix = () => {
        matrixData = [...Array(5)].map(_ => choice())

        // 5 rows with 5 items each containing [id, similairty]
        matrixData = matrixData.map(id => {
                return matrixData.map(idInner => {
                    if (id == idInner) {
                        return [$epSimIdLookup(id), 0.0]
                    }

                    const hit = $epSims.find(({ idNum1, idNum2 }) => 
                        (idNum1 == id && idInner == idNum2) || (idNum2 == id && idInner == idNum1)
                    )

                    return [$epSimIdLookup(idInner), hit.similarity]
                })
            })
    }
</script>

<H3>Episode Similarity</H3>
<div class='explanation'>
    Compare topic contents between episodes. Click episode titles on the "Most similar podcasts to" 
    section to pin that episode.
    See the methodology section below on how these scores were calculated.
</div>
<Spacer />

{#if $epSims && comparedAllData}
    <div class='container'>
        <SimilarityMatrix data={matrixData} on:randomize={randomizeMatrix} />
        <Spacer />
        <SimilarityComparedAll bind:id={comparedAllId} data={comparedAllData} />
    </div>
{/if}

<style>
    .explanation {
        margin-bottom: var(--s-4);
    }

    /* Big screens */
    @media screen and (min-width: 1150px) {
        .explanation {
            width: 65%;
        }

        .container {
            display: flex;
        }
    }
</style>

