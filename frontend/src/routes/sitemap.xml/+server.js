import { PUBLIC_SITE_URL } from '$env/static/public'
import { getSitemapData } from '$lib/utils/sanity.js'

const staticRoutes = [
	{ path: '/', priority: '1.0', changefreq: 'weekly' },
	{ path: '/works', priority: '0.9', changefreq: 'weekly' },
	{ path: '/education', priority: '0.9', changefreq: 'monthly' },
	{ path: '/about', priority: '0.8', changefreq: 'monthly' },
]

export async function GET() {
	const { works, educations } = await getSitemapData()

	const urls = [
		...staticRoutes.map(r => `
	<url>
		<loc>${PUBLIC_SITE_URL}${r.path}</loc>
		<changefreq>${r.changefreq}</changefreq>
		<priority>${r.priority}</priority>
	</url>`),
		...works.map(w => `
	<url>
		<loc>${PUBLIC_SITE_URL}/works/${w.slug}</loc>
		<lastmod>${w._updatedAt?.slice(0, 10)}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.7</priority>
		${w.imageUrl ? `<image:image>
			<image:loc>${w.imageUrl}</image:loc>
			${w.imageTitle ? `<image:title>${w.imageTitle}</image:title>` : ''}
			${w.imageAlt ? `<image:caption>${w.imageAlt}</image:caption>` : ''}
		</image:image>` : ''}
	</url>`),
		...educations.map(e => `
	<url>
		<loc>${PUBLIC_SITE_URL}/education/${e.slug}</loc>
		<lastmod>${e._updatedAt?.slice(0, 10)}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.6</priority>
	</url>`),
	]

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
	xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('')}
</urlset>`

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600',
		},
	})
}
