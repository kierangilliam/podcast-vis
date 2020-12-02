<script lang='ts'>
    export let href: string

    const links = [
        'https://github.com/mapbox/pbf',
        'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers',
        'https://diglib.eg.org/bitstream/handle/10.2312/eurova20181105/007-011.pdf?sequence=1&isAllowed=y',
        'https://towardsdatascience.com/tf-idf-for-document-ranking-from-scratch-in-python-on-real-world-dataset-796d339a4089',
        'https://github.com/kierangilliam/jre-vis',
        'https://github.com/kierangilliam/jre-data-wrangling',
        'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API',
        'https://github.com/pyannote',
        'https://modelzoo.co/model/deepspeech2',
        'https://developer.mozilla.org/en-US/docs/Web/API/Transferable',
    ]

    const link = links.find(link => link.includes(href))
</script>

{#if !link}
    [link broken]
{:else}
    <a target='_blank' href={link}>
        <slot>link</slot>
    </a>
{/if}