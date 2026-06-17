export function obelo(node) {
	const chars = [...node.textContent]
	node.innerHTML = ''
	node.setAttribute('aria-label', chars.join(''))

	const timers = new Map()
	let lastTouch = 0

	const spans = chars.map(c => {
		const span = document.createElement('span')
		span.textContent = c
		node.appendChild(span)

		if (c.trim() !== '') {
			span.addEventListener('mouseenter', () => {
				if (Date.now() - lastTouch < 500) return
				if (timers.has(span)) {
					clearTimeout(timers.get(span))
					timers.delete(span)
				}
				span.textContent = '÷'
			})
			span.addEventListener('mouseleave', () => {
				if (Date.now() - lastTouch < 500) return
				const t = setTimeout(() => {
					span.textContent = c
					timers.delete(span)
				}, 300)
				timers.set(span, t)
			})
		}

		return span
	})

	function onTouchStart() {
		lastTouch = Date.now()
		timers.forEach(t => clearTimeout(t))
		timers.clear()

		const active = spans.map((span, i) => ({ span, c: chars[i] })).filter(e => e.c.trim() !== '')
		const shuffled = active.slice().sort(() => Math.random() - 0.5)

		shuffled.forEach(({ span, c }, i) => {
			const enterTimer = setTimeout(() => {
				span.textContent = '÷'
				const restoreTimer = setTimeout(() => {
					span.textContent = c
				}, 300)
				timers.set(span, restoreTimer)
			}, i * 40)
			timers.set(`enter-${i}`, enterTimer)
		})
	}

	node.addEventListener('touchstart', onTouchStart, { passive: true })

	return {
		destroy() {
			node.removeEventListener('touchstart', onTouchStart)
			timers.forEach(t => clearTimeout(t))
		}
	}
}
