/**
 * TILDA "atlas_generalized_bikelanes" — bike-routing categories.
 *
 * Source: https://tiles.tilda-geo.de/atlas_generalized_bikelanes/{z}/{x}/{y}
 * Vector source-layer: `bikelanes`. The `category` value lives inside the
 * `meta` (jsonb) tile property — see `getCategory()`.
 *
 * Relevance rule for the Z721 (Grünpfeil für den Radverkehr) check — see
 * docs/tilda-bikelanes.md for the full reasoning:
 *
 *   A category is RELEVANT (drawn solid) when it represents a form of bicycle
 *   guidance that is straßenbegleitend or fahrbahngebunden at a junction
 *   approach and is therefore directly addressed by VwV-StVO XI/XII
 *   (Radführungsform, the Z240 / Z241 / Z239+1022-10 cases, the on-carriageway
 *   strips of XII.4) — or the Querung the right-turn movement actually uses.
 *
 *   It is NOT RELEVANT (drawn dashed) when it is a standalone path
 *   (`_isolated`, selbstständig geführt, not part of the road junction), a
 *   non-junction context (Spielstraße, Fußgängerzone, reiner Mischverkehr) or a
 *   meta / unclear placeholder.
 */

/** TileJSON endpoint (also serves the {z}/{x}/{y} template + bounds). */
export const TILDA_TILEJSON = 'https://tiles.tilda-geo.de/atlas_generalized_bikelanes'
export const TILDA_SOURCE_LAYER = 'bikelanes'
export const TILDA_ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a>; <a href="https://tilda-geo.de">tilda-geo.de</a>'

/** atlas_bikelanes source id (10) for the TILDA feature deeplink (`f` param). */
const TILDA_SOURCE_ID = 10
/** Data config that makes the bikelanes layer visible on tilda-geo.de. */
const TILDA_CONFIG = '1p2va4k.7h3d.jz6rk'

export type Bikelane = { label: string; relevant: boolean }

export const BIKELANE_CATEGORIES: Record<string, Bikelane> = {
  // Fahrradstraßen — distinct routing form at the approach
  bicycleRoad: { label: 'Fahrradstraße', relevant: true },
  bicycleRoad_vehicleDestination: { label: 'Fahrradstraße mit Anlieger/Kfz frei', relevant: true },

  // Querungen — the right-turn movement crosses these
  crossing: { label: 'Straßenquerung', relevant: true },
  cycleway_crossing: { label: 'Straßenquerung (Radverkehr)', relevant: true },

  // Straßenbegleitende Radwege
  cycleway_adjoining: { label: 'Radweg (straßenbegleitend)', relevant: true },
  cycleway_adjoiningOrIsolated: {
    label: 'Radweg (straßenbegleitend oder selbstständig; unklar)',
    relevant: true,
  },
  cycleway_isolated: { label: 'Radweg, selbstständig geführt', relevant: false },
  cyclewayLink: { label: 'Radweg-Verbindungsstück', relevant: true },

  // Fahrbahngebundene Streifen — direkt einschlägig (u. a. XII.4)
  cyclewayOnHighway_advisory: { label: 'Schutzstreifen', relevant: true },
  cyclewayOnHighway_advisoryOrExclusive: {
    label: 'Radfahrstreifen oder Schutzstreifen (unklar)',
    relevant: true,
  },
  cyclewayOnHighway_exclusive: { label: 'Radfahrstreifen', relevant: true },
  cyclewayOnHighwayBetweenLanes: {
    label: 'Radfahrstreifen in Mittellage (Fahrradweiche)',
    relevant: true,
  },
  cyclewayOnHighwayProtected: { label: 'Geschützter Radfahrstreifen (PBL)', relevant: true },

  // Getrennter Geh-/Radweg (Z241)
  footAndCyclewaySegregated_adjoining: {
    label: 'Getrennter Rad- und Gehweg, straßenbegleitend',
    relevant: true,
  },
  footAndCyclewaySegregated_adjoiningOrIsolated: {
    label: 'Getrennter Rad- und Gehweg (straßenbegleitend oder selbstständig; unklar)',
    relevant: true,
  },
  footAndCyclewaySegregated_isolated: {
    label: 'Getrennter Rad- und Gehweg, selbstständig geführt',
    relevant: false,
  },

  // Gemeinsamer Geh-/Radweg (Z240) — Ausschlussfall XII.2 b
  footAndCyclewayShared_adjoining: {
    label: 'Gemeinsamer Geh- und Radweg, straßenbegleitend',
    relevant: true,
  },
  footAndCyclewayShared_adjoiningOrIsolated: {
    label: 'Gemeinsamer Geh- und Radweg (straßenbegleitend oder selbstständig; unklar)',
    relevant: true,
  },
  footAndCyclewayShared_isolated: {
    label: 'Gemeinsamer Geh- und Radweg, selbstständig geführt',
    relevant: false,
  },

  // Gehweg, Rad frei (Z239 + 1022-10) — Ausschlussfall XII.2 b
  footwayBicycleYes_adjoining: {
    label: 'Gehweg mit Radfahrer frei, straßenbegleitend',
    relevant: true,
  },
  footwayBicycleYes_adjoiningOrIsolated: {
    label: 'Gehweg mit Radfahrer frei (straßenbegleitend oder selbstständig; unklar)',
    relevant: true,
  },
  footwayBicycleYes_isolated: {
    label: 'Gehweg mit Radfahrer frei, selbstständig geführt',
    relevant: false,
  },

  // Bussonderfahrstreifen — fahrbahngebunden
  sharedBusLaneBikeWithBus: {
    label: 'Radfahrstreifen mit Freigabe Busverkehr',
    relevant: true,
  },
  sharedBusLaneBusWithBike: {
    label: 'Bussonderfahrstreifen mit Fahrrad frei',
    relevant: true,
  },

  // Nicht einschlägig für die Z721-Knotenpunktprüfung
  livingStreet: { label: 'Verkehrsberuhigter Bereich (Spielstraße)', relevant: false },
  pedestrianAreaBicycleYes: { label: 'Fußgängerzone, Fahrrad frei', relevant: false },
  sharedMotorVehicleLane: { label: 'Gemeinsamer Fahrstreifen (Mischverkehr)', relevant: false },
  separate_geometry: { label: 'RVA als separate Geometrie erfasst', relevant: false },
  needsClarification: { label: 'Führungsform unklar', relevant: false },
}

export const RELEVANT_CATEGORIES: string[] = Object.entries(BIKELANE_CATEGORIES)
  .filter(([, v]) => v.relevant)
  .map(([k]) => k)

/**
 * MapLibre filter that matches the relevant categories. `category` lives inside
 * the `meta`/`tags` jsonb string in the tile, so we match it both as a (possible)
 * top-level property and as a substring of the json.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function relevantBikelaneFilter(): any {
  const haystack = ['concat', ['coalesce', ['get', 'meta'], ''], ['coalesce', ['get', 'tags'], '']]
  return [
    'any',
    ['in', ['get', 'category'], ['literal', RELEVANT_CATEGORIES]],
    ...RELEVANT_CATEGORIES.map((c) => ['>=', ['index-of', `"category":"${c}"`, haystack], 0]),
  ]
}

export function bikelaneLabel(category: string | undefined): string {
  if (!category) return 'Unbekannte Kategorie'
  return BIKELANE_CATEGORIES[category]?.label ?? category
}

export function isRelevantCategory(category: string | undefined): boolean {
  return !!category && (BIKELANE_CATEGORIES[category]?.relevant ?? false)
}

/** Read the bikelane `category` from a tile feature (it is nested in `meta`). */
export function getCategory(props: Record<string, unknown> | undefined | null): string | undefined {
  if (!props) return undefined
  if (typeof props.category === 'string') return props.category
  for (const key of ['meta', 'tags'] as const) {
    const raw = props[key]
    if (typeof raw === 'string') {
      try {
        const obj = JSON.parse(raw)
        if (typeof obj?.category === 'string') return obj.category
      } catch {
        /* ignore */
      }
    } else if (raw && typeof raw === 'object' && typeof (raw as { category?: unknown }).category === 'string') {
      return (raw as { category: string }).category
    }
  }
  return undefined
}

function fix6(n: number): string {
  return Number(n.toFixed(6)).toString()
}

/**
 * Build a deeplink to tilda-geo.de that highlights this bikelane feature.
 * Format per FixMyBerlin/tilda-geo docs:
 *   f = <sourceId>|<osmType/osmId>|<minLng>|<minLat>|<maxLng>|<maxLat>
 */
export function buildTildaDeeplink(osmId: string, bbox: [number, number, number, number]): string {
  const [minLng, minLat, maxLng, maxLat] = bbox
  const cLat = fix6((minLat + maxLat) / 2)
  const cLng = fix6((minLng + maxLng) / 2)
  const f = [TILDA_SOURCE_ID, osmId, fix6(minLng), fix6(minLat), fix6(maxLng), fix6(maxLat)].join('|')
  return `https://tilda-geo.de/regionen/radinfra?map=16/${cLat}/${cLng}&config=${TILDA_CONFIG}&v=2&f=${f}`
}

/** OSM id of a tile feature in `way/123` form, for the TILDA deeplink. */
export function osmFeatureId(props: Record<string, unknown> | undefined | null): string | undefined {
  if (!props) return undefined
  if (typeof props.id === 'string' && props.id.includes('/')) return props.id
  const type = props.osm_type
  const id = props.osm_id
  if (id == null) return undefined
  const t = String(type).trim().toLowerCase()
  const word = t.startsWith('w') ? 'way' : t.startsWith('n') ? 'node' : t.startsWith('r') ? 'relation' : t
  return `${word}/${id}`
}
