<script>
	import { onMount } from 'svelte'
	import { register } from 'swiper/element/bundle'
	import { replaceState, goto } from '$app/navigation'
	import { page } from '$app/state'
	import Media from '$lib/components/Media.svelte'
	import { obelo } from '$lib/utils/obelo.js'

	register()

	let { educations, slug } = $props()

	let swiperEl = $state()
	let keyHoldTimer = null
	let keyHoldCount = 0
	let hoverSide = $state(null)
	const tilt = $derived(hoverSide === 'left' ? '-2deg' : hoverSide === 'right' ? '2deg' : '0deg')
	const peekPrev = $derived(hoverSide === 'left' ? '48px' : '0px')
	const peekNext = $derived(hoverSide === 'right' ? '-48px' : '0px')

	function startKeyHold(direction) {
		if (keyHoldTimer) return
		const swiper = swiperEl?.swiper
		if (!swiper) return

		direction === 'left' ? swiper.slidePrev() : swiper.slideNext()
		keyHoldCount = 0

		function repeat() {
			const s = swiperEl?.swiper
			if (!s) return
			direction === 'left' ? s.slidePrev() : s.slideNext()
			keyHoldCount++
			const delay = Math.max(60, 200 - keyHoldCount * 14)
			s.params.speed = Math.max(80, delay)
			keyHoldTimer = setTimeout(repeat, delay)
		}

		keyHoldTimer = setTimeout(repeat, 350)
	}

	function stopKeyHold() {
		clearTimeout(keyHoldTimer)
		keyHoldTimer = null
		keyHoldCount = 0
		if (swiperEl?.swiper) swiperEl.swiper.params.speed = 250
	}

	const slides = $derived(
		educations.items
			.filter(item => item._type === 'education')
			.flatMap(item =>
				item.education.media.map((media, i) => ({
					media,
					slug: item.education.slug.current,
					imageIndex: i + 1,
				}))
			)
	)

	let activeRealIndex = $state(0)
	const activeSlide = $derived(slides[activeRealIndex])

	function closeSwiper() {
		if (!activeSlide) { goto('/education'); return }
		goto(`/education#title=${activeSlide.slug}&i=${activeSlide.imageIndex}`)
	}

	function computeInitialSlide() {
		const match = page.url.hash.match(/^#i=(\d+)$/)
		const offset = match ? parseInt(match[1]) - 1 : 0
		const base = slides.findIndex(s => s.slug === slug && s.imageIndex === 1)
		return Math.max(0, base) + offset
	}

	onMount(() => {
		const initialSlide = computeInitialSlide()
		activeRealIndex = initialSlide

		Object.assign(swiperEl, {
			loop: true,
			effect: 'creative',
			speed: 250,
			grabCursor: true,
			preventInteractionOnTransition: false,
			loopAdditionalSlides: 4,
			slideToClickedSlide: true,
			initialSlide,
			keyboard: { enabled: false },
			mousewheel: {
                forceToAxis: true,
                sensitivity: 1,
                thresholdDelta: 10, 
            },
			creativeEffect: {
				prev: {
					translate: ['-50%', 0, 0],
					scale: 0.7,
					opacity: 1,
				},
				next: {
					translate: ['50%', 0, 0],
					scale: 0.7,
					opacity: 1,
				},
			},
		})
		swiperEl.initialize()

		swiperEl.swiper.on('slideChange', () => {
			activeRealIndex = swiperEl.swiper.realIndex
		})
		swiperEl.swiper.on('slideNextTransitionStart', () => {
			window.dispatchEvent(new CustomEvent('obelo-swiper-step', { detail: { direction: 'next' } }))
		})
		swiperEl.swiper.on('slidePrevTransitionStart', () => {
			window.dispatchEvent(new CustomEvent('obelo-swiper-step', { detail: { direction: 'prev' } }))
		})
		swiperEl.swiper.on('slideChangeTransitionEnd', () => {
			if (activeSlide && !page.state.overlay) replaceState(`/education/${activeSlide.slug}#i=${activeSlide.imageIndex}`, {})
		})

		function onKeyDown(e) {
			if (e.repeat) return
			if (e.key === 'ArrowLeft') startKeyHold('left')
			else if (e.key === 'ArrowRight') startKeyHold('right')
			else if (e.key === 'Escape') closeSwiper()
		}
		function onKeyUp(e) {
			if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') stopKeyHold()
		}

		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)

		return () => {
			stopKeyHold()
			window.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('keyup', onKeyUp)
		}
	})
</script>

{#if !page.state.overlay}
	<button class="close" onclick={closeSwiper} use:obelo>× Close</button>
{/if}

<button
	class="nav nav-prev"
	aria-label="Previous"
	onmouseenter={() => hoverSide = 'left'}
	onmouseleave={() => { hoverSide = null; stopKeyHold() }}
	onmousedown={() => startKeyHold('left')}
	onmouseup={stopKeyHold}
></button>

<button
	class="nav nav-next"
	aria-label="Next"
	onmouseenter={() => hoverSide = 'right'}
	onmouseleave={() => { hoverSide = null; stopKeyHold() }}
	onmousedown={() => startKeyHold('right')}
	onmouseup={stopKeyHold}
></button>

<swiper-container bind:this={swiperEl} init="false" style:--slide-tilt={tilt} style:--peek-prev={peekPrev} style:--peek-next={peekNext}>
	{#each slides as slide, i}
		<swiper-slide>
			<div class="single-education-wrapper">
				<span class="index">{activeSlide?.imageIndex}</span>
				<Media media={slide.media} class="single-education" />
				{#if slide.media?.image?.asset?.description}
					<caption class="caption">{slide.media.image.asset.description}</caption>
				{/if}
			</div>
		</swiper-slide>
	{/each}
</swiper-container>

<style lang="scss">
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

		&:global(.swiper-slide-active) {
			perspective: 800px;
		}

		&:global(.swiper-slide-active) .single-education-wrapper {
			transform: rotateY(var(--slide-tilt, 0deg));
			transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		}

		&:global(.swiper-slide-prev),
		&:global(.swiper-slide-next) {
			filter: blur(20px) saturate(1.2);
		}

		&:global(.swiper-slide-prev) .single-education-wrapper {
			transform: translateX(var(--peek-prev, 0px));
			transition: transform 0.35s ease;
		}

		&:global(.swiper-slide-next) .single-education-wrapper {
			transform: translateX(var(--peek-next, 0px));
			transition: transform 0.35s ease;
		}

		.single-education-wrapper {
			height: fit-content;
			position: relative;

			.index, .caption {
				display: block;
				width: 100%;
				text-align: center;
				position: absolute;
				background-color: var(--black);
				width: fit-content;
				white-space: pre;
			}
			.index {
				left: 50%;
				top: calc(var(--sp-12)*-1);
				transform: translateX(-50%) translateY(-100%);
			}
			.caption {
				left: 50%;
				bottom: calc(var(--sp-22)*-1);
				transform: translateX(-50%) translateY(100%);
			}
		}
	}
</style>
