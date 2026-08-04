import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Link2 } from 'lucide-react'
import { Sign721 } from '~/components/Sign721'
import { CHECK_STEPS } from '~/domain/steps'
import { VWV_STVO_URL } from '~/domain/legalText'

export const Route = createFileRoute('/')({
  component: StartPage,
})

function StartPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-start gap-4 sm:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Grünpfeil für den Radverkehr (Zeichen 721) prüfen
          </h1>
          <p className="mt-3 text-gray-700">
            Dieses Werkzeug führt Schritt für Schritt durch die rechtliche Prüfung einer
            Knotenpunktzufahrt nach{' '}
            <a
              href={VWV_STVO_URL}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-600"
            >
              VwV-StVO Abschnitt XII
            </a>{' '}
            (verweist auf XI). Du
            wählst den Prüf-Ort auf der Karte, dokumentierst jeden Prüfpunkt mit einem
            Mapillary-Bild oder einer Zeichnung, und erhältst am Ende ein Ergebnis samt
            druckbarem Bericht.
          </p>
        </div>
        <Sign721 className="mt-0.5" />
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex items-center gap-2 font-medium">
          <Link2 size={16} />
          Der gesamte Prüfstand steckt in der URL
        </div>
        <p className="mt-1">
          Du kannst den Link jederzeit kopieren, teilen oder als Lesezeichen speichern — er
          stellt die komplette Prüfung wieder her (inkl. der gewählten Mapillary-Ansichten).
        </p>
      </div>

      <Link
        to="/ort"
        search={(prev) => prev}
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700"
      >
        Neue Prüfung starten
        <ArrowRight size={18} />
      </Link>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Prüfpunkte ({CHECK_STEPS.length})
      </h2>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CHECK_STEPS.map((s) => (
          <li key={s.id} className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white"
              style={{ backgroundColor: s.color }}
            >
              <s.icon size={16} />
            </span>
            <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-gray-500">{s.no}</span>
            <span className="text-sm text-gray-800">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
