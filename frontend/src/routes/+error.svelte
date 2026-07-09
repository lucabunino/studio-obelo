<script>
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { typewriter } from '$lib/utils/typewriter.js'
	import timing from '$lib/scss/timing.module.scss'

	const isNotFound = page.status === 404
	let countdown = $state(3)

	onMount(() => {
		if (!isNotFound) return
		const interval = setInterval(() => {
			countdown -= 1
			if (countdown <= 0) {
				clearInterval(interval)
				goto('/')
			}
		}, 1000)
		return () => clearInterval(interval)
	})
</script>

<main id="error" in:typewriter={{ duration: +timing.overlayDuration }}>
	{#if isNotFound}
		<p>404: Not found</p>
		<p>Redirecting in {countdown}</p>
	{:else}
		<p>{page.status}</p>
		<p>{page.error?.message}</p>
	{/if}
</main>

<style lang="scss">
	#error {
		position: fixed;
		top: var(--sp-12);
		left: var(--sp-12);
	}
</style>
