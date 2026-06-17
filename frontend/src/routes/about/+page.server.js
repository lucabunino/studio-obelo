import { getAbout } from '$lib/utils/sanity.js'
import { error } from '@sveltejs/kit'

export async function load() {
	const about = await getAbout()
	if (!about) throw error(404, 'Not found')
	return {
		about,
		seoSingle: {
			seoTitle: 'About',
			seoDescription: about.seoDescription,
			seoImage: about.seoImage,
		},
	}
}
