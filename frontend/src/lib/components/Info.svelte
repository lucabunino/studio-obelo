<script>
	import { page } from '$app/state'
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'
	import { typewriter, resetTypewriter } from '$lib/utils/typewriter.js'
	import { fade } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { onMount } from 'svelte'
	import { obelo } from '$lib/utils/obelo'
	import timing from '$lib/scss/timing.module.scss'
	import { getInfoText } from '$lib/stores/infoText.svelte.js'

	const DURATION = parseInt(timing.overlayDuration)

	let { about } = $props()

	const isOverlay = $derived(!!page.state.overlay)
	const isFullscreen = $derived(!isOverlay && page.url.pathname !== '/')
	let loaded = $state(false)
	let bottomVisible = $state(false)
	let topEl = $state()
	const infoText = getInfoText()

	$effect(() => {
		resetTypewriter();
		const t = setTimeout(() => loaded = true, DURATION)
		return () => clearTimeout(t)
	})

	$effect(() => {
		if (!topEl) return
		const ro = new ResizeObserver(([entry]) => infoText.setHeight(entry.contentRect.height))
		ro.observe(topEl)
		return () => ro.disconnect()
	})

	$effect(() => {
		const _overlay = page.state.overlay
		bottomVisible = false
		const t = setTimeout(() => { bottomVisible = true }, DURATION)
		return () => clearTimeout(t)
	})
</script>

{#if loaded}
	<aside id="info" aria-hidden={isFullscreen}>
		<div class="content">
			<div class="top" bind:this={topEl} in:typewriter out:typewriter|global={{ duration: DURATION, clean: true }}>
				{#if about?.description}
					<div class="portableText info">
						<PortableText value={about.description} components={{ block: PortableTextStyle, marks: { link: PortableTextStyle } }} />
					</div>
				{/if}
				{#if about?.mail}
					<a use:obelo class="hover-yellow" href="mailto:{about.mail}">{about.mail}</a>
				{/if}
				{#if about?.instagram}
					<a use:obelo class="hover-yellow" href={about.instagram.href} target="_blank" rel="noopener noreferrer">{about.instagram.handle}</a>
				{/if}
			</div>
			{#if page.state.overlay && bottomVisible}
				<div class="bottom" transition:fade={{ duration: DURATION }}></div>
			{/if}
		</div>
	</aside>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as bp;

	#info {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: var(--infoWidth);
		z-index: 5;
		pointer-events: none;

		&[aria-hidden=true] {
			pointer-events: none;
			> :global(*) {
				pointer-events: none;
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			overflow-y: scroll;
			height: 100%;
			padding: var(--sp-12) var(--sp-12) 0;



			.top {
				.info {
					pointer-events: all;
				}
				a {
					display: block;
					width: fit-content;
					pointer-events: all;

					&:first-of-type {
						margin-top: var(--sp-24);
					}

					&:hover {
						color: var(--black);
					}
				}
			}

			.bottom {
				background: linear-gradient(to bottom, transparent, var(--black) var(--sp-24));
				height: calc(var(--headerHeight) + var(--sp-24));
				flex-shrink: 0;
				position: sticky;
				bottom: 0;
				transition: var(--transition);
			}
		}

		@media (orientation: portrait) {
			max-width: 70ch;
			width: 100%;
		}
	}
</style>
