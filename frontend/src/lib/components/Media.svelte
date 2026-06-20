<script>
	import { urlFor } from '$lib/utils/image.js'
	import { getOrientation } from '$lib/utils/image.js'

	let { media, class: className = '' } = $props()

	const orientation = $derived(getOrientation(media))
	const aspectRatio = $derived(
		media.type === 'image'
			? media.image?.asset?.metadata?.dimensions?.aspectRatio
			: media.videoPoster?.asset?.metadata?.dimensions?.aspectRatio
	)
</script>

<div class="media-container {className}" data-orientation={orientation} class:landscape={orientation === 'landscape'} class:portrait={orientation === 'portrait'} class:square={orientation === 'square'} style:--aspectRatio={aspectRatio}>
	{#if media.type === 'image'}
		<img src={urlFor(media.image).url()} alt="" />
	{:else if media.type === 'video'}
		<video autoplay muted loop playsinline poster={urlFor(media.videoPoster).url()}>
			<source src={media.video?.asset?.url} type="video/mp4" />
		</video>
	{/if}
</div>

<style lang="scss">
	.media-container {
		display: block;
		overflow: hidden;

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
	}
</style>
