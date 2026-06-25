let height = $state(0)

export function getInfoText() {
	return {
		get height() { return height },
		setHeight(v) { height = v },
	}
}
