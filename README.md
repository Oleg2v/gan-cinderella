# גן סינדרלה · interactive demo

One self-contained page (`index.html`) that shows the kindergarten's public site and its management system through four entrances: new visitors, parents, staff (tablet), and the owner's dashboard with automations. Hebrew by default (RTL) with a Russian switch (LTR). All data inside the cabinets and dashboards is fictional and marked as an example.

## Open it

- Live: https://cinderella.kikkey.com (Cloudflare Worker `cinderella`, deployed with `deploy/deploy.sh`).
- `index.html` works on its own: open it in a browser or host it anywhere.
- Direct links to an entrance: `#visitors`, `#parents`, `#staff`, `#owner`. `#tour` starts the guided tour (about 88 seconds).

## Logo

Put the original logo file at `cinderella-logo.png` (repo root or `assets/`) and run `node build.mjs`. The build inlines it into the page as a data URI and shows it in a round mask everywhere. Until then a neutral text placeholder is shown; the logo is never redrawn.

## Build

```
node build.mjs            # → index.html (standalone) + dist/artifact.html (for claude.ai Artifacts)
node tools/shot.mjs --view parents --lang ru --out shots/parents-ru.png   # screenshots via Playwright
node tools/qa-tour.mjs    # runs the whole guided tour and snapshots it
```

Source layout: `src/shell.html` (page frame), `src/core/` (design tokens, components, runtime: i18n, role switcher with the pixie-dust transition, sheets, phone mocks, particles, guided-tour engine), `src/modules/<name>/` (pubTop, pubBottom, parent, staff, owner). Architecture and rules: `docs/CONTRACT.md`. Client brief: `docs/BRIEF.md`.

Libraries from CDN: GSAP 3.12.5 (cdnjs) and Lenis 1.1.13 (jsDelivr, desktop smooth scroll only). Fonts: Fredoka, Nunito, Rubik (Google Fonts).

Design and development: [Kikkey](https://kikkey.com)
