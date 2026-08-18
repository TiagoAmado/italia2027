# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive day-by-day itinerary for a honeymoon trip through Italy (Roma → Sorrento → Florença → Bologna → Veneza → Roma, 22/3–5/4/2027). Static site, no build step, no dependencies beyond two Google Fonts loaded via CDN link, no package.json. Installable as a PWA with offline support. Published via GitHub Pages at `tiagoamado.github.io/italia2027/`.

## Files

- `index.html` — shell only: meta tags (manifest, theme-color, OG, favicon), the anti-flash inline theme script (must stay inline — see Theming below), font links, and the static markup skeleton (header, view-toggle buttons, empty `#dayNav`/`#dayView` containers, legend).
- `styles.css` — all CSS.
- `data.js` — pure data, loaded before `app.js`: `DAYS`, `CITY_COLORS`, `HOTEL_ADDRESSES`, `HOTELS`, `ATTRACTIONS`, `TRIP_YEAR`, `EXCHANGE_RATE`, `FIXED_COSTS_BRL`.
- `app.js` — all rendering/interaction logic, loaded after `data.js` (relies on its globals — both are classic `<script src>` tags, not modules, so this stays a script-order requirement).
- `manifest.json`, `sw.js`, `icons/icon.svg` — PWA: installability + offline caching of the app shell.

There is no build/lint/test tooling. Edit the relevant file directly and open `index.html` in a browser (or via a local server — `sw.js` registration silently no-ops on `file://`) to check changes.

## Architecture

**Everything is data-driven from one array: `DAYS`** (in `data.js`). Each entry describes one day of the trip (date, weekday, city, title, hotel, per-day budget, and an `items` array of time-stamped activities). Each priced item also carries a `cat` field (`'transporte' | 'comida' | 'atracao'`) — see Budget below. To edit itinerary content, edit `DAYS` directly.

**Rendering**: two view modes toggled by `mode` (`'byday'` | `'summary'`), driven by `setMode()` in `app.js`:
- `renderNav()` + `renderDay()` — day-by-day view. `active` (index into `DAYS`) tracks the selected day. `renderDay()` builds the "boarding pass" card for `DAYS[active]`, iterating `day.items` to build each row.
- `renderSummary()` — trip-wide budget overview plus a clickable list of all days (built with real DOM nodes, not `innerHTML`, specifically to keep click handlers bound correctly per index — see the comment in that function).
- `goToDay(i)` is the single shared entry point for changing the active day (used by nav-stub clicks, swipe gestures, and the summary card list) — always route new "jump to day N" behavior through it rather than duplicating the `active=i; renderNav(); renderDay(); persistState();` sequence.
- Every render triggered by `setMode()`/`goToDay()` is wrapped in `transitionView()`, which fades `#dayView` via a `.view-fade` CSS class (respects `prefers-reduced-motion` through the existing global rule).

**City theming**: `CITY_COLORS` maps each `city` key (`voo`, `roma`, `sorrento`, `firenze`, `bologna`, `ferrari`, `venezia`) to an accent color pair. Colors are applied by setting CSS custom properties (`--accent-city`, `--accent-city-soft`) on the view container at render time — the stylesheet itself only references these vars with fallbacks, it has no per-city rules.

**Light/dark theming**: controlled by a `data-theme` attribute on `<html>` (`"light"` | `"dark"`), not bare `prefers-color-scheme` — this lets the user override the system setting via the theme-toggle button (auto/claro/escuro cycle, persisted in `localStorage`). A small inline script at the very top of `index.html`'s `<head>` sets `data-theme` synchronously before first paint, based on the stored preference and/or `matchMedia`; **this script must stay inline** (not moved to `app.js`) or the theme flash it exists to prevent comes back. `styles.css` defines the light palette on bare `:root` and overrides it under `:root[data-theme="dark"]`.

**Budget**: `FIXED_COSTS_BRL` in `data.js` only has `passagens` now (not itemized per-day, no other source to derive it from). Hotéis/Trens/Alimentação/Atrações/Seguro in "Orçamento geral" are all *computed*, not hand-typed. Hotéis comes from `hotelNightsSummary()` (counts nights per hotel from the `"Dormindo no X (Y)"` pattern in each `day.end`, multiplies by `HOTEL_PRICES_EUR[X]`) — the same total feeds both the "Hotéis selecionados" card and the "Hotéis" line of "Orçamento geral", so they can never drift apart. Trens/Alimentação/Atrações: `categorySumsEUR()` sums `parseEuroMin(item.p)` per `item.cat` across all of `DAYS`, then converts to BRL via `EXCHANGE_RATE`. `parseEuroMin` takes the *minimum* of any `€X,XX` values found in a price string (handles "Ferry a confirmar / Ônibus ~€5,00"-style dual-option items) and returns `0` for non-numeric text (`grátis`, `a confirmar`, `incluso`, `a definir`) — this matches how each day's `budget` field was originally hand-tallied, verified to sum exactly. When adding a new priced item, set `cat` to keep this in sync automatically; don't hand-edit the summary table. Seguro/eSIM/misc. is `INSURANCE_MISC_ITEMS_BRL` in `data.js` — a small list of individually-estimated items (seguro viagem, eSIM, imprevistos), summed; not tied to any day/city since they're bought before the trip. Because every category is now a real computed number (no more manual min/max), "Total estimado" is a single value, not a range.

**Categorias expansíveis do Orçamento geral**: cada linha de `renderSummary()` (exceto "Total estimado") é clicável e mostra a lista de itens por trás do número — mesmo padrão de expand/collapse dos itens do dia (`.budget-row-wrap`/`.budget-row-detail`/`.chev` em vez de `.item`/`.item-expand`/`.chev`, mas o mecanismo de toggle de classe é idêntico). `categoryItems(catName)` (`app.js`) itera `DAYS` igual a `categorySumsEUR()`, só que guarda os itens (com `d`/`cityLabel`) em vez de só somar — use-a pra qualquer nova categoria expansível. Passagens lista os 2 voos (sem preço individual, é pago em conjunto); Hotéis reaproveita `hotelNightsSummary()`; Seguro lista `INSURANCE_MISC_ITEMS_BRL` sem dia/cidade.

**Per-item links** are *derived*, not stored in the data:
- `getLinksFor(item)` — matches substrings in `item.a` (activity name) or `item.tr` (transport) against lookup tables (`HOTELS`, `ATTRACTIONS` in `data.js`, transport-operator keyword checks) to produce official ticket/booking links.
- `getMapsLinksFor(item, day)` — builds Google Maps search links, with special-casing for check-in/checkout (uses `HOTEL_ADDRESSES` for an exact address) and for "A → B" transit legs (one pin per endpoint).
- Both are called in `renderDay()` and merged into one link list per item; a row is expandable (chevron, `cursor:pointer`) if it has links *or* an `item.desc` — if neither, no chevron and `cursor:default`.
- **Adding a new activity/hotel that should auto-link**: add an entry to `ATTRACTIONS`/`HOTELS`/`HOTEL_ADDRESSES` in `data.js`.

**Per-item description** (`item.desc`, optional): a short personalized note — written for us specifically (can we go, do we need to prep/reserve, what to expect) — shown inside the same expandable panel as the links, above them. Unlike links, `desc` is hand-written per item in `data.js`, not derived. Rendered in `renderDay()` inside `.item-expand` alongside `.item-links`; the two share one expand/collapse toggle on the row.

**Calendar export**: `buildICS(days)` in `app.js` generates an `.ics` string from `DAYS`, parsing each item's `t` (time) field via `parseItemTimes()` — handles both `"HH:MM–HH:MM"` ranges and single `"HH:MM"` times (falling back to `parseDurationMinutes(item.dur)` or a 60-min default for the end time); non-parseable times (`"Manhã"`, etc.) are skipped. Used by both the per-day export button and the whole-trip export in the summary view.

**Sharing**: `shareDay()` uses `navigator.share()` only when `location.protocol` is `http(s):` — calling the Web Share API on a `file://`-loaded page crashes the entire Chrome process (`RESULT_CODE_KILLED_BAD_MESSAGE`, a browser-level IPC crash that no JS try/catch can prevent), so the protocol is checked *before* attempting the call, not just guarded with try/catch. Falls back to clipboard copy, then `window.prompt`.

**Icons**: `icon(name)` in `app.js` returns inline SVG markup (thin stroke, `currentColor`) from the `ICON_SVG` map — used via `innerHTML`, not `textContent`, everywhere an icon appears next to text. No emoji in the UI; add new icons to `ICON_SVG` rather than reaching for an emoji character.

**Responsive layout**: single column with a horizontally-scrolling day nav below ~900px; above that, `styles.css` turns `.app` into a CSS grid with the day nav as a sticky left sidebar (`grid-template-areas`, see the `@media (min-width:900px)` block). The nav must stay in the DOM and occupy its grid column even when hidden in summary mode (`:root[data-mode="summary"] nav.days` — `display:none` below the breakpoint to collapse the space, but only `visibility:hidden` above it) or the content column jumps sideways when switching modes. `mode` is mirrored onto `<html data-mode="...">` by `setMode()` specifically so CSS can key off it. Centering `.app` uses `body{display:flex; justify-content:center; align-items:flex-start}` rather than `margin:auto` — `align-items:flex-start` is load-bearing: the default `stretch` forces `.app` to viewport height, which then makes CSS Grid's implicit `auto` row tracks distribute that extra space across all rows (inflating the toggle buttons and day chips well beyond their content size).

**Print**: `@media print` in `styles.css` hides interactive chrome (nav, toggle buttons, icsbtn/share buttons), forces all `.item-links` visible, and avoids page breaks inside a `.pass` card.

**Offline/PWA**: `sw.js` cache-first serves the app shell (`index.html`, `styles.css`, `data.js`, `app.js`, `manifest.json`) and stale-while-revalidates the Google Fonts requests. **Bump `CACHE_NAME` in `sw.js` whenever any app-shell file changes** — otherwise users with the PWA already installed keep serving the stale cached version indefinitely.
