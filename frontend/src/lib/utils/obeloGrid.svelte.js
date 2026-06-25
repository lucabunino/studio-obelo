import { getSwiperStep } from '$lib/stores/swiperStep.svelte.js'

export function obeloGrid(node, params = {}) {
	const swiperStep = getSwiperStep()
	const prevPosition = node.style.position
	const computed = window.getComputedStyle(node)
	if (computed.position === 'static') node.style.position = 'relative'

	let div
	let cleanup = null
	let y = 0
	let x = 0

	function render({ cols = 6, rows = 8, count = cols * rows, loop = false, baseSpeed = 0.04, scrollFactor = 0.02, friction = 0.9 } = {}) {
		if (div) div.remove()
		cleanup?.()
		cleanup = null
		if (count === 0) return

		if (loop) {
			div = document.createElement('div')
			div.setAttribute('aria-hidden', 'true')
			Object.assign(div.style, {
				position: 'absolute',
				top: '0',
				left: '0',
				width: '0',
				height: '0',
				pointerEvents: 'none',
			})

			function createQuadrant() {
				const g = document.createElement('div')
				Object.assign(g.style, {
					position: 'absolute',
					width: '0',
					height: '0',
					paddingTop: '12px',
					paddingLeft: '12px',
					paddingRight: '12px',
					paddingBottom: '12px',
					boxSizing: 'border-box',
					display: 'grid',
					gridTemplateColumns: `repeat(${cols}, auto)`,
					gridTemplateRows: `repeat(${rows}, auto)`,
					columnGap: '0px',
					justifyContent: 'start',
					alignContent: 'start',
					rowGap: '0px',
					pointerEvents: 'none',
					overflow: 'hidden',
				})
				for (let i = 0; i < count; i++) {
					const span = document.createElement('span')
					span.textContent = '÷'
					span.style.opacity = '0'
					span.style.transition = `opacity 0.4s ease ${i * 6}ms`
					g.appendChild(span)
				}
				return g
			}

			;[[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([xi, yi]) => {
				const q = createQuadrant()
				q.style.left = '0px'
				q.style.top = '0px'
				div.appendChild(q)
			})

			node.prepend(div)
			node.style.overflow = 'hidden'

			requestAnimationFrame(() => {
				div.querySelectorAll('span').forEach(s => { s.style.opacity = '1' })
			})

			let velocityY = 0
			let lastTouchY = 0
			let halfHeight = 0
			let halfWidth = 0
			let colWidth = 0
			let targetX = x
			let rafId

			function measure() {
				const W = node.clientWidth
				const H = node.clientHeight

				const firstSpan = div.firstChild?.querySelector('span')
				const charW = firstSpan ? firstSpan.offsetWidth : 8
				const charH = firstSpan ? firstSpan.offsetHeight : 16

				// step formula: first glyph at 12px, last glyph edge at (size-12)px, seam gap = internal gap
				colWidth = cols > 1 ? (W - 24 - charW) / (cols - 1) : W - 24
				const rowHeight = rows > 1 ? (H - 24 - charH) / (rows - 1) : H - 24
				halfWidth = cols * colWidth
				halfHeight = rows * rowHeight

				const columnGap = Math.max(0, colWidth - charW) + 'px'
				const rowGap = Math.max(0, rowHeight - charH) + 'px'
				const tiles = [...div.children]
				tiles.forEach((tile, i) => {
					tile.style.width = halfWidth + 'px'
					tile.style.height = halfHeight + 'px'
					tile.style.left = (i % 2) * halfWidth + 'px'
					tile.style.top = Math.floor(i / 2) * halfHeight + 'px'
					tile.style.columnGap = columnGap
					tile.style.rowGap = rowGap
				})
				div.style.width = 2 * halfWidth + 'px'
				div.style.height = 2 * halfHeight + 'px'
			}

			requestAnimationFrame(() => { measure(); targetX = x })

			const ro = new ResizeObserver(measure)
			ro.observe(node)

			function onWheel(e) { velocityY += e.deltaY * scrollFactor * 0.5 }
			function onTouchStart(e) { lastTouchY = e.touches[0].clientY }
			function onTouchMove(e) {
				velocityY += (lastTouchY - e.touches[0].clientY) * scrollFactor
				lastTouchY = e.touches[0].clientY
			}
			$effect(() => {
				const { seq, direction } = swiperStep
				if (seq > 0) targetX += (direction === 'next' ? 1 : -1) * colWidth
			})

			function tick() {
				if (halfHeight && halfWidth) {
					y += baseSpeed + velocityY
					velocityY *= friction
					if (Math.abs(velocityY) < 0.001) velocityY = 0
					y = ((y % halfHeight) + halfHeight) % halfHeight

					x += (targetX - x) * 0.1
					if (Math.abs(targetX - x) < 0.05) x = targetX
					if (x >= halfWidth) { x -= halfWidth; targetX -= halfWidth }
					else if (x < 0) { x += halfWidth; targetX += halfWidth }

					div.style.transform = `translate(-${x}px, -${y}px)`
				}
				rafId = requestAnimationFrame(tick)
			}

			rafId = requestAnimationFrame(tick)
			window.addEventListener('wheel', onWheel, { passive: true })
			window.addEventListener('touchstart', onTouchStart, { passive: true })
			window.addEventListener('touchmove', onTouchMove, { passive: true })
			cleanup = () => {
				cancelAnimationFrame(rafId)
				ro.disconnect()
				window.removeEventListener('wheel', onWheel)
				window.removeEventListener('touchstart', onTouchStart)
				window.removeEventListener('touchmove', onTouchMove)
			}

		} else {
			div = document.createElement('div')
			div.setAttribute('aria-hidden', 'true')
			Object.assign(div.style, {
				position: 'absolute',
				top: '0',
				left: '0',
				width: '100%',
				height: '100%',
				paddingTop: '12px',
				paddingLeft: '12px',
				paddingRight: '12px',
				paddingBottom: '12px',
				boxSizing: 'border-box',
				display: 'grid',
				gridTemplateColumns: `repeat(${cols}, auto)`,
				gridTemplateRows: `repeat(${rows}, auto)`,
				justifyContent: 'space-between',
				alignContent: 'space-between',
				pointerEvents: 'none',
			})

			for (let i = 0; i < count; i++) {
				const span = document.createElement('span')
				span.textContent = '÷'
				span.style.opacity = '0'
				span.style.transition = `opacity 0.4s ease ${i * 100}ms`
				div.appendChild(span)
			}

			node.prepend(div)

			requestAnimationFrame(() => {
				div.querySelectorAll('span').forEach(s => { s.style.opacity = '1' })
			})
		}
	}

	render(params)

	return {
		update: (newParams) => render(newParams),
		destroy: () => {
			div?.remove()
			cleanup?.()
			node.style.position = prevPosition
			node.style.overflow = ''
		}
	}
}
