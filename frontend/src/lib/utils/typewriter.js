let charOffset = 0

export const MS_PER_CHAR = .5
const MIN_DURATION = 300

// change to 'A', 'B', 'C', or 'D' to test modes
export let typewriterMode = 'B'

export function resetTypewriter() {
	charOffset = 0
}

function wrapChars(node, skipHidden = true) {
	const charSpans = []
	const textNodes = []
	const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
		acceptNode(n) {
			if (!n.textContent.trim()) return NodeFilter.FILTER_REJECT
			if (skipHidden) {
				let el = n.parentElement
				while (el && el !== node) {
					if (el.getAttribute('aria-hidden') === 'true') return NodeFilter.FILTER_REJECT
					el = el.parentElement
				}
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
			span.style.display = 'contents'
			span.style.color = 'transparent'
			fragment.appendChild(span)
			charSpans.push(span)
		}
		textNode.parentNode.replaceChild(fragment, textNode)
	}
	return charSpans
}

export function typewriter(node, { mode = typewriterMode, minChars = 0, skipHidden = true } = {}) {
	const myOffset = charOffset
	const charSpans = wrapChars(node, skipHidden)
	const effectiveChars = Math.max(charSpans.length, minChars)
	charOffset += effectiveChars

	if (!charSpans.length) return { duration: 0 }

	const show = (span, glyph) => {
		span.textContent = glyph && !span.dataset.ws ? '÷' : span.dataset.char
		span.style.color = ''
	}
	const hide = (span) => {
		span.textContent = span.dataset.char
		span.style.color = 'transparent'
	}

	if (mode === 'B') {
		charSpans.forEach(span => show(span, true))
	}

	return {
		delay: myOffset * MS_PER_CHAR,
		duration: Math.max(effectiveChars * MS_PER_CHAR, MIN_DURATION),
		tick(t) {
			const N = charSpans.length
			const currentIdx = Math.floor(t * N)
			charSpans.forEach((span, i) => {
				if (mode === 'A') {
					const TRAIL = 4
					const sweep = Math.floor(t * (N + TRAIL))
					if (i < sweep - TRAIL) show(span, false)
					else if (i < sweep) show(span, true)
					else hide(span)
				} else if (mode === 'B') {
					if (i < currentIdx) show(span, false)
					else show(span, true)
				} else if (mode === 'C') {
					const slotStart = i / N
					const slotMid = (i + 0.5) / N
					if (t < slotStart) hide(span)
					else if (t < slotMid) show(span, true)
					else show(span, false)
				} else {
					// D: two-pass — ÷ sweep in, then flip to real chars
					if (t < 0.5) {
						const fillIdx = Math.floor(t * 2 * N)
						if (i < fillIdx) show(span, true)
						else hide(span)
					} else {
						const flipIdx = Math.floor((t - 0.5) * 2 * N)
						if (i < flipIdx) show(span, false)
						else show(span, true)
					}
				}
			})
		}
	}
}