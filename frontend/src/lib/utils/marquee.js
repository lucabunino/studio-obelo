export function marquee(node) {
	const trigger = node.closest('.work') ?? node

	function onEnter() {
		if (node.scrollWidth <= node.offsetWidth) return

		const duration = node.scrollWidth / 30
		const originalChildren = [...node.childNodes]

		const track = document.createElement('span')
		track.className = 'marquee-track'
		track.style.animationDuration = `${duration}s`

		const copy1 = document.createElement('span')
		copy1.className = 'marquee-copy'
		originalChildren.forEach(child => copy1.appendChild(child))

		const copy2 = copy1.cloneNode(true)
		copy2.setAttribute('aria-hidden', 'true')

		track.appendChild(copy1)
		track.appendChild(copy2)
		node.appendChild(track)
		node.style.textOverflow = 'clip'
	}

	function onLeave() {
		const track = node.querySelector('.marquee-track')
		if (!track) return

		const copy1 = track.querySelector('.marquee-copy')
		;[...copy1.childNodes].forEach(child => node.appendChild(child))
		track.remove()
		node.style.textOverflow = ''
	}

	trigger.addEventListener('mouseenter', onEnter)
	trigger.addEventListener('mouseleave', onLeave)

	return {
		destroy() {
			trigger.removeEventListener('mouseenter', onEnter)
			trigger.removeEventListener('mouseleave', onLeave)
		}
	}
}
