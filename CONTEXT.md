---
name: studio-obelo
description: Domain glossary for the studio òbelo portfolio site
---

## Background
The homepage layer — always rendered behind all other content. Contains the Info Column and the Projects grid. Never unmounts during navigation.

## Info Column
The fixed left column of the Background showing the studio description, contact email, and Instagram link. Remains visible when an Overlay is open. Clicking it while an Overlay is active dismisses the Overlay (history.back()).

## Overlay
A route that renders on top of the Background, inset from the left by `--infoColumn` so the Info Column stays visible. Routes: `/works`, `/about`.

## Fullscreen
A route that covers the entire viewport, replacing both the Background and Info Column visually. Routes: `/works/[slug]`, `/education`, `/education/[slug]`.

## Education Swiper
A single flat swiper across all education items' media, shown at `/education/[slug]`. The active education slug and image index within that education are encoded in the URL (`/education/[slug]#i=[imageIndex]`) and updated via `replaceState` on each slide settle, without triggering a page reload. Entry from the Education Grid uses the same hash format to set the initial slide.

## Toggle Navigation
Clicking a nav link whose route is already active dismisses it via `history.back()` rather than navigating to `/`.
