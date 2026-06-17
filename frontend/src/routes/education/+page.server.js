import { getEducations } from '$lib/utils/sanity.js'
import { error } from '@sveltejs/kit'

export async function load({ cookies }) {
	const educations = await getEducations()
	if (!educations) throw error(404, 'Not found')
	return {
		educations,
		cols: parseInt(cookies.get('edu-cols') ?? '9'),
		seoSingle: { seoTitle: 'Education' },
	}
}
