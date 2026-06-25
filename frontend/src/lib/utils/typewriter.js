import timing from '$lib/scss/timing.module.scss'

let animationEndMs = 0

export const MS_PER_CHAR = parseFloat(timing.typewriterPerChar)
const FADE_DURATION_DEFAULT = parseInt(timing.fadeDuration)
const HOLD_DURATION_DEFAULT = parseInt(timing.typewriterHold)
const MIN_DURATION = parseInt(timing.typewriterMinDuration)
const START_DELAY = 0

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
		const parent = textNode.parentElement
		const isObeloChild = parent !== node && parent.parentElement?.hasAttribute('data-obelo')

		if (isObeloChild) {
			const char = textNode.textContent
			parent.dataset.char = char
			if (char.trim() === '') parent.dataset.ws = '1'
			parent.style.display = 'inline'
			parent.style.color = 'transparent'
			charSpans.push(parent)
		} else {
			const fragment = document.createDocumentFragment()
			for (const char of textNode.textContent.split('')) {
				const span = document.createElement('span')
				span.dataset.char = char
				if (char.trim() === '') span.dataset.ws = '1'
				span.textContent = char
				span.style.display = 'inline'
				span.style.color = 'transparent'
				fragment.appendChild(span)
				charSpans.push(span)
			}
			textNode.parentNode.replaceChild(fragment, textNode)
		}
	}
	return charSpans
}

export function typewriter(node, { duration: fixedDuration, delay: fixedDelay, clean = false, glyphs = false, fade = true, hold = true, revealDelay = 0 } = {}, { direction = 'in' } = {}) {
	const charSpans = wrapChars(node)
	const charReveal = charSpans.length * MS_PER_CHAR
	const effectiveFadeDuration = fade === true ? FADE_DURATION_DEFAULT : fade === false ? 0 : fade
	const effectiveHoldDuration = hold === true ? HOLD_DURATION_DEFAULT : hold === false ? 0 : hold
	const duration = fixedDuration ?? Math.max(effectiveFadeDuration + effectiveHoldDuration + revealDelay + charReveal, MIN_DURATION)

	if (!charSpans.length) return { duration: 0 }

	const links = Array.from(node.querySelectorAll('a'))
	const liItems = Array.from(node.querySelectorAll('li'))
	links.forEach(a => a.style.textDecorationColor = 'transparent')
	liItems.forEach(li => li.style.listStyleType = 'none')
	node.dataset.typing = '1'

	const restoreDecorations = () => {
		links.forEach(a => a.style.removeProperty('text-decoration-color'))
		liItems.forEach(li => li.style.removeProperty('list-style-type'))
		delete node.dataset.typing
	}

	const show = (span, glyph) => {
		span.textContent = glyph && !span.dataset.ws ? '÷' : span.dataset.char
		span.style.removeProperty('color')
	}
	const hide = (span) => { span.style.color = 'transparent' }

	const N = charSpans.length

	if (direction === 'out') {
		charSpans.forEach(span => show(span, false))
		let prevIdx = N
		const outDelay = fixedDelay !== undefined ? fixedDelay : (node.dataset.outDelay !== undefined ? parseInt(node.dataset.outDelay) : 0)
		return {
			delay: outDelay,
			duration,
			tick(t) {
				const currentIdx = Math.floor(t * N)
				for (let i = currentIdx; i < prevIdx; i++) {
					clean ? hide(charSpans[i]) : show(charSpans[i], true)
				}
				prevIdx = currentIdx
				}
		}
	}

	const myStart = animationEndMs
	if (fixedDelay === undefined) animationEndMs = myStart + duration

	if (glyphs) {
		const obeloPhaseMs = Math.min(N * 0.5, duration * 0.5)
		const obeloRatio = obeloPhaseMs / duration

		charSpans.forEach(span => hide(span))

		let prevObeloIdx = 0
		let prevCharIdx = 0
		let obelosDone = false

		return {
			delay: fixedDelay ?? (START_DELAY + myStart),
			duration,
			tick(t) {
				if (t < obeloRatio) {
					const phaseT = t / obeloRatio
					const currentObeloIdx = Math.floor(phaseT * N)
					for (let i = prevObeloIdx; i < currentObeloIdx; i++) show(charSpans[i], true)
					prevObeloIdx = currentObeloIdx
				} else {
					if (!obelosDone) {
						for (let i = prevObeloIdx; i < N; i++) show(charSpans[i], true)
						prevObeloIdx = N
						obelosDone = true
					}
					const remainingRatio = 1 - obeloRatio
					const phaseT = remainingRatio > 0 ? (t - obeloRatio) / remainingRatio : 1
					const currentCharIdx = t >= 1 ? N : Math.floor(phaseT * N)
					for (let i = prevCharIdx; i < currentCharIdx; i++) show(charSpans[i], false)
					prevCharIdx = currentCharIdx
					if (currentCharIdx === N) restoreDecorations()
				}
			}
		}
	}

	const totalFixed = effectiveFadeDuration + effectiveHoldDuration + revealDelay
	const scale = totalFixed > 0 ? Math.min(1, duration * 0.8 / totalFixed) : 1
	const fadeRatio = (effectiveFadeDuration * scale) / duration
	const holdRatio = ((effectiveHoldDuration + revealDelay) * scale) / duration
	const revealStart = fadeRatio + holdRatio

	charSpans.forEach(span => show(span, true))
	if (fade) node.style.opacity = '0'

	let prevIdx = 0
	let fadeDone = false

	return {
		delay: fixedDelay ?? (START_DELAY + myStart),
		duration,
		tick(t) {
			if (t < fadeRatio) {
				node.style.opacity = String(fadeRatio > 0 ? t / fadeRatio : 1)
			} else {
				if (!fadeDone) {
					node.style.removeProperty('opacity')
					fadeDone = true
				}
				if (t >= revealStart) {
					const phaseT = revealStart < 1 ? (t - revealStart) / (1 - revealStart) : 1
					const currentIdx = t >= 1 ? N : Math.floor(phaseT * N)
					for (let i = prevIdx; i < currentIdx; i++) show(charSpans[i], false)
					prevIdx = currentIdx
					if (currentIdx === N) links.forEach(a => a.style.removeProperty('text-decoration-color'))
				}
			}
		}
	}
}
