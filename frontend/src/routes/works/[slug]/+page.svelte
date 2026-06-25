<script>
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'
	import Media from '$lib/components/Media.svelte'
	import CursorTag from '$lib/components/CursorTag.svelte'
	import { obelo } from '$lib/utils/obelo'
	import { obeloGrid } from '$lib/utils/obeloGrid.svelte.js'
    import { resetTypewriter, typewriter } from '$lib/utils/typewriter.js';
    import { onMount } from 'svelte';
	import { fade } from 'svelte/transition'
	import timing from '$lib/scss/timing.module.scss'
	const DURATION = parseInt(timing.overlayDuration)
	const FADE_DURATION = parseInt(timing.fadeDuration)

	let { data } = $props()
	let work = $derived(data.work)
	let prev = $derived(data.prev)
	let next = $derived(data.next)

	let loaded = $state(false)
	let scrollEnd = $state(false)
	let hoveredNav = $state(null)
	let hoveredNavArrow = $state(null)
	let hoveredRef = $state(null)
	let relatedBlockEl = $state()

	$effect(() => {
		resetTypewriter();
		const t = setTimeout(() => { loaded = true; }, DURATION)
		return () => clearTimeout(t)
	})

	$effect(() => {
		if (!relatedBlockEl) return
		const observer = new IntersectionObserver(
			([entry]) => { scrollEnd = entry.isIntersecting },
			{ threshold: 0.5 }
		)
		observer.observe(relatedBlockEl)
		return () => observer.disconnect()
	})

	let time = $derived.by(() => {
		if (work.ongoing && work.startDate) return `From ${work.startDate.slice(0, 4)}`
		if (work.ongoing) return 'Ongoing'
		if (work.startDate && work.endDate) return `From ${work.startDate.slice(0, 4)} to ${work.endDate.slice(0, 4)}`
		if (work.startDate) return work.startDate.slice(0, 4)
		return null
	})

	let relatedWorks = $derived(
		(work.blocks ?? [])
			.filter(b => b._type === 'workReference' && b.work)
			.map(b => b.work)
	)

</script>

	<article>
		<aside class="info" aria-label="Work information">
			{#if loaded}
				<div class="content" in:typewriter|global out:typewriter|global={{ clean: true }}>
					{#key scrollEnd}
						<div class="wrapper" in:typewriter={{ duration: DURATION, delay: DURATION }} out:typewriter|global={{ clean: true }}>
							{#if scrollEnd && (next || prev)}
								<p class="center">Other projects:</p>
							{:else}
								<div class="top">
									{#if work.title}
										<h1 class="title">{work.title}</h1>
									{/if}
									{#if time}
										<p class="time">{time}{#if work.place}
											<span class="place">{@html ' – '}{work.place.title}</span>
										{/if}</p>
									{/if}
									{#if work.services?.length}
										<ul class="services" aria-label="Services">
											{#each work.services as s, i}
												<li class="service" style="display:inline">{s.title}{#if i + 1 < work.services.length},&nbsp;{/if}</li>
											{/each}
										</ul>
									{/if}
									{#if work.team?.length}
										<p class="team">Designed by {work.team.map(p => [p.name, p.surname].filter(Boolean).join(' ')).join(', ')}</p>
									{/if}
									{#if work.link?.href}
										<a class="link hover-yellow" use:obelo href={work.link.href} target="_blank" rel="noopener noreferrer">
											{work.link.label || work.link.href}
										</a>
									{/if}
									{#if work.description}
										<div class="description portableText">
											<PortableText value={work.description} components={{ block: PortableTextStyle, marks: { link: PortableTextStyle } }} />
										</div>
									{/if}
								</div>
								{#if relatedWorks.length}
									<div class="bottom">
										<p id="related-label" class="uppercase">Related projects:</p>
										<ul class="related-projects" aria-labelledby="related-label">
											{#each relatedWorks as rw}
												<li><a class="hover-yellow" use:obelo href="/works/{rw.slug}">{rw.title}</a></li>
											{/each}
										</ul>
									</div>
								{/if}
							{/if}
						</div>
					{/key}
				</div>
			{/if}
		</aside>

		<div class="blocks" role="list">
			{#each work.blocks ?? [] as block, i (block._key)}
				{#if block._type === 'mediaBlock'}
					<div class="block media-block {block.alignment}" class:first={i === 0} role="listitem" in:fade|global={{ delay: 100 + i * 100, duration: FADE_DURATION }} out:fade|global={{ duration: FADE_DURATION }}>
						<div class="media-items" class:three-quarters={block.width === 'three-quarters'} class:half={block.width === 'half'}>
							{#each block.items ?? [] as item}
								<div class="media-item">
									<Media media={item} class="work" />
								</div>
							{/each}
						</div>
						{#if block.caption && block.width !== 'full'}
							<p class="caption">{block.caption}</p>
						{/if}
					</div>

				{:else if block._type === 'textBlock'}
					<div class="block text-block no-m" class:first={i === 0} role="listitem" in:fade|global={{ delay: 200 + i * 100, duration: FADE_DURATION }} out:fade|global={{ duration: FADE_DURATION }}>
						{#if block.text}
							<div class="text portableText">
								<p>Vogliamo un blocco solo testo?</p>
								<PortableText value={block.text} components={{ block: PortableTextStyle, marks: { link: PortableTextStyle } }} />
							</div>
						{/if}
					</div>

				{:else if block._type === 'workReference' && block.work}
					<div class="block reference-block" class:first={i === 0} class:marginBottom={!block.marginBottom} role="listitem" in:fade|global={{ delay: 200 + i * 100, duration: FADE_DURATION }} out:fade|global={{ duration: FADE_DURATION }}>
						<a class="link no-m glass-1" href="/works/{block.work.slug}"
						onmouseenter={() => hoveredRef = block.work}
						onmouseleave={() => hoveredRef = null}>
							<span>Visit project:</span>
							<span>{block.work.title}</span>
						</a>
					</div>
				{/if}
			{/each}

			{#if prev || next}
				<nav class="block related-block projects glass-2" aria-label="Other projects" use:obeloGrid={{cols: 6, rows: 8, loop: true}} bind:this={relatedBlockEl}>
						<div class="links">
							{#if prev}
								<a href="/works/{prev.slug.current}" class="link"
									onmouseenter={() => { hoveredNav = prev; hoveredNavArrow = '←' }}
									onmouseleave={() => { hoveredNav = null; hoveredNavArrow = null }}
								>
									<div class="thumb">
										<Media media={prev.thumbnail} class="nav" />
									</div>
								</a>
							{/if}
							{#if next}
								<a href="/works/{next.slug.current}" class="link"
									onmouseenter={() => { hoveredNav = next; hoveredNavArrow = '→' }}
									onmouseleave={() => { hoveredNav = null; hoveredNavArrow = null }}
								>
									<div class="thumb">
										<Media media={next.thumbnail} class="nav" />
									</div>
								</a>
							{/if}
						</div>
				</nav>
			{/if}
		</div>
	</article>

{#if hoveredNav}
	<CursorTag
		arrow={hoveredNavArrow}
		title={hoveredNav.title}
		subtitle={hoveredNav.services?.map(s => s.title).join(', ')}
		year={hoveredNav.ongoing ? 'Ongoing' : [hoveredNav.startDate?.slice(0, 4), hoveredNav.endDate?.slice(0, 4)].filter(Boolean).join('–')}
	/>
{/if}
{#if hoveredRef}
	<CursorTag
		title={hoveredRef.title}
		subtitle={hoveredRef.services?.map(s => s.title).join(', ')}
		year={hoveredRef.ongoing ? 'Ongoing' : [hoveredRef.startDate?.slice(0, 4), hoveredRef.endDate?.slice(0, 4)].filter(Boolean).join('–')}
	/>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as bp;

	article {
		display: block;

		.info {
			position: fixed;
			top: 0;
			left: 0;
			width: var(--infoWidth);
			height: 100vh;
			pointer-events: none;

			.content {
				height: 100%;
				
				.wrapper {
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					height: 100%;
					overflow-y: scroll;
					padding: var(--sp-12) var(--sp-12) 0;
					pointer-events: all;

					.center {
						height: 100%;
						align-content: center;
						text-align: center;
					}

					.top {
						display: flex;
						flex-direction: column;
						text-align: center;
						row-gap: var(--sp-18);

						.services {
							list-style: none;
						}

						.link {
							margin: auto;
						}

						.description {
							text-align: left;
						}
					}

					.bottom {
						position: sticky;
						bottom: 0;
						padding-bottom: calc(var(--sp-150));
						padding-top: var(--sp-36);
						background: linear-gradient(to bottom, transparent, inherit var(--sp-24));
						transition: var(--transition);

						.related-label {
							opacity: 0.5;
							margin-bottom: var(--sp-3);
						}

						.related-projects {
							list-style: none;
							display: flex;
							flex-direction: column;
							gap: var(--sp-3);

							a {
								display: block;
							}
						}
					}
				}
			}
		}

		.blocks {
			margin-left: var(--infoWidth);
			
			.block {
				position: sticky;
				top: 0;
				padding-bottom: var(--sp-150);

				&.first {
					padding-bottom: var(--sp-4);
				}

				// &.media-block:not(.first) {
				// 	height: 100vh;
				// }

				&.media-block {
					display: flex;
					align-items: flex-start;
					background-color: var(--black);

					&.align-right {
						justify-content: flex-end;
					}

					.media-items {
						width: 100%;
						display: flex;
						flex-direction: row;
						align-items: flex-start;

						&.three-quarters {
							width: calc(100% - var(--infoWidth));
							min-width: 50%;
						}
						&.half { width: 50%; }

						.media-item {
							flex: 1;
						}
					}

					.caption {
						padding: var(--sp-4);
						flex: 1;
					}
				}

				&.text-block {
					background-color: var(--black);
					border: solid red 1px;
					padding: var(--sp-4) var(--sp-4) var(--sp-150);

					.text {
						max-width: 60ch;
					}
				}

				&.reference-block {		
					padding-bottom: 0;						
					&:not(.marginBottom) {
						border-bottom: solid var(--sp-150) var(--black);
					}

					.link {
						display: flex;
						align-items: center;
						justify-content: space-between;
						padding: var(--sp-24) var(--sp-12);
					}
				}

				&.related-block {
					display: flex;
					height: 100vh;
					width: 100%;
					padding-bottom: 0;
					flex: 1;
					position: relative;
					overflow: hidden;
					justify-content: center;
					align-items: center;

					// .label {
					// 	width: var(--infoWidth);
					// 	flex-shrink: 0;
					// 	display: flex;
					// 	align-items: center;
					// 	justify-content: center;
					// 	background-color: var(--black);
					// }

						.links {
							position: relative;
							height: 100%;
							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: center;
							column-gap: var(--sp-72);

							.link {
								display: flex;
								flex-direction: column;
								align-items: center;
								color: var(--white);

								.thumb {
									width: 30vw;
									display: flex;
									align-items: center;
								}

								&:first-of-type {
									.thumb {
										justify-content: flex-end;
									}
								}
								&:last-of-type {
									.thumb {
										justify-content: flex-start;
									}
								}
							}
						}
				}
			}
		}
	}
</style>
