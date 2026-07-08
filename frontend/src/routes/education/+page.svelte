<script>
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'
	import Media from '$lib/components/Media.svelte'
	import { getOrientation } from '$lib/utils/image.js'
	import { typewriter } from '$lib/utils/typewriter.js'
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import timing from '$lib/scss/timing.module.scss'
	import { getResponsive } from '$lib/utils/responsive.svelte.js'
	import { useScrollLock } from '$lib/utils/scrollLock.svelte.js'
	import CursorTag from '$lib/components/CursorTag.svelte'
    import { fade, fly, slide } from 'svelte/transition';
    import { innerHeight } from 'svelte/reactivity/window';

	const responsive = getResponsive()
	let { data } = $props()
	const educations = $derived(data.educations)
	
	let readMore = $state(false)
	let readMoreHeight = $state(undefined)

	useScrollLock(() => readMore)

	const itemsWithIndex = $derived.by(() => {
		let mediaCount = 0
		return (educations?.items ?? []).map(item => {
			if (item._type !== 'education') return item
			return {
				...item,
				education: {
					...item.education,
					media: item.education.media.map(m => ({ ...m, _mediaIndex: mediaCount++ }))
				}
			}
		})
	})
	let loaded = $state(false)
	let cols = $state(data.cols)
	let gridHeight = $state(0)
	let hoveredEdu = $state(null)

	onMount(() => {
		const t = setTimeout(() => { loaded = true }, responsive.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration)
		return () => { clearTimeout(t); loaded = false }
	})

	$effect(() => { document.cookie = `edu-cols=${cols}; path=/; max-age=31536000` })

	$effect(() => {
		if (!loaded) return
		const hash = page.url.hash
		if (!hash) return
		const params = new URLSearchParams(hash.slice(1))
		const title = params.get('title')
		const i = params.get('i')
		if (!title || !i) return
		requestAnimationFrame(() => {
			document.getElementById(`${title}-${i}`)?.scrollIntoView({ behavior: 'instant', block: 'center' })
		})
	})
</script>

<main style:--readMoreHeight="{readMoreHeight}px">
	<h1 class="sr-only">Education</h1>
	{#if loaded}
		<aside class="intro" aria-label="Introduction" out:typewriter|global={{ duration: responsive.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration, clean: true }}>
			<button class="bottom-button uppercase under-md glass-1" onclick={() => readMore = !readMore}>{#if !readMore}Read more{:else}Close{/if}</button>
			<div class="intro-content" in:typewriter={{ duration: +timing.overlayDuration }}>
				{#if educations?.description}
					<div class="description portableText" bind:clientHeight={readMoreHeight}>
						<PortableText value={educations.description} components={{ block: PortableTextStyle, types: { break: PortableTextStyle }, marks: { link: PortableTextStyle } }} />
					</div>
				{/if}
				{#if educations?.teachingsOngoing?.length}
					<ul class="teachings" aria-label="Ongoing teaching" >
						<li class="mt">Currently teaching at:</li>
						{#each educations.teachingsOngoing as t}
							<li class="teaching">{t.title}</li>
						{/each}
					</ul>
					{#if readMore}
						<ul class="teachings under-md read-more" aria-label="Ongoing teaching" transition:slide={{ duration: +timing.overlayDuration }}>
							<li class="mt">Currently teaching at:</li>
							{#each educations.teachingsOngoing as t}
								<li class="teaching">{t.title}</li>
							{/each}
						</ul>
					{/if}
				{/if}
			</div>
		</aside>
	{/if}
	<div class="grid" style="--cols: {cols}" aria-label="Works" bind:clientHeight={gridHeight}>
		{#each itemsWithIndex as item, i}
			{#if item._type === 'gap'}
				{#each Array(item.gap) as _, j}
					<div class="gap" aria-hidden="true"></div>
				{/each}
			{:else if item._type === 'education'}
				{@const edu = item.education}
				{#each edu.media as media, j (media)}
					{#if loaded}
						<a id="{edu.slug.current}-{j+1}" href="/education/{edu.slug.current}#{edu.slug.current}-{j+1}" class="media-item {getOrientation(media)}"
							onmouseenter={() => hoveredEdu = edu}
							onmouseleave={() => hoveredEdu = null}
							in:fade={{ delay: responsive.isMobile ? +timing.overlayDurationMobile : media._mediaIndex * 80, duration: +timing.fadeDuration }}
							out:fade|global={{ duration: responsive.isMobile ? +timing.fadeDurationMobile : +timing.fadeDuration }}
						>
							<Media {media} class="education" sizes="{getOrientation(media) === 'landscape' ? Math.round(200/cols) : Math.round(100/cols)}vw" />
						</a>
					{/if}
				{/each}
			{/if}
		{/each}
	</div>
	{#if loaded}
		<div class="zoom-controls" role="group" aria-label="Zoom" in:fade={{ delay: responsive.isMobile ? +timing.overlayDurationMobile : itemsWithIndex.length * 80, duration: +timing.fadeDuration }} out:fade|global={{ duration: responsive.isMobile ? +timing.fadeDurationMobile : +timing.fadeDuration }}>
			<button class="glass-1"
				aria-label="Zoom out"
				disabled={cols >= 12}
				onclick={() => cols = Math.min(12, cols + 1)}>
				<svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="14" height="2" fill="currentColor"/>
				</svg>
			</button>
			<button class="glass-1"
				aria-label="Zoom in"
				disabled={cols <= 4}
				onclick={() => cols = Math.max(4, cols - 1)}>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z" fill="currentColor"/>
				</svg>
			</button>
		</div>
	{/if}
</main>

{#if hoveredEdu}
	<CursorTag
		title={hoveredEdu.title}
		subtitle={hoveredEdu.place?.title}
		year={hoveredEdu.ongoing ? 'Ongoing' : [hoveredEdu.startDate?.slice(0,4), hoveredEdu.endDate?.slice(0,4)].filter(Boolean).join('–')}
	/>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as bp;

	main {
		position: relative;
		padding: var(--sp-12);
		padding-bottom: calc(var(--headerHeight) + var(--sp-12));

		@media (orientation: portrait), (width <= #{bp.$md}) {
			padding: var(--sp-6);
		}
	}

	.intro {
		position: fixed;
		top: var(--sp-12);
		left: var(--sp-12);
		display: flex;
		flex-direction: column;
		pointer-events: none;
		width: var(--infoWidth);
		z-index: 2;

		* {
			pointer-events: auto;
		}

		.bottom-button {
			display: none;
		}

		.intro-content {
			display: flex;
			flex-direction: column;

			.teachings {
				&.under-md { display: none; }

				.mt {
					margin-top: var(--sp-12);
				}
				
				.teaching {
					display: block;
					min-width: 400px;
				}
			}
		}

		@media (orientation: portrait), (width <= #{bp.$md}) {
			top: unset;
			left: 0;
			bottom: 0;
			width: stretch;

			.bottom-button {
				width: stretch;
				padding: var(--sp-12);
				margin: 0 var(--sp-6) -1px;
				text-align: center;
				display: block;
			}

			.intro-content {
				padding: var(--sp-12) var(--sp-12) var(--headerHeight);
				background-color: var(--black);

				.teachings {
					display: none;
					&.under-md { display: block; }
				}
			}
		}
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(var(--cols, 9), 1fr);
		column-gap: var(--sp-4);
		row-gap: var(--sp-120);
		position: relative;

		@media (orientation: portrait), (width <= #{bp.$md}) {
			grid-template-columns: repeat(4, 1fr);
			row-gap: var(--sp-60);
			margin: 0 0 calc(var(--headerHeight) + var(--readMoreHeight) + var(--sp-12)*2 + 1.2em + var(--sp-12));
		}

		@media (width <= #{bp.$xs}) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.media-item {
		height: fit-content;
		z-index: 1;

		&.landscape {
			grid-column: span 2;
		}

	}

	.zoom-controls {
		position: fixed;
		top: 50%;
		left: 50%;
		transform:  translateY(-50%) translateX(-50%);
		display: flex;
		column-gap: var(--sp-3);
		z-index: 2;

		@media (width <= #{bp.$md}) {
			display: none;
		}

		button {
			width: 1.8rem;
			height: 1.8rem;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: var(--transition);
			transition-property: transform;

			&:disabled {
				cursor: not-allowed;
				opacity: .5;

				&:hover {
					background: inherit;
					color: inherit;
				}
			}

			&:hover {
				transform: scale(.9);
				background: var(--white);
				color: var(--black);
			}
		}
	}
</style>
