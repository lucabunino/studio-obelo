<script>
	import { onMount } from 'svelte'
	import { goto, replaceState } from '$app/navigation'
	import { page, navigating } from '$app/state'
	import { fade } from 'svelte/transition'
	import Media from '$lib/components/Media.svelte'
	import { obelo } from '$lib/utils/obelo.js'
	import timing from '$lib/scss/timing.module.scss'
    import { typewriter } from '$lib/utils/typewriter';
	import { buildSlides, computeInitialIndex, getDisplayTitle, closeEducationUrl, replaceEducationUrl } from '$lib/utils/education.js'

	let { educations, slug } = $props()

	const slides = $derived(buildSlides(educations))

	let activeIndex = $state(computeInitialIndex(slides, slug, page.url.hash))
	const activeSlide = $derived(slides[activeIndex])
	let panelHeight = $state(undefined)
	let ready = $state(false)
	let slideEls = $state([])

	const seoBase = $derived(Array.isArray(page.data?.seo) ? page.data.seo[0] : page.data?.seo)
	const displayTitle = $derived(getDisplayTitle(activeSlide, seoBase))

	function close() {
		goto(closeEducationUrl(activeSlide), { replaceState: true, noScroll: true })
	}

	function updateActiveSlide() {
		let newIndex = slideEls.length - 1
		for (let i = 0; i < slideEls.length; i++) {
			const el = slideEls[i]
			if (el && el.getBoundingClientRect().top >= 0) { newIndex = i; break }
		}
		if (newIndex === activeIndex) return
		activeIndex = newIndex

		if (!ready || page.state.overlay || navigating.to || page.route.id !== '/education/[slug]') return
		const slide = slides[newIndex]
		if (!slide) return
		replaceState(replaceEducationUrl(slide), {})
	}

	onMount(() => {
		const t = requestAnimationFrame(() => { ready = true })
		return () => cancelAnimationFrame(t)
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

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && !page.state.overlay) close() }} onscroll={updateActiveSlide} />

<div class="slides" style:--panelHeight="{panelHeight}px" in:fade={{ duration: +timing.fadeDuration }} out:fade|global={{ duration: +timing.fadeDurationMobile }}>
	{#each slides as slide, i (slide.media)}
		<div id="{slide.slug}-{slide.imageIndex}" class="slide" class:new-education={slide.imageIndex === 1 && i !== 0} bind:this={slideEls[i]}>
			<Media media={slide.media} class="education-scroll" sizes="100vw" />
		</div>
	{/each}
</div>

<div class="bottom-panel">
	{#if !page.state.overlay}
		<button class="bottom-button uppercase glass-1" onclick={close} use:obelo>Close</button>
	{/if}
	<div class="info" bind:clientHeight={panelHeight}>
		{#key activeSlide?.media}
			<div in:typewriter={{ duration: +timing.overlayDuration, delay: +timing.overlayDuration/3 }} out:typewriter={{ duration: +timing.overlayDuration/3, clean: true }}>
				{#if activeSlide?.title}
					<h1 class="title">{activeSlide.title}</h1>
				{/if}
				{#if activeSlide?.media?.image?.asset?.description}
					<p class="caption">{activeSlide.media.image.asset.description}</p>
				{/if}
			</div>
		{/key}
	</div>
</div>

<style lang="scss">
	.slides {
		display: flex;
		flex-direction: column;
		margin: var(--sp-6) var(--sp-6) calc(var(--panelHeight) + var(--sp-12)*2 + 1.2em + var(--sp-6));
		row-gap: var(--sp-4);

		.slide {
			width: 100%;
			scroll-margin-top: var(--sp-6);

			&.new-education {
				margin-top: var(--sp-156);
			}
		}
	}

	.bottom-panel {
		position: fixed;
		bottom: 0;
		left: 0;
		width: stretch;
		z-index: 8;

		.bottom-button {
			width: stretch;
			padding: var(--sp-12);
			margin: 0 var(--sp-6) -1px;
			text-align: center;
			display: block;
		}

		.info {
			padding: var(--sp-12) var(--sp-12) var(--headerHeight);
			background-color: var(--black);
			color: var(--white);
			text-align: center;

			.caption {
				white-space: pre;
			}
		}
	}
</style>
