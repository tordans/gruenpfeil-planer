import { z } from 'zod'

/**
 * The complete check document. EVERYTHING the user inputs lives here and is
 * serialized into the URL search params (see router root `validateSearch`).
 *
 * Exception: large binary artefacts (captured Mapillary PNGs / map screenshots)
 * are NOT in the URL — they are a derived cache in IndexedDB, keyed by the
 * reproducible references stored here. The URL alone can regenerate them.
 */

export const zLngLat = z.tuple([z.number(), z.number()])

export const zAnswer = z.enum(['ja', 'nein', 'unklar', 'na'])
export type Answer = z.infer<typeof zAnswer>

/** One captured Mapillary viewpoint — enough to reopen the exact framing. */
export const zView = z.object({
  imageId: z.string(),
  lng: z.number(),
  lat: z.number(),
  bearing: z.number().default(0),
  tilt: z.number().default(0),
  zoom: z.number().default(0),
  center: zLngLat.optional(),
  capturedAt: z.number().optional(),
})
export type EvidenceView = z.infer<typeof zView>

/** Per-step answer + evidence (inspection pins, Mapillary views). */
export const zStepState = z.object({
  a: zAnswer.optional(),
  /** classification answer for steps with an `options` list (e.g. Radführungsform) */
  kind: z.string().optional(),
  note: z.string().optional(),
  pins: z.array(zLngLat).optional(),
  views: z.array(zView).optional(),
})
export type StepState = z.infer<typeof zStepState>

export const zMeta = z
  .object({
    name: z.string(),
    az: z.string(),
    behoerde: z.string(),
    bearbeiter: z.string(),
    datum: z.string(),
  })
  .partial()

export const zSignal = z.object({
  lng: z.number(),
  lat: z.number(),
  osmId: z.string().optional(),
})

export const zUnfaelle = z
  .object({
    personen: z.number(),
    schwer: z.number(),
    gering: z.number(),
  })
  .partial()

/**
 * The search-param document. Kept flat-ish and mostly optional so unset fields
 * never appear in the URL.
 */
export const zDoc = z.object({
  v: z.literal(1).catch(1).default(1),
  meta: zMeta.optional(),
  /** map viewport */
  view: z
    .object({ lng: z.number(), lat: z.number(), zoom: z.number(), bearing: z.number() })
    .partial()
    .optional(),
  signal: zSignal.optional(),
  /** OSM way the cyclist rides in on (GeoJSON LineString coords) */
  from: z.object({ coords: z.array(zLngLat), osmId: z.string().optional() }).optional(),
  /** OSM way the cyclist turns into */
  to: z.object({ coords: z.array(zLngLat), osmId: z.string().optional() }).optional(),
  /** per-step answers + evidence, keyed by step id */
  answers: z.record(z.string(), zStepState).optional(),
  unfaelle: zUnfaelle.optional(),
  /** lz-string compressed GeoJSON FeatureCollection of drawn features */
  geo: z.string().optional(),
})

export type Doc = z.infer<typeof zDoc>

export const EMPTY_DOC: Doc = { v: 1 }

/** Read a single step's state from the doc (never undefined). */
export function stepState(doc: Doc, stepId: string): StepState {
  return doc.answers?.[stepId] ?? {}
}

/** Immutably set a step's state, returning a new doc. */
export function setStepState(doc: Doc, stepId: string, next: StepState): Doc {
  return { ...doc, answers: { ...doc.answers, [stepId]: next } }
}
