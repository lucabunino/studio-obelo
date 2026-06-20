<script>
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'
	import Media from '$lib/components/Media.svelte'
	import { getOrientation } from '$lib/utils/image.js'
	import { typewriter, resetTypewriter } from '$lib/utils/typewriter.js'
	import { onMount, untrack } from 'svelte'
	import { page } from '$app/state'
	import CursorTag from '$lib/components/CursorTag.svelte'
    import { fade, fly, slide } from 'svelte/transition';
    import { innerHeight } from 'svelte/reactivity/window';

	let { data } = $props()
	const educations = $derived(data.educations)

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
	let cols = $state(untrack(() => data.cols))
	let gridHeight = $state(0)
	let hoveredEdu = $state(null)

	$effect(() => { document.cookie = `edu-cols=${cols}; path=/; max-age=31536000` })

	onMount(() => {
		resetTypewriter()
		loaded = true
	})

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

<main>
	<h1 class="sr-only">Education</h1>
	<aside class="intro" aria-label="Introduction">
		{#if loaded && educations?.description}
			<div class="description portableText" in:typewriter={{ duration: 800 }}>
				<PortableText value={educations.description} components={{ block: PortableTextStyle, marks: { link: PortableTextStyle } }} />
			</div>
		{/if}
		{#if loaded && educations?.teachingsOngoing?.length}
			<ul class="teachings" aria-label="Ongoing teaching" in:typewriter={{ duration: 800 }}>
				{#each educations.teachingsOngoing as t}
					<li class="teaching">{t.title}</li>
				{/each}
			</ul>
		{/if}
	</aside>
	<div class="grid" style="--cols: {cols}" aria-label="Works" bind:clientHeight={gridHeight}>
{#each itemsWithIndex as item}
				{#if item._type === 'gap'}
					{#each Array(item.gap) as _}
						<div class="gap" aria-hidden="true"></div>
					{/each}
				{:else if item._type === 'education'}
					{@const edu = item.education}
					{#each edu.media as media, j (media)}
						{#if loaded}
							<a id="{edu.slug.current}-{j+1}" href="/education/{edu.slug.current}#i={j+1}" class="media-item {getOrientation(media)}"
								onmouseenter={() => hoveredEdu = edu}
								onmouseleave={() => hoveredEdu = null}
								in:fade|global={{ delay: media._mediaIndex * 80, duration: 200 }}
							>
								<Media {media} class="education" />
							</a>
						{/if}
					{/each}
				{/if}
			{/each}
	</div>
	<div class="zoom-controls" role="group" aria-label="Zoom">
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
</main>

{#if hoveredEdu}
	<CursorTag
		title={hoveredEdu.title}
		subtitle={hoveredEdu.place?.title}
		year={hoveredEdu.ongoing ? 'Ongoing' : [hoveredEdu.startDate?.slice(0,4), hoveredEdu.endDate?.slice(0,4)].filter(Boolean).join('–')}
	/>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as *;

	main {
		position: relative;
		padding: var(--sp-12);
		padding-bottom: calc(var(--headerHeight) + var(--sp-12));
	}

	.intro {
		position: fixed;
		top: var(--sp-12);
		left: var(--sp-12);
		display: flex;
		flex-direction: column;
		gap: var(--sp-12);
		pointer-events: none;
		width: var(--infoWidth);
		z-index: 2;

		* {
			pointer-events: auto;
		}

		.teachings {
			.teaching {
				display: block;
				min-width: 400px;
			}
		}
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(var(--cols, 9), 1fr);
		column-gap: var(--sp-4);
		row-gap: var(--sp-120);
		position: relative;
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
