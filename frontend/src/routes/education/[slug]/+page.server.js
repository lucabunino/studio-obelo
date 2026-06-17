import { getEducations, getEducationBySlug } from '$lib/utils/sanity.js'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
	const [educations, education] = await Promise.all([
		getEducations(),
		getEducationBySlug(params.slug),
	])
	if (!educations || !education) throw error(404, 'Not found')
	return {
		educations,
		slug: params.slug,
		seoSingle: {
			seoTitle: education.title,
			seoDescription: education.seoDescription,
			seoImage: education.seoImage,
		},
	}
}
