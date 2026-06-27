import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Printer } from 'lucide-react'
import { useDoc } from '~/lib/useDoc'
import { stepState, type Answer } from '~/domain/doc'
import { CHECK_STEPS } from '~/domain/steps'
import { evaluate } from '~/domain/evaluate'
import { legalText } from '~/domain/legalText'
import { VerdictBadge } from '~/components/VerdictBadge'
import { ReportImage } from '~/components/ReportImage'
import { MapCanvas } from '~/components/MapCanvas'

export const Route = createFileRoute('/bericht')({
  component: BerichtPage,
})

const ANSWER_LABEL: Record<Answer, string> = {
  ja: 'Ja / trifft zu',
  nein: 'Nein / trifft nicht zu',
  unklar: 'Unklar',
  na: 'Nicht zutreffend',
}

function BerichtPage() {
  const [doc] = useDoc()
  const evaluation = useMemo(() => evaluate(doc), [doc])
  const meta = doc.meta ?? {}
  const ausschluesse = evaluation.reasons.filter((r) => r.severity === 'ausschluss')
  const offen = evaluation.reasons.filter((r) => r.severity === 'offen' || r.severity === 'warnung')

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="no-print mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">Druckansicht — „Drucken“ → „Als PDF speichern“.</span>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
        >
          <Printer size={16} /> Drucken / Als PDF
        </button>
      </div>

      <article className="prose prose-sm max-w-none">
        <header className="not-prose mb-4 border-b border-gray-300 pb-3">
          <h1 className="text-xl font-bold text-gray-900">
            Prüfung Grünpfeil für den Radverkehr (Zeichen 721)
          </h1>
          <p className="text-sm text-gray-500">Nach VwV-StVO Abschnitt XII (i. V. m. XI)</p>
          <div className="mt-3">
            <VerdictBadge verdict={evaluation.verdict} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <Meta label="Knotenpunkt / Bezeichnung" value={meta.name} />
            <Meta label="Aktenzeichen" value={meta.az} />
            <Meta label="Behörde" value={meta.behoerde} />
            <Meta label="Bearbeiter:in" value={meta.bearbeiter} />
            <Meta label="Datum" value={meta.datum} />
          </dl>
        </header>

        {/* Overview map */}
        <h2 className="text-base font-semibold">Übersicht</h2>
        <div className="not-prose relative h-80 w-full overflow-hidden rounded border border-gray-300">
          <MapCanvas mapId="report-overview" preserveDrawingBuffer />
        </div>

        {/* Per-check findings */}
        <h2 className="mt-6 text-base font-semibold">Einzelprüfung</h2>
        <div className="not-prose space-y-4">
          {CHECK_STEPS.map((step) => {
            const st = stepState(doc, step.id)
            const reason = evaluation.reasons.find((r) => r.stepId === step.id)
            return (
              <section
                key={step.id}
                className="break-inside-avoid rounded border border-gray-200 p-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {step.no} · {step.label}
                    {step.legalRef && (
                      <span className="ml-1 text-xs font-normal text-gray-400">({step.legalRef})</span>
                    )}
                  </h3>
                  {reason && <SeverityTag severity={reason.severity} />}
                </div>

                {step.legalRef && legalText(step.legalRef) && (
                  <p className="mt-1 border-l-2 border-gray-200 pl-2 text-[11px] italic text-gray-500">
                    {legalText(step.legalRef)}
                  </p>
                )}

                <p className="mt-2 text-sm text-gray-800">
                  <strong>Bewertung:</strong>{' '}
                  {step.id === 'unfaelle'
                    ? unfaelleText(doc.unfaelle)
                    : step.options
                      ? (step.options.find((o) => o.value === st.kind)?.label ?? '—')
                      : st.a
                        ? ANSWER_LABEL[st.a]
                        : '—'}
                  {reason && <span className="text-gray-500"> — {reason.message}</span>}
                </p>

                {st.note && <p className="mt-1 text-sm text-gray-700">Notiz: {st.note}</p>}

                {!!st.views?.length && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {st.views.map((v, i) => (
                      <ReportImage key={i} view={v} />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>

        {/* Lückentext — Anordnungsentwurf */}
        <h2 className="mt-6 text-base font-semibold">Nächste Schritte / Anordnungsentwurf</h2>
        <div className="not-prose rounded border border-gray-300 bg-gray-50 p-4 text-sm leading-6 text-gray-800">
          <p className="font-medium">Verkehrsrechtliche Anordnung nach § 45 StVO (Entwurf)</p>
          <p className="mt-2">
            Knotenpunkt: <U>{meta.name}</U> · Aktenzeichen: <U>{meta.az}</U> · Behörde:{' '}
            <U>{meta.behoerde}</U>
          </p>
          <p className="mt-2">
            Auf Grundlage der vorstehenden Prüfung nach VwV-StVO Abschnitt XII wird für die
            o. g. Knotenpunktzufahrt die Anordnung des Grünpfeils für den Radverkehr (Zeichen 721){' '}
            {evaluation.verdict === 'zulaessig' && <strong>angeordnet</strong>}
            {evaluation.verdict === 'bedingt' && <strong>zurückgestellt</strong>}
            {evaluation.verdict === 'unzulaessig' && <strong>abgelehnt</strong>}.
          </p>

          {evaluation.verdict === 'unzulaessig' && (
            <p className="mt-2">
              Begründung — folgende Ausschlusskriterien liegen vor:
              <br />
              {ausschluesse.map((r) => `• ${r.no} ${r.label} (${r.legalRef ?? ''})`).join('  ')}
            </p>
          )}
          {evaluation.verdict === 'bedingt' && (
            <p className="mt-2">
              Vor einer Anordnung sind folgende Punkte zu klären:
              <br />
              {offen.map((r) => `• ${r.no} ${r.label}`).join('  ')}
            </p>
          )}
          {evaluation.verdict === 'zulaessig' && (
            <p className="mt-2">
              Auflagen / Hinweise: <U long />
              <br />
              Anbringung (XII.3): <U long />
            </p>
          )}

          <p className="mt-4">
            Ort, Datum: <U /> Unterschrift: <U />
          </p>
        </div>
      </article>
    </div>
  )
}

function Meta({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="text-gray-800">{value || '—'}</dd>
    </div>
  )
}

function SeverityTag({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    ok: 'bg-green-100 text-green-800',
    ausschluss: 'bg-red-100 text-red-800',
    warnung: 'bg-amber-100 text-amber-800',
    offen: 'bg-gray-100 text-gray-600',
  }
  const label: Record<string, string> = {
    ok: 'erfüllt',
    ausschluss: 'Ausschluss',
    warnung: 'Warnung',
    offen: 'offen',
  }
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${map[severity] ?? ''}`}>
      {label[severity] ?? severity}
    </span>
  )
}

function U({ long, children }: { long?: boolean; children?: React.ReactNode }) {
  return (
    <span
      className="inline-block border-b border-gray-400 px-1 align-baseline"
      style={{ minWidth: long ? 320 : 120 }}
    >
      {children ? children : ' '}
    </span>
  )
}

function unfaelleText(u: { personen?: number; schwer?: number; gering?: number } | undefined): string {
  if (!u) return '—'
  return `Personenschaden: ${u.personen ?? 0}, schwerwiegend: ${u.schwer ?? 0}, geringfügig: ${u.gering ?? 0}`
}
