<script>
    import { Spacer } from '@ollopa/cedar'

    const GAP = 8
</script>

<Spacer s={GAP}/>
<div><slot /></div> 
<Spacer s={GAP}/>

<style>
    div {
        width: 60vw;
    }
</style>