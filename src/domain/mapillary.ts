import { getMapillaryToken } from '~/lib/mapillaryToken'

export const MLY_TILE_TEMPLATE =
  'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}'

export const MLY_GRAPH = 'https://graph.mapillary.com'

/** source-layer with per-image points (carries compass_angle, captured_at, id). */
export const MLY_IMAGE_LAYER = 'image'
/** source-layer with sequence lines. */
export const MLY_SEQUENCE_LAYER = 'sequence'

export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

/** Vector-tile URL including the access token (required by Mapillary). */
export function mapillaryTileUrl(token = getMapillaryToken()): string {
  return `${MLY_TILE_TEMPLATE}?access_token=${token}`
}

export type MapillaryImageMeta = {
  id: string
  captured_at?: number
  compass_angle?: number
  is_pano?: boolean
  thumb_2048_url?: string
  thumb_1024_url?: string
  computed_geometry?: { type: 'Point'; coordinates: [number, number] }
  geometry?: { type: 'Point'; coordinates: [number, number] }
  sequence?: string
}

const META_FIELDS =
  'id,captured_at,compass_angle,is_pano,thumb_1024_url,thumb_2048_url,computed_geometry,geometry,sequence'

/** Fetch image metadata (stable thumbnail URL, capture date, geometry). */
export async function fetchImageMeta(
  imageId: string,
  token = getMapillaryToken(),
): Promise<MapillaryImageMeta> {
  const url = `${MLY_GRAPH}/${imageId}?fields=${META_FIELDS}&access_token=${token}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Mapillary graph ${res.status}`)
  return (await res.json()) as MapillaryImageMeta
}

export function imageLngLat(meta: MapillaryImageMeta): [number, number] | undefined {
  return meta.computed_geometry?.coordinates ?? meta.geometry?.coordinates
}
