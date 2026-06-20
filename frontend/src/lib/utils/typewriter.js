let animationEndMs = 0

export const MS_PER_CHAR = .3
const MIN_DURATION = 50
const START_DELAY = 1

export function resetTypewriter() {
	animationEndMs = 0
}

function wrapChars(node) {
	const charSpans = []
	const textNodes = []
	const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
		acceptNode(n) {
			if (!n.textContent.trim()) return NodeFilter.FILTER_REJECT
			let el = n.parentElement
			while (el && el !== node) {
				if (el.getAttribute('aria-hidden') === 'true') return NodeFilter.FILTER_REJECT
				el = el.parentElement
			}
			return NodeFilter.FILTER_ACCEPT
		}
	})
	let n
	while ((n = walker.nextNode())) textNodes.push(n)

	for (const textNode of textNodes) {
		const fragment = document.createDocumentFragment()
		for (const char of textNode.textContent.split('')) {
			const span = document.createElement('span')
			span.dataset.char = char
			if (/\s/.test(char)) span.dataset.ws = '1'
			span.textContent = char
			span.style.display = 'inline'
			span.style.color = 'transparent'
			fragment.appendChild(span)
			charSpans.push(span)
		}
		textNode.parentNode.replaceChild(fragment, textNode)
	}
	return charSpans
}

export function typewriter(node, { duration: fixedDuration, delay: fixedDelay, clean = false } = {}, { direction = 'in' } = {}) {
	const charSpans = wrapChars(node)
	const duration = fixedDuration ?? Math.max(charSpans.length * MS_PER_CHAR, MIN_DURATION)

	if (!charSpans.length) return { duration: 0 }

	const show = (span, glyph) => {
		span.textContent = glyph && !span.dataset.ws ? '÷' : span.dataset.char
		span.style.removeProperty('color')
	}
	const hide = (span) => { span.style.color = 'transparent' }

	if (direction === 'out') {
		charSpans.forEach(span => show(span, false))
		return {
			delay: fixedDelay ?? 0,
			duration,
			tick(t) {
				const N = charSpans.length
				const currentIdx = Math.floor(t * N)
				charSpans.forEach((span, i) => {
					if (i < currentIdx) show(span, false)
					else clean ? hide(span) : show(span, true)
				})
			}
		}
	}

	const myStart = animationEndMs
	// Option A: timing based on chars only (MIN_DURATION only stretches display, not sequence):
	// animationEndMs = myStart + (fixedDuration ?? charSpans.length * MS_PER_CHAR)
	animationEndMs = myStart + duration

	charSpans.forEach(span => show(span, true))

	return {
		delay: fixedDelay ?? (START_DELAY + myStart),
		duration,
		tick(t) {
			const N = charSpans.length
			const currentIdx = Math.floor(t * N)
			charSpans.forEach((span, i) => {
				if (i < currentIdx) show(span, false)
				else show(span, true)
			})
		}
	}
}
