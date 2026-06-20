<script>
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'
	import { typewriter, resetTypewriter } from '$lib/utils/typewriter.js'
	import { onMount } from 'svelte'

	let { data } = $props()
	let loaded = $state(false)

	onMount(() => { resetTypewriter(); loaded = true })
</script>

<main>
	<div class="content">
		<div class="top">
			{#if loaded}
				<section in:typewriter={{ duration: 800 }}>
					<h1 class="uppercase">{data.policy.title}</h1>
					<div class="portableText">
						<PortableText
						value={data.policy.content}
						components={{
							block: PortableTextStyle,
							listItem: PortableTextStyle,
							marks: {
								link: PortableTextStyle,
							}
							}} />
					</div>
				</section>
			{/if}
		</div>
		<div class="bottom"></div>
	</div>
</main>

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as *;

	main {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(6, minmax(var(--menuColWidth), 1fr)) repeat(9, 1fr);
		grid-template-rows: 1fr;

		.content {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			overflow-y: scroll;
			grid-column: 1 / span 6;
			background-color: var(--black);
			color: var(--white);
			padding: var(--sp-12) var(--sp-12) 0;
			height: 100%;
			pointer-events: all;

			.bottom {
				background: linear-gradient(to bottom, transparent, var(--black) var(--sp-24));
				height: calc(var(--headerHeight) + var(--sp-24));
				flex-shrink: 0;
				position: sticky;
				bottom: 0;
			}
		}
	}
</style>
