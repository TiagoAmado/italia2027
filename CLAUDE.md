# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single self-contained HTML file (`Roteiro_Italia_Interativo.html`) — an interactive day-by-day itinerary for a honeymoon trip through Italy (Roma → Sorrento → Florença → Bologna → Veneza → Roma, 22/3–5/4). No build step, no dependencies beyond two Google Fonts loaded via CDN link, no package.json. Open the file directly in a browser to run it.

## Development

There is no build/lint/test tooling. To work on this:
- Edit `Roteiro_Italia_Interativo.html` directly and open it in a browser to check changes.
- All CSS is in the `<style>` block in `<head>`; all markup is generated at runtime by the `<script>` block at the bottom — there is very little static HTML in `<body>` (just the shell: header, view-toggle buttons, `#dayNav`, `#dayView`, legend).

## Architecture

**Everything is data-driven from one array: `DAYS`.** Each entry describes one day of the trip (date, weekday, city, title, hotel, per-day budget, and an `items` array of time-stamped activities). To edit the itinerary content (add a day, change a price, fix a time), edit `DAYS` — there is no separate data file.

**Rendering**: two view modes toggled by `mode` (`'byday'` | `'summary'`), driven by `setMode()`:
- `renderNav()` + `renderDay()` — day-by-day view. `active` (index into `DAYS`) tracks the selected day. `renderDay()` builds the "boarding pass" card for `DAYS[active]`, iterating `day.items` to build each row.
- `renderSummary()` — trip-wide budget overview plus a clickable list of all days (built with real DOM nodes, not `innerHTML`, specifically to keep click handlers bound correctly per index — see the comment in that function).

**City theming**: `CITY_COLORS` maps each `city` key (`voo`, `roma`, `sorrento`, `firenze`, `bologna`, `ferrari`, `venezia`) to an accent color pair. Colors are applied by setting CSS custom properties (`--accent-city`, `--accent-city-soft`) on the view container at render time — the stylesheet itself only references these vars with fallbacks, it has no per-city rules.

**Per-item links** are *derived*, not stored in the data:
- `getLinksFor(item)` — matches substrings in `item.a` (activity name) or `item.tr` (transport) against hardcoded lookup tables (`HOTELS`, `ATTRACTIONS`, transport-operator keyword checks) to produce official ticket/booking links.
- `getMapsLinksFor(item, day)` — builds Google Maps search links, with special-casing for check-in/checkout (uses `HOTEL_ADDRESSES` for an exact address) and for "A → B" transit legs (one pin per endpoint).
- Both are called in `renderDay()` and merged into one link list per item; if empty, the row isn't expandable (no chevron, `cursor:default`).

**Adding a new activity type/keyword** that should auto-link: add an entry to `ATTRACTIONS` (or a new keyword branch) in `getLinksFor`, or to `HOTEL_ADDRESSES`/`HOTELS` if it's a new hotel.

**Styling conventions**: CSS custom properties in `:root` define the base palette (`--paper`, `--ink`, `--accent`, etc.); city accent vars override per-view. Fonts: `Fraunces` (serif, headings), `Inter` (body), `IBM Plex Mono` (labels, times, prices, dates) — the mono/serif/sans split is a deliberate part of the "travel document" visual identity and should be preserved when adding new UI elements.
