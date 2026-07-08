<script>
	import { untrack, onDestroy } from 'svelte'
	import { getResponsive } from '$lib/utils/responsive.svelte.js'
	import { register } from 'swiper/element/bundle'
	import { replaceState, goto } from '$app/navigation'
	import { page, navigating } from '$app/state'
	import { fade } from 'svelte/transition'
	import Media from '$lib/components/Media.svelte'
	import { obelo } from '$lib/utils/obelo.js'
	import { getSwiperStep } from '$lib/stores/swiperStep.svelte.js'
	import timing from '$lib/scss/timing.module.scss'
	import { typewriter } from '$lib/utils/typewriter.js'
	import { buildSlides, computeInitialIndex, getDisplayTitle, closeEducationUrl, replaceEducationUrl } from '$lib/utils/education.js'
	const swiperStep = getSwiperStep()
	const responsive = getResponsive()

	register()

	let { educations, slug } = $props()

	let ready = $state(false)
	let loaded = $state(false)
	let swiperEl = $state(undefined)
	let hoverSide = $state(null)
	const tilt = $derived(hoverSide === 'left' ? 'perspective(800px) rotateY(-2deg)' : hoverSide === 'right' ? 'perspective(800px) rotateY(2deg)' : 'perspective(800px) rotateY(0deg)')
	const peekPrev = $derived(hoverSide === 'left' ? 'translateX(48px)' : 'translateX(0px)')
	const peekNext = $derived(hoverSide === 'right' ? 'translateX(-48px)' : 'translateX(0px)')

	const slides = $derived(buildSlides(educations))

	let activeRealIndex = $state(0)
	const activeSlide = $derived(slides[activeRealIndex])
	let activeSlideRef = $state(null)
	$effect(() => { activeSlideRef = activeSlide })

	let destroyed = false
	onDestroy(() => { destroyed = true })

	const seoBase = $derived(Array.isArray(page.data?.seo) ? page.data.seo[0] : page.data?.seo)
	const displayTitle = $derived(getDisplayTitle(activeSlide, seoBase))

	function closeSwiper() {
		goto(closeEducationUrl(activeSlide), { replaceState: true, noScroll: true })
	}

	$effect(() => {
		const t = setTimeout(() => { loaded = true }, responsive.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration)
		return () => { clearTimeout(t); loaded = false }
	})

	$effect(() => {
		if (!swiperEl) return
		untrack(() => {
			const initialSlide = computeInitialIndex(slides, slug, page.url.hash)
			activeRealIndex = initialSlide
			Object.assign(swiperEl, {
				loop: true,
				effect: 'creative',
				speed: 300,
				grabCursor: true,
				preventInteractionOnTransition: false,
				loopAdditionalSlides: 4,
				slideToClickedSlide: true,
				initialSlide,
				keyboard: { enabled: true },
				mousewheel: {
					forceToAxis: true,
					sensitivity: 1,
					thresholdDelta: 10,
				},
				creativeEffect: {
					prev: { translate: ['-50%', 0, 0], scale: 0.7, opacity: 1 },
					next: { translate: ['50%', 0, 0], scale: 0.7, opacity: 1 },
				},
				on: {
					afterInit() { ready = true; this.loopFix() },
					slideNextTransitionStart() { activeRealIndex = this.realIndex; if (ready) swiperStep.step('next') },
					slidePrevTransitionStart() { activeRealIndex = this.realIndex; if (ready) swiperStep.step('prev') },
					slideChangeTransitionEnd() {
						if (!ready || destroyed || !activeSlideRef || page.state.overlay || navigating.to || page.route.id !== '/education/[slug]') return
						replaceState(replaceEducationUrl(activeSlideRef), {})
					},
				},
			})
			swiperEl.initialize()
		})
	})
</script>

<svelte:head>
	{#if displayTitle}
		<title>{displayTitle}</title>
		<meta name="title" content={displayTitle} />
		<meta property="og:title" content={displayTitle} />
		<meta name="twitter:title" content={displayTitle} />
		<meta property="og:site_name" content={seoBase?.seoTitle} />
	{/if}
</svelte:head>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && !page.state.overlay) closeSwiper() }} />

{#if loaded}
	<div in:fade={{ duration: +timing.fadeDuration }} out:fade|global={{ duration: responsive.isMobile ? +timing.fadeDurationMobile : +timing.fadeDuration }}>
		{#if activeSlide?.title}
			{#key activeSlide.title}
				<h1 class="title" in:typewriter={{ duration: +timing.overlayDuration, delay: +timing.overlayDuration/3 }} out:typewriter={{ duration: +timing.overlayDuration/3, clean: true }}>{activeSlide.title}</h1>
			{/key}
		{/if}

		{#if !page.state.overlay}
			<button class="close" onclick={closeSwiper} use:obelo>× Close</button>
		{/if}

		<button
			class="nav nav-prev"
			aria-label="Previous"
			onmouseenter={() => hoverSide = 'left'}
			onmouseleave={() => hoverSide = null}
			onclick={() => swiperEl.swiper.slidePrev()}
		></button>

		<button
			class="nav nav-next"
			aria-label="Next"
			onmouseenter={() => hoverSide = 'right'}
			onmouseleave={() => hoverSide = null}
			onclick={() => swiperEl.swiper.slideNext()}
		></button>

		<swiper-container bind:this={swiperEl} init="false" style:--slide-tilt={tilt} style:--peek-prev={peekPrev} style:--peek-next={peekNext}>
			{#each slides as slide, i}
				<swiper-slide>
					<div class="single-education-wrapper">
						<Media media={slide.media} class="single-education" sizes="70vw" />
						{#if slide.media?.image?.asset?.description}
							<span class="caption">{slide.media.image.asset.description}</span>
						{/if}
					</div>
				</swiper-slide>
			{/each}
		</swiper-container>
	</div>
{/if}

<style lang="scss">
	.title {
		position: fixed;
		top: var(--sp-12);
		left: var(--sp-12);
		z-index: 3;
		pointer-events: none;
	}

	.close {
		position: fixed;
		top: var(--sp-12);
		right: var(--sp-12);
		z-index: 11;

		&:hover {
			color: var(--black-50);
		}
	}

	.nav {
		position: fixed;
		top: 0;
		height: 100vh;
		width: 15vw;
		z-index: 6;
		background: transparent;

		&-prev {
			left: 0;
			cursor: w-resize;
		}

		&-next {
			right: 0;
			cursor: e-resize;
		}
	}

	swiper-container {
		width: 100vw;
		height: 100vh;
		position: fixed;
		display: flex;
		left: 0;
		top: 0;
	}

	swiper-slide {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		place-self: center;
		opacity: 0 !important;
		will-change: transform, filter, opacity;
		filter: blur(20px) saturate(1.2);

		&:global(.swiper-slide-active),
		&:global(.swiper-slide-prev),
		&:global(.swiper-slide-next) {
			opacity: 1 !important;
		}

		&:global(.swiper-slide-active) {
			filter: blur(0) saturate(1);
		}

		&:global(.swiper-slide-active) .single-education-wrapper {
			transform: var(--slide-tilt, perspective(800px) rotateY(0deg));
			transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

			:global(.media-container) {
				overflow: visible;
			}
		}

		&:global(.swiper-slide-prev),
		&:global(.swiper-slide-next) {
			filter: blur(20px) saturate(1.2);
		}

		&:global(.swiper-slide-prev) .single-education-wrapper {
			transform: var(--peek-prev, translateX(0px));
			transition: transform 0.35s ease;
		}

		&:global(.swiper-slide-next) .single-education-wrapper {
			transform: var(--peek-next, translateX(0px));
			transition: transform 0.35s ease;
		}

		.single-education-wrapper {
			height: fit-content;
			position: relative;

			.caption {
				display: block;
				width: 100%;
				text-align: center;
				position: absolute;
				background-color: var(--black);
				width: fit-content;
				white-space: pre;
			}
			.caption {
				left: 50%;
				bottom: calc(var(--sp-22)*-1);
				transform: translateX(-50%) translateY(100%);
			}
		}
	}
</style>
