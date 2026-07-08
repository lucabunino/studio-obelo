export function useScrollLock(condition) {
	$effect(() => {
		if (!condition()) return
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
		document.body.style.setProperty('--scrollbarWidth', `${scrollbarWidth}px`)
		document.body.classList.add('scroll-locked')
		return () => document.body.classList.remove('scroll-locked')
	})
}
