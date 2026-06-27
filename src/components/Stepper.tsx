import { Link, useRouterState } from '@tanstack/react-router'
import { MapPin, ListChecks, ClipboardCheck, FileText, Home } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

const PHASES = [
  { to: '/', label: 'Start', icon: Home },
  { to: '/ort', label: '1 · Prüf-Ort', icon: MapPin },
  { to: '/pruefung', label: '2 · Checkliste', icon: ListChecks },
  { to: '/ergebnis', label: '3 · Ergebnis', icon: ClipboardCheck },
  { to: '/bericht', label: '4 · Bericht', icon: FileText },
] as const

export function Stepper() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className="no-print flex items-stretch gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-2 py-1">
      {PHASES.map(({ to, label, icon: Icon }) => {
        const active = pathname === to
        return (
          <Link
            key={to}
            to={to}
            // keep the whole document when moving between phases
            search={(prev) => prev}
            className={twMerge(
              'flex items-center gap-1.5 whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200',
              active && 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200',
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
