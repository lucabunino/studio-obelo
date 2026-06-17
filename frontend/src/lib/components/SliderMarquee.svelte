<script>
	import { onMount } from 'svelte'
	import { fade, fly, slide } from 'svelte/transition'
	import Media from '$lib/components/Media.svelte'
	import CursorTag from '$lib/components/CursorTag.svelte'
    import { innerHeight, innerWidth } from 'svelte/reactivity/window';

	let { works, separator = false } = $props()
	let hoveredWork = $state(null)

let container = $state()
	let x = $state(0)
	let isDragging = $state(false)
	let startX = $state(0)
	let velocity = $state(0)
	let lastMouseX = $state(0)
	let lastTimestamp = $state(0)
	let lastInteractionTime = $state(0)
	let started = $state(false)
	let loaded = $state(false)
	let dragDistance = $state(0)

	const PAUSE_DURATION = 1000
	const BASE_SPEED = 0.3
	const FRICTION = .9
	const START_DELAY = 4000

	function update() {
		const now = Date.now()
		const isPaused = now - lastInteractionTime < PAUSE_DURATION
		if (!isDragging) {
			if (started && !isPaused) x -= BASE_SPEED
			x += velocity
			velocity *= FRICTION
			if (Math.abs(velocity) < 0.01) velocity = 0
			if (container) {
				const halfWidth = container.scrollWidth / 2
				if (x <= -halfWidth) x += halfWidth
				if (x > 0) x -= halfWidth
			}
		}
		requestAnimationFrame(update)
	}

	onMount(() => {
		const frame = requestAnimationFrame(update)
		const timeout = setTimeout(() => { started = true }, START_DELAY)
		loaded = true
		return () => { cancelAnimationFrame(frame); clearTimeout(timeout) }
	})

	function handleMouseDown(e) {
		isDragging = true
		lastInteractionTime = Date.now()
		startX = e.pageX - x
		velocity = 0
		lastMouseX = e.pageX
		lastTimestamp = Date.now()
		dragDistance = 0
	}
	function handleMouseMove(e) {
		if (!isDragging) return
		const now = Date.now()
		if (now - lastTimestamp > 0) velocity = velocity * 0.2 + (e.pageX - lastMouseX) * 0.8
		dragDistance += Math.abs(e.pageX - lastMouseX)
		x = e.pageX - startX
		lastMouseX = e.pageX
		lastTimestamp = now
	}
	function handleMouseUp() {
		if (!isDragging) return
		isDragging = false
		lastInteractionTime = Date.now()
		velocity *= 1.2
	}
	function handleClick(e) {
		if (dragDistance > 5) e.preventDefault()
	}
	function handleTouchStart(e) {
		isDragging = true
		lastInteractionTime = Date.now()
		startX = e.touches[0].pageX - x
		velocity = 0
		lastMouseX = e.touches[0].pageX
		lastTimestamp = Date.now()
		dragDistance = 0
	}
	function handleTouchMove(e) {
		if (!isDragging) return
		const now = Date.now()
		const pageX = e.touches[0].pageX
		if (now - lastTimestamp > 0) velocity = velocity * 0.2 + (pageX - lastMouseX) * 0.8
		dragDistance += Math.abs(pageX - lastMouseX)
		x = pageX - startX
		lastMouseX = pageX
		lastTimestamp = now
	}
	function handleTouchEnd() { handleMouseUp() }
	function handleWheel(e) {
		e.preventDefault()
		lastInteractionTime = Date.now()
		const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
		velocity -= delta * 0.1
	}
</script>


{#if loaded}
<div
	bind:this={container}
	class="slider-marquee"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	onwheel={handleWheel}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<div
		class="slider-track"
		style:transform="translate3d({Math.round(x * 100) / 100}px, 0, 0)"
	>
		{#each [0, 1] as set}
			{#if separator}<div class="separator" aria-hidden="true"></div>{/if}
			{#each works as work, i (work._id + set)}
				<a
					class="work"
					href="/works/{work.slug.current}"
					onclick={handleClick}
					ondragstart={(e) => e.preventDefault()}
					onmouseenter={() => hoveredWork = work}
					onmouseleave={() => hoveredWork = null}
					in:fade|global={{ delay: 500 + i*100, duration: 200 ,  y: -innerHeight.current }}
				>
					<Media media={work.thumbnail} class="homepage" />
				</a>
			{/each}
		{/each}
	</div>
</div>
{/if}

{#if hoveredWork}
	<CursorTag
		title={hoveredWork.title}
		subtitle={hoveredWork.services?.map(s => s.title).join(', ')}
		year={hoveredWork.ongoing ? 'Ongoing' : [hoveredWork.startDate?.slice(0, 4), hoveredWork.endDate?.slice(0, 4)].filter(Boolean).join('–')}
	/>
{/if}

<style lang="scss">
	.slider-marquee {
		position: fixed;
		inset: 0;
		overflow: hidden;
		user-select: none;
		touch-action: pan-y;
		cursor: grab;
		z-index: -1;

		&:active { cursor: grabbing; }
	}

	.slider-track {
		display: flex;
		align-items: flex-start;
		height: 100%;
		width: max-content;
		will-change: transform;
		contain: layout paint;
	}

	.separator {
		width: var(--infoWidth);
		flex-shrink: 0;
	}

	.work {
		flex-shrink: 0;
	}
</style>
