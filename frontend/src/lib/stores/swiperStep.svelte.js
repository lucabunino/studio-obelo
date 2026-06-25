let seq = $state(0)
let direction = $state(null)

export function getSwiperStep() {
	return {
		get seq() { return seq },
		get direction() { return direction },
		step(dir) { direction = dir; seq++ },
	}
}
