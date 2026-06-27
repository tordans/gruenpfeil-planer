import type { Doc } from './doc'
import { stepState } from './doc'
import { CHECK_STEPS, type Step } from './steps'
import { decodeGeo, featuresForStep } from './geoParam'

export type Verdict = 'zulaessig' | 'bedingt' | 'unzulaessig'
export type Severity = 'ausschluss' | 'warnung' | 'offen' | 'ok'

export type Reason = {
  stepId: string
  no: string
  label: string
  legalRef?: string
  severity: Severity
  message: string
}

export type Evaluation = {
  verdict: Verdict
  reasons: Reason[]
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  zulaessig: 'Zulässig',
  bedingt: 'Bedingt zulässig / offen',
  unzulaessig: 'Unzulässig',
}

/** 3-year accident accumulation thresholds per VwV-StVO XI.3. */
export function hasUnfallhaeufung(u: Doc['unfaelle']): boolean {
  if (!u) return false
  return (u.personen ?? 0) >= 2 || (u.schwer ?? 0) >= 3 || (u.gering ?? 0) >= 5
}

function evalStep(step: Step, doc: Doc, laneCount: number): Reason {
  const base = { stepId: step.id, no: step.no, label: step.label, legalRef: step.legalRef }
  const s = stepState(doc, step.id)

  // E — Unfalllage (counts based)
  if (step.id === 'unfaelle') {
    if (!doc.unfaelle) return { ...base, severity: 'offen', message: 'Unfallzahlen noch nicht erfasst.' }
    if (hasUnfallhaeufung(doc.unfaelle))
      return {
        ...base,
        severity: 'warnung',
        message: 'Unfallhäufung — Grünpfeil nur, wenn verkehrstechnische Verbesserungen möglich sind.',
      }
    return { ...base, severity: 'ok', message: 'Keine Unfallhäufung.' }
  }

  // B-f — automatic lane count (≥2 markierte Rechtsabbiege-Fahrstreifen)
  if (step.countLanes && laneCount >= 2) {
    return { ...base, severity: 'ausschluss', message: `Mehrere Rechtsabbiege-Fahrstreifen eingezeichnet (${laneCount}).` }
  }

  // Classification steps (e.g. Radführungsform)
  if (step.options) {
    if (!s.kind) return { ...base, severity: 'offen', message: 'Führungsform noch nicht eingeordnet.' }
    const opt = step.options.find((o) => o.value === s.kind)
    if (opt?.ausschluss)
      return { ...base, severity: 'ausschluss', message: `Führung als „${opt.label}“ schließt Z721 aus.` }
    return { ...base, severity: 'ok', message: opt ? `Führung: ${opt.label}.` : 'Eingeordnet.' }
  }

  // Exclusion steps (ja/nein semantics)
  if (step.ausschlussWhen) {
    if (s.a === undefined) return { ...base, severity: 'offen', message: 'Noch nicht bewertet.' }
    if (s.a === 'unklar') return { ...base, severity: 'offen', message: 'Als unklar markiert.' }
    if (s.a === 'na') return { ...base, severity: 'ok', message: 'Nicht zutreffend.' }
    if (s.a === step.ausschlussWhen) {
      if (step.soft)
        return { ...base, severity: 'warnung', message: 'Soll-Kriterium nicht erfüllt — nur ausnahmsweise zulässig.' }
      return { ...base, severity: 'ausschluss', message: 'Ausschlusskriterium trifft zu.' }
    }
    return { ...base, severity: 'ok', message: 'Kriterium erfüllt.' }
  }

  // Requirement steps without exclusion logic (e.g. F — Ausführung): need "ja"
  if (s.a === undefined) return { ...base, severity: 'offen', message: 'Noch nicht bewertet.' }
  if (s.a === 'ja' || s.a === 'na') return { ...base, severity: 'ok', message: 'Erfüllt.' }
  return { ...base, severity: 'warnung', message: 'Anforderung noch nicht erfüllt.' }
}

export function evaluate(doc: Doc): Evaluation {
  const fc = decodeGeo(doc.geo)
  const laneCount = featuresForStep(fc, 'fahrstreifen').length

  const reasons = CHECK_STEPS.map((step) => evalStep(step, doc, laneCount))

  let verdict: Verdict = 'zulaessig'
  if (reasons.some((r) => r.severity === 'ausschluss')) verdict = 'unzulaessig'
  else if (reasons.some((r) => r.severity === 'warnung' || r.severity === 'offen'))
    verdict = 'bedingt'

  return { verdict, reasons }
}
