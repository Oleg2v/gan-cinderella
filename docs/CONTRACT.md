# Gan Cinderella demo — module contract

Read `docs/BRIEF.md` first (the client brief). This file is how the codebase is built. Core is done; you build ONE module.
Bar: an Awwwards-level kindergarten demo that a kindergarten owner opens from a WhatsApp link on a mid-range Android phone (390px) and says "wow". Every button works. Smooth at 60fps.

## 1. Files and build

```
src/shell.html               page skeleton (top bar, dock, views, tour UI)       — core, DO NOT EDIT
src/core/core.css            tokens + components                                 — core, DO NOT EDIT
src/core/core.js             window.App runtime                                  — core, DO NOT EDIT
src/core/icons.svg           <symbol id="i-*"> sprite                            — core, DO NOT EDIT
src/modules/<name>/<name>.html   your markup (injected inside <div data-module="<name>">)
src/modules/<name>/<name>.css    your styles
src/modules/<name>/<name>.js     your script (wrapped in an IIFE + try/catch by the build)
build.mjs                    `node build.mjs` → index.html (+ dist/artifact.html)
tools/shot.mjs               Playwright screenshots/flows (see §9)
tools/contrast.mjs           `node tools/contrast.mjs "#fg" "#bg"`
```
You may ONLY create/edit files inside `src/modules/<your module>/` (and scratch files under `shots/` or `tools/tmp-<module>-*`). Never edit core or another module. If core lacks something, implement it inside your module and mention it in your final report.

Modules and owners:
| module | view (dock) | root div | CSS/ID/i18n prefix |
|---|---|---|---|
| `pubTop` | `visitors` (מבקרים חדשים) — top half | `[data-module="pubTop"]` | `pt-` / `pt.` |
| `pubBottom` | `visitors` — rest of the public site + footer | `[data-module="pubBottom"]` | `pb-` / `pb.` |
| `parent` | `parents` (הורים) | `[data-module="parent"]` | `pa-` / `pa.` |
| `staff` | `staff` (צוות) | `[data-module="staff"]` | `st-` / `st.` |
| `owner` | `owner` (הנהלה) | `[data-module="owner"]` | `ow-` / `ow.` |

Every class, id, CSS custom property, keyframe name and i18n key you create starts with your prefix. Exception: pubBottom owns these public anchors: `#kids-world`, `#recognized`, `#availability`, `#visit`, `#register`, `#reviews`, `#contact`. pubTop owns `#hero`, `#clock`.

No literal `</script` inside JS (build fails). No external images/fonts/scripts beyond what core loads. All art is inline SVG (or canvas) you write.

## 2. Module API

```js
App.module('parent', {
  view: 'parents',
  i18n: { he: { 'pa.title': 'שלום, משפחת ...' }, ru: { 'pa.title': '...' } },
  init(root) {},        // once at boot; root = your [data-module] div. Bind events here.
  onEnter() {},         // your view became visible (after the pixie transition swap). Start loops, refresh layout.
  onLeave() {},         // your view is being hidden. Stop rAF loops / timers.
  reset() {},           // return to the initial demo state (used by the guided tour)
  tour: { login: async (ctx) => {}, ... },   // guided tour steps, see §8
  // + any public methods other modules may call (documented in §7)
});
```
Get another module: `App.mod('pubBottom')`. Boot order: all modules registered → `init` each → i18n applied → `onEnter` for the starting view. `init` runs even if your view is hidden (it is `hidden`/display:none — measure layout in `onEnter`, not `init`).

## 3. Core runtime (window.App) — what you can use

- DOM: `App.$(sel, root)`, `App.$$(sel, root)` (array), `App.h(htmlString)` → element, `App.esc(str)`, `App.icon(name, extraClass)` → `<svg class="ic ..."><use href="#i-name"/></svg>` string.
- Math: `App.clamp, App.lerp, App.rand, App.pick, App.sleep(ms)`.
- i18n: `App.t(key, {vars})`, `App.L({he, ru})` picks current language, `App.i18n.lang` ('he'|'ru'), `App.i18n.apply(el)` (call after inserting markup that has `data-i18n*`), `App.on('lang', fn)` to re-render dynamic text.
  - Markup: `<span data-i18n="pa.hello">שלום</span>` (textContent), `data-i18n-html="key"` (innerHTML, trusted strings only), `data-i18n-attr="aria-label:pa.x; placeholder:pa.y"`.
  - Always put the Hebrew text inline too (first paint + no-JS).
- Format: `App.fmt.time(date)` "07:48", `App.fmt.date(date, intlOpts)`, `App.fmt.weekday(date, long)` (א׳ / пн), `App.fmt.num(n)`, `App.fmt.money(n)` "₪1,234", `App.fmt.pct(n)`.
- Data (fictional, shared — use it so names/faces match across views):
  - `App.data.kids` — 14 kids of group בוגרים: `{id, he, ru, lang:'he'|'ru' (parents' language), allergies?:['peanuts'], birthdayTomorrow?, look}`. Ids: noa, itai (peanut allergy), daniel (Russian-speaking family), maya, yonatan, tamar (sesame), misha, lia, omer, sofia (milk), ariel, shira, eitan (birthday tomorrow), alisa.
  - `App.data.kid(id)`, `App.kidName(kidOrId)` (localized), `App.data.groups` (baby/young/big with he/ru names), `App.data.allergens` (`{peanuts:{he,ru}, ...}`), `App.data.trusted.noa / .daniel` — trusted pick-up adults with `look`.
- Avatars: `App.avatar(kidOrAdultOrLook, {label})` → SVG string (round, illustrated, consistent). `App.avatarEl(who, sizePx)` → `<span class="av">`. Looks: `{skin:0-4, hair:'short'|'buzz'|'curly'|'pigtails'|'bun'|'bob'|'long', hc:0-6, bg:0-5, shirt:'#hex', bow, glasses, beard, adult, senior}`. `App.SHIRTS` palette.
- FX (canvas over everything, auto-disabled with reduced motion): `App.fx.burst(x, y, {count, colors:['magenta','pink','gold','white','blue','sky'], speed:[min,max], size:[min,max], life:[ms,ms], gravity, angle, spread})`, `App.fx.burstAt(el, opts)`, `App.fx.trail(x,y)`, `App.fx.ring(x,y,r,n)`, `App.fx.rain(n)`. Use bursts for "sent!/done!" moments — that's the signature micro-delight. Don't overuse.
- Sparkle trail: add `data-sparkle-zone` to an element → touch drags inside it leave sparkles (mouse leaves sparkles everywhere already).
- Magnetic: add `data-magnetic` (optional strength `data-magnetic=".35"`) to buttons → pulled by the cursor on desktop.
- Reveal: `data-reveal` (or `="scale"|"fade"`, delay via `style="--d:120ms"`) → animates in when scrolled into view. Call `App.reveal(el)` after inserting new markup. Count-up: `<span data-count="42" data-suffix="%">0</span>` inside a revealed element, or `App.countUp(el, to, {duration, prefix, suffix, decimals})`.
- Scroll: `App.scrollTo(yOrElOrSelector, {offset=76, center, duration, linear})` → Promise (Lenis-aware). `App.onScroll(fn(y))` → unsubscribe fn (rAF-batched). `App.progress(el)` → 0..1 progress of a tall element through the viewport (for sticky scenes). `App.scrollY()`.
- UI:
  - `App.ui.sheet({title | titleKey, content: Node|html, size:'md'|'full', className, onClose, hideTitle, focus})` → `{el, body, close(), setTitle(), setContent()}`. Bottom sheet on phone (drag to close), centered dialog ≥760px. Focus trap, Esc, scroll lock, `data-lenis-prevent` already handled. Use it for every modal/flow. Sheets close automatically when the view changes.
  - `App.ui.toast(text | {he,ru}, {icon:'check-circle', tone:'ok'})`.
  - `App.ui.phone({time:'17:30', date:{he,ru}, light:false, notifs:[{title,text,time,icon}], size:260, max:3})` → `.phone` element with `.notify(n)` (animated lock-screen notification), `.setTime('17:30')`, `.chat({title, avatar, messages:[{text, out, time}]})` → chat view with `.add({text,out,time})` (neutral messenger bubbles — NOT WhatsApp look). Phones are the hero device of "message sent" moments.
  - `App.ui.logo()` → logo markup; or put `<span class="brand__logo" data-logo></span>` (any size via style) and call `App.ui.fillLogos(root)`. The real logo file is inlined by the build when present; until then a neutral placeholder shows. Never draw a logo yourself.
  - `App.ui.statement()` opens the accessibility statement (footer link).
- Views: `App.go('parents', {origin: element})` switches role with the pixie-dust transition. `App.state.view`.
- Events: `App.on(evt, fn)` / `App.emit(evt, data)`. Core emits `lang`, `view`, `motion`, `tour:start`, `tour:stop`, `ready`. Cross-module events you may emit/listen: `staff:endday` (staff sent summaries), `parent:message` ({text, lang}) etc. — optional sugar.
- Motion: `App.motion.reduced` (true when the OS asks or the a11y menu "stop animations" is on). Listen `App.on('motion', reduced => ...)`. `App.isTouch`, `App.isFine`. `App.haptic(ms)`.
- GSAP 3.12.5 core is loaded as global `gsap` (no plugins — no ScrollTrigger). Always guard: `if (window.gsap) ... else` set the final state directly. Lenis is managed by core (desktop only); never instantiate it.

## 4. Design system (use it — consistency across 5 modules is the whole game)

Tokens (core.css `:root`): `--magenta #E8048C` (decor + text ≥24px only), `--magenta-600 #D1037D` (fills under white text), `--magenta-700 #A3026A` (magenta text on white/sky), `--blue #01AEF2` (decoration ONLY, never text, never under white text), `--blue-700 #0270A8` (links), `--pink #F6B0C6`, `--sky #D0EDFD`, `--blush #F3CFDF`, `--paper #FFFAFC` (page ground), `--mist #F4F9FE`, `--ink #1B1A4B` (text), `--ink-2 #4A4873` (secondary; OK on white/sky/blush/pink), `--ink-3 #6B6990` (tertiary; ONLY on white/paper/mist), `--night #12164A`, `--night-2 #252B78`, `--gold #FFD27A` (stars, lit windows), semantic `--ok/--ok-bg`, `--warn/--warn-bg`, `--danger/--danger-bg`, `--line`, `--line-2`, shadows `--shadow-1/2/3`, radii `--r-xs..--r-xl, --r-pill`, `--font-display` (Fredoka for he, Nunito for ru — switches automatically), `--font-body` (Rubik), sizes `--fs-2xs..--fs-3xl, --fs-hero`, easing `--ease-out`, `--ease-spring`, `--ease-in-out`, `--bar-h` (60px top bar), `--dock-h`, `--safe-t`, `--safe-b`.
Extra illustration hues allowed inside SVG art only: mint `#7FC8A9`, sun `#FFB547`, lilac `#9B8CE8` (sparingly), grass `#9AD9B5`, wood `#C98E4A`.

Contrast rules (AA): white text only on `--magenta-600`, `--ink`, `--night`, `--ok`, `--danger`. Never magenta text on pink/blush. Never `--ink-3` on blush/pink/sky. Check anything new with `node tools/contrast.mjs`.

Components (class names from core.css — prefer them over re-inventing):
`.wrap` (max 1120 + safe gutters), `.wrap--narrow`, `.band` / `.band--tight` (section vertical rhythm), `.stack` / `.row` (flex + `--gap`), `.grid-2`, `.grid-3`;
type: `.display`, `.h1`, `.h2`, `.h3`, `.h4`, `.lead`, `.muted`, `.subtle`, `.small`, `.tiny`, `.eyebrow` (+ `.ic` sparkle), `.section-head`, `.tnum`, `.ltr`;
buttons: `.btn` + `--primary` | `--ghost` | `--soft` | `--night`, sizes `--sm` `--xs` `--block` `--icon`; `.link-btn`; `.chip` (+`aria-pressed="true"`), `.chips`; `.seg` (segmented: buttons with `aria-pressed`/`aria-selected`);
`.tag` + `--ok|--warn|--danger|--pink|--ink`; `.demo-tag` (the "example data" marker — text `לדוגמה` / `пример`, key `core.example`);
`.card` + `--flat|--lift|--sky|--blush|--night|--arch`; `.arch-frame` (castle-window arch mask for pictures); `.rows` + `.rowi` (`__main`, `__title`, `__sub`); `.icon-bubble` + `--pink|--magenta|--night`;
forms: `.field`, `.input`, `.hint`; `.switch` (use on a `<button role="switch" aria-checked>` or a span inside it); `.progress > i` (`--p: 40%`);
`.scallop` (fairy-tale awning edge: an inline SVG strip you draw), `.phone`, `.bubble`, `.notif`, `.av`, `.typing`.
Icons: `<svg class="ic" aria-hidden="true"><use href="#i-NAME"/></svg>` — available: sparkle, sparkles, play, heart, star, dot, stop, pause, close, check, check-circle, checks, plus, minus, chevron, chevron-down, arrow, back, castle, home-heart, tablet, chart, crown, globe, a11y, clock, calendar, pin, chat, chat-text, send, camera, image, user, users, baby, lock, key, shield, doc, pen, sign, upload, card, receipt, bell, gear, bolt, flow, eye, info, alert, gift, cake, candle, plate, apple, chef, note, ball, leaf, bunny, sun, moon, sleep, diaper, drop, bandage, slipper, pumpkin, wand, flag, list, search, edit, hand, door, walk, swing, book, funnel, trend, sofa, link, external, translate, copy, refresh, tooth, sprout, whistle, hourglass, ticket. Filled ones (sparkle, sparkles, play, heart, star, dot, stop) need class `ic--fill`. Direction arrows (chevron, arrow, back) get `ic--dir` so they flip in RTL. Need another icon? Define `<symbol id="<prefix>-i-name">` inside your module HTML (24×24, stroke 2, round caps, same style).

Art direction — "storybook paper-cut":
- Flat shapes, no outlines, soft paper-cut layering (a slightly darker duplicate shape offset 2–4px under a shape gives the cut-paper shadow). Gradients only for skies/glows. Rounded everything. Small 4-point sparkles (`#i-sparkle`) are the recurring accent — gold at night, magenta/blue by day.
- Motifs: original storybook castle (chunky, rounded, toy-like — NEVER a tall cluster of spires / anything resembling the Disney castle), puffy clouds, rolling hills, a dotted magic trail, glass slipper, pumpkin carriage, clocks, stars, crescent moon. Arched "castle window" frames for pictures (`.arch-frame`). Scalloped awning edges between some bands.
- People: only the App.avatar style (round heads, dot eyes, tiny smile, blush cheeks) on simple rounded bodies. No realistic faces, no copyrighted characters, no princess character.
- Typography: display headings in `--font-display`, body Rubik. Big confident headings, short lines. `text-wrap: balance` on headings is already set.
- Layout: phone-first single column; on ≥ 900px use the width (2 columns, bigger art) — the desktop must also look great.
- Motion: purposeful, springy (`--ease-spring`), 60fps — animate only `transform` and `opacity`. One orchestrated moment per section beats many scattered effects.
- Avoid: emoji, purple-blue gradient heros, `rounded-lg` sameness, accent rails on cards, generic stock-UI look, brand logos (WhatsApp/Facebook/Google marks). Use generic icons + the words "WhatsApp", "Facebook", "Google Maps".

## 5. Copy

- Hebrew is the default and the soul of the product: natural, warm, short, spoken Israeli Hebrew. Public site addresses parents in plural (אתם). UI labels short. No bureaucratic phrasing, no ad clichés (מוביל, איכותי ביותר, חוויה בלתי נשכחת, лучший, уникальный, качественный).
- Russian: natural Israeli-Russian family tone ("вы" lowercase), short. Hebrew institution words may stay with explanation: מעון → «мэон (ясли-сад)», מנחה → «полдник», חול המועד → «холь а-моэд», הורי שבת → «шабатные родители». Days: א׳–ה׳ → вс–чт, ו׳ → пт.
- Avoid mannered devices: em-dash asides, "not X but Y", colon-reveal headlines, scare quotes.
- Fixed names: "גן סינדרלה" / «Синдерелла» (or «сад „Синдерелла“»), slogan "גן ילדים מהאגדות" / «Детский сад из сказки». Groups: `App.data.groups`.
- FACTS you may state (and nothing else about the real kindergarten): name & slogan; מעון יום for ages 0–3 (from birth to 3); מעון מוכר ומפוקח; families entitled to subsidy get a noticeable discount (never a number); address העצמאות 58, אשדוד / ул. ха-Ацмаут 58, Ашдод; WhatsApp 058-528-1292 (`https://wa.me/972585281292`) and 052-540-6093 (`https://wa.me/972525406093`); hours Sun–Thu 07:00–17:00 (extension to 18:00 possible), Fri 07:00–13:00; own kitchen, fresh food daily: breakfast, lunch, מנחה, menu approved by a dietitian; 3 clubs a week: music, sport, nature & animals (טבע-חיות); fewer vacation days than the official calendar, open during חול המועד סוכות and פסח; Facebook `https://facebook.com/Cinderellashdod`; three groups תינוקייה / צעירים / בוגרים.
- NEVER invent: prices, staff names, number of children/groups beyond the three groups, ratings, years of experience, certifications, menu items as facts, policies. Things that are illustrative (a day's timeline, menus, kids, payments, dashboards) are FICTIONAL and must be visibly marked with `.demo-tag` (`core.example`) or a short line like "נתונים לדוגמה". If a question needs an unknown fact (e.g., adaptation policy), answer warmly and route to the visit / WhatsApp.
- Contact is ONLY via WhatsApp links and forms. No phone-call buttons, no `tel:` links.

## 6. Technical rules

- RTL/LTR: use logical properties (`margin-inline-start`, `padding-inline`, `inset-inline-end`, `text-align: start`, `border-start-start-radius`...). Never hard-code left/right for flow layout. Illustrations (SVG scenes) do not need to mirror. Phone numbers, codes, URLs: wrap in `<bdi dir="ltr">` or `.ltr`. Time ranges like 07:00–17:00 may stay natural.
- Interactions: real `<button type="button">`, `<a href target="_blank" rel="noopener">` for outbound links. Toggles `role="switch" aria-checked`, chips `aria-pressed`, tabs `role="tablist"/"tab"` + `aria-selected` + `aria-controls`. Decorative SVG `aria-hidden="true"`; meaningful art `role="img" aria-label`. Live updates in an `aria-live="polite"` region. Touch targets ≥ 44px. Visible focus is global (don't remove outlines).
- Forms: handle `submit` with `preventDefault()`. Never `alert/confirm/prompt`, never `window.open`, never downloads, no camera/geo APIs (mock them). `<input type="file">` is OK for mock uploads (read nothing, just show the filename) — also offer a "use a sample file" path so it works without picking a file.
- Views other than visitors sit under the fixed top bar: start your view content with `class="view-pad-top"` (or equivalent padding `calc(var(--bar-h) + var(--safe-t) + 12px)`). The dock floats at the bottom; the view already has bottom padding.
- Fixed/floating elements you add must respect `env(safe-area-inset-*)` and not collide with the dock (`bottom: calc(var(--dock-h) + 22px + var(--safe-b))`). Hide them during the tour: `html.is-touring .your-fab { display:none }`. z-index: keep module content < 50 (top bar 50, dock 60, sheets 100+, tour 290–400, transition 500, fx 600, toasts 700).
- Performance (mid Android): animate transform/opacity only; no `filter: blur()` / `feGaussianBlur` on large areas, no `backdrop-filter` on big elements, no animated box-shadows; use IntersectionObserver to pause offscreen loops; stop loops in `onLeave`; canvas DPR ≤ 2; keep DOM reasonable. `will-change` only during animations.
- Reduced motion (`App.motion.reduced`): no parallax, no auto-playing loops, no pinned scroll scenes (render a calm static version), instant state changes. Must still be fully usable and beautiful.
- Example data: wrap invented numbers/names in a visible `.demo-tag` near them (once per card/section is enough).
- The page must never scroll horizontally at 390px. Decorative overflow: clip it inside your section (`overflow: clip` / `hidden`).
- No `localStorage` dependence (core's `App.store` is optional sugar and may return null).

## 7. Cross-module public methods (implement exactly these)

- `pubBottom.openBooking(opts?)` — opens the visit-booking sheet (day + slot → confirm → message preview). Called by the hero CTA "קביעת סיור בגן".
- `pubBottom.openEligibility()`, `pubBottom.openRegistration()`, `pubBottom.openAssistant()`.
- pubTop's hero CTA "בדיקת מקום פנוי" scrolls to `#availability` (pubBottom).
- `parent.openSummary()` optional; `owner.play(id)` plays an automation animation.

## 8. Guided tour (the "סיור בדמו" button) — your `tour` functions

Core runs the story and switches views (with the ghost finger tapping the dock). Your step function receives `ctx`:
- `await ctx.tap(elOrSelector, {after:ms, noClick})` — scrolls it into view (window or the open sheet), moves the ghost finger there, shows a tap ripple + sparkles, then `.click()`s it. Use selectors/elements that are real, clickable and visible.
- `await ctx.type(inputOrSel, 'text', {cps})` — taps the input and types it (fires `input` events).
- `await ctx.scrollTo(target, {duration, center, offset, linear})`, `await ctx.wait(ms)`, `await ctx.point(el)` (move finger, no click), `await ctx.waitFor(sel|fn, timeoutMs)`, `ctx.caption(textOr{he,ru})` (core already sets the step caption — only override for sub-captions), `ctx.check()` (throws if aborted), `ctx.signal`, `ctx.fast` (reduced motion: shorten waits), `ctx.hideFinger()`.
- Every `await` on ctx rejects with AbortError when the user stops the tour — never swallow AbortError (if you try/catch, rethrow when `e.name === 'AbortError'`).
- Steps must work from ANY state (call your own `reset()` or close sheets first) and leave no sheet open at the end. Keep within the duration budget.

Steps (module.fn — budget — what to show):
| pubTop.hero | 5s | top of page; a moment of magic (e.g. toggle night → stars → back to day, sparkle burst on the logo) |
| pubTop.clock | 12s | smooth scroll through the whole clock scene from 07:00 to the 17:00 finale; pause on finale |
| pubBottom.booking | 10s | open booking (via the hero CTA or #visit), pick a day, a slot, fill a name, confirm → confirmation + message preview; close |
| parent.login | 6s | log out if needed; type a phone, request code, code auto-fills, enter |
| parent.feed | 6.5s | scroll Noa's day feed |
| parent.summary | 9s | evening summary + phone with the 17:30 notification; switch the summary to Russian and back |
| staff.checkin | 6s | reset the day; tap 3–4 kids to mark arrival |
| staff.meal | 8s | select several kids incl. Itai, choose lunch → peanut allergy warning → confirm "הכל" |
| staff.endDay | 8s | "סיום יום" → summaries preview list → "שלח לכולם" → messages fly to parents' phones (he + ru) |
| owner.kpis | 6s | KPIs count up, funnel animates |
| owner.automations | 10s | scroll to "מאחורי הקלעים", play 2 automations (e.g. new lead, 17:30 summaries) |

## 9. Self-QA (mandatory before you finish)

1. `node build.mjs` then screenshots, e.g.
   - `node tools/shot.mjs --view parents --out shots/pa-he.png` (390×844 default) and `--full` for full page
   - `--lang ru`, `--w 1280 --h 800` desktop, `--reduced`, `--time 2026-11-15T20:30` (night), `--touch`
   - `--sel "#availability"` scrolls to an element; `--do "App.mod('parent').reset()"` runs code before the shot (repeatable, `--wait ms` after each)
   - flows: write `tools/tmp-<module>-flow.mjs` with `export default async (page, h) => { await h.click('...'); await h.wait(600); await h.shot('shots/x.png'); }` and run `node tools/shot.mjs --view parents --script tools/tmp-<module>-flow.mjs`
   - run a module's tour steps directly: `--do "const c=App.tour.ctx(new AbortController().signal); await App.mod('staff').tour.meal(c)"` (the ghost finger works without the tour UI)
2. LOOK at your screenshots (Read the PNG). Fix anything clumsy: alignment, spacing, overlaps, clipped text, wrapping, RTL mistakes, contrast. Check both languages and desktop.
3. The harness prints console errors and horizontal-overflow offenders — must be clean.
4. Run every interactive flow and every tour step at least once.
Final report (your last message): what you built (sections/flows), the public methods/tour fns implemented, anything you needed from core, known gaps. Keep it under 250 words.
