<script lang='ts'>
    import { H3 } from '@ollopa/cedar'
    import { onMount } from 'svelte'
    import * as d3 from 'd3'

    let E
    const data = [30, 86, 168, 281, 303, 365];

    // onMount(() => {
    //     d3.select(E)
	// 		.selectAll('div')
	// 		.data(data)
	// 		.enter()
	// 		.append('div')
	// 		.style('width', function(d) {
	// 			return d + 'px';
	// 		})
	// 		.text(function(d) {
	// 			return d;
	// 		})
    // })
</script>

<H3>Screen time</H3>

<!-- <div class="chart" bind:this={E}></div> -->

<style>
	.chart :global(div) {
		font: 10px sans-serif;
		background-color: steelblue;
		text-align: right;
		padding: 3px;
		margin: 1px;
		color: white;
	}
</style>