<script>
	import { beforeNavigate, goto, preloadData, replaceState } from '$app/navigation'
	import { page } from '$app/state'
	import { fade, slide } from 'svelte/transition'
	import { flushSync } from 'svelte'
	import { typewriter } from '$lib/utils/typewriter.js'
	import { onMount, onDestroy } from 'svelte'
	import Media from '$lib/components/Media.svelte'
	import { buildSrcset, urlFor } from '$lib/utils/image.js'
	import { marquee } from '$lib/utils/marquee.js'
	import { obelo } from '$lib/utils/obelo.js'
	import timing from '$lib/scss/timing.module.scss'
    import { obeloGrid } from '$lib/utils/obeloGrid.svelte.js';
	import { getResponsive } from '$lib/utils/responsive.svelte.js'

	const responsive = getResponsive()
	let { data } = $props()
	let activeFilters = $state(page.url.searchParams.getAll('filter'))
	let sort = $derived(data.sort)
	let filteredWorks = $derived(
		activeFilters.length === 0 ? data.works : data.works.map(w => {
			const slugs = [...(w.services ?? []), ...(w.tags ?? [])].map(x => x.slug?.current)
			return { ...w, inactive: !activeFilters.some(f => slugs.includes(f)) }
		})
	)
	const STEP = 20
	const OUT_DURATION = 300
	const RIPPLE = 10
	let loaded = $state(!page.state.overlay)
	let worksLoaded = $state(!page.state.overlay)
	let isSorting = $state(false)
	let activeWork = $state(null)
	let filtersOpen = $state(false)
	let previewMobileEl = $state()
	let sortersEl = $state()
	let bottomHeight = $state(0)
	let sorterHeight = $state(0)

	$effect(() => {
		if (responsive.isMobile) activeWork = filteredWorks.find(w => !w.inactive) ?? null
		else activeWork = null
	})

	$effect(() => {
		if (!responsive.isMobile) return
		function updateActiveWork() {
			const cutoff = sortersEl?.getBoundingClientRect().bottom ?? 0
			const items = document.querySelectorAll('[data-work-id]')
			for (const item of items) {
				if (item.getBoundingClientRect().top >= cutoff + 12) {
					activeWork = filteredWorks.find(w => w._id === item.dataset.workId) ?? null
					return
				}
			}
		}
		window.addEventListener('scroll', updateActiveWork, { passive: true })
		updateActiveWork()
		return () => window.removeEventListener('scroll', updateActiveWork)
	})

	$effect(() => {
		data.works.forEach(work => {
			if (work.thumbnail?.type === 'image' && work.thumbnail?.image) {
				const img = new Image()
				img.srcset = buildSrcset(work.thumbnail.image)
				img.sizes = '35vw'
			} else if (work.thumbnail?.type === 'video' && work.thumbnail?.videoPoster) {
				const img = new Image()
				img.src = urlFor(work.thumbnail.videoPoster).width(800).url()
			}
		})
	})

	$effect(() => {
		if (!page.state.overlay) return
		const t = setTimeout(() => { loaded = true; worksLoaded = true; }, responsive.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration)
		return () => clearTimeout(t)
	})

	function buildSearch(sortVal, filters) {
		const params = new URLSearchParams()
		if (sortVal) params.set('sort', sortVal)
		filters.forEach(f => params.append('filter', f))
		return params.toString() ? `?${params.toString()}` : ''
	}

	function syncFiltersToUrl(filters) {
		activeFilters = filters
		const url = `/works${buildSearch(sort, filters)}`
		replaceState(url, { ...page.state })
	}

	function toggleFilter(slug) {
		const next = activeFilters.includes(slug)
			? activeFilters.filter(f => f !== slug)
			: [...activeFilters, slug]
		syncFiltersToUrl(next)
	}

	async function setSort(key) {
		let next
		if (sort === `${key}-desc`) next = `${key}-asc`
		else if (sort === `${key}-asc`) next = `${key}-desc`
		else next = key === 'year' ? 'year-desc' : 'title-asc'
		const outDuration = (filteredWorks.length - 1) * RIPPLE + OUT_DURATION
		isSorting = true
		worksLoaded = false
		await new Promise(r => setTimeout(r, outDuration))
		const url = `/works${buildSearch(next, activeFilters)}`
		if (page.state.overlay) {
			const result = await preloadData(url)
			if (result.type === 'loaded' && result.status === 200) {
				replaceState(url, { ...page.state, overlayData: result.data })
			}
		} else {
			await goto(url, { replaceState: true, noScroll: true })
		}
		worksLoaded = true
		isSorting = false
	}
</script>

{#if loaded}
	<main>
		<h1 class="sr-only">Works</h1>
			<div class="content" style:--filterHeight={responsive.isMobile && bottomHeight ? `${bottomHeight}px` : undefined} style:--sorterHeight={responsive.isMobile && sorterHeight ? `${sorterHeight}px` : undefined}>
				<div class="top">
					<nav id="sorters" role="group" aria-label="Sorters" bind:this={sortersEl} bind:offsetHeight={sorterHeight}>
						<button class="sorter uppercase title"
							aria-pressed={sort?.startsWith('title')}
							aria-label="Sort by title{sort === 'title-asc' ? ', ascending' : sort === 'title-desc' ? ', descending' : ''}"
							onclick={() => setSort('title')}
						>Title<span class="arrow">{sort === 'title-asc' ? ' ▲' : sort === 'title-desc' ? ' ▼' : ''}</span></button>
						<button class="sorter uppercase year"
							aria-pressed={sort?.startsWith('year')}
							aria-label="Sort by year{sort === 'year-desc' ? ', descending' : sort === 'year-asc' ? ', ascending' : ''}"
							onclick={() => setSort('year')}
						><span class="arrow">{sort === 'year-desc' ? '▼ ' : sort === 'year-asc' ? '▲ ' : ''}</span>Year</button>
					</nav>
					<div id="works" aria-label="Works">
						<ul class="works" onmouseleave={() => { activeWork = responsive.isMobile ? (filteredWorks.find(w => !w.inactive) ?? null) : null }}
						>
							{#each filteredWorks as work, i (work._id)}
								{#if worksLoaded}
									<li class="work hover-yellow" class:active={work._id === activeWork?._id} class:yellow={work._id === activeWork?._id} data-work-id={work._id}
									class:inactive={work.inactive}
									data-out-delay={responsive.isMobile ? +timing.overlayDurationMobile : (filteredWorks.length - 1 - i) * RIPPLE}
									onmouseenter={() => { activeWork = work }}
									onintroend={(e) => e.currentTarget.dataset.introDone = '1'}
									in:typewriter|global={{ delay: responsive.isMobile ? +timing.overlayDurationMobile : (page.state.overlay ? i * STEP : 0) }}
									out:typewriter|global={{ duration: responsive.isMobile ? (isSorting ? +timing.overlayDurationMobile : 0) : OUT_DURATION, clean: true }}
									>
										<a href="/works/{work.slug.current}">
											<h2 class="title ellipsis" use:marquee use:obelo>{work.title}</h2>
											{#if work.services?.length}
												<ul class="services ellipsis" use:marquee aria-label="Services">
													{#each work.services as service, i (service.title)}
														<li class="service" use:obelo>{service.title}</li>{#if i+1 < work.services.length}{@html ',&nbsp;'}{/if}
													{/each}
												</ul>
											{/if}
											<p class="year ellipsis">
												{#if work.ongoing}
													<span use:obelo>Ongoing</span>
												{:else}
													<time use:obelo datetime={work.startDate}>{work.startDate?.slice(0, 4)}</time>{#if work.endDate}–<time datetime={work.endDate}>{work.endDate?.slice(0, 4)}</time>{/if}
												{/if}
											</p>
										</a>
									</li>
								{/if}
							{/each}
						</ul>
					</div>
				</div>
				{#if activeWork}
					<aside id="preview-mobile" aria-label="Work preview" bind:this={previewMobileEl}>
						<div class="obelo-grid obelo-grid-mobile glass-2" use:obeloGrid={{cols: 6, rows: 8}}></div>
						<Media media={activeWork.thumbnail} class={'works'} sizes="90vw" />
						<Media media={activeWork.thumbnail} class={'works-bg'} sizes="90vw" />
					</aside>
				{/if}
				<div class="bottom" bind:offsetHeight={bottomHeight}>
					<nav id="filters" aria-labelledby="filters-label">
						<div class="titles">
							<button id="filters-label" class="filters-toggle uppercase"
								aria-expanded={responsive.isMobile ? filtersOpen : undefined}
								onclick={() => { if (responsive.isMobile) filtersOpen = !filtersOpen }}
							>Filters<span class="arrow">{filtersOpen ? ' ▲' : ' ▼'}</span></button>
							{#if activeFilters.length > 0}
								<button use:obelo class="clear" onclick={() => syncFiltersToUrl([])}>× Clear all</button>
							{/if}
						</div>
						{#if responsive.isMobile && !filtersOpen && activeFilters.length > 0}
							<div class="active-summary">
								{#each activeFilters as slug (slug)}
									{@const filter = data.filters.find(f => f.slug === slug)}
									{#if filter}
										<button use:obelo class="chip" onclick={() => toggleFilter(slug)}>× {filter.title}</button>
									{/if}
								{/each}
							</div>
						{/if}
						{#if !responsive.isMobile || filtersOpen}
							<div class="filters" transition:slide={{ duration: +timing.overlayDuration }}>
								{#each data.filters as filter, i (filter.title)}
									<button
										class="filter"
										data-type={filter.type}
										aria-pressed={activeFilters.includes(filter.slug)}
										onclick={() => toggleFilter(filter.slug)}
										in:typewriter|global={{ delay: responsive.isMobile ? +timing.overlayDurationMobile :filteredWorks.length*STEP }}
										out:typewriter|global={{ duration: responsive.isMobile ? +timing.overlayDurationMobile : +timing.overlayDuration/3, clean: true }}
									><span use:obelo>{filter.title}</span></button>
								{/each}
							</div>
						{/if}
					</nav>
				</div>
			</div>
			{#if activeWork}
				<aside id="preview" aria-label="Work preview">
					<div class="obelo-grid overlay glass-2" use:obeloGrid={{cols: 6, rows: 8}}></div>
					<Media media={activeWork.thumbnail} class={'works'} sizes="35vw" />
				</aside>
			{/if}
	</main>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as bp;
	
	main {
		height: 100%;
		width: 100%;

		.content {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			overflow-y: scroll;
			padding: 0 var(--sp-12);
			height: 100vh;

			.top {
				#sorters {
					position: sticky;
					top: 0;
					padding: var(--sp-12) 0 var(--sp-6);
					display: flex;
					justify-content: space-between;
					background-color: var(--bgColor);
					z-index: 1;
	
					&::after {
						content: '';
						position: absolute;
						bottom: calc(var(--sp-12) * -1);
						left: 0;
						right: 0;
						height: var(--sp-12);
						background: linear-gradient(to bottom, var(--bgColor), transparent);
						pointer-events: none;
					}
					.sorter {
						color: var(--fgColor);
						opacity: .5;
						&[aria-pressed=true] {
							opacity: 1;
						}
						&:hover {
							@media (pointer: fine) {
								opacity: 1;
							}
						}
					}
					.title {
						grid-column: 1;
					}
					.year {
						grid-column: 3;
						text-align: right;
					}
				}
				#works {
					padding: var(--sp-6) 0 var(--sp-24);

					.works {
						display: flex;
						flex-direction: column;

						.work {
							width: 100%;

							&.inactive {
								color: var(--black-50);
							}
							a {
								display: grid;
								grid-template-columns: repeat(6, 1fr);
								column-gap: var(--sp-12);
								padding: calc((var(--sp-6) - (1.2em - 1cap)/2)/2) 0;
		
								.title {
									grid-column: 1 / span 3;
								}
								.services {
									grid-column: 4 / span 2;
									.service {
										display: inline;
									}
								}
								.year {
									grid-column: 6 / span 1;
									text-align: right;
									
									time, span {
										display: contents;
									}
								}
							}
						}
					}
				}
			}

			#preview-mobile {
				display: none;
			}
			
			.bottom {
				position: sticky;
				bottom: 0;
				background-color: var(--bgColor);
				z-index: 1;
				padding-bottom: var(--headerHeight);

				#filters {		
					&::before {
						content: '';
						position: absolute;
						top: calc(var(--sp-24) * -1);
						left: 0;
						right: 0;
						height: var(--sp-24);
						background: linear-gradient(to top, var(--bgColor), transparent);
						pointer-events: none;
					}
		
					.titles {
						display: flex;
						flex-direction: row;
						justify-content: space-between;
						margin: var(--sp-24) 0 var(--sp-16);

						.filters-toggle {
							color: currentColor;
							pointer-events: none;

							.arrow {
								display: none;
							}
						}

						.clear {
							&:hover {
								@media (pointer: fine) {
									color: var(--black-50);
								}
							}
						}
					}
		
					.filters {
						display: flex;
						flex-wrap: wrap;
						flex-direction: row;
						justify-content: flex-start;
						column-gap: .8em;
						margin-bottom: var(--sp-24);
		
						.filter {
							display: flex;
							align-items: center;
							gap: .3em;
			
							&::before {
								content: '';
								display: block;
								width: .6em;
								height: .6em;
								border-radius: 50%;
								border: 1.5px solid currentColor;
								flex-shrink: 0;
							}

							&[aria-pressed="true"]::before {
								background-color: currentColor;
							}
							&:hover::before {
								@media (pointer: fine) {
									opacity: 1;
								}
							}
						}
					}
				}
			}

			@media (orientation: portrait), (width <= #{bp.$md}) {
				color: var(--black);
				background-color: var(--white);
				padding: var(--sp-12) var(--sp-12) var(--sp-120);
				flex-direction: column-reverse;
				justify-content: flex-end;
				height: auto;
				min-height: 100dvh;

				.top {
					margin-top: calc(var(--previewHeight, 40vh) + var(--filterHeight, calc(var(--sp-24) + 1.2em)) + var(--sorterHeight, 0px));
					margin-bottom: calc(100dvh - var(--previewHeight, 40vh) - var(--filterHeight, calc(var(--sp-24) + 1.2em)) - var(--sorterHeight, 0px) - var(--sp-120) - var(--sp-24)*3);
					z-index: 0;

					#sorters {
						position: fixed;
						left: 0;
						right: 0;
						top: calc(var(--filterHeight, 0px) + var(--previewHeight, 40vh));
						padding: var(--sp-12) var(--sp-12) 0;
						margin-bottom: var(--sp-12);
						background-color: var(--white);
						z-index: 1;
						overflow: visible;

						.sorter.year {
							min-width: max-content;
						}

						&::after {
							content: '';
							position: absolute;
							top: 100%;
							left: 0;
							right: 0;
							height: var(--sp-32);
							background: linear-gradient(to bottom, var(--white), transparent);
							pointer-events: none;
						}
					}

					#works {
						.works {
							.work {
								&.inactive {
									display: none;
								}

								a {
									display: flex;
									justify-content: space-between;

									.services {
										display: none;
									}
									.year {
										min-width: max-content;
									}
								}

							}
						}
					}
				}

				#preview-mobile {
					width: stretch;
					height: 40vh;
					display: flex;
					align-items: center;
					justify-content: center;
					position: fixed;
					left: 0;
					top: var(--filterHeight, calc(var(--sp-24) + 1.2em));
					padding: var(--sp-24);
					overflow: hidden;

					.obelo-grid-mobile {
						position: absolute;
						left: 0;
						top: 0;
						inset: 0;
						height: unset;
					}
				}

				.bottom {
					padding-bottom: var(--sp-12);
					position: fixed;
					left: 0;
					padding: var(--sp-12);
					top: 0;
					bottom: unset;
					width: stretch;
					
					#filters {
						&::before {
							display: none;
						}
						.titles {
							margin: 0;

							.filters-toggle {
								pointer-events: all;
								cursor: pointer;

								.arrow {
									display: inline;
								}
							}
						}

						.active-summary {
							display: flex;
							flex-wrap: wrap;
							column-gap: .8em;
							margin-top: var(--sp-6);

							.chip {
								color: currentColor;
								cursor: pointer;

								&:hover {
									color: var(--black-50);
								}
							}
						}

						.filters {
							margin-top: var(--sp-6);
							margin-bottom: 0;
						}
					}
				}
			}
			@media (width <= #{bp.$md}) and (orientation: landscape) {
				--previewHeight: 0px;

				#preview-mobile {
					display: none;
				}
			}
		}
		#preview {
			position: fixed;
			top: 0;
			bottom: 0;
			left: calc(var(--infoWidth) + var(--overlayWidth));
			right: 0;
			display: flex;
			justify-content: center;
			align-items: center;

			@media (orientation: portrait), (width <= #{bp.$xl}) {
				display: none;
			}
		}
	}
</style>