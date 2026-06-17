import { getSeo, getHomepage } from '$lib/utils/sanity.js'

const OVERLAY_ROUTES = ['/works', '/about']

export async function load({ url }) {
	const [seo, { homepage, about }] = await Promise.all([getSeo(), getHomepage()])
	return { seo, homepage, about, needsOverlayRedirect: OVERLAY_ROUTES.includes(url.pathname) }
}
