<script lang='ts'>
    import Chart from "./Chart.svelte"

    let focused: string
</script>

<div class='container'>
    <div class="chart">
        <Chart />
    </div>
    <div>
        <!-- Here we analyze facets of the Joe Rogan Experience. -->
    </div>
</div>

<style>
    .container {
        display: flex;
    }

    .chart {
        flex: 1.5;
    }
</style>