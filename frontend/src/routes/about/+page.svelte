<script>
	import { PortableText } from '@portabletext/svelte'
	import PortableTextStyle from '$lib/components/PortableTextStyle.svelte'
	import { typewriter, resetTypewriter } from '$lib/utils/typewriter.js'
	import { handleOverlay } from '$lib/utils/overlay.js'
	import { onDestroy, onMount } from 'svelte'
	import { obelo } from '$lib/utils/obelo.js'
	import timing from '$lib/scss/timing.module.scss'
    import { beforeNavigate } from '$app/navigation';

	let { data } = $props()
	const about = $derived(data.about)
	let loaded = $state(false)
	const DURATION = parseInt(timing.overlayDuration)

	$effect(() => {
		resetTypewriter();
		const t = setTimeout(() => loaded = true, DURATION)
		return () => clearTimeout(t)
	})
</script>

{#if loaded}
	<main>
		<h1 class="sr-only">About</h1>
		<div class="content">
			<div class="top" in:typewriter out:typewriter|global={{ duration: DURATION, clean: true }}>
				{#if about?.team?.length}
					<section id="team" aria-labelledby="team-heading">
						<h2 id="team-heading" class="uppercase">Team:</h2>
						<ul class="team">
							{#each about.team as person, i}
								<li class="person">{person.name} {person.surname}</li>{#if i+1 < about.team.length}{@html ', '}{/if}
							{/each}
						</ul>
					</section>
				{/if}

				{#if about?.clients?.length}
					<section id="clients" aria-labelledby="clients-heading">
						<h2 id="clients-heading" class="uppercase">Selected clients:</h2>
						<ul class="clients">
							{#each about.clients as client, i}
								<li class="client">{client.title}</li>{#if i+1 < about.clients.length}{@html ', '}{/if}
							{/each}
						</ul>
					</section>
				{/if}

				{#if about?.team?.length || about?.clients?.length}
					<div class="separator">÷</div>
				{/if}

				{#if about?.recognitions?.length}
					<section id="recognitions" aria-labelledby="recognitions-heading">
						<h2 id="recognitions-heading" class="uppercase">Recognitions:</h2>
						<ul class="recognitions">
							{#each about.recognitions as r}
								<li class="recognition">
									<span>{r.title}</span>
									{#if r.year}<time datetime={r.year}>{r.year.slice(0, 4)}</time>{/if}
								</li>
							{/each}
						</ul>
					</section>
					<div class="separator">÷</div>
				{/if}

				{#if about?.teachingsOngoing?.length || about?.teachingsOther?.length}
					<section id="teaching" aria-labelledby="teaching-heading">
						<h2 id="teaching-heading" class="uppercase">Teaching:</h2>
						{#if about.teachingsOngoing?.length}
							<ul class="teachings ongoing" aria-label="Ongoing">
								{#each about.teachingsOngoing as t}
									<li class="teaching">
										<span>{t.title}</span>
									</li>
								{/each}
							</ul>
						{/if}
						{#if about.teachingsOther?.length}
							<ul class="teachings" aria-label="Past">
								{#each about.teachingsOther as t}
									<li class="teaching">
										<span>{t.title}</span>
										{#if t.startDate}<time datetime={t.startDate}>{t.startDate.slice(0, 4)}</time>{/if}
										{#if t.endDate}–<time datetime={t.endDate}>{t.endDate.slice(0, 4)}</time>{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</section>
					<div class="separator">÷</div>
				{/if}

				{#if about?.applications}
					<section id="applications" aria-label="Applications:">
						<div class="applications portableText">
							<PortableText value={about.applications} components={{ block: PortableTextStyle, marks: { link: PortableTextStyle } }} />
						</div>
					</section>
					<div class="separator">÷</div>
				{/if}

				{#if (about?.legalName || about?.vat || about?.addressLabel)}
					<section id="legal" aria-label="Legal">
						<ul class="legal">
							{#if about.legalName}<li class="legal-item">{about.legalName}</li>{/if}
							{#if about.vat}<li class="legal-item">VAT {about.vat}</li>{/if}
							{#if about.addressLabel}
								<li class="legal-item">
									{#if about.addressHref}
										<a use:obelo class="hover-yellow" href={about.addressHref} target="_blank" rel="noopener noreferrer">{about.addressLabel}</a>
									{:else}
										{about.addressLabel}
									{/if}
								</li>
							{/if}
						</ul>
					</section>
					<div class="separator">÷</div>
				{/if}

				{#if about?.policies?.length}
					<nav id="policies" aria-label="Legal documents">
						<ul class="policies">
							{#each about.policies as policy}
								<li class="policy"><a use:obelo class="hover-yellow" href="/policy/{policy.slug}" onclick={(e) => handleOverlay(e, `/policy/${policy.slug}`)}>{policy.title}</a></li>
							{/each}
						</ul>
					</nav>
				{/if}
			</div>
			<div class="bottom"></div>
		</div>
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
			padding: var(--sp-12) var(--sp-12) 0;
			height: 100%;

			.top {
				.separator {
					margin: var(--sp-12) 0;
					width: stretch;
					text-align: center;
				}

				#team {
					.team {
						text-wrap: balance;
	
						.person {
							display: inline;
						}
					}
				}

				#clients {
					margin-top: var(--sp-12);
					.clients {
						.client {
							display: inline;
						}
					}
				}

				#teaching {
					.teachings {
						&.ongoing {
							margin-bottom: var(--sp-12);
						}

						.teaching {
							display: flex;
							justify-content: space-between;
						}
					}
				}

				#applications {
					.applications {
						text-align: center;
					}
				}

				#legal {
					.legal {
						text-align: center;
					}
				}
				
				#policies {
					.policies {
						text-align: center;
						display: flex;
						justify-content: center;
						column-gap: var(--sp-36);
					}
				}
			}

			.bottom {
				background: linear-gradient(to bottom, transparent, var(--bgColor) var(--sp-24));
				height: calc(var(--headerHeight) + var(--sp-24));
				flex-shrink: 0;
				position: sticky;
				bottom: 0;
			}
		}
	}
</style>
