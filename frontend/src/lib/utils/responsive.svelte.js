import { innerHeight, innerWidth } from 'svelte/reactivity/window'
import bp from '$lib/scss/breakpoints.module.scss'

export function getResponsive() {
	const isPortrait = $derived(innerHeight.current > innerWidth.current)
	const isMobile = $derived(isPortrait || innerWidth.current <= parseInt(bp.md))
	return {
		get isPortrait() { return isPortrait },
		get isMobile() { return isMobile },
	}
}
