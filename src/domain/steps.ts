import {
  Eye,
  CornerUpLeft,
  Signpost,
  ArrowUpRight,
  TramFront,
  Rows3,
  School,
  ParkingSquare,
  Bike,
  Footprints,
  Accessibility,
  TriangleAlert,
  LogIn,
  LogOut,
} from 'lucide-react'
import { TrafficLight, type Icon } from '~/components/icons'

export type EvidenceMode = 'mapillary' | 'draw' | 'both' | 'none'
export type Interaction =
  | 'osm-point'
  | 'osm-way'
  | 'draw-point'
  | 'draw-line'
  | 'draw-area'
  | 'none'

export type StepOption = { value: string; label: string; ausschluss?: boolean }

export type Step = {
  id: string
  group: 'geometrie' | 'checkliste'
  /** display number, e.g. "0.1", "B-d" */
  no: string
  label: string
  /** short instruction shown while the step is active */
  help: string
  icon: Icon
  /** map accent colour (tailwind-ish hex) used for the pin/feature + list chip */
  color: string
  evidence: EvidenceMode
  interaction: Interaction
  directional?: boolean
  legalRef?: string
  /** which answer triggers a hard exclusion */
  ausschlussWhen?: 'ja' | 'nein'
  /** classification answer instead of ja/nein; some options trigger exclusion */
  options?: StepOption[]
  /** soft criterion → contributes "bedingt" rather than hard "unzulässig" */
  soft?: boolean
  /** number of right-turn lanes ≥ 2 ⇒ exclusion (special handling for B-f) */
  countLanes?: boolean
}

export const GEOMETRIE_STEPS: Step[] = [
  {
    id: 'signal',
    group: 'geometrie',
    no: '0.1',
    label: 'LZA / Signal wählen',
    help: 'Klicke die signalisierte Zufahrtsecke an, an der Zeichen 721 hängen würde. Danach werden OSM-Daten geladen.',
    icon: TrafficLight,
    color: '#ef4444',
    evidence: 'none',
    interaction: 'osm-point',
  },
  {
    id: 'from',
    group: 'geometrie',
    no: '0.2',
    label: 'Zufahrt „von“',
    help: 'Wähle den OSM-Weg, auf dem der Radverkehr zur Ampel fährt. Die Richtung zeigt zur LZA (umkehrbar).',
    icon: LogIn,
    color: '#2563eb',
    evidence: 'none',
    interaction: 'osm-way',
    directional: true,
  },
  {
    id: 'to',
    group: 'geometrie',
    no: '0.3',
    label: 'Abbiegen „nach“',
    help: 'Wähle den OSM-Weg, in den nach rechts abgebogen wird. Zusammen mit „von“ ergibt sich die Abbiegebewegung.',
    icon: LogOut,
    color: '#16a34a',
    evidence: 'none',
    interaction: 'osm-way',
    directional: true,
  },
]

export const CHECK_STEPS: Step[] = [
  {
    id: 'sicht',
    group: 'checkliste',
    no: 'A',
    label: 'Sichtbeziehung',
    help: 'Kann der Radfahrer Fußgänger- und Fahrzeugverkehr der freigegebenen Richtungen ausreichend einsehen? Mapillary-Bild von der Warteposition aufnehmen.',
    icon: Eye,
    color: '#0891b2',
    evidence: 'mapillary',
    interaction: 'draw-line',
    directional: true,
    legalRef: 'XI.1 S.1',
    ausschlussWhen: 'nein',
  },
  {
    id: 'konflikt-links',
    group: 'checkliste',
    no: 'B-a',
    label: 'Konfliktfreies Linksabbiegersignal (Gegenverkehr)',
    help: 'Wird dem entgegenkommenden Verkehr ein konfliktfreies Linksabbiegen signalisiert? Wenn ja: Ausschluss.',
    icon: CornerUpLeft,
    color: '#7c3aed',
    evidence: 'mapillary',
    interaction: 'draw-point',
    legalRef: 'XI.1 a',
    ausschlussWhen: 'ja',
  },
  {
    id: 'gegen-gruenpfeil',
    group: 'checkliste',
    no: 'B-b',
    label: '§37-Grünpfeil für Gegen-Linksabbieger',
    help: 'Wird für den entgegenkommenden Linksabbieger der grüne Pfeil gemäß §37 Abs.2 Nr.1 S.4 verwendet? Bild des gegenüberliegenden Signals aufnehmen.',
    icon: Signpost,
    color: '#7c3aed',
    evidence: 'mapillary',
    interaction: 'draw-point',
    legalRef: 'XI.1 b',
    ausschlussWhen: 'ja',
  },
  {
    id: 'pfeile',
    group: 'checkliste',
    no: 'B-c',
    label: 'Richtungweisende Pfeile im eigenen LZ',
    help: 'Schreiben Pfeile in den für den Rechtsabbieger gültigen Lichtzeichen die Fahrtrichtung vor? Bild des eigenen Signals aufnehmen.',
    icon: ArrowUpRight,
    color: '#7c3aed',
    evidence: 'mapillary',
    interaction: 'draw-point',
    legalRef: 'XI.1 c',
    ausschlussWhen: 'ja',
  },
  {
    id: 'gleise',
    group: 'checkliste',
    no: 'B-d',
    label: 'Zu kreuzende Gleise',
    help: 'Müssen beim Rechtsabbiegen Gleise von Schienenfahrzeugen gekreuzt oder befahren werden? Gleise auf der Karte nachzeichnen.',
    icon: TramFront,
    color: '#b45309',
    evidence: 'draw',
    interaction: 'draw-line',
    legalRef: 'XI.1 d',
    ausschlussWhen: 'ja',
  },
  {
    id: 'fahrstreifen',
    group: 'checkliste',
    no: 'B-f',
    label: 'Mehrere Rechtsabbiege-Fahrstreifen',
    help: 'Stehen für das Rechtsabbiegen mehrere markierte Fahrstreifen zur Verfügung? Jeden Rechtsabbiege-Fahrstreifen einzeln einzeichnen (≥2 ⇒ Ausschluss).',
    icon: Rows3,
    color: '#b45309',
    evidence: 'both',
    interaction: 'draw-line',
    legalRef: 'XI.1 f',
    ausschlussWhen: 'ja',
    countLanes: true,
  },
  {
    id: 'schulweg',
    group: 'checkliste',
    no: 'B-g',
    label: 'Überwiegend Schulwegsicherung',
    help: 'Dient die Lichtzeichenanlage überwiegend der Schulwegsicherung? Wenn ja: Ausschluss.',
    icon: School,
    color: '#7c3aed',
    evidence: 'mapillary',
    interaction: 'draw-point',
    legalRef: 'XI.1 g',
    ausschlussWhen: 'ja',
  },
  {
    id: 'aufstellflaeche',
    group: 'checkliste',
    no: 'B-h',
    label: 'Aufstellfläche Linksabbieger (indirekt)',
    help: 'Befindet sich im unmittelbaren Bereich des Rechtsabbiegers eine Aufstellfläche für indirektes Linksabbiegen des Radverkehrs? Fläche einzeichnen.',
    icon: ParkingSquare,
    color: '#b45309',
    evidence: 'both',
    interaction: 'draw-area',
    legalRef: 'XI.1 h',
    ausschlussWhen: 'ja',
  },
  {
    id: 'ueberholbarkeit',
    group: 'checkliste',
    no: 'C-a',
    label: 'Radaufkommen / Überholbarkeit',
    help: 'Übersteigt bei hohem Radaufkommen der geradeaus fahrende Anteil den Rechtsabbieger-Anteil erheblich UND ist sicheres Überholen wartender Radfahrer nicht gewährleistet? Wenn ja: Ausschluss.',
    icon: Bike,
    color: '#0891b2',
    evidence: 'mapillary',
    interaction: 'draw-area',
    legalRef: 'XII.2 a',
    ausschlussWhen: 'ja',
  },
  {
    id: 'radfuehrung',
    group: 'checkliste',
    no: 'C-b',
    label: 'Radführungsform der Zufahrt',
    help: 'Wie wird der rechtsabbiegende Radverkehr in der Zufahrt geführt? Führungsform nachzeichnen und einordnen.',
    icon: Bike,
    color: '#0891b2',
    evidence: 'both',
    interaction: 'draw-line',
    legalRef: 'XII.2 b',
    options: [
      { value: 'radfahrstreifen', label: 'Radfahrstreifen / Schutzstreifen' },
      { value: 'baulich', label: 'Baulicher Radweg' },
      { value: 'z240', label: 'Gem. Geh- und Radweg (Z240)', ausschluss: true },
      { value: 'gehweg-frei', label: 'Gehweg, Rad frei (Z239 + 1022-10)', ausschluss: true },
    ],
  },
  {
    id: 'warteflaeche',
    group: 'checkliste',
    no: 'C-c',
    label: 'Fußverkehr-Wartefläche / Abgrenzung (Z241)',
    help: 'Ist die Wartefläche für zu Fuß Gehende ausreichend groß und der baulich angelegte Radweg deutlich vom Gehweg abgegrenzt? Wartefläche einzeichnen.',
    icon: Footprints,
    color: '#0891b2',
    evidence: 'both',
    interaction: 'draw-area',
    legalRef: 'XII.2 S',
    ausschlussWhen: 'nein',
  },
  {
    id: 'schutzbeduerftige',
    group: 'checkliste',
    no: 'D',
    label: 'Schutzbedürftige (seh-/gehbehindert)',
    help: 'Wird die Kreuzung häufig von seh- oder gehbehinderten Personen überquert? Dann soll der Grünpfeil nicht angewandt werden (ausnahmsweise mit akustischer Zusatzeinrichtung).',
    icon: Accessibility,
    color: '#db2777',
    evidence: 'mapillary',
    interaction: 'draw-point',
    legalRef: 'XI.2',
    ausschlussWhen: 'ja',
    soft: true,
  },
  {
    id: 'unfaelle',
    group: 'checkliste',
    no: 'E',
    label: 'Unfalllage',
    help: 'Liegt eine Unfallhäufung vor (3 Jahre: ≥2 mit Personenschaden / ≥3 schwerwiegend / ≥5 geringfügig)? Unfallzahlen eintragen.',
    icon: TriangleAlert,
    color: '#dc2626',
    evidence: 'none',
    interaction: 'draw-point',
    legalRef: 'XI.3',
  },
  {
    id: 'ausfuehrung',
    group: 'checkliste',
    no: 'F',
    label: 'Ausführung & Anbringung',
    help: 'Schild nicht leuchtend/retroreflektierend, korrekte Anbringung am Signalgeber, keine unzulässige gemeinsame Anordnung Z720+Z721. Signalgeber-Position markieren.',
    icon: Signpost,
    color: '#475569',
    evidence: 'mapillary',
    interaction: 'draw-point',
    legalRef: 'XII.3',
  },
]

export const STEPS: Step[] = [...GEOMETRIE_STEPS, ...CHECK_STEPS]

export const STEP_BY_ID: Record<string, Step> = Object.fromEntries(
  STEPS.map((s) => [s.id, s]),
)

export function getStep(id: string): Step | undefined {
  return STEP_BY_ID[id]
}
