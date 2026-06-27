import { useEffect, useRef, useState } from 'react'
import { Viewer } from 'mapillary-js'
import { domToBlob } from 'modern-screenshot'
import { Camera, Loader2 } from 'lucide-react'
import type { EvidenceView } from '~/domain/doc'
import { getMapillaryToken } from '~/lib/mapillaryToken'
import { putShot, viewShotKey } from '~/lib/shots'
import { TokenGate } from '~/components/TokenGate'

type Props = {
  imageId: string | null
  onCapture: (view: EvidenceView) => void
}

type Current = { id: string; lng: number; lat: number; capturedAt?: number }

export function MapillaryPanel({ imageId, onCapture }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const currentRef = useRef<Current | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [current, setCurrent] = useState<Current | null>(null)
  const token = getMapillaryToken()

  // create / destroy the viewer
  useEffect(() => {
    if (!token || !containerRef.current) return
    const viewer = new Viewer({
      accessToken: token,
      container: containerRef.current,
      component: { cover: false },
      imageId: imageId ?? undefined,
    })
    viewer.on('image', (e) => {
      const img = e.image
      const c: Current = {
        id: img.id,
        lng: img.lngLat.lng,
        lat: img.lngLat.lat,
        capturedAt: img.capturedAt ?? undefined,
      }
      currentRef.current = c
      setCurrent(c)
    })
    viewer.on('load', () => setReady(true))
    viewerRef.current = viewer
    return () => {
      viewer.remove()
      viewerRef.current = null
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // navigate when the requested image changes
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !imageId) return
    viewer.moveTo(imageId).catch(() => {})
  }, [imageId])

  async function capture() {
    const viewer = viewerRef.current
    const cur = currentRef.current
    if (!viewer || !cur) return
    setBusy(true)
    try {
      const [pov, zoom] = await Promise.all([viewer.getPointOfView(), viewer.getZoom()])
      let center: [number, number] | undefined
      try {
        center = (await viewer.getCenter()) as [number, number]
      } catch {
        center = undefined
      }
      const view: EvidenceView = {
        imageId: cur.id,
        lng: cur.lng,
        lat: cur.lat,
        bearing: Math.round(pov.bearing),
        tilt: Math.round(pov.tilt),
        zoom: Math.round(zoom * 100) / 100,
        center,
        capturedAt: cur.capturedAt,
      }
      // best-effort screenshot to IndexedDB (regenerable from the URL)
      if (containerRef.current) {
        try {
          const blob = await domToBlob(containerRef.current, { quality: 0.9 })
          if (blob) await putShot(viewShotKey(view), blob)
        } catch {
          /* fall back to thumb_2048_url in the report */
        }
      }
      onCapture(view)
    } finally {
      setBusy(false)
    }
  }

  if (!token) return <TokenGate />

  return (
    <div className="flex h-full flex-col">
      <div ref={containerRef} className="mapillary-viewer relative min-h-0 flex-1 bg-gray-900">
        {!imageId && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center text-sm text-gray-300">
            Setze einen Punkt auf der Karte und wähle ein Mapillary-Bild (Pfeil/Punkt),
            das den Prüfpunkt zeigt.
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 py-2">
        <span className="text-xs text-gray-500">
          {current
            ? `Bild ${current.id.slice(0, 10)}…${
                current.capturedAt
                  ? ` · ${new Date(current.capturedAt).toLocaleDateString('de-DE')}`
                  : ''
              }`
            : ready
              ? 'Bereit'
              : 'Lädt…'}
        </span>
        <button
          type="button"
          onClick={capture}
          disabled={!current || busy}
          className="inline-flex items-center gap-1.5 rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
          Diese Ansicht übernehmen
        </button>
      </div>
    </div>
  )
}
