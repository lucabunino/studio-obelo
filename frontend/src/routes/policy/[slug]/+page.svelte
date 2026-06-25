<script>
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'
	import { typewriter, resetTypewriter } from '$lib/utils/typewriter.js'
	import { onMount } from 'svelte'
	import timing from '$lib/scss/timing.module.scss'

	let { data } = $props()
	let loaded = $state(false)
	const DURATION = parseInt(timing.overlayDuration)

	onMount(() => { resetTypewriter(); const t = setTimeout(() => loaded = true, DURATION*2); return () => clearTimeout(t) })
</script>

{#if loaded}
<main>
	<div class="content">
		<div class="top" in:typewriter out:typewriter|global={{ duration: DURATION, clean: true }}>
			<section>
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
		</div>
		<div class="bottom"></div>
	</div>
</main>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as bp;

	main {
		height: 100%;
		width: 100%;

		.content {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			overflow-y: scroll;
			padding: var(--sp-12) var(--sp-12) 0;
			height: 100%;

			.bottom {
				background: linear-gradient(to bottom, transparent, var(--bgColor) var(--sp-24));
				height: calc(var(--headerHeight) + var(--sp-24));
				flex-shrink: 0;
				position: sticky;
				bottom: 0;
				transition: var(--transition);
			}
		}
	}
</style>
