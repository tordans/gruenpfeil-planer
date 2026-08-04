import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Marker, useMap, type MarkerEvent } from 'react-map-gl/maplibre'
import { ArrowRight, RefreshCw, Loader2, Check } from 'lucide-react'
import type { FeatureCollection } from 'geojson'
import { MapCanvas } from '~/components/MapCanvas'
import { StepIcon } from '~/components/StepIcon'
import { TrafficLight } from '~/components/icons'
import { useDoc } from '~/lib/useDoc'
import { GEOMETRIE_STEPS } from '~/domain/steps'
import { fetchWays, fetchTrafficSignals, type WayFeature, type TrafficSignal } from '~/domain/overpass'
import { pickNearestWay, orientEndToward, orientStartToward, reverse, type LngLat } from '~/lib/geo'

export const Route = createFileRoute('/ort')({
  component: OrtPage,
})

type Sub = 'signal' | 'from' | 'to'

function OrtPage() {
  const [doc, setDoc] = useDoc()
  const [sub, setSub] = useState<Sub>('signal')
  const maps = useMap()
  const [signals, setSignals] = useState<TrafficSignal[]>([])
  const [loadingSignals, setLoadingSignals] = useState(false)

  async function loadTrafficSignals() {
    const m = maps.pruefmap
    if (!m) return
    const b = m.getBounds()
    setLoadingSignals(true)
    try {
      const found = await fetchTrafficSignals({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast(),
      })
      setSignals(found)
    } finally {
      setLoadingSignals(false)
    }
  }

  function selectSignal(s: TrafficSignal) {
    setDoc((p) => ({ ...p, signal: { lng: s.lng, lat: s.lat, osmId: s.id } }))
    setSignals([])
    setSub('from')
  }

  // advance to the first incomplete sub-step on load
  useEffect(() => {
    if (!doc.signal) setSub('signal')
    else if (!doc.from) setSub('from')
    else if (!doc.to) setSub('to')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const waysQuery = useQuery({
    queryKey: ['ways', doc.signal?.lng, doc.signal?.lat],
    queryFn: ({ signal }) => fetchWays(doc.signal!.lng, doc.signal!.lat, 90, signal),
    enabled: !!doc.signal,
  })
  const ways: WayFeature[] = waysQuery.data ?? []

  const overlay: FeatureCollection | null = useMemo(
    () => (sub !== 'signal' && ways.length ? { type: 'FeatureCollection', features: ways } : null),
    [sub, ways],
  )

  function onMapClick(at: LngLat) {
    if (sub === 'signal') {
      setDoc((p) => ({ ...p, signal: { lng: at[0], lat: at[1] } }))
      setSub('from')
      return
    }
    const target: LngLat = doc.signal ? [doc.signal.lng, doc.signal.lat] : at
    const way = pickNearestWay(ways, at)
    if (!way) return
    const coords = way.geometry.coordinates as LngLat[]
    const osmId = String(way.id ?? '')
    if (sub === 'from') {
      setDoc((p) => ({ ...p, from: { coords: orientEndToward(coords, target), osmId } }))
      setSub('to')
    } else {
      setDoc((p) => ({ ...p, to: { coords: orientStartToward(coords, target), osmId } }))
    }
  }

  const geomDone = !!doc.signal && !!doc.from && !!doc.to

  return (
    <div className="flex h-full">
      <div className="relative min-h-0 flex-1">
        <MapCanvas
          onMapClick={onMapClick}
          overlay={overlay}
          bikelanesClickable={false}
          cursor="crosshair"
        >
          {sub === 'signal' &&
            signals.map((s) => (
              <Marker
                key={s.id}
                longitude={s.lng}
                latitude={s.lat}
                anchor="bottom"
                onClick={(e: MarkerEvent<MouseEvent>) => {
                  e.originalEvent.stopPropagation()
                  selectSignal(s)
                }}
              >
                <button
                  type="button"
                  title="Diese Ampel als LZA wählen"
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow-lg hover:bg-red-700"
                >
                  <TrafficLight size={18} />
                </button>
              </Marker>
            ))}
        </MapCanvas>

        {sub === 'signal' && (
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
            <button
              type="button"
              onClick={loadTrafficSignals}
              disabled={loadingSignals}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-red-700 disabled:opacity-60"
            >
              {loadingSignals ? <Loader2 size={16} className="animate-spin" /> : <TrafficLight size={16} />}
              Ampel im Gebiet anzeigen
              {signals.length > 0 && <span className="opacity-80">({signals.length})</span>}
            </button>
          </div>
        )}

        {sub !== 'signal' && waysQuery.isFetching && (
          <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow">
            <Loader2 size={15} className="animate-spin" /> OSM-Wege werden geladen…
          </div>
        )}
      </div>

      <aside className="w-96 shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
        <div className="space-y-4 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Phase 1 · Prüf-Ort & Geometrie
          </h2>

          <ol className="space-y-2">
            {GEOMETRIE_STEPS.map((step) => {
              const active = sub === step.id
              const done =
                (step.id === 'signal' && !!doc.signal) ||
                (step.id === 'from' && !!doc.from) ||
                (step.id === 'to' && !!doc.to)
              return (
                <li
                  key={step.id}
                  className={`flex items-start gap-3 rounded-md border p-2.5 ${
                    active ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <button onClick={() => setSub(step.id as Sub)} className="mt-0.5">
                    <StepIcon step={step} size={16} active={active} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                      {step.no} · {step.label}
                      {done && <Check size={15} className="text-green-600" />}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{step.help}</p>
                    {step.id === 'signal' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSub('signal')
                          loadTrafficSignals()
                        }}
                        disabled={loadingSignals}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {loadingSignals ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <TrafficLight size={13} />
                        )}
                        Ampel im Gebiet anzeigen
                        {signals.length > 0 && <span className="opacity-80">({signals.length})</span>}
                      </button>
                    )}
                    {step.id !== 'signal' && done && (
                      <button
                        onClick={() => flip(step.id as 'from' | 'to')}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <RefreshCw size={12} /> Richtung umkehren
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>

          {waysQuery.isError && (
            <p className="rounded bg-red-50 p-2 text-xs text-red-700">
              Overpass-Abfrage fehlgeschlagen. Bitte erneut versuchen.
            </p>
          )}

          <fieldset className="space-y-2 border-t border-gray-100 pt-4">
            <legend className="text-sm font-semibold text-gray-700">Angaben zur Prüfung</legend>
            <Field label="Bezeichnung / Knotenpunkt" value={doc.meta?.name} onChange={(v) => setMeta('name', v)} />
            <Field label="Aktenzeichen" value={doc.meta?.az} onChange={(v) => setMeta('az', v)} />
            <Field label="Behörde" value={doc.meta?.behoerde} onChange={(v) => setMeta('behoerde', v)} />
            <Field label="Bearbeiter:in" value={doc.meta?.bearbeiter} onChange={(v) => setMeta('bearbeiter', v)} />
            <Field label="Datum" type="date" value={doc.meta?.datum} onChange={(v) => setMeta('datum', v)} />
          </fieldset>

          <Link
            to="/pruefung"
            search={(prev) => prev}
            className={`flex items-center justify-center gap-2 rounded-md px-4 py-2.5 font-medium text-white ${
              geomDone ? 'bg-green-600 hover:bg-green-700' : 'pointer-events-none bg-gray-300'
            }`}
          >
            Weiter zur Checkliste <ArrowRight size={18} />
          </Link>
        </div>
      </aside>
    </div>
  )

  function flip(which: 'from' | 'to') {
    setDoc((p) => {
      const cur = p[which]
      if (!cur) return p
      return { ...p, [which]: { ...cur, coords: reverse(cur.coords as LngLat[]) } }
    })
  }

  function setMeta(key: keyof NonNullable<typeof doc.meta>, value: string) {
    setDoc((p) => ({ ...p, meta: { ...p.meta, [key]: value } }))
  }
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value?: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded border-gray-300 text-sm"
      />
    </label>
  )
}
