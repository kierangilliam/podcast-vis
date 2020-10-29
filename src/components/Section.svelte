<script>
    import { Spacer } from '@ollopa/cedar'

    const GAP = 16
</script>

<Spacer s={GAP}/>

<div><slot /></div> 

<Spacer s={GAP}/>

<style>
    div {
        width: 90vw;
    }

    @media screen and (min-width: 1250px) {
        div {
            width: 60vw;
        }
    }
</style>