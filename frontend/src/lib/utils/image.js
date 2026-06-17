import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from '$lib/utils/sanity.js'

const builder = createImageUrlBuilder(client)

export function urlFor(source) {
	if (source) return builder.image(source).auto('format')
}

export function getOrientation(media) {
	const dims = media?.image?.asset?.metadata?.dimensions
		?? media?.videoPoster?.asset?.metadata?.dimensions
	if (!dims) return 'landscape'
	if (dims.width > dims.height) return 'landscape'
	if (dims.width === dims.height) return 'square'
	return 'portrait'
}
