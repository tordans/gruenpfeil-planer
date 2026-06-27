import type { Geometry } from 'geojson'
import type { Doc } from '~/domain/doc'
import { decodeGeo, encodeGeo, type DrawFeature } from '~/domain/geoParam'
import type { Interaction } from '~/domain/steps'
import type { LngLat } from '~/lib/geo'

/** Build the geometry for a finished draft based on the step's interaction. */
export function geometryFor(interaction: Interaction, coords: LngLat[]): Geometry | null {
  if (interaction === 'draw-point') {
    return coords[0] ? { type: 'Point', coordinates: coords[0] } : null
  }
  if (interaction === 'draw-line') {
    return coords.length >= 2 ? { type: 'LineString', coordinates: coords } : null
  }
  if (interaction === 'draw-area') {
    if (coords.length < 3) return null
    const ring = [...coords, coords[0]]
    return { type: 'Polygon', coordinates: [ring] }
  }
  return null
}

export function addFeature(doc: Doc, stepId: string, geometry: Geometry, kind?: string): Doc {
  const fc = decodeGeo(doc.geo)
  const feature: DrawFeature = {
    type: 'Feature',
    properties: { step: stepId, ...(kind ? { kind } : {}) },
    geometry,
  }
  fc.features.push(feature)
  return { ...doc, geo: encodeGeo(fc) }
}

export function clearStepFeatures(doc: Doc, stepId: string): Doc {
  const fc = decodeGeo(doc.geo)
  fc.features = fc.features.filter((f) => f.properties?.step !== stepId)
  return { ...doc, geo: encodeGeo(fc) }
}

export function countStepFeatures(doc: Doc, stepId: string): number {
  return decodeGeo(doc.geo).features.filter((f) => f.properties?.step === stepId).length
}
