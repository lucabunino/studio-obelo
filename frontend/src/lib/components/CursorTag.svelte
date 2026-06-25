<script>
    import { typewriter, resetTypewriter } from '$lib/utils/typewriter';
    import { onMount } from 'svelte';
	import { innerWidth } from 'svelte/reactivity/window'

	let { title, subtitle, year, arrow } = $props()

	let mouseX = $state(null)
	let mouseY = $state(null)
	let els = $state([])
	let mirrorEls = $state([])
	let arrowEl = $state()
	let arrowMirrorEl = $state()
	let loaded = $state(false)

	$effect(() => {
		resetTypewriter(); loaded = true
		function track(e) { mouseX = e.clientX; mouseY = e.clientY }
		window.addEventListener('mousemove', track)
		return () => window.removeEventListener('mousemove', track)
	})

	const lines = $derived([title, subtitle, year].filter(Boolean))
	const below = $derived(mouseY === null || mouseY < window.innerHeight - 80)

	function clampCenter(mirrorEl, mx) {
		const w = mirrorEl?.offsetWidth ?? 0
		const vw = innerWidth.current ?? window.innerWidth
		return Math.max(w / 2, Math.min(mx, vw - w / 2))
	}

	function getArrowTop() {
		const offset = below ? 22 : -16
		if (below) {
			return mouseY + offset
		} else {
			let y = mouseY + offset
			const arrowH = arrowEl?.getBoundingClientRect().height ?? 20
			for (let j = 0; j < lines.length; j++) y -= els[j]?.getBoundingClientRect().height ?? 20
			y -= arrowH
			return y
		}
	}

	function getTop(i) {
		const offset = below ? 22 : -16
		const arrowH = arrow ? (arrowEl?.getBoundingClientRect().height ?? 20) : 0
		if (below) {
			let y = mouseY + offset + arrowH
			for (let j = 0; j < i; j++) y += els[j]?.getBoundingClientRect().height ?? 20
			return y
		} else {
			let y = mouseY + offset
			for (let j = lines.length - 1; j > i; j--) y -= els[j]?.getBoundingClientRect().height ?? 20
			return y
		}
	}
</script>

{#if arrow}
	<span bind:this={arrowMirrorEl} class="cursor-line yellow mirror" aria-hidden="true">{arrow}</span>
{/if}
{#each lines as line, i}
	<span bind:this={mirrorEls[i]} class="cursor-line yellow mirror" aria-hidden="true">{line}</span>
{/each}

{#if arrow && loaded && mouseX !== null}
	<span
		bind:this={arrowEl}
		class="cursor-line yellow"
		style="left: {clampCenter(arrowMirrorEl, mouseX)}px; top: {getArrowTop()}px; transform: translateX(-50%)"
	>{arrow}</span>
{/if}
{#each lines as line, i}
	{#if loaded && mouseX !== null}
		<span
			bind:this={els[i]}
			in:typewriter={{ duration: line.length*15, fade: false, hold: false }}
			class="cursor-line yellow"
			style="left: {clampCenter(mirrorEls[i], mouseX)}px; top: {getTop(i)}px; transform: translateX(-50%)"
		>{line}</span>
	{/if}
{/each}

<style lang="scss">
	.cursor-line {
		position: fixed;
		pointer-events: none;
		white-space: nowrap;
		z-index: 1;
		line-height: 1.3;

		@media (pointer: coarse) {
			display: none;
		}
	}
	.mirror {
		visibility: hidden;
		left: -9999px;
		top: -9999px;
	}
	.yellow::before {
		height: 1lh;
		bottom: 0.05em;
		left: -0.05em;
		right: -0.05em;
	}
</style>
