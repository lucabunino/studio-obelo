<script>
	import { onMount } from 'svelte'
	import { typewriter, resetTypewriter } from '$lib/utils/typewriter.js'
    import { obelo } from '$lib/utils/obelo';

	let visible = $state(false)

	onMount(() => {
		if (!localStorage.getItem('cookie-consent')) {
			resetTypewriter()
			visible = true
		}
	})

	function accept() {
		localStorage.setItem('cookie-consent', 'accepted')
		visible = false
	}
</script>

{#if visible}
	<div id="cookie-banner" class="glass-1" role="dialog" aria-label="Cookie consent" aria-modal="false" in:typewriter>
		<p>This website uses only technical cookies, which are necessary for its proper functioning. No profiling or third-party cookies are used. For more details, please consult our cookies and privacy policies.</p>
		<button use:obelo class="hover-yellow" onclick={accept}>Ok, I understand</button>
	</div>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as *;

	#cookie-banner {
		position: fixed;
		color: var(--black);
		bottom: var(--sp-12);
		right: var(--sp-12);
		padding: var(--sp-12);
		display: flex;
		flex-direction: column;
		gap: var(--sp-12);
		max-width: 320px;
		z-index: 10;

		button {
			width: fit-content;
		}
	}
</style>
