import { getWork, getWorks } from '$lib/utils/sanity.js'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
	const [work, allWorks] = await Promise.all([getWork(params.slug), getWorks()])
	if (!work) throw error(404, 'Not found')

	const idx = allWorks.findIndex(w => w.slug.current === params.slug)
	const len = allWorks.length
	const prev = len > 1 ? allWorks[(idx - 1 + len) % len] : null
	const next = len > 1 ? allWorks[(idx + 1) % len] : null

	return {
		work,
		prev,
		next,
		seoSingle: {
			seoTitle: work.title,
			seoDescription: work.seoDescription,
			seoImage: work.seoImage,
		},
	}
}
