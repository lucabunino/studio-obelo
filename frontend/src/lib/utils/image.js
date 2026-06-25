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

export function getOrientation(media) {
	const dims = media?.image?.asset?.metadata?.dimensions
		?? media?.videoPoster?.asset?.metadata?.dimensions
	if (!dims) return 'landscape'
	if (dims.width > dims.height) return 'landscape'
	if (dims.width === dims.height) return 'square'
	return 'portrait'
}
