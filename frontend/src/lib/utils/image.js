import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from '$lib/utils/sanity.js'

const builder = createImageUrlBuilder(client)

export function urlFor(source) {
	if (source) return builder.image(source).auto('format')
}

const SRCSET_WIDTHS = [400, 800, 1200, 1600, 2000]

export function buildSrcset(image, widths = SRCSET_WIDTHS) {
	if (!image) return ''
	return widths.map(w => `${urlFor(image).width(w).url()} ${w}w`).join(', ')
}

const RATIOS = [
	{ key: '_21x9', value: 21/9 },
	{ key: '_8x5',  value: 8/5 },
	{ key: '_3x2',  value: 3/2 },
	{ key: '_4x3',  value: 4/3 },
	{ key: '_5x4',  value: 5/4 },
	{ key: '_1x1',  value: 1 },
	{ key: '_4x5',  value: 4/5 },
	{ key: '_3x4',  value: 3/4 },
	{ key: '_2x3',  value: 2/3 },
	{ key: '_5x8',  value: 5/8 },
	{ key: '_9x21', value: 9/21 },
]

export function getOrientation(media) {
	const dims = media?.image?.asset?.metadata?.dimensions
		?? media?.videoPoster?.asset?.metadata?.dimensions
	if (!dims) return 'landscape'
	if (dims.width > dims.height) return 'landscape'
	if (dims.width === dims.height) return 'square'
	return 'portrait'
}

export function getAspectRatioClass(media) {
	const dims = media?.image?.asset?.metadata?.dimensions
		?? media?.videoPoster?.asset?.metadata?.dimensions
	if (!dims) return '_3x2'
	const ratio = dims.width / dims.height
	return RATIOS.reduce((closest, r) =>
		Math.abs(r.value - ratio) < Math.abs(closest.value - ratio) ? r : closest
	).key
}
