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
	import PolicyPage from './policy/[slug]/+page.svelte'
	import { page } from '$app/state'
	import { onMount } from 'svelte'
	import { initGlass } from '$lib/utils/glass.js'
	import { obeloGrid } from '$lib/utils/obeloGrid.svelte.js'
	import timing from '$lib/scss/timing.module.scss'
	import { getPageInfo } from '$lib/utils/pageInfo.svelte.js'
	import { slideFromLeft, pageOut } from '$lib/utils/transitions.js'
	import { fade, fly, slide } from 'svelte/transition'
	import { getInfoText } from '$lib/stores/infoText.svelte.js'
	const infoText = getInfoText()

	let { data, children } = $props()
	const nav = getPageInfo()

	function setBodyPage(node, pageName) {
		node.dataset.page = pageName
		return {
			update(pageName) { node.dataset.page = pageName },
			destroy() { delete node.dataset.page },
		}
	}

	onMount(() => initGlass())
</script>

<Head />

<svelte:body use:setBodyPage={nav.pageName} />

{#if page.route.id?.startsWith('/education')}
	<div class="obelo-grid" use:obeloGrid={{cols: 6, rows: 8, loop: true}}></div>
{/if}

<div id="site-wrapper" data-page={nav.pageName} aria-hidden={!nav.isMobile && (nav.redirecting || data.needsOverlayRedirect)}
class:redirecting={!nav.isMobile && (nav.redirecting || data.needsOverlayRedirect)}
style:--infoTextHeight="{infoText.height}px">
	{#if nav.showInfo}
		<div class="info-wrapper" out:slideFromLeft={{ duration: nav.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration, delay: nav.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration }}>
			<Info about={data.about} scroll={nav.pageName === 'about'}/>
		</div>
	{/if}

	<div id="page" class:fullscreen={nav.isFullscreen}>
		{#key page.url.pathname}
			<div out:fade={{ duration: nav.isMobile ? 0 : 0 }}>
				{@render children()}
			</div>
		{/key}
	</div>

	{#if nav.isOverlay}
		<div class="info-bg"
			in:slideFromLeft
			out:slideFromLeft={{ duration: nav.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration, delay: nav.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration }}>
		</div>
		<div class="overlay">
			{#if page.state.overlay}
				<div class="panel"
					data-overlay={page.state.overlay}
					in:slideFromLeft|global={{ offset: 'var(--infoWidth)' }}
					out:slideFromLeft|global={{ duration: nav.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration, delay: nav.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration, offset: 'var(--infoWidth)' }}>
					{#if page.state.overlay === '/works'}
						<WorksPage data={page.state.overlayData} />
					{:else if page.state.overlay === '/about'}
						<AboutPage data={page.state.overlayData} />
					{:else if page.state.overlay?.startsWith('/policy/')}
						<PolicyPage data={page.state.overlayData} />
					{/if}
				</div>
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
	@use '$lib/scss/breakpoints.module' as bp;

	#site-wrapper {
		transition: --bgColor var(--transition), --fgColor var(--transition);
		transition-delay: var(--overlayDuration);

		@media (orientation: portrait), (width <= #{bp.$md}) {
			background-color: var(--bgColor);
		}
	}

	:global([data-page='home']),
	:global([data-page='policy']),
	:global([data-page='education']),
	:global([data-page='singleWork']),
	:global([data-page='singleEducation']) {
		--bgColor: var(--black);
		--fgColor: var(--white);

		@media (orientation: portrait), (width <= #{bp.$md}) {
			.info-wrapper {
				color: var(--fgColor);
			}
		}
	}
	:global([data-page='about']),
	:global([data-page='works']) {
		--bgColor: var(--white);
		--fgColor: var(--black);
		transition-delay: 0ms;

		@media (orientation: portrait), (width <= #{bp.$md}) {
			.info-wrapper {
				color: var(--fgColor);
			}
		}
	}

	.redirecting {
		visibility: hidden;
	}

	#page {
		inset: 0;
		bottom: var(--headerHeight);
		z-index: 1;

		&.fullscreen {
			bottom: 0;
			z-index: 4;
			background-color: var(--black);
		}
	}

	// #back-backdrop {
	// 	position: fixed;
	// 	left: 0;
	// 	top: 0;
	// 	z-index: 4;
	// 	cursor: pointer;
	// 	height: 100vh;
	// 	width: var(--infoWidth);
	// }

	.info-bg {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: var(--infoWidth);
		background-color: var(--black);
		z-index: 4;
		pointer-events: none;
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 3;
		pointer-events: none;

		.panel {
			background-color: var(--bgColor);
			color: var(--fgColor);
			position: absolute;
			left: var(--infoWidth);
			top: 0;
			bottom: 0;
			width: var(--overlayWidth);
			overflow: hidden;
			pointer-events: all;

			&[data-overlay='/works'],
			&[data-overlay='/about'] {
				--bgColor: var(--white);
				--fgColor: var(--black);
			}
		}
	}
</style>
