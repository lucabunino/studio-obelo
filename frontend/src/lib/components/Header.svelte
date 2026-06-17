<script>
	import { page } from '$app/state'
	import { goto, pushState, preloadData } from '$app/navigation'
	import { obelo } from '$lib/utils/obelo.js'
	import { typewriter, resetTypewriter } from '$lib/utils/typewriter.js'
	import { onMount } from 'svelte'

	const OVERLAY_ROUTES = ['/works', '/about']

	function isActive(href) {
		if (page.state.overlay) return page.state.overlay === href
		return page.url.pathname === href
	}

	let loaded = $state(false)
	onMount(() => { resetTypewriter(); loaded = true })

	async function handleOverlay(e, href) {
		e.preventDefault()
		if (isActive(href)) {
			goto(page.state.lastFullscreen ?? '/')
			return
		}
		const result = await preloadData(href)
		if (result.type === 'loaded' && result.status === 200) {
			const lastFullscreen = page.state.lastFullscreen ?? (!OVERLAY_ROUTES.includes(page.url.pathname) ? page.url.pathname : '/')
			pushState(href, { overlay: href, overlayData: result.data, from: page.url.pathname, lastFullscreen })
		}
	}
</script>

<header>
	{#if loaded}
		<a use:obelo class="logo" href="/" in:typewriter>studio òbelo</a>
	{/if}
	<nav class="menu" class:bg={isActive('/works') || isActive('/about')}>
		{#if loaded}
			<a use:obelo class="menu-item uppercase" href="/works" aria-current={isActive('/works') ? 'page' : undefined} onclick={(e) => handleOverlay(e, '/works')} in:typewriter>Works</a>
			<a use:obelo class="menu-item uppercase" href="/about" aria-current={isActive('/about') ? 'page' : undefined} onclick={(e) => handleOverlay(e, '/about')} in:typewriter>About</a>
			<a use:obelo class="menu-item uppercase" href="/education" aria-current={isActive('/education') ? 'page' : undefined} in:typewriter>Education</a>
		{/if}
	</nav>
</header>

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
