import { getWorks } from '$lib/utils/sanity.js'
import { error } from '@sveltejs/kit'

const VALID = ['title-asc', 'title-desc', 'year-asc', 'year-desc']

function sortWorks(works, sort) {
	if (!sort || !VALID.includes(sort)) return works
	const arr = [...works]
	if (sort === 'title-asc') return arr.sort((a, b) => a.title.localeCompare(b.title))
	if (sort === 'title-desc') return arr.sort((a, b) => b.title.localeCompare(a.title))
	const year = w => parseInt(w.startDate?.slice(0, 4) ?? 0)
	if (sort === 'year-desc') return arr.sort((a, b) => {
		if (a.ongoing && b.ongoing) return 0
		if (a.ongoing) return -1
		if (b.ongoing) return 1
		return year(b) - year(a)
	})
	return arr.sort((a, b) => {
		if (a.ongoing && b.ongoing) return 0
		if (a.ongoing) return 1
		if (b.ongoing) return -1
		return year(a) - year(b)
	})
}

function buildFilters(works) {
	const services = new Map()
	const tags = new Map()
	for (const w of works) {
		w.services?.forEach(s => { if (s.slug?.current) services.set(s.slug.current, { title: s.title, slug: s.slug.current, type: 'service' }) })
		w.tags?.forEach(t => { if (t.slug?.current) tags.set(t.slug.current, { title: t.title, slug: t.slug.current, type: 'tag' }) })
	}
	return [
		...[...services.values()].sort((a, b) => a.title.localeCompare(b.title)),
		...[...tags.values()].sort((a, b) => a.title.localeCompare(b.title)),
	]
}

export async function load({ url }) {
	const works = await getWorks()
	if (!works) throw error(404, 'Not found')
	const sort = url.searchParams.get('sort')
	return {
		works: sortWorks(works, sort).map((w, i) => ({ ...w, index: i })),
		filters: buildFilters(works),
		sort,
		seoSingle: { seoTitle: 'Works' },
	}
}
