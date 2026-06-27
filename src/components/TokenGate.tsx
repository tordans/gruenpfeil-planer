import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { setMapillaryToken } from '~/lib/mapillaryToken'

/** Shown when no Mapillary token is configured. Stores the token in localStorage. */
export function TokenGate() {
  const [value, setValue] = useState('')
  return (
    <div className="flex h-full items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow">
        <div className="flex items-center gap-2 font-medium text-gray-900">
          <KeyRound size={18} />
          Mapillary-Token erforderlich
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Zum Laden der Bilder wird ein Mapillary Client-Token benötigt. Du bekommst eins im{' '}
          <a
            href="https://www.mapillary.com/dashboard/developers"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            Mapillary Developer Dashboard
          </a>
          . Der Token bleibt lokal im Browser.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="MLY|…"
          className="mt-3 w-full rounded border-gray-300 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            setMapillaryToken(value.trim())
            location.reload()
          }}
          disabled={!value.trim()}
          className="mt-3 w-full rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          Token speichern
        </button>
      </div>
    </div>
  )
}
