import { describe, it, expect } from 'vitest'
import { encodeGeo, decodeGeo, featuresForStep, type DrawCollection } from './geoParam'

const fc: DrawCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { step: 'gleise' },
      geometry: { type: 'LineString', coordinates: [[13.4, 52.5], [13.41, 52.51]] },
    },
    {
      type: 'Feature',
      properties: { step: 'aufstellflaeche', kind: 'box' },
      geometry: { type: 'Point', coordinates: [13.4, 52.5] },
    },
  ],
}

describe('geoParam', () => {
  it('round-trips a FeatureCollection through the URL param', () => {
    const encoded = encodeGeo(fc)
    expect(typeof encoded).toBe('string')
    const decoded = decodeGeo(encoded)
    expect(decoded).toEqual(fc)
  })

  it('encodes an empty collection as undefined', () => {
    expect(encodeGeo({ type: 'FeatureCollection', features: [] })).toBeUndefined()
  })

  it('decodes undefined / garbage to an empty collection', () => {
    expect(decodeGeo(undefined).features).toEqual([])
    expect(decodeGeo('not-valid-lz').features).toEqual([])
  })

  it('filters features by step', () => {
    expect(featuresForStep(fc, 'gleise')).toHaveLength(1)
    expect(featuresForStep(fc, 'nope')).toHaveLength(0)
  })
})
