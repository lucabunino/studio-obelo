<script>
	import { beforeNavigate, goto, preloadData, replaceState } from '$app/navigation'
	import { page } from '$app/state'
	import { fade } from 'svelte/transition'
	import { typewriter, resetTypewriter } from '$lib/utils/typewriter.js'
	import { onMount, onDestroy } from 'svelte'
	import Media from '$lib/components/Media.svelte'
	import { marquee } from '$lib/utils/marquee.js'
	import { obelo } from '$lib/utils/obelo.js'
	import timing from '$lib/scss/timing.module.scss'
    import { obeloGrid } from '$lib/utils/obeloGrid.svelte.js';

	let { data } = $props()
	let activeFilters = $state(page.url.searchParams.getAll('filter'))
	let sort = $derived(data.sort)
	let filteredWorks = $derived(
		activeFilters.length === 0 ? data.works : data.works.map(w => {
			const slugs = [...(w.services ?? []), ...(w.tags ?? [])].map(x => x.slug?.current)
			return { ...w, inactive: !activeFilters.some(f => slugs.includes(f)) }
		})
	)
	const DURATION = parseInt(timing.overlayDuration)
	const STEP = 20
	const OUT_DURATION = 300
	const RIPPLE = 10
	let loaded = $state(false)
	let worksLoaded = $state(false)
	let isSorting = $state(false)
	let activeWork = $state(null)

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

	$effect(() => {
		resetTypewriter();
		const t = setTimeout(() => { loaded = true; worksLoaded = true; }, DURATION)
		return () => clearTimeout(t)
	})

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
		resetTypewriter()
		worksLoaded = true
		isSorting = false
	}
</script>

{#if loaded}
	<main>
		<h1 class="sr-only">Works</h1>
			<div class="content">
				<div class="top">
					<nav id="sorters" role="group" aria-label="Sorters">
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
						<ul class="works" onmouseleave={() => activeWork = null}
						>
							{#each filteredWorks as work, i (work._id)}
								{#if worksLoaded}
									<li class="work hover-yellow"
									class:inactive={work.inactive}
									data-out-delay={(filteredWorks.length - 1 - i) * RIPPLE}
									onmouseenter={() => { activeWork = work}}
									onintroend={(e) => e.currentTarget.dataset.introDone = '1'}
									in:typewriter|global={{ delay: i * STEP }}
									out:typewriter|global={{ duration: OUT_DURATION, clean: true }}
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
				<div class="bottom" in:typewriter={{ delay: filteredWorks.length*STEP }}
				out:typewriter|global={{ duration: DURATION, clean: true }}
				>
					<nav id="filters" aria-labelledby="filters-label">
						<div class="titles uppercase">
							<h2 id="filters-label">Filters</h2>
							{#if activeFilters.length > 0}
								<button use:obelo class="clear" onclick={() => syncFiltersToUrl([])}>× Clear all</button>
							{/if}
						</div>
						<div class="filters">
							{#each data.filters as filter, i (filter.title)}
								<button
									class="filter"
									data-type={filter.type}
									aria-pressed={activeFilters.includes(filter.slug)}
									onclick={() => toggleFilter(filter.slug)}
								><span use:obelo>{filter.title}</span></button>
							{/each}
						</div>
					</nav>
				</div>
			</div>
		{#if activeWork}
			<aside id="preview" aria-label="Work preview">
				<div class="obelo-grid overlay glass-2" use:obeloGrid={{cols: 6, rows: 8, loop: true}}></div>
				{#key activeWork._id}
					<Media media={activeWork.thumbnail} class={'preview'}/>
				{/key}
			</aside>
		{/if}
	</main>
{/if}

<style lang="scss">
	@use '$lib/scss/breakpoints.module' as *;
	
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
						.arrow {
							font-variant: unicase;
						}
						&:hover, &[aria-pressed=true] {
							opacity: 1;
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

						.clear:hover {
							color: var(--black-50);
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
		
							&:hover::before,
							&[aria-pressed="true"]::before {
								background-color: currentColor;
							}
						}
					}
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
		}
	}
</style>