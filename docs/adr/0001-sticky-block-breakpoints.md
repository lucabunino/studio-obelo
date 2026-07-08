# Auto sticky/relative work-block layout via exact breakpoint math

The work detail page (`/works/[slug]`) switches each content block between `sticky` (pinned/scaling to fit the viewport) and `relative` (normal document flow) layout. This used to be a manual dev toggle (`blockMode`, Shift+S) defaulting to `sticky`. It's now automatic: `sticky` is the baseline, and `relative` kicks in via `@media` when `(orientation: portrait)` OR the viewport minus `--infoWidth` (`clamp(290px, 18vw, 400px)`) is wider than an 8:5 ratio — i.e. narrow/portrait screens and screens much wider than 8:5 fall back to normal flow; only viewports close to that 8:5 content ratio get the sticky/pinned treatment.

Because `--infoWidth` is a non-linear clamp, a single CSS media feature can't express "viewport width minus infoWidth" as one ratio across the whole range. We derived three exact segments (no rounding) instead of a single 18vw approximation:
- width ≤ `calc(290px / 0.18)`: infoWidth is pinned at 290px, so the condition becomes `min-width: calc(290px + 160vh)` (from `width - 290px > 1.6 * height`, i.e. `1.6 * 100vh = 160vh`).
- `calc(290px / 0.18)` < width < `calc(400px / 0.18)`: infoWidth scales linearly as `0.18 * width`, so the offset cancels into a pure ratio: `min-aspect-ratio: 80/41` (from `1.6 / 0.82`).
- width ≥ `calc(400px / 0.18)`: infoWidth is pinned at 400px, so `min-width: calc(400px + 160vh)`.

This exact 3-segment query is duplicated verbatim in `frontend/src/routes/works/[slug]/+page.svelte` (`.block`, and again for `.textBlock .text` padding) and in `frontend/src/lib/components/Media.svelte` (`.single-work`, `.contain`) — deliberately inlined rather than factored into a shared Sass mixin, so each file's stylesheet reads standalone. If `--infoWidth`'s clamp values ever change, all four copies need updating together.

The old manual toggle survives as a dev-only override: `blockMode` now defaults to `null` (auto/CSS-driven) and Shift+S still forces `sticky`/`relative` via `force-sticky`/`force-relative` classes, alternating forever once triggered (no way back to auto without a reload).
