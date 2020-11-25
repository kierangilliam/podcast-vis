<script lang='ts'>
    import { stemToWord } from '@lib/utils'
    import { onDestroy, tick } from 'svelte'

    export let stem: string
    
    let reverseIndex = 0
    let indexInterval

    $: reverseStem = getRestOfWord(stem, stemToWord, reverseIndex)


    const getRestOfWord = (_, __, ___) => {
        if (!stemToWord || !stem || !stemToWord[stem]) {
            clearInterval(indexInterval)
            return
        }

        if (stemToWord[stem].length == 1) {
            stem = stemToWord[stem][0]
            clearInterval(indexInterval)
            return
        }
        
        if (!indexInterval) {
            indexInterval = setInterval(() => 
                reverseIndex += 1, 4500 + (Math.random() * 500)
            )
        }

        // Randomly show the stem by itself
        if (Math.random() > .8) {
            return 
        }
        
        const reverse = stemToWord[stem][reverseIndex % stemToWord[stem].length]
        // if (reverse.length == stem.length) {
        //     stem = 
        // }
        console.log(reverse)

        return reverse
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