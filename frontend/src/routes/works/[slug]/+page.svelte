<script>
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'
	import Media from '$lib/components/Media.svelte'
	import CursorTag from '$lib/components/CursorTag.svelte'
	import { obelo } from '$lib/utils/obelo'
	import { obeloGrid } from '$lib/utils/obeloGrid.svelte.js'
    import { typewriter } from '$lib/utils/typewriter.js';
	import { page } from '$app/state'
	import { afterNavigate } from '$app/navigation'
	import timing from '$lib/scss/timing.module.scss'
    import { fade, slide } from 'svelte/transition';
	import { getResponsive } from '$lib/utils/responsive.svelte.js'
	import { useScrollLock } from '$lib/utils/scrollLock.svelte.js'
	const SCROLL_END_OUT = 14*15

	const responsive = getResponsive()
	let { data } = $props()
	let work = $derived(data.work)
	let prev = $derived(data.prev)
	let next = $derived(data.next)

	let articleLoaded = $state(false)
	let blocksLoaded = $state(false)
	let scrollEnd = $state(false)
	let hoveredNav = $state(null)
	let hoveredNavArrow = $state(null)
	let hoveredRef = $state(null)
	let relatedBlockEl = $state()
	let blockMode = $state(null)
	let readMore = $state(false)
	let wrapperHeight = $state(undefined)
	let readMoreHeight = $state(undefined)

	let loadTimeout
	let navigating = $state(false)
	let previousSlug = null

	afterNavigate(({ from, to }) => {
		const newSlug = to.params?.slug
		clearTimeout(loadTimeout)
		if (!from || previousSlug === null) {
			previousSlug = newSlug
			const delay = responsive.isMobile ? +timing.overlayDurationMobile : (page.state.overlay ? +timing.overlayDuration*2 : +timing.overlayDuration)
			loadTimeout = setTimeout(() => { articleLoaded = true; blocksLoaded = true }, delay)
			return
		}
		if (!newSlug || newSlug === previousSlug) return
		previousSlug = newSlug
		navigating = true
		blocksLoaded = false
		hoveredNav = null
		hoveredNavArrow = null
		hoveredRef = null
		scrollEnd = false
		loadTimeout = setTimeout(() => { navigating = false; blocksLoaded = true }, responsive.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration)
	})

	$effect(() => {
		if (!relatedBlockEl) return
		const observer = new IntersectionObserver(
			([entry]) => { scrollEnd = entry.isIntersecting },
			{ threshold: responsive.isMobile ? .9 : .5}
		)
		observer.observe(relatedBlockEl)
		return () => observer.disconnect()
	})

	$effect(() => {
		if (scrollEnd) readMore = false
	})

	$effect(() => {
		if (readMore) return
		if (readMoreHeight === undefined) { readMoreHeight = wrapperHeight; return }
		const t = setTimeout(() => { readMoreHeight = wrapperHeight }, +timing.overlayDuration)
		return () => clearTimeout(t)
	})

	useScrollLock(() => readMore)

	function getTime(w) {
		if (w.ongoing && w.startDate) return `From ${w.startDate.slice(0, 4)}`
		if (w.ongoing) return 'Ongoing'
		if (w.startDate && w.endDate) return `From ${w.startDate.slice(0, 4)} to ${w.endDate.slice(0, 4)}`
		if (w.startDate) return w.startDate.slice(0, 4)
		return null
	}

	let time = $derived(getTime(work))
	let nextTime = $derived.by(() => next ? getTime(next) : null)

	let relatedWorks = $derived(
		(work.blocks ?? [])
			.filter(b => b._type === 'workReference' && b.work)
			.map(b => b.work)
	)

	const zIndexes = $derived.by(() => {
		const blocks = work.blocks ?? []
		const zs = []
		let z = 0
		for (let i = 0; i < blocks.length; i++) {
			z++
			const isFloating = blocks[i]._type === 'workReference' && !blocks[i].marginBottom
			const prevIsFloating = i > 0 && blocks[i - 1]._type === 'workReference' && !blocks[i - 1].marginBottom
			if (isFloating) zs.push(z + 1)
			else if (prevIsFloating) zs.push(z - 1)
			else zs.push(z)
		}
		return zs
	})

</script>

<svelte:window onkeydown={(e) => {
	if (e.key === 'S' && e.shiftKey) blockMode = blockMode === 'sticky' ? 'relative' : 'sticky'
}} />

{#if articleLoaded}
	<article>
		<aside class="info over-md" aria-label="Work information">
			<div class="content" in:typewriter|global>
				{#key `${work.slug?.current}-${scrollEnd}`}
					<div class="wrapper"
					in:typewriter={{ duration: scrollEnd ? undefined : +timing.overlayDuration, delay: responsive.isMobile ? +timing.overlayDurationMobile : (scrollEnd ? SCROLL_END_OUT : 0) }}
					out:typewriter|global={{ duration: responsive.isMobile ? +timing.overlayDurationMobile : (scrollEnd ? undefined : SCROLL_END_OUT), clean: true }}>
						{#if scrollEnd && (next || prev)}
							<p class="center uppercase">Other projects</p>
						{:else}
							<div class="top">
								{#if work.title}
									<h1 class="title">{work.title}</h1>
								{/if}
								{#if work.client}
									<h2 class="client">{work.client.title}</h2>
								{/if}
								{#if time}
									<p class="time">{time}{#if work.place}<span class="place">{@html ', '}{work.place.title}</span>{/if}</p>
								{/if}
								{#if work.services?.length}
									<ul class="services" aria-label="Services">
										{#each work.services as s, i}
											<li class="service" style="display:inline">{s.title}{#if i + 1 < work.services.length},&nbsp;{/if}</li>
										{/each}
									</ul>
								{/if}
								{#if work.link?.href}
									<a class="link hover-yellow" use:obelo href={work.link.href} target="_blank" rel="noopener noreferrer">
										{work.link.label || work.link.href}
									</a>
								{/if}
								{#if work.description}
									<div class="description portableText">
										<PortableText value={work.description} components={{ block: PortableTextStyle, types: { break: PortableTextStyle }, marks: { link: PortableTextStyle } }} />
									</div>
								{/if}
								{#if work.team?.length}
									<p class="team">Team<br>{work.team.map(p => [p.name, p.surname].filter(Boolean).join(' ')).join(', ')}</p>
								{/if}
							</div>
							{#if relatedWorks.length}
								<div class="bottom">
									<p id="related-label" class="uppercase">Related projects</p>
									<ul class="related-projects" aria-labelledby="related-label">
										{#each relatedWorks as relatedWork}
											<li class="related-project"><a class="hover-yellow" use:obelo href="/works/{relatedWork.slug}">{relatedWork.title}</a></li>
										{/each}
									</ul>
								</div>
							{/if}
						{/if}
					</div>
				{/key}
			</div>
		</aside>
		<aside class="info under-md" aria-label="Work information">
			{#if work.team?.length || work.link?.href || work.description || relatedWorks.length}
				{#if !scrollEnd}
					<button class="bottom-button uppercase under-md glass-1" onclick={() => readMore = !readMore}>{#if !readMore}Read more{:else}Close{/if}</button>
				{:else if next}
					<a href="/works/{next.slug.current}" class="bottom-button uppercase under-md glass-1">Next project</a>
				{/if}
			{/if}
			<div class="content" in:typewriter|global>
				{#key `${work.slug?.current}-${scrollEnd}`}
					<div class="wrapper"
					in:typewriter={{ duration: +timing.overlayDuration, delay: responsive.isMobile ? +timing.overlayDurationMobile : (scrollEnd ? SCROLL_END_OUT : 0) }}
					bind:clientHeight={wrapperHeight}>
						{#if scrollEnd && next}
							{#if next.title}
								<h1 class="title">{next.title}</h1>
							{/if}
							{#if next.client}
								<h2 class="client">{next.client.title}{#if nextTime}<span class="time">{@html ', '}{nextTime}</span>{/if}{#if next.place}<span class="place">{@html ', '}{next.place.title}</span>{/if}</h2>
							{/if}
							{#if next.services?.length}
								<ul class="services" aria-label="Services">
									{#each next.services as s, i}
										<li class="service" style="display:inline">{s.title}{#if i + 1 < next.services.length},&nbsp;{/if}</li>
									{/each}
								</ul>
							{/if}
						{:else}
							{#if work.title}
								<h1 class="title">{work.title}</h1>
							{/if}
							{#if work.client}
								<h2 class="client">{work.client.title}{#if time}<span class="time">{@html ', '}{time}</span>{/if}{#if work.place}<span class="place">{@html ', '}{work.place.title}</span>{/if}</h2>
							{/if}
							{#if work.services?.length}
								<ul class="services" aria-label="Services">
									{#each work.services as s, i}
										<li class="service" style="display:inline">{s.title}{#if i + 1 < work.services.length},&nbsp;{/if}</li>
									{/each}
								</ul>
							{/if}
						{/if}
						{#if work.team?.length || work.link?.href || work.description || relatedWorks.length}
							{#if readMore}
								<div class="read-more" transition:slide={{ duration: +timing.overlayDuration }}>
									{#if (work.team?.length || work.link?.href || work.description)}
										<div class="top">
											{#if work.link?.href}
												<a class="link hover-yellow" use:obelo href={work.link.href} target="_blank" rel="noopener noreferrer">
													{work.link.label || work.link.href}
												</a>
											{/if}
											{#if work.description}
												<div class="description portableText">
													<PortableText value={work.description} components={{ block: PortableTextStyle, types: { break: PortableTextStyle }, marks: { link: PortableTextStyle } }} />
												</div>
											{/if}
											{#if work.team?.length}
												<p class="team">Designed by {work.team.map(p => [p.name, p.surname].filter(Boolean).join(' ')).join(', ')}</p>
											{/if}
										</div>
									{/if}

									{#if relatedWorks.length}
										<div class="bottom">
											<p id="related-label" class="uppercase">Related projects</p>
											<ul class="related-projects" aria-labelledby="related-label">
												{#each relatedWorks as relatedWork}
													<li class="related-project"><a class="hover-yellow" use:obelo href="/works/{relatedWork.slug}">{relatedWork.title}</a></li>
												{/each}
											</ul>
										</div>
									{/if}
								</div>
							{/if}
						{/if}
					</div>
				{/key}
			</div>
		</aside>

		{#if blocksLoaded}
			<div class="blocks" role="list" style:--readMoreHeight="{readMoreHeight}px">
				{#each work.blocks ?? [] as block, i (block._key)}
					{#if block._type === 'mediaBlock' || block._type === 'textBlock' || (block._type === 'workReference' && block.work)}
						<div role="listitem" class="block {block._type} {block.alignment} {blockMode ? `force-${blockMode}` : ''}"
						class:no-m={block._type === 'textBlock' || block._type === 'workReference'}
						class:first={i === 0} class:second={i === 1} class:last={i+1 === work.blocks.length}
						class:marginBottom={block._type === 'workReference' && block.marginBottom}
						style:--zIndex={zIndexes[i]}
						in:fade|global={{ duration: block._type === 'mediaBlock' ? +timing.fadeDuration : +timing.overlayDuration }}>
							{#if block._type === 'mediaBlock'}
								<div class="media-items" class:three-quarters={block.width === 'three-quarters'} class:half={block.width === 'half'}>
									{#each block.items ?? [] as item}
										<div class="media-item">
											<Media media={item} class="single-work {blockMode ? `force-${blockMode}` : ''}" sizes="{Math.round((block.width === 'half' ? 40 : block.width === 'three-quarters' ? 60 : 80) / (block.items?.length ?? 1))}vw" />
										</div>
									{/each}
								</div>
								{#if block.caption && block.width !== 'full'}
									<div class="caption">
										<p>{block.caption}</p>
									</div>
								{/if}

							{:else if block._type === 'textBlock'}
								{#if block.text}
									<div class="text portableText"
										class:three-quarters={block.width === 'three-quarters'}
										class:half={block.width === 'half'}>
										<PortableText value={block.text} components={{ block: PortableTextStyle, types: { break: PortableTextStyle }, marks: { link: PortableTextStyle } }} />
									</div>
								{/if}

							{:else if block._type === 'workReference'}
								<a class="link glass-1" href="/works/{block.work.slug}"
								onmouseenter={() => hoveredRef = block.work}
								onmouseleave={() => hoveredRef = null}>
									<span>Visit project:</span>
									<span>{block.work.title}</span>
								</a>
							{/if}
						</div>
					{/if}
				{/each}

				{#if prev || next}
					<nav class="block relatedBlock projects glass-2" aria-label="Other projects" use:obeloGrid={{cols: 6, rows: 8, loop: false}} bind:this={relatedBlockEl} style:--zIndex={(work.blocks?.length ?? 0) + 2} in:fade|global={{ duration: +timing.overlayDuration }}>
							<div class="links">
								{#if prev}
									<a href="/works/{prev.slug.current}" class="link prev"
										onmouseenter={() => { hoveredNav = prev; hoveredNavArrow = '←' }}
										onmouseleave={() => { hoveredNav = null; hoveredNavArrow = null }}
									>
										<div class="thumb">
											<Media media={prev.thumbnail} class="nav" sizes="30vw" />
										</div>
									</a>
								{/if}
								{#if next}
									<a href="/works/{next.slug.current}" class="link next"
										onmouseenter={() => { hoveredNav = next; hoveredNavArrow = '→' }}
										onmouseleave={() => { hoveredNav = null; hoveredNavArrow = null }}
									>
										<div class="thumb">
											<Media media={next.thumbnail} class="nav" sizes="30vw" />
										</div>
									</a>
								{/if}
							</div>
					</nav>
				{/if}
			</div>
		{/if}
	</article>
{/if}

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
		isolation: isolate;

		.info {
			&.under-md { display: none; }
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
						row-gap: var(--sp-14);

						.team {
							text-align: left;
						}

						.services {
							list-style: none;
						}

						.link {
							margin: 0 auto;
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
						text-align: center;

						#related-label {
							margin-bottom: var(--sp-14);
						}

						.related-projects {
							list-style: none;
							display: flex;
							flex-direction: column;
							gap: var(--sp-3);

							.related-project {
								align-self: center;

								a {
									display: block;
								}
							}
						}
					}
				}
			}

			@media (orientation: portrait), (width <= #{bp.$md}) {
				display: none;
				&.under-md { display: block; }
				top: unset;
				bottom: 0;
				width: stretch;
				height: auto;
				z-index: 2;
				pointer-events: all;

				.bottom-button {
					width: stretch;
					padding: var(--sp-12);
					margin: 0 var(--sp-6) -1px;
					text-align: center;
					display: block;
				}

				.content {
					background-color: var(--black);
					padding-bottom: var(--headerHeight);

					.wrapper {
						text-align: center;
						justify-content: flex-start;
						min-height: calc(var(--sp-12) + var(--sp-3)*2 + 3.6em);
						max-height: calc(100vh - (var(--headerHeight) + var(--sp-12)*2 + 1.2em) - var(--sp-6));

						.client {
							margin-top: var(--sp-3);
						}
						.services {
							margin-top: var(--sp-3);
						}
						.read-more {
							.top {
								margin-bottom: auto;
								min-height: 40vh;
								margin: var(--sp-15) 0;
							}
							.bottom {
								position: relative;
								padding: var(--sp-36) 0;
								// margin-top: auto;
							}
						}
					}
				}
			}
		}

		.blocks {
			margin-left: var(--infoWidth);			
			
			.block {
				z-index: var(--zIndex);

				// baseline = sticky; auto-switches to relative in portrait or on wide-enough screens (viewport minus --infoWidth wider than 8:5) — see docs/adr/0001-sticky-block-breakpoints.md for the derivation
				position: sticky;
				padding-top: var(--sp-150);
				top: calc(var(--sp-150)*-1);

				@media (orientation: portrait),
					(min-width: #{bp.$md}) and (max-width: calc(290px / 0.18)) and (min-width: calc(290px + 160vh)),
					(min-width: calc(290px / 0.18)) and (max-width: calc(400px / 0.18)) and (min-aspect-ratio: 80/41),
					(min-width: calc(400px / 0.18)) and (min-width: calc(400px + 160vh)) {
					position: relative;
					padding: 0 0 var(--sp-4) !important;
					top: unset !important;
				}

				&.force-sticky {
					position: sticky;
					padding-top: var(--sp-150);
					padding-bottom: 0;
					top: calc(var(--sp-150)*-1);
				}
				&.force-relative {
					position: relative;
					padding-top: 0;
					padding-bottom: var(--sp-4);
					top: 0;
				}

				&.first {
					padding-top: 0;
					top: 0;
				}
				&.second {
					padding-top: var(--sp-4);
					top: calc(var(--sp-4)*-1);
				}

				&.workReference:not(.marginBottom) + .block {
					padding-top: 0;
					top: 0;
				}

				&.mediaBlock {
					display: flex;
					align-items: flex-start;

					&.center {
						justify-content: center;
					}

					&.right {
						flex-direction: row-reverse;
					}

					.media-items {
						width: 100%;
						display: flex;
						flex-direction: row;
						align-items: flex-start;
						
						&.three-quarters {
							width: calc(50% * (5/4) * (5/4));
						}
						&.half {
							width: 50%;
						}
						.media-item {
							flex: 1;
						}
					}

					.caption {
						padding: var(--sp-4);
						flex: 1;
						background-color: var(--black);
						height: stretch;

						p {
							max-width: 60ch;
						}
					}
				}

				&.textBlock {
					display: flex;
					align-items: flex-start;

					.text {
						padding: var(--sp-12) var(--sp-4) var(--sp-150);
					}

					@media (orientation: portrait),
						(min-width: #{bp.$md}) and (max-width: calc(290px / 0.18)) and (min-width: calc(290px + 160vh)),
						(min-width: calc(290px / 0.18)) and (max-width: calc(400px / 0.18)) and (min-aspect-ratio: 80/41),
						(min-width: calc(400px / 0.18)) and (min-width: calc(400px + 160vh)) {
						.text {
							padding: var(--sp-12) var(--sp-4);
						}
					}

					&.force-sticky .text {
						padding: var(--sp-12) var(--sp-4) var(--sp-150);
					}
					&.force-relative .text {
						padding: var(--sp-12) var(--sp-4);
					}

					&.center {
						justify-content: center;
					}

					&.right {
						flex-direction: row-reverse;
					}

					.text {
						width: 100%;
						background-color: var(--black);
						height: 100%;

						&.three-quarters {
							width: calc(100% - var(--infoWidth));
							min-width: 50%;
						}
						&.half { width: 50%; }
					}
				}

				&.workReference {
					.link {
						display: flex;
						align-items: center;
						justify-content: space-between;
						padding: var(--sp-24) var(--sp-12);
					}
				}

				&.relatedBlock {
					display: flex;
					height: 100vh;
					width: 100%;
					padding: 0;
					flex: 1;
					position: relative;
					overflow: hidden;
					justify-content: center;
					align-items: center;
					margin-top: var(--sp-150);
					position: sticky;

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
									height: fit-content;
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

			@media (orientation: portrait), (width <= #{bp.$md}) {
				margin: var(--sp-6);

				.block {
					z-index: 0;

					&.mediaBlock {						
						.media-items {
							flex-direction: column;
							row-gap: var(--sp-4);
						
							&.three-quarters {
								width: 100%;
							}
							&.half {
								width: 100%;
							}

							.media-item {
								width: 100%;
							}
						}
					}

					&.relatedBlock {
						z-index: 1;
						height: calc(100vh - (var(--headerHeight) + var(--readMoreHeight) + var(--sp-12)*2 + 1.2em + var(--sp-12)));
						margin: var(--sp-2) 0 calc(var(--headerHeight) + var(--readMoreHeight) + var(--sp-12)*2 + 1.2em + var(--sp-6));

						.links {
							.link {
								.thumb {
									width: 70vw;
									height: fit-content;
									display: flex;
									align-items: center;
								}
							}
							.prev {
								display: none;
							}
						}
					}
				}
				
			}
		}
	}
</style>
