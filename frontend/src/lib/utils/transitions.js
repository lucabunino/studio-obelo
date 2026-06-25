import { cubicOut } from 'svelte/easing'
import timing from '$lib/scss/timing.module.scss'

const DURATION = parseInt(timing.overlayDuration)

export function slideFromLeft(node, { duration = DURATION, delay = 0, offset = '0px' } = {}) {
	return {
		duration,
		delay,
		easing: cubicOut,
		css: t => `transform: translateX(calc(${t - 1} * (100% + ${offset})))`
	}
}
