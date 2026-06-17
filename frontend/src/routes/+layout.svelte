<script>
	import '$lib/scss/reset.scss'
	import '$lib/scss/main.scss'
	import '$lib/scss/typography.scss'
	import Head from '$lib/components/Head.svelte'
	import Header from '$lib/components/Header.svelte'
	import CookieBanner from '$lib/components/CookieBanner.svelte'
	import Info from '$lib/components/Info.svelte'
	import WorksPage from './works/+page.svelte'
	import AboutPage from './about/+page.svelte'
	import { page } from '$app/state'
	import { afterNavigate, goto, pushState } from '$app/navigation'
	import '$lib/utils/glass.js'
	import { obeloGrid } from '$lib/utils/obeloGrid.js'

	const SLIDE_DURATION = 400

	const isEducationRoute = $derived(page.route.id?.startsWith('/education') ?? false)
	const showObeloGrid = $derived(isEducationRoute || isOverlay)
	const obeloGridParams = $derived({
		cols: 6,
		rows: 8,
		loop: true,
	})

	let { data, children } = $props()

	const OVERLAY_ROUTES = ['/works', '/about']
	const isOverlay = $derived(!!page.state.overlay)
	const isFullscreen = $derived(!isOverlay && page.url.pathname !== '/')
	let redirecting = $state(false)

	afterNavigate(async ({ type, to }) => {
		if (type === 'enter' && to && OVERLAY_ROUTES.includes(to.url.pathname) && !page.state.overlay) {
			redirecting = true
			const overlayPathname = to.url.pathname
			const overlayFullPath = to.url.pathname + to.url.search
			const overlayData = { ...page.data }
			await goto('/', { replaceState: true, noScroll: true })
			pushState(overlayFullPath, { overlay: overlayPathname, overlayData, from: '/' })
			redirecting = false
		}
	})
</script>

<Head />

{#if showObeloGrid}
	<div class="obelo-grid" class:glass-2={isOverlay} class:is-overlay={isOverlay} use:obeloGrid={obeloGridParams}></div>
{/if}

<div aria-hidden={redirecting || data.needsOverlayRedirect} class:redirecting={redirecting || data.needsOverlayRedirect}>
	{#if !isFullscreen}
		<Info about={data.about} />
	{/if}

	{#if isFullscreen}
		<div id="fullscreen">{@render children()}</div>
	{:else}
		<div id="background">{@render children()}</div>
	{/if}

	{#if isOverlay}
		<!-- <button id="back-backdrop" onclick={() => goto(page.state.lastFullscreen ?? '/')} aria-label="Go back"></button> -->
		<div id="overlay">
			{#if page.state.overlay === '/works'}
				<WorksPage data={page.state.overlayData} />
			{:else if page.state.overlay === '/about'}
				<AboutPage data={page.state.overlayData} />
			{/if}
		</div>
	{/if}

	<Header />
	<CookieBanner />
</div>

<svg style="display:none" aria-hidden="true">
	<defs>
		<filter id="liquid-glass" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
			<feTurbulence type="fractalNoise" baseFrequency="0.018 0.012" numOctaves="3" seed="8" result="noise"/>
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
			<feComposite in="displaced" in2="SourceGraphic" operator="atop"/>
		</filter>
	</defs>
</svg>

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as *;

	.obelo-grid {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		z-index: 1;
		pointer-events: none;

		&.is-overlay {
			z-index: 3;
			
			left: max(
				calc(var(--infoWidth) + 6 * var(--menuColWidth)),
				calc(var(--infoWidth) + (100vw - var(--infoWidth)) * 6 / 15)
			);
			width: min(
				calc((100vw - var(--infoWidth)) * 9 / 15),
				calc(100vw - var(--infoWidth) - 6 * var(--menuColWidth))
			);
		}
	}

	.redirecting {
		visibility: hidden;
	}

	#background {
		// position: fixed;
		inset: 0;
		bottom: var(--headerHeight);
		z-index: 1;
	}

	#fullscreen {
		// position: fixed;
		inset: 0;
		z-index: 4;
		background-color: var(--black);
	}

	#back-backdrop {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 4;
		cursor: pointer;
		height: 100vh;
		width: var(--infoWidth);
	}

	#overlay {
		position: fixed;
		top: 0;
		left: var(--infoWidth);
		right: 0;
		bottom: 0;
		z-index: 5;
		overflow: hidden;
		pointer-events: none;
	}
</style>
