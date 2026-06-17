<script>
	import { page } from '$app/state'
	import { urlFor } from '$lib/utils/image.js'

	const seoBase = $derived(Array.isArray(page.data?.seo) ? page.data.seo[0] : page.data?.seo)
	const seoSingle = $derived(page.data?.seoSingle)
	const canonicalUrl = $derived(page.url.origin + page.url.pathname)
	const displayTitle = $derived(
		seoSingle?.seoTitle
			? `${seoSingle.seoTitle} | ${seoBase?.seoTitle || ''}`
			: (seoBase?.seoTitle || '')
	)
	const rawDesc = $derived(seoSingle?.seoDescription || seoBase?.seoDescription || '')
	const displayDesc = $derived(rawDesc.length > 157 ? rawDesc.slice(0, 157) + '...' : rawDesc)

	function resolveImageUrl(img) {
		if (!img) return undefined
		if (typeof img === 'string') return img
		if (img.url) return img.url
		if (img.asset) return urlFor(img)?.width(1200).height(630).fit('crop').quality(70).format('jpg').url()
		return undefined
	}

	const socialImageUrl = $derived(resolveImageUrl(seoSingle?.seoImage || seoBase?.seoImage))

	const about = $derived(page.data?.about)
	const jsonLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'studio òbelo',
		url: 'https://www.obelo.it',
		email: about?.mail,
		sameAs: about?.instagram?.href ? [about.instagram.href] : undefined,
		address: about?.addressLabel ? {
			'@type': 'PostalAddress',
			streetAddress: about.addressLabel,
		} : undefined,
		description: displayDesc || undefined,
	}))
</script>

<svelte:head>
	{#if displayTitle}
		<title>{displayTitle}</title>
		<meta name="title" content={displayTitle} />
		<meta property="og:title" content={displayTitle} />
		<meta name="twitter:title" content={displayTitle} />
		<meta property="og:site_name" content={seoBase?.seoTitle} />
	{/if}

	{#if displayDesc}
		<meta name="description" content={displayDesc} />
		<meta property="og:description" content={displayDesc} />
		<meta name="twitter:description" content={displayDesc} />
	{/if}

	{#if socialImageUrl}
		<meta property="og:image" content={socialImageUrl} />
		<meta property="og:image:secure_url" content={socialImageUrl} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:image" content={socialImageUrl} />
	{/if}

	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href={canonicalUrl} />

	{#if page.data?.hidden}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<meta name="geo.region" content="IT" />
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
