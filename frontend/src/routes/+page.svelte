<script>
	import SliderMarquee from '$lib/components/SliderMarquee.svelte'
	let { data } = $props()
</script>

{#if data.homepage?.projects?.length}
	<SliderMarquee works={data.homepage.projects} separator={data.homepage.separator} />
{/if}
