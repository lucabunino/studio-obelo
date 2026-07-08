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
{:else if value._type === 'break'}
	<hr />
{:else if style === 'h2'}
	<h2>{@render children()}</h2>
{:else if style === 'normal'}
	<p>{@render children()}</p>
{:else}
	{@render children?.()}
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as bp;

	li {
		list-style: disc;
	}

	h2 { margin-top: 1.2em; }

	hr {
		margin: var(--sp-7) 0;
		border: none;
	}

	a {
		display: inline;
		text-decoration: underline;

		&:hover {
			text-decoration-color: var(--fgColor);
		}
	}
</style>
