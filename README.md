# Grünpfeil-Planer (Zeichen 721 · Radverkehr)

A single-page web app that guides a traffic authority / planner through the legal check for
installing a **Grünpfeil für den Radverkehr (Zeichen 721)** at one intersection approach
(*Knotenpunktzufahrt*), per **VwV-StVO Abschnitt XII** (which references XI).

It is a **guided, icon-driven checklist**:

1. **Prüf-Ort & Geometrie** — click the traffic signal (LZA), then pick the "von" and "nach" OSM
   ways (loaded live from Overpass) that define the right-turn movement.
2. **Checkliste** — work each legal criterion. Most are evidenced by a **Mapillary** street-level
   image (place a pin → browse coverage filtered to the last 2 years, +1 year → pick a view →
   capture it); geometric criteria (Gleise, Fahrstreifen, Radführung, Warteflächen) are drawn on
   the map. Each step has one icon, used identically in the task list and on the map.
3. **Ergebnis** — a computed verdict (zulässig / bedingt / unzulässig) with the triggering criteria.
4. **Bericht** — a print-styled report (verbatim legal text + answers + captured images + map +
   an Anordnungs-*Lückentext*); "Drucken → Als PDF speichern".

## Everything lives in the URL

The complete check is encoded in the URL search params (TanStack Router `validateSearch` + Zod;
drawn geometry is lz-compressed). Copy the link to share or reproduce a check exactly — including
the precise Mapillary viewpoints. Captured PNG screenshots are a derived cache in IndexedDB
(regenerable from the URL).

## Tech

Vite + React 19 + TypeScript · TanStack Router + Query · `react-map-gl/maplibre` (OpenFreeMap) ·
`mapillary-js` · Zod · Tailwind · Vitest · oxlint · Bun.

## Setup

```bash
bun install
cp .env.example .env   # add a Mapillary token (or paste one at runtime in the app)
bun run dev
```

A **Mapillary client access token** is required to load imagery — get one at
<https://www.mapillary.com/dashboard/developers>. Set `VITE_MAPILLARY_TOKEN` or paste it in the app.

## Scripts

- `bun run dev` — dev server
- `bun run test` — Vitest (domain logic: `evaluate`, `geoParam`)
- `bun run typecheck` · `bun run lint` · `bun run build`

## Layout

- `src/domain/` — single sources of truth: `steps.ts` (the checklist config that drives UI + map +
  evaluation + report), `doc.ts` (URL schema), `evaluate.ts` (verdict), `legalText.ts`,
  `geoParam.ts`, `mapillary.ts`, `overpass.ts`.
- `src/routes/` — `index`, `ort`, `pruefung`, `ergebnis`, `bericht`.
- `src/components/` — `MapCanvas`, `MapillaryPanel`, `TaskList`, `StepIcon`, `VerdictBadge`,
  `ReportImage`, `TokenGate`, …
