import { describe, it, expect } from 'vitest'
import { evaluate, hasUnfallhaeufung } from './evaluate'
import { CHECK_STEPS } from './steps'
import { encodeGeo } from './geoParam'
import type { Doc, StepState } from './doc'

/** Build a doc where every check step is answered in its non-exclusion way. */
function allClearDoc(): Doc {
  const answers: Record<string, StepState> = {}
  for (const step of CHECK_STEPS) {
    if (step.id === 'unfaelle') continue
    if (step.options) {
      const ok = step.options.find((o) => !o.ausschluss)!
      answers[step.id] = { kind: ok.value }
    } else if (step.ausschlussWhen === 'ja') {
      answers[step.id] = { a: 'nein' }
    } else if (step.ausschlussWhen === 'nein') {
      answers[step.id] = { a: 'ja' }
    } else {
      answers[step.id] = { a: 'ja' } // requirement steps (F)
    }
  }
  return { v: 1, answers, unfaelle: { personen: 0, schwer: 0, gering: 0 } }
}

describe('evaluate', () => {
  it('empty doc is "bedingt" (everything still open)', () => {
    expect(evaluate({ v: 1 }).verdict).toBe('bedingt')
  })

  it('fully and cleanly answered doc is "zulaessig"', () => {
    const e = evaluate(allClearDoc())
    expect(e.verdict).toBe('zulaessig')
    expect(e.reasons.every((r) => r.severity === 'ok')).toBe(true)
  })

  it('a hard exclusion (Gleise = ja) makes it "unzulaessig"', () => {
    const doc = allClearDoc()
    doc.answers!.gleise = { a: 'ja' }
    expect(evaluate(doc).verdict).toBe('unzulaessig')
  })

  it('Sichtbeziehung = nein makes it "unzulaessig"', () => {
    const doc = allClearDoc()
    doc.answers!.sicht = { a: 'nein' }
    expect(evaluate(doc).verdict).toBe('unzulaessig')
  })

  it('Radführung Z240 makes it "unzulaessig"', () => {
    const doc = allClearDoc()
    doc.answers!.radfuehrung = { kind: 'z240' }
    expect(evaluate(doc).verdict).toBe('unzulaessig')
  })

  it('two drawn right-turn lanes make it "unzulaessig" (countLanes)', () => {
    const doc = allClearDoc()
    doc.geo = encodeGeo({
      type: 'FeatureCollection',
      features: [
        line('fahrstreifen', [[0, 0], [0, 1]]),
        line('fahrstreifen', [[1, 0], [1, 1]]),
      ],
    })
    expect(evaluate(doc).verdict).toBe('unzulaessig')
  })

  it('soft criterion (Schutzbedürftige = ja) is only "bedingt"', () => {
    const doc = allClearDoc()
    doc.answers!.schutzbeduerftige = { a: 'ja' }
    const e = evaluate(doc)
    expect(e.verdict).toBe('bedingt')
    expect(e.reasons.find((r) => r.stepId === 'schutzbeduerftige')?.severity).toBe('warnung')
  })

  it('Unfallhäufung is a warning ⇒ "bedingt"', () => {
    const doc = allClearDoc()
    doc.unfaelle = { personen: 2, schwer: 0, gering: 0 }
    expect(evaluate(doc).verdict).toBe('bedingt')
  })
})

describe('hasUnfallhaeufung', () => {
  it('applies the 3-year thresholds (2 / 3 / 5)', () => {
    expect(hasUnfallhaeufung({ personen: 2 })).toBe(true)
    expect(hasUnfallhaeufung({ schwer: 3 })).toBe(true)
    expect(hasUnfallhaeufung({ gering: 5 })).toBe(true)
    expect(hasUnfallhaeufung({ personen: 1, schwer: 2, gering: 4 })).toBe(false)
    expect(hasUnfallhaeufung(undefined)).toBe(false)
  })
})

function line(step: string, coordinates: number[][]) {
  return {
    type: 'Feature' as const,
    properties: { step },
    geometry: { type: 'LineString' as const, coordinates },
  }
}
