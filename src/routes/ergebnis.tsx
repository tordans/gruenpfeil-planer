import { useMemo } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { useDoc } from '~/lib/useDoc'
import { evaluate, type Severity } from '~/domain/evaluate'
import { VerdictBadge } from '~/components/VerdictBadge'
import { getStep } from '~/domain/steps'
import { StepIcon } from '~/components/StepIcon'

export const Route = createFileRoute('/ergebnis')({
  component: ErgebnisPage,
})

const ORDER: Severity[] = ['ausschluss', 'warnung', 'offen', 'ok']
const HEADING: Record<Severity, string> = {
  ausschluss: 'Ausschlusskriterien (zwingend)',
  warnung: 'Warnungen / Soll-Kriterien',
  offen: 'Noch offen',
  ok: 'Erfüllt',
}

function ErgebnisPage() {
  const [doc] = useDoc()
  const evaluation = useMemo(() => evaluate(doc), [doc])

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Ergebnis der Prüfung</h1>
        <VerdictBadge verdict={evaluation.verdict} />
      </div>

      {doc.meta?.name && <p className="mt-1 text-gray-600">{doc.meta.name}</p>}

      <p className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
        {evaluation.verdict === 'unzulaessig' &&
          'Mindestens ein zwingendes Ausschlusskriterium trifft zu — die Anordnung des Grünpfeils für den Radverkehr (Z721) kommt nicht in Betracht.'}
        {evaluation.verdict === 'bedingt' &&
          'Es bestehen offene Punkte oder Soll-Kriterien. Eine Anordnung ist nur nach Klärung bzw. nur ausnahmsweise möglich.'}
        {evaluation.verdict === 'zulaessig' &&
          'Keine Ausschlusskriterien festgestellt. Die Anordnung des Grünpfeils für den Radverkehr (Z721) kommt grundsätzlich in Betracht.'}
      </p>

      {ORDER.map((sev) => {
        const items = evaluation.reasons.filter((r) => r.severity === sev)
        if (!items.length) return null
        return (
          <section key={sev} className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              {HEADING[sev]} ({items.length})
            </h2>
            <ul className="mt-2 space-y-1.5">
              {items.map((r) => {
                const step = getStep(r.stepId)
                return (
                  <li key={r.stepId} className="flex items-start gap-2.5 rounded border border-gray-200 px-3 py-2">
                    {step && <StepIcon step={step} size={14} />}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {r.no} · {r.label}
                        {r.legalRef && <span className="ml-1 text-xs text-gray-400">({r.legalRef})</span>}
                      </div>
                      <div className="text-xs text-gray-600">{r.message}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <div className="mt-8 flex items-center justify-between">
        <Link
          to="/pruefung"
          search={(p) => p}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft size={16} /> Zurück zur Checkliste
        </Link>
        <Link
          to="/bericht"
          search={(p) => p}
          className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Bericht erstellen <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
