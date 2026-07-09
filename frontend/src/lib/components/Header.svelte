<script>
	import { page } from '$app/state'
	import { obelo } from '$lib/utils/obelo.js'
	import { typewriter } from '$lib/utils/typewriter.js'
	import { handleOverlay, isOverlayActive } from '$lib/utils/overlay.js'
	import { getResponsive } from '$lib/utils/responsive.svelte.js'
	import { onMount } from 'svelte'
	import timing from '$lib/scss/timing.module.scss'
	const responsive = getResponsive()
	let loaded = $state(false)
	$effect(() => {
		const t = setTimeout(() => { loaded = true; }, timing.overlayDuration)
		return () => clearTimeout(t)
	})

	function isActive(href) {
		return isOverlayActive(href)
	}

	const hideShadow = $derived(
		page.url.pathname === '/' ||
		page.url.pathname.startsWith('/works/') ||
		page.url.pathname.startsWith('/education')
	)
</script>

{#if loaded}
	<header in:typewriter={{ duration: 31*15, fade: false, hold: false }} class:no-shadow={hideShadow}>
		<a use:obelo class="logo ellipsis" href="/">studio òbelo</a>
		<nav class="menu ellipsis" class:bg={isActive('/works') || isActive('/about')}>
			{#if loaded}
				<a use:obelo class="menu-item uppercase ellipsis" href="/about" aria-current={isActive('/about') ? 'page' : undefined} onclick={responsive.isMobile ? undefined : (e) => handleOverlay(e, '/about')}>About</a>
			{/if}
		</nav>
	</header>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as bp;

	header {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		align-items: center;
		height: var(--headerHeight);
		z-index: 8;
		display: grid;
		grid-template-columns: var(--infoWidth) var(--overlayWidth) repeat(9, 1fr);
		pointer-events: none;

		@media (orientation: portrait), (width <= #{bp.$md}) {
			pointer-events: all;
			background-color: var(--bgColor);
		}

		&::before {
			content: '';
			display: none;
			position: absolute;
			bottom: 100%;
			left: 0;
			right: 0;
			height: var(--sp-24);
			pointer-events: none;

			@media (orientation: portrait), (width <= #{bp.$md}) {
				display: block;
				background: linear-gradient(to bottom, transparent, var(--bgColor));
			}
		}

		&.no-shadow::before {
			display: none;
		}

		a {
			pointer-events: all;
		}

		.logo {
			margin	: 0 var(--sp-12);
			height: 100%;
			align-content: center;

			@media (orientation: portrait), (width <= #{bp.$md}) {
				color: var(--fgColor);
			}
		}

		.menu {
			grid-column: 2;
			padding: 0 var(--sp-12);
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			height: 100%;
			color: var(--fgColor);

			&.bg {
				&:has(.menu-item:hover) .menu-item:not(:hover),
				&:has([aria-current="page"]) .menu-item:not([aria-current="page"]) {
					opacity: .5;
				}

				&:has(.menu-item:hover) .menu-item:hover,
				&:has([aria-current="page"]) .menu-item:hover,
				&:has(.menu-item:hover) .menu-item[aria-current="page"] {
					opacity: 1;
				}
			}

			.menu-item {
				align-content: center;
				text-align: center;
				height: 100%;
			}

			&:has(.menu-item:hover) .menu-item:not(:hover),
			&:has([aria-current="page"]) .menu-item:not([aria-current="page"]) {
				opacity: .5;
			}

			&:has(.menu-item:hover) .menu-item:hover,
			&:has([aria-current="page"]) .menu-item:hover,
			&:has(.menu-item:hover) .menu-item[aria-current="page"] {
				opacity: 1;
			}
		}

		@media (width <= bp.$md) {
			display: flex;
			justify-content: space-between;
			column-gap: var(--sp-30);

			.logo {
				margin-right: 0;
				white-space: nowrap;
			}

			.menu {
				display: flex;
				justify-content: space-between;
				column-gap: var(--sp-30);
				padding-left: 0;
			}
		}

		@media (width <= #{bp.$xs}) {
			margin: 0;
			padding: 0 var(--sp-12);
			column-gap: var(--sp-12);
			align-items: baseline;

			.logo {
				margin: 0 15vw 0 0;
			}
			.menu {
				display: contents;
			}
		}

		@media (width <= #{bp.$xxs}) {
			.logo {
				margin: 0;
			}
		}
	}
</style>
