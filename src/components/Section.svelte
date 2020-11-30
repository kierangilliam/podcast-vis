<script>
    import { Spacer } from '@ollopa/cedar'
    import { fade } from 'svelte/transition'
    import IntersectionObserver from './IntersectionObserver.svelte'

    export let stretch = false

    const GAP = 32
</script>

<Spacer s={GAP}/>

<IntersectionObserver let:intersecting once center threshold={.6}>
    {#if intersecting}
        <div class='main' class:stretch in:fade><slot /></div> 
    {:else}
        <div class="intersection-spacer"></div>
    {/if}
</IntersectionObserver>

<Spacer s={GAP}/>

<style>
    .main {
        width: 90vw;
    }
    
    .stretch {
        width: 99vw;
    }
    
    .intersection-spacer {
        width: 100%;
        height: 90vh;
    }

    @media screen and (min-width: 550px) {
        .main {
            width: 80vw;
        }
        .stretch {
            width: 95vw;
        }
    }

    @media screen and (min-width: 1350px) {
        .main {
            width: 60vw;
        }
        .stretch {
            width: 85vw;
        }
    }
</style>