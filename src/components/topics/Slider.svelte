<script lang='ts'>
    export let min = 0
    export let max = 1
    export let stretch: boolean
    // export let span: boolean
    export let value: number
</script>

<input 
    type='range'
    {min} {max} 
    bind:value 
    class:stretch 
>

<style>
    input {
        --thumbHeight: var(--s-2);
        --thumbWidth: var(--s-4);
        --thumbColor: var(--darkGray);
        --lineColor: var(--gray);

        border: var(--line);
        border-radius: 99px;

        -webkit-appearance: none;
        width: 100%;
        height: var(--s-3);
        background: var(--lightGray);
        outline: none;
        -webkit-transition: .2s;
        transition: opacity .2s;
    }

    .stretch {
        width: 100%;
    }

    input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;

        width: var(--thumbWidth);
        height: var(--thumbHeight);
        background: var(--thumbColor);
        border-radius: 99px;
        cursor: pointer;
        opacity: .7;
    }

    input::-moz-range-thumb {
        width: var(--thumbWidth);
        height: var(--thumbHeight);
        background: var(--thumbColor);
        border-radius: 99px;
        cursor: pointer;
        opacity: .7;
    }

    input::-webkit-slider-thumb:hover {
        opacity: 1;
    }

    input::-moz-range-thumb:hover {
        opacity: 1;
    }
</style>