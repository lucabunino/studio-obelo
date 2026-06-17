<script>
	import EducationSwiper from '$lib/components/EducationSwiper.svelte'

	let { data } = $props()
</script>

<main>
	<EducationSwiper educations={data.educations} slug={data.slug} />
</main>

<style lang="scss">
	main {
		width: 100%;
		height: 100%;
	}
</style>
