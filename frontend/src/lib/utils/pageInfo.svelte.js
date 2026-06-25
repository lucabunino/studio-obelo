import { page } from '$app/state'
import { beforeNavigate, afterNavigate, goto, pushState, preloadData } from '$app/navigation'
import { innerWidth, innerHeight } from 'svelte/reactivity/window'
import bp from '$lib/scss/breakpoints.module.scss'
import timing from '$lib/scss/timing.module.scss'

const DURATION = parseInt(timing.overlayDuration)
const OVERLAY_ROUTES = ['/works', '/about']

export function isOverlayRoute(pathname) {
	return OVERLAY_ROUTES.includes(pathname) || pathname.startsWith('/policy/')
}

function isFullscreenPath(pathname) {
	return pathname !== '/' && !isOverlayRoute(pathname)
}

export function getPageInfo() {
	const isMobile = $derived(innerWidth.current < parseInt(bp.md) || innerHeight.current > innerWidth.current)
	const isOverlay = $derived(!isMobile && !!page.state.overlay)
	const isFullscreen = $derived(!isOverlay && page.url.pathname !== '/')
	const showInfo = $derived(!isFullscreen || (isMobile && page.url.pathname === '/about'))
	const activePath = $derived(page.state.overlay ?? page.url.pathname)
	const pageName = $derived(
		!activePath || activePath === '/' ? 'home' :
		activePath === '/about' ? 'about' :
		activePath === '/works' ? 'works' :
		activePath.startsWith('/works/') ? 'singleWork' :
		activePath === '/education' ? 'education' :
		activePath.startsWith('/education/') ? 'singleEducation' :
		activePath.startsWith('/policy/') ? 'policy' : ''
	)

	let redirecting = $state(false)
	let navigating = $state(false)

	$effect(() => {
		if (isMobile && page.state.overlay) goto(page.state.overlay)
	})

	let wasMobile = false
	$effect(() => {
		const mobile = isMobile
		if (!mobile && wasMobile && isOverlayRoute(page.url.pathname) && !page.state.overlay) {
			const overlayPathname = page.url.pathname
			const path = overlayPathname + page.url.search
			preloadData(path).then(result => {
				if (result.type === 'loaded' && result.status === 200) {
					goto('/', { replaceState: true, noScroll: true }).then(() => {
						pushState(path, { overlay: overlayPathname, overlayData: result.data })
					})
				}
			})
		}
		wasMobile = mobile
	})

	beforeNavigate(({ cancel, to, type }) => {
		if (!navigating && isFullscreen && to && isFullscreenPath(to.url.pathname)) {
			cancel()
			navigating = true
			setTimeout(async () => {
				await goto(to.url.pathname + to.url.search + to.url.hash)
				navigating = false
			}, DURATION)
			return
		}
		if (!isMobile && isOverlay && to && isOverlayRoute(to.url.pathname) && type !== 'popstate') {
			cancel()
			const href = to.url.pathname + to.url.search
			preloadData(href).then(result => {
				if (result.type === 'loaded' && result.status === 200) {
					pushState(href, {
						overlay: to.url.pathname,
						overlayData: result.data,
						from: window.location.href,
						lastFullscreen: page.state.lastFullscreen ?? '/'
					})
				}
			})
		}
	})

	afterNavigate(async ({ type, to }) => {
		if (isMobile) return
		if (to && isOverlayRoute(to.url.pathname) && !page.state.overlay) {
			redirecting = true
			const from = window.location.href
			const overlayPathname = to.url.pathname
			const overlayFullPath = to.url.pathname + to.url.search
			const overlayData = { ...page.data }
			await goto('/', { replaceState: true, noScroll: true })
			pushState(overlayFullPath, { overlay: overlayPathname, overlayData, from })
			redirecting = false
		}
	})

	return {
		get isMobile() { return isMobile },
		get isOverlay() { return isOverlay },
		get isFullscreen() { return isFullscreen },
		get showInfo() { return showInfo },
		get pageName() { return pageName },
		get redirecting() { return redirecting },
	}
}
