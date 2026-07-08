export function buildSlides(educations) {
	return educations.items
		.filter(item => item._type === 'education')
		.flatMap(item =>
			item.education.media.map((media, i) => ({
				media,
				slug: item.education.slug.current,
				title: item.education.title,
				imageIndex: i + 1,
			}))
		)
}

export function computeInitialIndex(slides, slug, hash) {
	const match = hash.match(/-(\d+)$/)
	const offset = match ? parseInt(match[1]) - 1 : 0
	const base = slides.findIndex(s => s.slug === slug && s.imageIndex === 1)
	return Math.max(0, base) + offset
}

export function getDisplayTitle(activeSlide, seoBase) {
	return activeSlide?.title ? `${activeSlide.title} | ${seoBase?.seoTitle || ''}` : (seoBase?.seoTitle || '')
}

export function closeEducationUrl(activeSlide) {
	return activeSlide ? `/education#title=${activeSlide.slug}&i=${activeSlide.imageIndex}` : '/education'
}

export function replaceEducationUrl(slide) {
	return `/education/${slide.slug}#${slide.slug}-${slide.imageIndex}`
}
