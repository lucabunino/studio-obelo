<script>
	import { urlFor, buildSrcset, getAspectRatioClass } from '$lib/utils/image.js'
	import bp from '$lib/scss/breakpoints.module.scss'

	let { media, class: className = '', sizes = '100vw' } = $props()

	const ratioClass = $derived(getAspectRatioClass(media))
	const aspectRatio = $derived(media.type === 'image' ? media.image?.asset?.metadata?.dimensions?.aspectRatio : media.videoPoster?.asset?.metadata?.dimensions?.aspectRatio )

	const paletteColor = $derived(
		media.type === 'image'
			? media.image?.asset?.metadata?.palette?.dominant?.background
			: media.videoPoster?.asset?.metadata?.palette?.dominant?.background
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
	class:contain={media.contain}
	class:object-center={media.contain && media.objectAlignment === 'center'}
	class:object-right={media.contain && media.objectAlignment === 'right'}
	data-aspect-ratio={ratioClass}
	style:--aspectRatio={aspectRatio}
	style:--paletteColor={paletteColor ?? 'var(--black)'}
	style:--objectPosition={media.objectAlignment ?? 'left'}
>
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
			/>
		</picture>
	{:else if media.type === 'video'}
		<video
			bind:this={videoEl}
			autoplay muted loop playsinline
			oncanplay={() => loaded = true}
		>
			{#if media.videoMobile}
				<source media="(max-width: {parseInt(bp.md) - 1}px)" src={media.videoMobile?.asset?.url} type="video/mp4" />
			{/if}
			<source src={media.video?.asset?.url} type="video/mp4" />
		</video>
	{/if}

	<div class="color-overlay" class:loaded aria-hidden="true"></div>
</div>

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as bp;

	.media-container {
		display: block;
		position: relative;
		overflow: hidden;
		background-color: var(--paletteColor, var(--black));

		picture {
			display: contents;
		}

		img:not(.lqip), video {
			position: relative;
			z-index: 1;
		}

		img, video {
			display: block;
			max-width: 100%;
			max-height: 100%;
			width: auto;
			height: auto;
		}

		.color-overlay {
			position: absolute;
			inset: 0;
			z-index: 2;
			background-color: var(--paletteColor, var(--black));
			opacity: 1;
			transition: var(--transition);
			pointer-events: none;

			&.loaded { opacity: 0; }
		}

		&.homepage {
			img, video {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}

			&[data-aspect-ratio='_21x9'] { width: 100vh; aspect-ratio: 21/9; max-height: 100vh; }
			&[data-aspect-ratio='_8x5']  { width: 100vh; aspect-ratio: 8/5;  max-height: 100vh; }
			&[data-aspect-ratio='_3x2']  { width: 100vh; aspect-ratio: 3/2;  max-height: 100vh; }
			&[data-aspect-ratio='_4x3']  { width: 100vh; aspect-ratio: 4/3;  max-height: 100vh; }
			&[data-aspect-ratio='_5x4']  { width: 100vh; aspect-ratio: 5/4;  max-height: 100vh; }
			&[data-aspect-ratio='_1x1']  { width: 100vh; aspect-ratio: 1;    max-height: 100vh; }
			&[data-aspect-ratio='_4x5']  { height: 100vh; aspect-ratio: 4/5;  max-width: 100vw; }
			&[data-aspect-ratio='_3x4']  { height: 100vh; aspect-ratio: 3/4;  max-width: 100vw; }
			&[data-aspect-ratio='_2x3']  { height: 100vh; aspect-ratio: 2/3;  max-width: 100vw; }
			&[data-aspect-ratio='_5x8']  { height: 100vh; aspect-ratio: 5/8;  max-width: 100vw; }
			&[data-aspect-ratio='_9x21'] { height: 100vh; aspect-ratio: 9/21; max-width: 100vw; }

			@media (orientation: portrait) {
				&[data-aspect-ratio] {
					width: 100%;
					height: auto;
					max-width: unset;
					max-height: unset;
					aspect-ratio: unset;
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

		&.works {
			aspect-ratio: var(--aspectRatio);
			max-width: 70%;
			max-height: 60%;

			img, video {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		&.single-work {
			width: 100%;
			height: auto;

			img, video {
				width: 100%;
				height: auto;
				max-height: calc(100vh - var(--headerHeight) - var(--sp-12));
				object-fit: cover;
				object-position: var(--objectPosition, left);
				display: block;
			}

			&.relative {
				img, video {
					max-height: unset;
				}
			}

			&.contain {
				aspect-ratio: var(--aspectRatio);
				width: auto;
				height: calc((100vw - var(--infoWidth))/8*5);
				max-height: calc(100vh - var(--headerHeight) - var(--sp-12));

				&.relative {
					height: calc((100vw - var(--infoWidth))/8*5);
					max-height: unset;
				}

				img, video {
					height: 100%;
					object-fit: contain;
				}

				&.object-center { margin: auto; }
				&.object-right { margin-left: auto; }
			}
		}

		&.nav {
			aspect-ratio: var(--aspectRatio);
			width: auto;
			height: 100%;
			max-height: 60vh;
		}
	}
</style>
