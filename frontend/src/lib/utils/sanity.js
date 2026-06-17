import { createClient } from '@sanity/client'
import { PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID } from '$env/static/public'
import { dev } from '$app/environment'

export const client = createClient({
	projectId: PUBLIC_SANITY_PROJECT_ID,
	dataset: PUBLIC_SANITY_DATASET,
	useCdn: !dev,
	apiVersion: '2025-01-01',
})

const media = `
	type,
	columns,
	type == "image" => {
		image { asset->{ _id, altText, title, description, metadata { dimensions, lqip } } }
	},
	type == "video" => {
		video { asset->{ url, mimeType, size } },
		videoPoster { asset->{ _id, altText, title, description, metadata { dimensions, lqip } } },
	}
`

export async function getSeo() {
	return client.fetch(`*[_type == "seo" && !(_id in path('drafts.**'))][0] {
		seoTitle,
		seoDescription,
		seoImage,
	}`)
}

export async function getAbout() {
	return client.fetch(`*[_type == "about" && !(_id in path('drafts.**'))][0] {
		description,
		mail,
		instagram,
		"team": team[]->{ name, surname },
		"clients": clients[]->{ title },
		recognitions[]{ title, year },
		applications,
		legalName,
		vat,
		addressLabel,
		addressHref,
		"teachingsOngoing": *[_type == "teaching" && ongoing == true && !(_id in path('drafts.**'))] | order(orderRank) { title, startDate },
		"teachingsOther": *[_type == "teaching" && ongoing != true && !(_id in path('drafts.**'))] | order(startDate desc) { title, startDate, endDate },
		"policies": *[_type == "policy" && !(_id in path('drafts.**'))] { title, "slug": slug.current },
		seoDescription,
		seoImage,
	}`)
}

export async function getPolicy(slug) {
	return client.fetch(`*[_type == "policy" && slug.current == $slug && !(_id in path('drafts.**'))][0] {
		title,
		content,
	}`, { slug })
}

export async function getWorks() {
	return client.fetch(`*[_type == "work" && status == "public" && !(_id in path('drafts.**'))] | order(orderRank) {
		_id,
		title,
		slug,
		ongoing,
		startDate,
		endDate,
		services[]->{ title, slug },
		tags[]->{ title, slug },
		thumbnail { ${media} },
	}`)
}

export async function getWork(slug) {
	return client.fetch(`*[_type == "work" && slug.current == $slug && !(_id in path('drafts.**'))][0] {
		title,
		slug,
		startDate,
		endDate,
		ongoing,
		place->{ title },
		services[]->{ title },
		team[]->{ name, surname },
		link,
		description,
		blocks,
		seoDescription,
		seoImage,
	}`, { slug })
}

export async function getSitemapData() {
	return client.fetch(`{
		"works": *[_type == "work" && status == "public" && !(_id in path('drafts.**'))] {
			"slug": slug.current,
			_updatedAt,
			"imageUrl": thumbnail.image.asset->url,
			"imageAlt": thumbnail.image.asset->altText,
			"imageTitle": title,
		},
		"educations": *[_type == "education" && !(_id in path('drafts.**'))] { "slug": slug.current, _updatedAt },
	}`)
}

export async function getEducationBySlug(slug) {
	return client.fetch(`*[_type == "education" && slug.current == $slug && !(_id in path('drafts.**'))][0] {
		title,
		seoDescription,
		seoImage,
	}`, { slug })
}

export async function getEducations() {
	return client.fetch(`*[_type == "educations" && !(_id in path('drafts.**'))][0] {
		description,
		"teachingsOngoing": *[_type == "teaching" && ongoing == true && !(_id in path('drafts.**'))] | order(orderRank) { title, startDate },
		items[] {
			_type,
			_type == "education" => {
				"education": @->{
					_id,
					title,
					slug,
					place->{ title },
					media[] { ${media} },
					ongoing,
					startDate,
					endDate,
				}
			},
			_type == "gap" => { "gap": gap },
		}
	}`)
}

export async function getHomepage() {
	return client.fetch(`{
		"homepage": *[_type == "homepage" && !(_id in path('drafts.**'))][0] {
			projects[]->{ _id, title, slug, startDate, endDate, ongoing, services[]->{ title }, thumbnail { ${media} } },
			separator
		},
		"about": *[_type == "about" && !(_id in path('drafts.**'))][0] {
			description,
			mail,
			instagram,
		}
	}`)
}
