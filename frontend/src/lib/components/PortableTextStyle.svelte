<script>
    import { obelo } from "$lib/utils/obelo";

	let { portableText, children } = $props()

	const value = $derived(portableText.value)
	const style = $derived(value?.style)
	const listItem = $derived(value?.listItem)
</script>

{#if listItem === 'bullet'}
	<li>{@render children()}</li>
{:else if value._type === 'link'}
	<a use:obelo class="hover-yellow" href={value?.href} target={value?.blank ? '_blank' : undefined} rel={value?.blank ? 'noopener noreferrer' : undefined}>
		{@render children()}
	</a>
{:else if style === 'h1'}
	<h1>{@render children()}</h1>
{:else if style === 'h2'}
	<h2>{@render children()}</h2>
{:else if style === 'h3'}
	<h3>{@render children()}</h3>
{:else if style === 'h4'}
	<h4>{@render children()}</h4>
{:else if style === 'h5'}
	<h5>{@render children()}</h5>
{:else if style === 'h6'}
	<h6>{@render children()}</h6>
{:else if style === 'normal'}
	<p>{@render children()}</p>
{:else}
	{@render children()}
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as *;

	h1 { font-size: 4.5rem; }
	h2 { font-size: 4rem; }
	h3 { font-size: 3.5rem; }
	h4 { font-size: 3rem; }
	h5 { font-size: 2.5rem; }
	h6 { font-size: 2rem; }

	a {
		display: inline;
		text-decoration: none;
	}
</style>
