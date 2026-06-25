import { page } from '$app/state'
import { goto, pushState, preloadData } from '$app/navigation'

const OVERLAY_ROUTES = ['/works', '/about']

export function isOverlayActive(href) {
	if (page.state.overlay) return page.state.overlay === href
	return page.url.pathname === href
}

export async function handleOverlay(e, href) {
	e.preventDefault()
	if (isOverlayActive(href)) {
		goto(page.state.lastFullscreen ?? '/', { noScroll: true })
		return
	}
	const hrefPathname = href.split('?')[0]
	const preservedSearch = page.url.pathname === hrefPathname ? page.url.search : ''
	const fullHref = href + preservedSearch
	const result = await preloadData(fullHref)
	if (result.type === 'loaded' && result.status === 200) {
		const currentHref = window.location.href
		const lastFullscreen = page.state.lastFullscreen ?? (!OVERLAY_ROUTES.includes(page.url.pathname) ? currentHref : '/')
		pushState(fullHref, { overlay: hrefPathname, overlayData: result.data, from: currentHref, lastFullscreen })
	}
}
