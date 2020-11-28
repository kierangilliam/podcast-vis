<script>
    import { Spacer } from '@ollopa/cedar'
    import { fly } from 'svelte/transition'
    import IntersectionObserver from './IntersectionObserver.svelte'

    const GAP = 24
</script>

<Spacer s={GAP}/>

<IntersectionObserver let:intersecting once center>
    {#if intersecting}
        <div class='main' in:fly={{ y: -100 }}><slot /></div> 
    {:else}
        <div class="intersection-spacer"></div>
    {/if}
</IntersectionObserver>

<Spacer s={GAP}/>

<style>
    .main {
        width: 90vw;
    }
    
    .intersection-spacer {
        width: 100%;
        height: 90vh;
    }

    @media screen and (min-width: 1250px) {
        .main {
            width: 60vw;
        }
    }
</style>