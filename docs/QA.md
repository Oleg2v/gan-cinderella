# QA checklist — "fix every glitch" pass

The owner of the kindergarten opens this demo on an iPhone (Safari or Chrome iOS = WebKit), often in Russian. The user already reported, from a real iPhone: top bar overflowing in Russian, a sheet that could be dragged sideways, an over-wide date field, a clock that didn't move, a time pill whose digits spilled out, the clock dial changing size when the browser bars hid on scroll, and an "empty-looking" reviews block. Assume more of the same class exists. Hunt them like a picky user with a phone in hand.

## Test matrix (tools/shot.mjs, always --touch)
- 390×664 (iPhone with Safari/Chrome bars shown — the most important), 390×844, 360×640, 430×932, and 1280×800 desktop.
- --lang ru AND --lang he. Russian strings are longer: wraps, clipping, buttons wider than the screen.
- Day and night (`--time 2026-11-15T20:30`) where relevant; `--reduced`.
- Existing checkers: tools/check-page.mjs (screen-by-screen + offscreen/clipped report), tools/check-clock.mjs, tools/check-sheets.mjs, tools/check-parent.mjs, tools/check-bars.mjs, tools/check-topbar.mjs, tools/time-tour.mjs, tools/qa-tour.mjs. Write your own flow scripts under tools/tmp-<module>-*.mjs.

## Real-device glitch classes to look for
1. Layout: overlaps, clipped/cut text, text spilling out of pills/buttons, misaligned rows, uneven paddings, orphan words, cramped or huge empty gaps, elements hidden behind the fixed top bar (60px + safe area) or the bottom dock (≈68px + 22px), cards cut by the viewport bottom in sticky scenes, RTL/LTR mistakes (icons on the wrong side, arrows pointing the wrong way, punctuation at the wrong end, numbers/phones reordered).
2. iOS input zoom: any <input>/<textarea>/<select> with computed font-size < 16px makes iOS Safari zoom the page on focus. Every input must be ≥ 16px (OTP boxes, chat input, search, signature name field…).
3. Hover on touch: styles under :hover stick after a tap on iPhone (a button stays "hovered"). Put hover-only effects inside `@media (hover: hover)`.
4. Heights: never size things from window.innerHeight / 100vh / dvh on phones without thinking — mobile bars change innerHeight while scrolling (→ jumps). Prefer svh for anything that must not move; ignore resize events that only change height on touch devices.
5. Animations: only transform/opacity; no layout thrash in scroll handlers; nothing that flashes or jumps when a state changes; no animation that restarts when it shouldn't (e.g. on every view enter or language switch) or never plays; reveal-on-scroll elements must not stay invisible.
6. State bugs: open a flow → switch language mid-flow → continue; open a sheet → switch role via the dock → come back; double-tap buttons quickly (double submit, duplicated items); run the guided tour from a messy state; reset() really resets; re-opening a sheet shows a fresh state (or a deliberately kept one), never a broken mix.
7. Sheets: content never wider than the sheet; primary button visible without hunting at 390×664; sheet body scrolls, page behind does not; closing restores the page; nothing hidden under the sheet's sticky footer.
8. Copy: no leftover English/placeholder strings, no untranslated keys (a key like "pb.xx" showing on screen), no mixed languages in one view (except intentional ones like the bilingual summary), numbers/dates formatted for the language.
9. Console: zero errors/warnings in every flow.
10. Taste: anything that looks generic, unfinished, empty, or "broken-looking" even if technically working — make it intentional (but never invent facts about the real kindergarten; see CONTRACT §5).
