<script>
	import { urlFor, buildSrcset, getAspectRatioClass } from '$lib/utils/image.js'
	import { getResponsive } from '$lib/utils/responsive.svelte.js'
	import bp from '$lib/scss/breakpoints.module.scss'

	let { media, class: className = '', sizes = '100vw' } = $props()

	const responsive = getResponsive()

	const activePoster = $derived(
		responsive.isMobile && media.videoPosterMobile ? media.videoPosterMobile : media.videoPoster
	)

	const ratioClass = $derived(getAspectRatioClass(media))
	const aspectRatio = $derived(media.type === 'image' ? media.image?.asset?.metadata?.dimensions?.aspectRatio : activePoster?.asset?.metadata?.dimensions?.aspectRatio)

	const paletteColor = $derived(
		media.type === 'image'
			? media.image?.asset?.metadata?.palette?.dominant?.background
			: activePoster?.asset?.metadata?.palette?.dominant?.background
	)

	const hasValidAsset = $derived(
		media.type === 'image'
			? !!media.image?.asset?.metadata?.dimensions
			: !!media.video?.asset?.url
	)

	function safely(fn) {
		try { return fn() } catch { return null }
	}

	const imageSrc = $derived(hasValidAsset ? safely(() => urlFor(media.image).width(800).url()) : null)
	const desktopSrcset = $derived(media.type === 'image' && hasValidAsset ? safely(() => buildSrcset(media.image)) : '')
	const mobileSrcset = $derived(media.type === 'image' && hasValidAsset && media.imageMobile ? safely(() => buildSrcset(media.imageMobile)) : '')
	const posterSrc = $derived(activePoster && hasValidAsset ? safely(() => urlFor(activePoster).width(800).url()) : undefined)

	const mediaError = $derived(!hasValidAsset || (media.type === 'image' && !imageSrc))

	let loaded = $state(false)
	$effect(() => {
		if (media.type !== 'video' || !posterSrc) return
		const img = new Image()
		img.onload = () => { loaded = true }
		img.src = posterSrc
	})
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
	{#if mediaError}
		<div class="media-error">
			<p>Media unavailable</p>
		</div>
	{:else if media.type === 'image'}
		<picture>
			{#if media.imageMobile}
				<source media="(max-width: {parseInt(bp.md) - 1}px)" srcset={mobileSrcset} {sizes} />
			{/if}
			<img
				srcset={desktopSrcset}
				src={imageSrc}
				alt={media.image?.asset?.altText ?? ''}
				{sizes}
				loading="lazy"
				onload={() => loaded = true}
			/>
		</picture>
	{:else if media.type === 'video'}
		<video
			autoplay muted loop playsinline
			poster={posterSrc}
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

		.media-error {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			aspect-ratio: var(--aspectRatio, 3/2);
			background-color: var(--black);
			color: var(--white);
			text-align: center;
			padding: var(--sp-6);
		}

		img, video {
			display: block;
			max-width: 100%;
			max-height: 100%;
			width: auto;
			height: auto;
			aspect-ratio: var(--aspectRatio);
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
				border-radius: var(--sp-2);

				&[data-aspect-ratio] {
					width: stretch;
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
			max-width: 90vw;
			aspect-ratio: var(--aspectRatio);

			img, video {
				height: 100%;
				width: 100%;
				object-fit: cover;
			}
		}

		&.education-scroll {
			width: 100%;
			height: auto;
			aspect-ratio: var(--aspectRatio);

			img, video {
				width: 100%;
				height: auto;
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

			@media (orientation: portrait), (width <= #{bp.$md}) {
				position: absolute;
				inset: 0;
				max-width: 80%;
				max-height: 80%;
				align-self: center;
				justify-self: center;
			}
		}

		&.works-bg {
			width: 100%;
			height: 100%;
			position: absolute;
			inset: 0;
			z-index: 0;

			img, video {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		&.single-work {
			aspect-ratio: var(--aspectRatio);
			width: 100%;
			height: auto;
			// baseline = sticky (capped); matches the sticky/relative auto-switch in +page.svelte's .block (see docs/adr/0001-sticky-block-breakpoints.md)
			max-height: calc(100vh - var(--headerHeight) - var(--sp-12));

			@media (orientation: portrait),
				(min-width: #{bp.$md}) and (max-width: calc(290px / 0.18)) and (min-width: calc(290px + 160vh)),
				(min-width: calc(290px / 0.18)) and (max-width: calc(400px / 0.18)) and (min-aspect-ratio: 80/41),
				(min-width: calc(400px / 0.18)) and (min-width: calc(400px + 160vh)) {
				max-height: unset;
			}

			&.force-sticky {
				max-height: calc(100vh - var(--headerHeight) - var(--sp-12));
			}
			&.force-relative {
				max-height: unset;
			}

			&[data-aspect-ratio='_21x9'] { aspect-ratio: 21/9; }
			&[data-aspect-ratio='_8x5']  { aspect-ratio: 8/5; }
			&[data-aspect-ratio='_3x2']  { aspect-ratio: 3/2; }
			&[data-aspect-ratio='_4x3']  { aspect-ratio: 4/3; }
			&[data-aspect-ratio='_5x4']  { aspect-ratio: 5/4; }
			&[data-aspect-ratio='_1x1']  { aspect-ratio: 1; }
			&[data-aspect-ratio='_4x5']  { aspect-ratio: 4/5; }
			&[data-aspect-ratio='_3x4']  { aspect-ratio: 3/4; }
			&[data-aspect-ratio='_2x3']  { aspect-ratio: 2/3; }
			&[data-aspect-ratio='_5x8']  { aspect-ratio: 5/8; }
			&[data-aspect-ratio='_9x21'] { aspect-ratio: 9/21; }

			img, video {
				width: 100%;
				height: auto;
				object-fit: cover;
				object-position: var(--objectPosition, left);
				display: block;
			}

			&.contain {
				aspect-ratio: var(--aspectRatio);
				width: auto;
				height: calc((100vw - var(--infoWidth))/8*5);
				max-height: calc(100vh - var(--headerHeight) - var(--sp-12));

				@media (orientation: portrait),
					(min-width: #{bp.$md}) and (max-width: calc(290px / 0.18)) and (min-width: calc(290px + 160vh)),
					(min-width: calc(290px / 0.18)) and (max-width: calc(400px / 0.18)) and (min-aspect-ratio: 80/41),
					(min-width: calc(400px / 0.18)) and (min-width: calc(400px + 160vh)) {
					max-height: unset;
				}

				@media (orientation: portrait), (width <= #{bp.$md}) {
					height: auto;
				}

				&.force-sticky {
					max-height: calc(100vh - var(--headerHeight) - var(--sp-12));
				}
				&.force-relative {
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

			@media (orientation: portrait), (width <= #{bp.$md}) {
				width: 100%;

				img, video {
					width: 100%;
					height: auto;
					object-fit: cover;
					object-position: var(--objectPosition, left);
					display: block;
				}
			}
		}
	}
</style>
