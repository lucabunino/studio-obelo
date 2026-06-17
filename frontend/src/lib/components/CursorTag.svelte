<script>
    import { typewriter, resetTypewriter } from '$lib/utils/typewriter';
    import { onMount } from 'svelte';
	import { innerWidth } from 'svelte/reactivity/window'

	let { title, subtitle, year } = $props()

	let mouseX = $state(0)
	let mouseY = $state(0)
	let els = $state([])
	let mirrorEls = $state([])
	let loaded = $state(false)

	$effect(() => {
		function track(e) { mouseX = e.clientX; mouseY = e.clientY }
		window.addEventListener('mousemove', track)
		return () => window.removeEventListener('mousemove', track)
	})
	onMount(() => { resetTypewriter(); loaded = true })

	const lines = $derived([title, subtitle, year].filter(Boolean))
	const below = $derived(mouseY < window.innerHeight - 80)

	function clampCenter(mirrorEl, mx) {
		const w = mirrorEl?.offsetWidth ?? 0
		const vw = innerWidth.current ?? window.innerWidth
		return Math.max(w / 2, Math.min(mx, vw - w / 2))
	}

	function getTop(i) {
		const offset = below ? 22 : -16
		if (below) {
			let y = mouseY + offset
			for (let j = 0; j < i; j++) y += els[j]?.getBoundingClientRect().height ?? 20
			return y
		} else {
			let y = mouseY + offset
			for (let j = lines.length - 1; j > i; j--) y -= els[j]?.getBoundingClientRect().height ?? 20
			return y
		}
	}
</script>

{#each lines as line, i}
	<span bind:this={mirrorEls[i]} class="cursor-line yellow mirror" aria-hidden="true">{line}</span>
{/each}

{#each lines as line, i}
	{#if loaded}
		<span
			bind:this={els[i]}
			in:typewriter
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
