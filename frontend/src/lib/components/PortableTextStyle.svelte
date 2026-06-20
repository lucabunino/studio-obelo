<script>
    import { obelo } from "$lib/utils/obelo";

	let { portableText, children } = $props()

	const value = $derived(portableText.value)
	const style = $derived(value?.style)
	const listItem = $derived(value?.listItem)

	let linkEl = $state()
	let isLongLink = $state(false)
	$effect(() => {
		if (linkEl) isLongLink = (linkEl.textContent?.length ?? 0) > 30
	})
</script>

{#if listItem === 'bullet'}
	<li>{@render children()}</li>
{:else if value._type === 'link'}
	<a bind:this={linkEl} use:obelo class={isLongLink ? 'long' : 'hover-yellow'} href={value?.href} target={value?.blank ? '_blank' : undefined} rel={value?.blank ? 'noopener noreferrer' : undefined}>
		{@render children()}
	</a>
{:else if style === 'h2'}
	<h2>{@render children()}</h2>
{:else if style === 'normal'}
	<p>{@render children()}</p>
{:else}
	{@render children()}
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as *;

	li {
		list-style: disc;
	}

	h2 { margin-top: 1.2em; }

	a {
		display: inline;
		text-decoration: none;

		&.long {
			display: inline;
			text-decoration: underline;
		}
	}
</style>
