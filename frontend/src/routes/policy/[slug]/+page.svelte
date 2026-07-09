<script>
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'
	import { typewriter } from '$lib/utils/typewriter.js'
	import { onMount } from 'svelte'
	import timing from '$lib/scss/timing.module.scss'
	const DURATION = +timing.overlayDuration
	const DURATION_MOBILE = +timing.overlayDurationMobile
	import { getResponsive } from '$lib/utils/responsive.svelte.js'

	const responsive = getResponsive()
	let { data } = $props()
	let loaded = $state(false)

	onMount(() => { const t = setTimeout(() => loaded = true, responsive.isMobile ? DURATION_MOBILE : DURATION*2); return () => clearTimeout(t) })
</script>

{#if loaded}
<main>
	<div class="content">
		<div class="top" in:typewriter out:typewriter={{ duration: responsive.isMobile ? DURATION_MOBILE : DURATION, clean: true }}>
			<section>
				<h1 class="uppercase">{data.policy.title}</h1>
				<div class="policy portableText">
					<PortableText
					value={data.policy.content}
					components={{
						block: PortableTextStyle,
						listItem: PortableTextStyle,
						types: {
							break: PortableTextStyle,
						},
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

			.top {
				@media (orientation: portrait), (width <= #{bp.$md}) {
					padding-bottom: calc(var(--headerHeight) + var(--sp-24));
				}
			}


			.bottom {
				background: linear-gradient(to bottom, transparent, var(--bgColor) var(--sp-24));
				height: calc(var(--headerHeight) + var(--sp-24));
				flex-shrink: 0;
				position: sticky;
				bottom: 0;
				transition: var(--transition);

				@media (orientation: portrait), (width <= #{bp.$md}) {
					display: none;
				}
			}
		}
	}
</style>
