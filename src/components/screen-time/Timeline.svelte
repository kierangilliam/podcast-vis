<script lang='ts'>
    import { Spacer } from '@ollopa/cedar'
    import { clickOutside } from '@lib/utils'
    import Tooltip from '../Tooltip.svelte'
    import { onMount } from 'svelte'
    import { Timelines } from '@lib/proto/screen-time'
    
    export let episodeID: string

    interface Timestamp { start: number, end: number }
    interface Cluster { id: string, timestamps: Timestamp[] }
    interface Timeline { id: string, clusters: Cluster[], frames: number }

    const expandAmount = .05
    let expandAt: number
    let element: HTMLElement
    let width: number

    let timelines: Timeline[]
    let timeline: Timeline, expanded: Cluster[]
    
    $: timeline = timelines && timelines.find(t => t.id === episodeID)
    $: expanded = timeline && expandAt && filtered()

     const as_timestamp = (frames: number, playhead: number): string => {
        const FPS = 29.97
        let sec: string | number = (frames * playhead) / FPS
        const hour = Math.floor(sec / 60 / 60)
        const min = `${Math.floor(sec / 60) % 60}`.padStart(2, '0')
        sec = `${Math.floor(sec) % 60}`.padStart(2, '0')
        return `${hour}:${min}:${sec}`
    }

    const as_timestamp_ = (frames: number, start: number, end: number) => {
        return `${as_timestamp(frames, start)} - ${as_timestamp(frames, end)}`
    }

    const withinExpandedRegion = ({ start, end }: Timestamp) => 
        start >= expandAt - (expandAmount / 2) && end <= expandAt + (expandAmount / 2)
                    
    const filtered = (): Cluster[] => 
        timeline.clusters
            .map(c => ({ ...c, timestamps: c.timestamps .filter(withinExpandedRegion) }))
            .filter(c => c.timestamps.length > 0)

    const lineStyle = ({ start, end }: Timestamp, _) => {
        return `
            width: ${(end - start) * width}px;
            left: ${start * width}px;
        `
    }
    
    const expandedLineStyle = ({ start, end }: Timestamp, _) => {
        return `
            width: ${(end - start) * width * (1 / expandAmount)}px;
            left: ${(start - expandAt) * width * (1 / expandAmount) + (width / 2)}px;
        `
    }

    const hideExpanded = () => { expandAt = null }
    const setExpanded = ({ offsetX }) => { expandAt = offsetX / width }

    async function loadTimelines(): Promise<Timeline[]> {
		const response = await fetch('./screen_time_timelines')
		const bufferRes = await response.arrayBuffer();
		// @ts-ignore
		const pbf = new Pbf(new Uint8Array(bufferRes));
		// @ts-ignore
		const { timelines } = Timelines.read(pbf);
		return timelines
	}

    onMount(async () => {
        // TODO just make a folder with the timelines as protobufs
		// do same for sim matrix
        timelines = await loadTimelines()
    })
</script>

{#if expanded}
    <Tooltip 
        x={width / 2 + element.getBoundingClientRect().left} 
        y={element.getBoundingClientRect().top}
    >
        <div class='expanded-container' style={`width: ${width}px`}>
            {#each expanded as { timestamps }}
                <Spacer />
                <div class='row'>
                    <!-- TODO Animate with delay -->
                    {#each timestamps as timestamp}
                        <div 
                            class='expanded-line' 
                            style={expandedLineStyle(timestamp, width)}
                        ></div>
                    {/each}
                </div>
                <Spacer />
            {/each}
        </div>
    </Tooltip>
{/if}

<div class='container' bind:this={element} bind:clientWidth={width}>
    {#if timeline}
        <div class="chart">
            {#each timeline.clusters as { timestamps }}    
                <Spacer />
                <div class='row'>
                    <!-- TODO Animate with delay -->
                    {#each timestamps as timestamp}
                        <div 
                            class='line' 
                            class:highlighted={expanded ? withinExpandedRegion(timestamp) : true}
                            style={lineStyle(timestamp, width)}
                        ></div>
                    {/each}
                </div>        
            {/each}
        </div>
        <!-- Psuedo element to capture all interaction -->
        <div 
            class="interaction-capturer" 
            on:mousemove={setExpanded}
            on:click={setExpanded}
            on:mouseleave={hideExpanded}
            use:clickOutside={hideExpanded}
        ></div>
    {/if}
</div>


<style>
    .expanded-container {
        position: relative;
    }

    .container {
        position: relative;
    }

    .interaction-capturer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transition: border 250ms ease-in;
        border-radius: 2px;
    }
    .interaction-capturer:hover {
        border: var(--line);
    }

    .row {
        position: relative;
    }

    .expanded-line {
        position: absolute;
        height: 8px;
        background: var(--orange);
    }

    .line {
        position: absolute;
        height: 8px;
        background: var(--orange);
        border-radius: 1px;
    }
    .line:not(.highlighted) {
        background: var(--gray);
    }
</style>