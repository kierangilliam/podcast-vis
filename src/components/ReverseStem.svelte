<script lang='ts'>
    import { stemToWord } from '@lib/data'
    import { getContext, onDestroy } from 'svelte'

    export let stem: string
    
    const { intersecting } = getContext('intersectionObserver')

    let reverseIndex = 0
    let indexInterval

    $: reverseStem = getRestOfWord(stem, stemToWord, reverseIndex, $intersecting)    

    const getRestOfWord = (_, __, ___, ____) => {
        if (!stemToWord || !stem || !stemToWord[stem]) {
            clearInterval(indexInterval)
            return
        }

        if (stemToWord[stem].length == 1) {
            const reversed = stemToWord[stem][0]
            // If the only item in the array is the word itself, return that word
            // else, combine that word with the stem ex: "polic" : ["e"]
            stem = reversed.length >= stem.length ? reversed : stem + reversed
            clearInterval(indexInterval)
            return
        }
        
        if (!indexInterval && $intersecting) {
            indexInterval = setInterval(() => 
                reverseIndex += 1, 4500 + (Math.random() * 500)
            )
        } else if (!$intersecting) {
            clearInterval(indexInterval)
        }

        // Randomly show the stem by itself
        if (Math.random() > .3) {
            return 
        }
        
        const reversed = stemToWord[stem][reverseIndex % stemToWord[stem].length]
        const [l1, l2] = [reversed.length, stem.length]
        // industri -> industry, industrial
        return l1 === l2 && stem.substring(0, l1 - 1) === reversed.substring(0, l1 - 1)
            ? ''
            : reversed
    }

    onDestroy(() => clearInterval(indexInterval))

    /* Watches when reverseStem changes to transition it's change */
    function fade (node: HTMLSpanElement, _) {
        const DELAY = 150
		
		return {
			update(__) {
                node.style.setProperty('top', '-10px')
                node.style.setProperty('opacity', '0')
                
                setTimeout(() => {
                    node.style.setProperty('top', '0')
                    node.style.setProperty('opacity', '1')
                }, DELAY)        
            }
        }
    }
</script>

<span class='container'>
    {stem}<span use:fade={reverseStem} class='reverse-stem'>{reverseStem || ''}</span>
</span>

<style>
    .reverse-stem {
        color: var(--darkGray);
        transition: all 150ms ease-in-out;
        top: 0;
        position: relative;
    }
    .reverse-stem:after,
	.reverse-stem:before {
		content: '';
		left: 0;
	}
	.reverse-stem:after {
		top: calc(100% + 4px);
	}
	.reverse-stem:before {
		bottom: calc(100% + 4px);		
	}
</style>