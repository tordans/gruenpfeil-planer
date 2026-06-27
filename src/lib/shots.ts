import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

/**
 * Derived screenshot cache (captured Mapillary frames + map screenshots).
 * Too large for the URL, so stored in IndexedDB keyed by a stable id derived
 * from the reproducible reference in the URL. Always regenerable from the URL.
 */
interface ShotsDB extends DBSchema {
  shots: {
    key: string
    value: { id: string; blob: Blob; createdAt: number }
  }
}

let dbPromise: Promise<IDBPDatabase<ShotsDB>> | undefined

function db() {
  if (!dbPromise) {
    dbPromise = openDB<ShotsDB>('gruenpfeil-shots', 1, {
      upgrade(d) {
        d.createObjectStore('shots', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

/** Stable key for a captured Mapillary view (image + point of view). */
export function viewShotKey(v: {
  imageId: string
  bearing: number
  tilt: number
  zoom: number
}): string {
  return `mly:${v.imageId}:${Math.round(v.bearing)}:${Math.round(v.tilt)}:${v.zoom.toFixed(2)}`
}

export async function putShot(id: string, blob: Blob): Promise<void> {
  const d = await db()
  await d.put('shots', { id, blob, createdAt: Date.now() })
}

export async function getShot(id: string): Promise<Blob | undefined> {
  const d = await db()
  const row = await d.get('shots', id)
  return row?.blob
}

export async function getShotUrl(id: string): Promise<string | undefined> {
  const blob = await getShot(id)
  return blob ? URL.createObjectURL(blob) : undefined
}
