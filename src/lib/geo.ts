import nearestPointOnLine from '@turf/nearest-point-on-line'
import distance from '@turf/distance'
import { point } from '@turf/helpers'
import type { WayFeature } from '~/domain/overpass'

export type LngLat = [number, number]

/** Pick the candidate way whose geometry passes closest to the clicked point. */
export function pickNearestWay(ways: WayFeature[], at: LngLat): WayFeature | undefined {
  let best: WayFeature | undefined
  let bestDist = Infinity
  const p = point(at)
  for (const w of ways) {
    const snapped = nearestPointOnLine(w, p)
    const d = (snapped.properties.dist as number) ?? distance(p, snapped)
    if (d < bestDist) {
      bestDist = d
      best = w
    }
  }
  return best
}

/** Orient a line so its END is the vertex nearest `target` (used for "von"). */
export function orientEndToward(coords: LngLat[], target: LngLat): LngLat[] {
  if (coords.length < 2) return coords
  const t = point(target)
  const dStart = distance(point(coords[0]), t)
  const dEnd = distance(point(coords[coords.length - 1]), t)
  return dEnd >= dStart ? coords : [...coords].reverse()
}

/** Orient a line so its START is the vertex nearest `target` (used for "nach"). */
export function orientStartToward(coords: LngLat[], target: LngLat): LngLat[] {
  return orientEndToward(coords, target).slice().reverse()
}

export function reverse(coords: LngLat[]): LngLat[] {
  return [...coords].reverse()
}
