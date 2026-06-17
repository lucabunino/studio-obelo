import { getPolicy } from '$lib/utils/sanity.js'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
	const policy = await getPolicy(params.slug)
	if (!policy) throw error(404, 'Not found')
	return {
		policy,
		seoSingle: { seoTitle: policy.title },
	}
}
