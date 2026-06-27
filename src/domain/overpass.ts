import osmtogeojson from 'osmtogeojson'
import type { Feature, FeatureCollection, LineString } from 'geojson'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export type WayFeature = Feature<LineString, Record<string, unknown>>

/**
 * Load highway + railway ways around a point so the user can pick the "von" and
 * "nach" ways of the right-turn movement.
 */
export async function fetchWays(
  lng: number,
  lat: number,
  radius = 90,
  signal?: AbortSignal,
): Promise<WayFeature[]> {
  const query = `[out:json][timeout:25];
(
  way["highway"](around:${radius},${lat},${lng});
  way["railway"~"tram|rail|light_rail|subway"](around:${radius},${lat},${lng});
);
out geom;`

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    signal,
  })
  if (!res.ok) throw new Error(`Overpass ${res.status}`)
  const json = await res.json()
  const gj = osmtogeojson(json) as FeatureCollection

  return gj.features.filter(
    (f): f is WayFeature =>
      f.geometry?.type === 'LineString' &&
      (f.properties?.highway != null || f.properties?.railway != null),
  )
}

export type TrafficSignal = { id: string; lng: number; lat: number }

/** Load traffic-signal nodes within a bounding box (current map view). */
export async function fetchTrafficSignals(
  bounds: { south: number; west: number; north: number; east: number },
  signal?: AbortSignal,
): Promise<TrafficSignal[]> {
  const { south, west, north, east } = bounds
  const query = `[out:json][timeout:25];
node["highway"="traffic_signals"](${south},${west},${north},${east});
out;`

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    signal,
  })
  if (!res.ok) throw new Error(`Overpass ${res.status}`)
  const json = await res.json()
  return (json.elements ?? [])
    .filter((e: { type: string; lon?: number; lat?: number }) => e.type === 'node' && e.lon != null)
    .map((e: { id: number; lon: number; lat: number }) => ({
      id: `node/${e.id}`,
      lng: e.lon,
      lat: e.lat,
    }))
}

export function wayLabel(f: WayFeature): string {
  const p = f.properties ?? {}
  const name = (p.name as string) || (p.ref as string)
  const kind = (p.highway as string) || (p.railway as string) || 'way'
  return name ? `${name} (${kind})` : kind
}
