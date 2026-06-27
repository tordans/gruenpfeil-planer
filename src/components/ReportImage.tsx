import { useEffect, useState } from 'react'
import type { EvidenceView } from '~/domain/doc'
import { getShotUrl, viewShotKey } from '~/lib/shots'
import { fetchImageMeta } from '~/domain/mapillary'

/**
 * Renders a captured Mapillary view in the report. Prefers the exact framing
 * screenshot from IndexedDB; falls back to the stable Mapillary thumbnail
 * (regenerated from the imageId in the URL).
 */
export function ReportImage({ view }: { view: EvidenceView }) {
  const [url, setUrl] = useState<string>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let revoke: string | undefined
    let cancelled = false
    ;(async () => {
      const shot = await getShotUrl(viewShotKey(view))
      if (cancelled) return
      if (shot) {
        revoke = shot
        setUrl(shot)
        return
      }
      try {
        const meta = await fetchImageMeta(view.imageId)
        if (!cancelled) setUrl(meta.thumb_2048_url ?? meta.thumb_1024_url)
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
      if (revoke) URL.revokeObjectURL(revoke)
    }
  }, [view])

  return (
    <figure className="m-0">
      {url ? (
        <img src={url} alt={`Mapillary ${view.imageId}`} className="w-full rounded border border-gray-300" />
      ) : (
        <div className="flex h-40 items-center justify-center rounded border border-dashed border-gray-300 text-xs text-gray-400">
          {failed ? 'Bild nicht verfügbar' : 'Bild lädt …'}
        </div>
      )}
      <figcaption className="mt-1 text-[11px] text-gray-500">
        Mapillary {view.imageId} ·{' '}
        {view.capturedAt ? new Date(view.capturedAt).toLocaleDateString('de-DE') : 'Datum unbekannt'} ·
        Blickrichtung {Math.round(view.bearing)}°
      </figcaption>
    </figure>
  )
}
