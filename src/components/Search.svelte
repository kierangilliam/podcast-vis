<script lang="ts">
    import { Icon } from '@ollopa/cedar'
    import { episodes } from '@lib/utils'
    import { tick } from 'svelte'

    export let placeholder = 'lex fridman'
    export let episodeID = null
    export let visible = false
    // List of IDs or null for all
    export let searchableEpisodes: string[] = null

    let search = ''
    let input: HTMLInputElement

    $: results = filterSearch(episodes, search)
    $: visible == true && (async () => {
        await tick()
        input.focus()
    })()

    const filterSearch = (_, __) => {
		if (!search || !episodes) return []
        return episodes
            .filter(({ id }) => 
                searchableEpisodes ? searchableEpisodes.includes(id) : true
            )
            .filter(({ title }) => 
                title.toLowerCase().includes(search.toLowerCase())
            )
	}
</script>

{#if visible}
    <div class='background' on:click={() => visible = false}>
        <div class="container">
            <div class='search-input' class:stretch={true} on:click|stopPropagation>
                <Icon search small />
                <input 
                    { placeholder } 
                    bind:this={input}
                    bind:value={search} 
                    type="text" 
                    name="search" 
                />
            </div>

            <div class='search-results'>
                {#each results as ep}
                    <div 
                        class='result'
                        on:click|stopPropagation={() => { 
                            episodeID = ep.id 
                            visible = false
                            results = []
                        }}
                    >
                        { ep.title }
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}

<style>
    .background {
        position: fixed;
        display: flex;
        justify-content: center;
        background: rgba(0, 0, 0, 0.3);
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 500;
    }

    .container {
        padding-top: var(--s-8);
        min-width: 60vw;
    }

    .search-input {
        display: flex;
        border: var(--inputBorder);
        border-radius: var(--inputBorderRadius);
        background: var(--inputBackground);
        box-shadow: var(--inputShadow);
        width: var(--inputWidth);
        padding-left: var(--s-2);
        width: 100%;
    }

    input {
        padding: var(--inputPadding);
        margin-left: var(--s-1);
        background: none;
        border: none;
        width: 100%;
    }

    .search-results {
        background-color: var(--background);
		overflow: scroll;
		max-width: 80vw;
	}

	.result {
		cursor: pointer;
		padding: var(--s-2);
	}

	.result:nth-child(odd) {
		background: var(--lightGray);
	}
</style>