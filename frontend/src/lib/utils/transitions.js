import { cubicOut } from 'svelte/easing'

export function slideLeft(node, { duration = 400, delay = 0, easing = cubicOut } = {}) {
	return {
		duration,
		delay,
		easing,
		css: (t, u) => `transform: translateX(${u * -100}%)`
	}
}
