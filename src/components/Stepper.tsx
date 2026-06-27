import { Link, useRouterState } from '@tanstack/react-router'
import { MapPin, ListChecks, ClipboardCheck, FileText, Home, Check } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

const PHASES = [
  { to: '/', label: 'Start', icon: Home },
  { to: '/ort', label: 'Prüf-Ort', icon: MapPin },
  { to: '/pruefung', label: 'Checkliste', icon: ListChecks },
  { to: '/ergebnis', label: 'Ergebnis', icon: ClipboardCheck },
  { to: '/bericht', label: 'Bericht', icon: FileText },
] as const

type Status = 'complete' | 'current' | 'upcoming'

export function Stepper() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const currentIdx = Math.max(
    0,
    PHASES.findIndex((p) => p.to === pathname),
  )

  return (
    <nav aria-label="Fortschritt" className="no-print border-b border-gray-200 bg-white px-3 py-2">
      <ol className="flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        {PHASES.map((phase, idx) => {
          const status: Status =
            idx < currentIdx ? 'complete' : idx === currentIdx ? 'current' : 'upcoming'
          return (
            <li key={phase.to} className="relative flex flex-1">
              <Link
                to={phase.to}
                search={(prev) => prev}
                aria-current={status === 'current' ? 'step' : undefined}
                className="group flex w-full items-center px-3 py-2 text-sm font-medium"
              >
                <Badge phase={phase} status={status} />
                <span
                  className={twMerge(
                    'ml-3 hidden text-sm font-medium sm:block',
                    status === 'complete' && 'text-gray-900',
                    status === 'current' && 'text-green-700',
                    status === 'upcoming' && 'text-gray-500 group-hover:text-gray-900',
                  )}
                >
                  <span className="text-gray-400">{idx}.</span> {phase.label}
                </span>
              </Link>

              {idx !== PHASES.length - 1 && (
                <div aria-hidden className="absolute right-0 top-0 hidden h-full w-5 sm:block">
                  <svg
                    fill="none"
                    viewBox="0 0 22 80"
                    preserveAspectRatio="none"
                    className="h-full w-full text-gray-300"
                  >
                    <path
                      d="M0 -2L20 40L0 82"
                      stroke="currentColor"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Badge({ phase, status }: { phase: (typeof PHASES)[number]; status: Status }) {
  const Icon = phase.icon
  if (status === 'complete') {
    return (
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white group-hover:bg-green-700">
        <Icon size={18} />
        <Check size={12} className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white text-green-600" />
      </span>
    )
  }
  if (status === 'current') {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-green-600 text-green-700">
        <Icon size={18} />
      </span>
    )
  }
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 text-gray-400 group-hover:border-gray-400 group-hover:text-gray-600">
      <Icon size={18} />
    </span>
  )
}
