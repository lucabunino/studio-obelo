<script>
	import { urlFor, buildSrcset, getOrientation } from '$lib/utils/image.js'
	import bp from '$lib/scss/breakpoints.module.scss'

	let { media, class: className = '', sizes = '100vw' } = $props()

	const orientation = $derived(getOrientation(media))
	const aspectRatio = $derived(media.type === 'image' ? media.image?.asset?.metadata?.dimensions?.aspectRatio : media.videoPoster?.asset?.metadata?.dimensions?.aspectRatio )

	const lqipDesktop = $derived(
		media.type === 'image'
			? media.image?.asset?.metadata?.lqip
			: media.videoPoster?.asset?.metadata?.lqip
	)
	const lqipMobile = $derived(
		media.type === 'image'
			? media.imageMobile?.asset?.metadata?.lqip
			: media.videoPosterMobile?.asset?.metadata?.lqip
	)

	const desktopSrcset = $derived(media.type === 'image' ? buildSrcset(media.image) : '')
	const mobileSrcset = $derived(media.type === 'image' && media.imageMobile ? buildSrcset(media.imageMobile) : '')

	let loaded = $state(false)
	let imgEl = $state()
	let videoEl = $state()

	$effect(() => { if (imgEl?.complete) loaded = true })
	$effect(() => { if (videoEl && videoEl.readyState >= 3) loaded = true })
</script>

<div
	class="media-container {className}"
	data-orientation={orientation}
	class:landscape={orientation === 'landscape'}
	class:portrait={orientation === 'portrait'}
	class:square={orientation === 'square'}
	class:has-mobile-lqip={!!lqipMobile}
	style:--aspectRatio={aspectRatio}
>
	{#if lqipDesktop}
		<img class="lqip lqip-desktop" class:loaded src={lqipDesktop} aria-hidden="true" alt="" />
	{/if}
	{#if lqipMobile}
		<img class="lqip lqip-mobile" class:loaded src={lqipMobile} aria-hidden="true" alt="" />
	{/if}
	{#if lqipDesktop || lqipMobile}
		<div class="lqip-blur" class:loaded aria-hidden="true"></div>
	{/if}

	{#if media.type === 'image'}
		<picture>
			{#if media.imageMobile}
				<source media="(max-width: {parseInt(bp.md) - 1}px)" srcset={mobileSrcset} {sizes} />
			{/if}
			<img
				bind:this={imgEl}
				srcset={desktopSrcset}
				src={urlFor(media.image).width(800).url()}
				alt={media.image?.asset?.altText ?? ''}
				{sizes}
				onload={() => loaded = true}
				class:loaded
			/>
		</picture>
	{:else if media.type === 'video'}
		<video
			bind:this={videoEl}
			autoplay muted loop playsinline
			oncanplay={() => loaded = true}
			class:loaded
		>
			{#if media.videoMobile}
				<source media="(max-width: {parseInt(bp.md) - 1}px)" src={media.videoMobile?.asset?.url} type="video/mp4" />
			{/if}
			<source src={media.video?.asset?.url} type="video/mp4" />
		</video>
	{/if}
</div>

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as bp;

	.media-container {
		display: block;
		position: relative;
		overflow: hidden;

		.lqip {
			position: absolute;
			inset: 0;
			z-index: 0;
			transition: var(--transition);

			&.loaded { opacity: 0; }
		}
		.lqip-mobile {
			@media (width >= bp.$md) { display: none; }
		}
		&.has-mobile-lqip .lqip-desktop {
			@media (width < bp.$md) { display: none; }
		}

		.lqip-blur {
			position: absolute;
			inset: 0;
			z-index: 2;
			backdrop-filter: blur(20px) saturate(1.5);
			transition: var(--transition);

			&.loaded { opacity: 0; }
		}

		picture {
			display: contents;
		}

		img:not(.lqip), video {
			position: relative;
			z-index: 1;
			opacity: 0;
			transition: var(--transition);

			&.loaded { opacity: 1; }
		}

		img, video {
			display: block;
			max-width: 100%;
			max-height: 100%;
			width: auto;
			height: auto;
		}

		&.homepage {
			img, video {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}

			&.portrait {
				height: 100vh;
				aspect-ratio: 2/3;
				max-width: 100vw;
			}

			&.landscape {
				width: 100vh;
				aspect-ratio: 3/2;
				max-height: 100vh;
			}

			&.square {
				height: 100vh;
				aspect-ratio: 1;
				max-width: 100vw;
			}

			@media (orientation: portrait) {
				&.portrait,
				&.landscape,
				&.square {
					width: 100%;
					height: auto;
					max-width: unset;
					max-height: unset;
				}
			}
		}

		&.education {
			img, video {
				width: 100%;
				height: auto;
				object-fit: cover;
			}
		}

		&.work {
			width: 100%;
			height: auto;

			img, video {
				width: 100%;
				height: auto;
				max-height: 90vh;
				object-fit: contain;
				object-position: left;
				display: block;
			}
		}

		&.single-education {
			display: flex;
			align-items: center;
			height: 60vh;
			max-height: 80vh;
			width: auto;
			max-width: 70vw;
			aspect-ratio: var(--aspectRatio);

			img, video {
				height: 100%;
				width: 100%;
				object-fit: cover;
			}
		}

		&.preview {
			width: 70%;
			height: 60%;

			img, video {
				width: 100%;
				height: 100%;
				object-fit: contain;
				object-position: center;
			}
		}
	}
</style>
