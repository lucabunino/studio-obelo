<script>
	import { fade, fly } from 'svelte/transition'
	import Media from '$lib/components/Media.svelte'
	import CursorTag from '$lib/components/CursorTag.svelte'
	import { innerHeight, innerWidth } from 'svelte/reactivity/window'
	import { getInfoText } from '$lib/stores/infoText.svelte.js'
	import timing from '$lib/scss/timing.module.scss'

	let { works, separator = false } = $props()
	let hoveredWork = $state(null)

	let container = $state()
	let pos = $state(0)
	let isDragging = $state(false)
	let startPos = $state(0)
	let velocity = $state(0)
	let lastMousePos = $state(0)
	let lastTimestamp = $state(0)
	let lastInteractionTime = $state(0)
	let started = $state(false)
	let loaded = $state(false)
	let dragDistance = $state(0)

	const DURATION = parseInt(timing.overlayDuration)
	const FADE_DURATION = parseInt(timing.fadeDuration)
	const PAUSE_DURATION = 1000
	const BASE_SPEED = 0.3
	const FRICTION = .9
	const START_DELAY = 3000

	const isPortrait = $derived(innerHeight.current > innerWidth.current)
	const infoText = getInfoText()

	$effect(() => {
		isPortrait
		pos = 0
		velocity = 0
	})

	$effect(() => {
		let frameId
		let cancelled = false
		function loop() {
			if (cancelled) return
			update()
			frameId = requestAnimationFrame(loop)
		}
		frameId = requestAnimationFrame(loop)
		const timeout = setTimeout(() => { started = true }, START_DELAY)
		loaded = true
		return () => { cancelled = true; cancelAnimationFrame(frameId); clearTimeout(timeout) }
	})

	function update() {
		const now = Date.now()
		const isPaused = now - lastInteractionTime < PAUSE_DURATION
		if (!isDragging) {
			if (started && !isPaused && !isPortrait) pos -= BASE_SPEED
			pos += velocity
			velocity *= FRICTION
			if (Math.abs(velocity) < 0.01) velocity = 0
			if (container) {
				const halfSize = isPortrait ? container.scrollHeight / 2 : container.scrollWidth / 2
				if (pos <= -halfSize) pos += halfSize
				if (pos > 0) pos -= halfSize
			}
		}
	}

	function getEventPos(e) { return isPortrait ? e.pageY : e.pageX }
	function getTouchPos(e) { return isPortrait ? e.touches[0].pageY : e.touches[0].pageX }

	function handleMouseDown(e) {
		isDragging = true
		lastInteractionTime = Date.now()
		startPos = getEventPos(e) - pos
		velocity = 0
		lastMousePos = getEventPos(e)
		lastTimestamp = Date.now()
		dragDistance = 0
	}
	function handleMouseMove(e) {
		if (!isDragging) return
		const now = Date.now()
		const p = getEventPos(e)
		if (now - lastTimestamp > 0) velocity = velocity * 0.2 + (p - lastMousePos) * 0.8
		dragDistance += Math.abs(p - lastMousePos)
		pos = p - startPos
		lastMousePos = p
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
		const p = getTouchPos(e)
		startPos = p - pos
		velocity = 0
		lastMousePos = p
		lastTimestamp = Date.now()
		dragDistance = 0
	}
	function handleTouchMove(e) {
		if (!isDragging) return
		const now = Date.now()
		const p = getTouchPos(e)
		if (now - lastTimestamp > 0) velocity = velocity * 0.2 + (p - lastMousePos) * 0.8
		dragDistance += Math.abs(p - lastMousePos)
		pos = p - startPos
		lastMousePos = p
		lastTimestamp = now
	}
	function handleTouchEnd() { handleMouseUp() }
	function handleWheel(e) {
		e.preventDefault()
		lastInteractionTime = Date.now()
		const delta = isPortrait
			? (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX)
			: (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)
		velocity -= delta * 0.1
	}

	const rounded = $derived(Math.round(pos * 100) / 100)
	const transform = $derived(isPortrait
		? `translate3d(0, ${rounded}px, 0)`
		: `translate3d(${rounded}px, 0, 0)`)
</script>


	<div
		bind:this={container}
		role="group"
		tabindex="0"
		aria-label="Work slider"
		class="slider-marquee"
		style:--infoTextHeight="{infoText.height + 24}px"
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
			style:transform={transform}
		>
			{#each [0, 1] as set}
				{#if separator}
					<div class="separator" aria-hidden="true"></div>
				{/if}
				{#each works as work, i (work._id + set)}
					{#if loaded}
						<a
							class="work"
							href="/works/{work.slug.current}"
							onclick={handleClick}
							ondragstart={(e) => e.preventDefault()}
							onmouseenter={() => hoveredWork = work}
							onmouseleave={() => hoveredWork = null}
							in:fly={{ delay: DURATION + i*DURATION/4, duration: DURATION, x: '20vw' }}
							out:fade|global={{ duration: FADE_DURATION }}
						>
							<Media media={work.thumbnail} class="homepage" />
						</a>
					{/if}
				{/each}
			{/each}
		</div>
	</div>

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

		@media (orientation: portrait) {
			touch-action: pan-x;
		}
	}

	.slider-track {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		height: 100%;
		width: max-content;
		will-change: transform;
		contain: layout paint;

		@media (orientation: portrait) {
			flex-direction: column;
			align-items: stretch;
			width: 100%;
			height: max-content;
		}
	}

	.separator {
		width: var(--infoWidth);
		flex-shrink: 0;

		@media (orientation: portrait) {
			width: 100%;
			height: var(--infoTextHeight);
		}
	}

	.work {
		flex-shrink: 0;
	}
</style>
