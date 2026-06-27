import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

/** Properties we attach to every drawn feature. */
export type FeatureProps = {
  /** step id this feature belongs to */
  step: string
  /** optional sub-classification (e.g. Radführungsform) */
  kind?: string
}

export type DrawFeature = Feature<Geometry, FeatureProps>
export type DrawCollection = FeatureCollection<Geometry, FeatureProps>

export const EMPTY_FC: DrawCollection = { type: 'FeatureCollection', features: [] }

/** Compress a FeatureCollection into a URL-safe string for the `geo` param. */
export function encodeGeo(fc: DrawCollection): string | undefined {
  if (!fc.features.length) return undefined
  return compressToEncodedURIComponent(JSON.stringify(fc))
}

/** Decode the `geo` param back into a FeatureCollection (never throws). */
export function decodeGeo(geo: string | undefined): DrawCollection {
  if (!geo) return { type: 'FeatureCollection', features: [] }
  try {
    const json = decompressFromEncodedURIComponent(geo)
    if (!json) return { type: 'FeatureCollection', features: [] }
    const parsed = JSON.parse(json) as DrawCollection
    if (parsed?.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
      return { type: 'FeatureCollection', features: [] }
    }
    return parsed
  } catch {
    return { type: 'FeatureCollection', features: [] }
  }
}

export function featuresForStep(fc: DrawCollection, stepId: string): DrawFeature[] {
  return fc.features.filter((f) => f.properties?.step === stepId)
}
