<script>
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'

	let { data } = $props()
</script>

<main>
	<h1>{data.policy.title}</h1>
	<div class="portableText">
		<PortableText value={data.policy.content} components={{ block: PortableTextStyle, marks: { link: PortableTextStyle } }} />
	</div>
</main>

<style lang="scss">
	main {
		max-width: 65ch;
		margin: 0 auto;
		padding: var(--sp-48) var(--sp-24) var(--sp-48);
		color: var(--white);

		h1 {
			margin-bottom: var(--sp-24);
		}
	}
</style>
