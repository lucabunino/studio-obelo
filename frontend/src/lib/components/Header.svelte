<script>
	import { page } from '$app/state'
	import { obelo } from '$lib/utils/obelo.js'
	import { typewriter, resetTypewriter } from '$lib/utils/typewriter.js'
	import { handleOverlay, isOverlayActive } from '$lib/utils/overlay.js'
	import { onMount } from 'svelte'

	let loaded = $state(false)
	onMount(() => { resetTypewriter(); loaded = true })

	function isActive(href) {
		return isOverlayActive(href)
	}
</script>

{#if loaded}
	<header in:typewriter|global={{ duration: 400 }}>
		<a use:obelo class="logo" href="/">studio òbelo</a>
		<nav class="menu" class:bg={isActive('/works') || isActive('/about')}>
			{#if loaded}
				<a use:obelo class="menu-item uppercase" href="/works" aria-current={isActive('/works') ? 'page' : undefined} onclick={(e) => handleOverlay(e, '/works')}>Works</a>
				<a use:obelo class="menu-item uppercase" href="/about" aria-current={isActive('/about') ? 'page' : undefined} onclick={(e) => handleOverlay(e, '/about')}>About</a>
				<a use:obelo class="menu-item uppercase" href="/education" aria-current={isActive('/education') ? 'page' : undefined}>Education</a>
			{/if}
		</nav>
	</header>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as *;

	header {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		height: var(--headerHeight);
		z-index: 8;
		display: grid;
		grid-template-columns: var(--infoWidth) repeat(6, minmax(var(--menuColWidth), 1fr)) repeat(9, 1fr);
		pointer-events: none;

		a {
			pointer-events: all;
		}

		.logo {
			margin	: 0 var(--sp-12);
			height: 100%;
			align-content: center;
		}

		.menu {
			grid-column: 2 / span 6;
			padding: 0 var(--sp-12);
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			height: 100%;

			&.bg {
				color: var(--black);

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
	}
</style>
