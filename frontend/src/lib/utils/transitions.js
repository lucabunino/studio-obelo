import { cubicOut, cubicIn } from 'svelte/easing'
import timing from '$lib/scss/timing.module.scss'

export function slideFromLeft(node, { duration = +timing.overlayDuration, delay = 0, offset = '0px' } = {}) {
	return {
		duration,
		delay,
		easing: cubicOut,
		css: t => `transform: translateX(calc(${t - 1} * (100% + ${offset})))`
	}
}

export function pageOut(node, { duration = 500, delay = 0 } = {}) {
	const scrollY = window.scrollY
	const w = window.innerWidth
	const h = window.innerHeight
	const fullH = node.scrollHeight
	const originX = w / 2
	const originY = scrollY + h / 2

	Object.assign(node.style, {
		position: 'fixed',
		top: `${-scrollY}px`,
		left: '0',
		width: `${w}px`,
		height: `${fullH}px`,
		overflow: 'hidden',
		pointerEvents: 'none',
		clipPath: `inset(${scrollY}px 0 ${Math.max(0, fullH - scrollY - h)}px 0)`,
	})

	return {
		duration,
		delay,
		easing: cubicIn,
		css: t => `transform: scale(${t}) rotate(${(1 - t) * 180}deg); transform-origin: ${originX}px ${originY}px;`
	}
}
