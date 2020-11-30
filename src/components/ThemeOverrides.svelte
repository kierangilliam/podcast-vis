<script lang='ts'>
    import { COLORS } from '@lib/constants'
    import { setCSSVar } from '@lib/utils'    

    Object.entries(COLORS).forEach(setCSSVar)
</script>

<div>
    <slot></slot>
</div>

<style>
    :global(:root) {
        /* Colors: defined using js */        
        --white: white;
        --lightGray: white;
        --darkGray: white;
        --red: white;
        --orange: white;
        --lightOrange: white;

        /* Color intetntions */
        --danger: var(--red);
        --background: var(--white);
        --textColor: var(--black);
        --buttonColor: var(--orange);
        --buttonTextColor: var(--darkOrange);
        --buttonWarnTextColor: var(--black);
        --lineColor: var(--darkGray);
        
        /* Borders */
        --borderRadius: 22px;
        --borderRadiusSmall: 12px;
        --borderRadiusFull: 999px;
        --buttonBorderRadius: var(--borderRadiusFull);
        --line: 2px solid var(--lineColor);
        
        /* Typography */
        --headingFont: 'Average', serif;
        --bodyFont: 'Average Sans', sans-serif;
        --monoFont: 'VT323', monospace;

        --textSmall: .75rem;
        --viewPaddingTop: var(--s-8);
        --viewPaddingBottom: var(--s-8);
        --viewPaddingLeft: var(--s-4);
        --viewPaddingRight: var(--s-4);
        --viewPadding: var(--viewPaddingTop)
                        var(--viewPaddingRight) 
                        var(--viewPaddingBottom) 
                        var(--viewPaddingLeft); 
        /* Modal */
        --modalPaddingX: var(--s-8);
        --modalPaddingY: var(--s-6);
        --modalShadow: var(--level-2);
        --maxModalWidth: 600px;     

        /* Inputs */
        --inputBorderRadius: 4px;
        --inputPadding: var(--s-2) var(--s-4);
        /* --inputBorder: ; */
        /* --inputBackground: ; */
        --inputShadow: 0;
        /* --inputWidth: ; */

    }
    :global(h1) {
        margin: 0 !important;
    }
    /* TODO move to ollopa */
    :global(h1, h2, h3, h4, h5, h6) {
        font-family: var(--headingFont);
    }
    :global(h1) { font-size: var(--h1); }
    :global(h2) { font-size: var(--h2); }
    :global(h3) { font-size: var(--h3); }
    :global(h4) { font-size: var(--h4); }
    :global(h5) { font-size: var(--h5); }
    :global(h6) { font-size: var(--h6); }
    
/*     
    :global(*) {
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    } */
    /* :global(a) {
        color: var(--primary);
        text-decoration: none;
        font-weight: bolder;
    }     */
    :global(input, textarea) {
        -webkit-user-select: auto !important;
        -khtml-user-select: auto !important;
        -moz-user-select: auto !important;
        -ms-user-select: auto !important;
        user-select: auto !important;
    }
    :global(label) {
        font-weight: lighter;
    }
    :global(.tag) {
        /* box-shadow: inset 0px -2.5px 0 rgba(12, 12, 12, .2); */
        padding: var(--s-1) var(--s-2);
        font-weight: bolder;
        border-radius: 12px;
        background: var(--lightGray);
        color: var(--black);
    }
    :global(.small) {
        font-size: var(--textSmall);
    }
    :global(.monospace) {
        font-family: monospace;
    }
    :global(.center) {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    :global(.between) {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    :global(.stretch) {
        width: 100%;
    }
    /* :global(.hide-scrollbar::-webkit-scrollbar) {
        display: none;
    } */
    
    :global(.inline-button) {
		color: var(--blue);
		font-weight: bold;
		cursor: pointer;
	}

    :global(.number-chip) {
        font-size: var(--textSmall);
        background: var(--gray);
        padding: var(--s-1) var(--s-2);
        border-radius: var(--s-4);
        width: fit-content;
    }

    :global(.explanation) {
        font-size: 1.1rem;
        font-family: var(--headingFont);
    }

    @media screen and (max-width: 1000px) {
        :global(body) {
            overflow-x: hidden !important;
        }
        div {
            max-width: 100% !important;
            overflow-x: hidden !important;
        }
    }
</style>