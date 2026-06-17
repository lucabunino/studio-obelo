<script>
	let { data } = $props()
</script>

<main>
	<h1>{data.work.title}</h1>
</main>

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as *;
</style>