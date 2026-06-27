import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { MapPin, Pencil, Check, X, Trash2, Plus, ArrowRight } from 'lucide-react'
import type { FeatureCollection } from 'geojson'
import { MapCanvas } from '~/components/MapCanvas'
import { MapillaryPanel } from '~/components/MapillaryPanel'
import { TaskList } from '~/components/TaskList'
import { StepIcon } from '~/components/StepIcon'
import { useDoc } from '~/lib/useDoc'
import { CHECK_STEPS, getStep, type Step } from '~/domain/steps'
import { stepState, setStepState, type Answer, type EvidenceView } from '~/domain/doc'
import { evaluate } from '~/domain/evaluate'
import { legalText } from '~/domain/legalText'
import { addFeature, clearStepFeatures, countStepFeatures, geometryFor } from '~/lib/draw'
import type { LngLat } from '~/lib/geo'

export const Route = createFileRoute('/pruefung')({
  component: PruefungPage,
})

type Tool = 'idle' | 'pin' | 'draw'

function PruefungPage() {
  const [doc, setDoc] = useDoc()
  const [activeId, setActiveId] = useState<string>(CHECK_STEPS[0].id)
  const [tool, setTool] = useState<Tool>('idle')
  const [draft, setDraft] = useState<LngLat[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [coverageYears, setCoverageYears] = useState(2)

  const step = getStep(activeId)!
  const isMapillary = step.evidence === 'mapillary' || step.evidence === 'both'
  const isDraw = step.evidence === 'draw' || step.evidence === 'both'
  const st = stepState(doc, activeId)

  // reset transient state when switching steps
  useEffect(() => {
    setTool('idle')
    setDraft([])
    setSelectedImageId(null)
    setCoverageYears(2)
  }, [activeId])

  const evaluation = useMemo(() => evaluate(doc), [doc])
  const severityById = useMemo(
    () => Object.fromEntries(evaluation.reasons.map((r) => [r.stepId, r.severity])),
    [evaluation],
  )

  const draftFC: FeatureCollection | null = useMemo(() => {
    if (!draft.length) return null
    const features: FeatureCollection['features'] = draft.map((c) => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: c },
    }))
    if (draft.length >= 2)
      features.push({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: draft },
      })
    return { type: 'FeatureCollection', features }
  }, [draft])

  function onMapClick(at: LngLat) {
    if (tool === 'pin') {
      setDoc((p) => {
        const cur = stepState(p, activeId)
        return setStepState(p, activeId, { ...cur, pins: [...(cur.pins ?? []), at] })
      })
      return
    }
    if (tool === 'draw') {
      if (step.interaction === 'draw-point') {
        commit([at])
        setTool('idle')
      } else {
        setDraft((d) => [...d, at])
      }
    }
  }

  function commit(coords: LngLat[]) {
    const geom = geometryFor(step.interaction, coords)
    if (geom) setDoc((p) => addFeature(p, activeId, geom))
  }

  function finishDraw() {
    commit(draft)
    setDraft([])
    setTool('idle')
  }

  function onCapture(view: EvidenceView) {
    setDoc((p) => {
      const cur = stepState(p, activeId)
      return setStepState(p, activeId, { ...cur, views: [...(cur.views ?? []), view] })
    })
  }

  function setAnswer(a: Answer) {
    setDoc((p) => setStepState(p, activeId, { ...stepState(p, activeId), a }))
  }
  function setKind(kind: string) {
    setDoc((p) => setStepState(p, activeId, { ...stepState(p, activeId), kind }))
  }
  function setNote(note: string) {
    setDoc((p) => setStepState(p, activeId, { ...stepState(p, activeId), note }))
  }

  return (
    <div className="flex h-full">
      <div className="relative min-h-0 flex-1">
        <MapCanvas
          onMapClick={onMapClick}
          coverage={isMapillary}
          coverageYears={coverageYears}
          onPickImage={setSelectedImageId}
          draft={draftFC}
          bikelanesClickable={tool === 'idle'}
          cursor={tool !== 'idle' ? 'crosshair' : undefined}
        />
        {tool === 'draw' && step.interaction !== 'draw-point' && (
          <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow">
            Punkte klicken …
            <button
              onClick={finishDraw}
              disabled={draft.length < (step.interaction === 'draw-area' ? 3 : 2)}
              className="rounded bg-green-600 px-2 py-0.5 text-white disabled:opacity-50"
            >
              Fertig
            </button>
            <button onClick={() => { setDraft([]); setTool('idle') }} className="text-gray-500">
              Abbrechen
            </button>
          </div>
        )}
      </div>

      <aside className="flex w-[30rem] shrink-0 flex-col border-l border-gray-200 bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Phase 2 · Checkliste
            </h2>
            <Link
              to="/ergebnis"
              search={(p) => p}
              className="inline-flex items-center gap-1 rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700"
            >
              Ergebnis <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-3">
            <TaskList activeId={activeId} onSelect={setActiveId} severityById={severityById} />
          </div>

          {/* Active step card */}
          <div className="mt-4 rounded-lg border border-gray-200 p-3">
            <div className="flex items-start gap-2.5">
              <StepIcon step={step} size={16} active />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {step.no} · {step.label}
                </div>
                <p className="mt-1 text-xs text-gray-600">{step.help}</p>
              </div>
            </div>

            {step.legalRef && legalText(step.legalRef) && (
              <p className="mt-2 border-l-2 border-gray-200 pl-2 text-[11px] italic text-gray-500">
                {legalText(step.legalRef)}
              </p>
            )}

            {/* Evidence: Mapillary */}
            {isMapillary && (
              <div className="mt-3 space-y-2">
                <SectionLabel>Beweis: Mapillary</SectionLabel>
                <div className="flex flex-wrap items-center gap-2">
                  <ToolButton
                    active={tool === 'pin'}
                    onClick={() => setTool(tool === 'pin' ? 'idle' : 'pin')}
                    icon={MapPin}
                  >
                    Punkt setzen
                  </ToolButton>
                  <span className="text-xs text-gray-500">
                    {st.pins?.length ?? 0} Punkt(e)
                  </span>
                  <CoverageYears years={coverageYears} onChange={setCoverageYears} />
                </div>
                <ViewList views={st.views ?? []} onRemove={(i) => removeView(i)} />
              </div>
            )}

            {/* Evidence: drawing */}
            {isDraw && (
              <div className="mt-3 space-y-2">
                <SectionLabel>Beweis: Zeichnung</SectionLabel>
                <div className="flex flex-wrap items-center gap-2">
                  <ToolButton
                    active={tool === 'draw'}
                    onClick={() => { setTool('draw'); setDraft([]) }}
                    icon={Pencil}
                  >
                    {labelForDraw(step)}
                  </ToolButton>
                  <span className="text-xs text-gray-500">
                    {countStepFeatures(doc, activeId)} Objekt(e)
                  </span>
                  {countStepFeatures(doc, activeId) > 0 && (
                    <button
                      onClick={() => setDoc((p) => clearStepFeatures(p, activeId))}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <Trash2 size={12} /> löschen
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Answer */}
            <div className="mt-4 space-y-2">
              <SectionLabel>Bewertung</SectionLabel>
              {step.id === 'unfaelle' ? (
                <UnfaelleInputs doc={doc} setDoc={setDoc} />
              ) : step.options ? (
                <select
                  value={st.kind ?? ''}
                  onChange={(e) => setKind(e.target.value)}
                  className="w-full rounded border-gray-300 text-sm"
                >
                  <option value="">– Führungsform wählen –</option>
                  {step.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                      {o.ausschluss ? ' (Ausschluss)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <AnswerButtons step={step} value={st.a} onChange={setAnswer} />
              )}
              <textarea
                value={st.note ?? ''}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Notiz / Begründung …"
                rows={2}
                className="w-full rounded border-gray-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Mapillary viewer */}
        {isMapillary && (
          <div className="h-80 shrink-0 border-t border-gray-200">
            <MapillaryPanel imageId={selectedImageId} onCapture={onCapture} />
          </div>
        )}
      </aside>
    </div>
  )

  function removeView(i: number) {
    setDoc((p) => {
      const cur = stepState(p, activeId)
      const views = (cur.views ?? []).filter((_, idx) => idx !== i)
      return setStepState(p, activeId, { ...cur, views })
    })
  }
}

function labelForDraw(step: Step): string {
  if (step.interaction === 'draw-area') return 'Fläche zeichnen'
  if (step.interaction === 'draw-line') return 'Linie zeichnen'
  return 'Punkt zeichnen'
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{children}</div>
}

function ToolButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: typeof MapPin
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium ${
        active ? 'border-yellow-400 bg-yellow-100 text-gray-900' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon size={13} />
      {children}
    </button>
  )
}

function CoverageYears({ years, onChange }: { years: number; onChange: (y: number) => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
      Bilder: letzte {years} J.
      <button
        onClick={() => onChange(years + 1)}
        className="inline-flex items-center gap-0.5 rounded border border-gray-300 px-1.5 py-0.5 hover:bg-gray-50"
      >
        <Plus size={11} /> 1 Jahr
      </button>
      {years !== 2 && (
        <button onClick={() => onChange(2)} className="text-gray-400 hover:underline">
          reset
        </button>
      )}
    </span>
  )
}

function ViewList({ views, onRemove }: { views: EvidenceView[]; onRemove: (i: number) => void }) {
  if (!views.length) return <p className="text-xs text-gray-400">Noch keine Ansicht übernommen.</p>
  return (
    <ul className="space-y-1">
      {views.map((v, i) => (
        <li key={i} className="flex items-center gap-2 rounded bg-gray-50 px-2 py-1 text-xs">
          <Check size={13} className="text-green-600" />
          <span className="min-w-0 flex-1 truncate">
            {v.imageId.slice(0, 12)}…
            {v.capturedAt ? ` · ${new Date(v.capturedAt).toLocaleDateString('de-DE')}` : ''} ·{' '}
            {Math.round(v.bearing)}°
          </span>
          <button onClick={() => onRemove(i)} className="text-gray-400 hover:text-red-600">
            <X size={13} />
          </button>
        </li>
      ))}
    </ul>
  )
}

function AnswerButtons({
  step,
  value,
  onChange,
}: {
  step: Step
  value?: Answer
  onChange: (a: Answer) => void
}) {
  // Phrase the options around what the exclusion means.
  const opts: { v: Answer; label: string }[] =
    step.ausschlussWhen === 'ja'
      ? [
          { v: 'nein', label: 'Trifft nicht zu' },
          { v: 'ja', label: 'Trifft zu' },
          { v: 'unklar', label: 'Unklar' },
          { v: 'na', label: 'n. zutr.' },
        ]
      : step.ausschlussWhen === 'nein'
        ? [
            { v: 'ja', label: 'Erfüllt' },
            { v: 'nein', label: 'Nicht erfüllt' },
            { v: 'unklar', label: 'Unklar' },
            { v: 'na', label: 'n. zutr.' },
          ]
        : [
            { v: 'ja', label: 'Erfüllt' },
            { v: 'nein', label: 'Nicht erfüllt' },
            { v: 'unklar', label: 'Unklar' },
          ]
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`rounded border px-2.5 py-1 text-xs font-medium ${
            value === o.v
              ? 'border-gray-800 bg-gray-800 text-white'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function UnfaelleInputs({
  doc,
  setDoc,
}: {
  doc: ReturnType<typeof useDoc>[0]
  setDoc: ReturnType<typeof useDoc>[1]
}) {
  function set(key: 'personen' | 'schwer' | 'gering', value: number) {
    setDoc((p) => ({ ...p, unfaelle: { ...p.unfaelle, [key]: value } }))
  }
  const u = doc.unfaelle ?? {}
  const fields: { key: 'personen' | 'schwer' | 'gering'; label: string }[] = [
    { key: 'personen', label: 'mit Personenschaden (≥2 ⇒ Häufung)' },
    { key: 'schwer', label: 'schwerwiegend (≥3)' },
    { key: 'gering', label: 'geringfügig (≥5)' },
  ]
  return (
    <div className="space-y-1.5">
      {fields.map((f) => (
        <label key={f.key} className="flex items-center justify-between gap-2 text-xs text-gray-600">
          {f.label}
          <input
            type="number"
            min={0}
            value={u[f.key] ?? 0}
            onChange={(e) => set(f.key, Number(e.target.value))}
            className="w-20 rounded border-gray-300 text-sm"
          />
        </label>
      ))}
    </div>
  )
}
