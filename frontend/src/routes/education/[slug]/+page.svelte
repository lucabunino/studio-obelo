<script>
	import EducationSwiper from '$lib/components/EducationSwiper.svelte'
	import EducationScroll from '$lib/components/EducationScroll.svelte'
	import { getResponsive } from '$lib/utils/responsive.svelte.js'

	const responsive = getResponsive()
	let { data } = $props()
</script>

<main>
	{#if responsive.isMobile}
		<EducationScroll educations={data.educations} slug={data.slug} />
	{:else}
		<EducationSwiper educations={data.educations} slug={data.slug} />
	{/if}
</main>

<style lang="scss">
	main {
		width: 100%;
		height: 100%;
	}
</style>
