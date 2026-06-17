import { getWork } from '$lib/utils/sanity.js'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
	const work = await getWork(params.slug)
	if (!work) throw error(404, 'Not found')
	return {
		work,
		seoSingle: {
			seoTitle: work.title,
			seoDescription: work.seoDescription,
			seoImage: work.seoImage,
		},
	}
}
