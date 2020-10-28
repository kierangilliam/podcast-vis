<script>
    import { Theme } from '@ollopa/cedar'
    import ThemeOverrides from './ThemeOverrides.svelte'
</script>

<Theme>
    <ThemeOverrides>
        <slot />
    </ThemeOverrides>
</Theme>