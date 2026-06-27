import { twMerge } from 'tailwind-merge'
import { Check, X, CircleDashed, AlertTriangle, Circle } from 'lucide-react'
import { CHECK_STEPS } from '~/domain/steps'
import { StepIcon } from '~/components/StepIcon'
import type { Severity } from '~/domain/evaluate'

const SEVERITY_ICON: Record<Severity, { icon: typeof Check; cls: string; title: string }> = {
  ok: { icon: Check, cls: 'text-green-600', title: 'Erfüllt' },
  ausschluss: { icon: X, cls: 'text-red-600', title: 'Ausschluss' },
  warnung: { icon: AlertTriangle, cls: 'text-amber-600', title: 'Warnung' },
  offen: { icon: CircleDashed, cls: 'text-gray-400', title: 'Offen' },
}

type Props = {
  activeId: string
  onSelect: (id: string) => void
  severityById: Record<string, Severity>
}

export function TaskList({ activeId, onSelect, severityById }: Props) {
  return (
    <ol className="space-y-1">
      {CHECK_STEPS.map((step) => {
        const sev = severityById[step.id] ?? 'offen'
        const S = SEVERITY_ICON[sev] ?? { icon: Circle, cls: 'text-gray-400', title: '' }
        const active = activeId === step.id
        return (
          <li key={step.id}>
            <button
              onClick={() => onSelect(step.id)}
              className={twMerge(
                'flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left',
                active ? 'border-yellow-400 bg-yellow-50' : 'border-transparent hover:bg-gray-50',
              )}
            >
              <StepIcon step={step} size={15} active={active} />
              <span className="w-9 shrink-0 text-xs font-semibold text-gray-500">{step.no}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-gray-800">{step.label}</span>
              <S.icon size={16} className={S.cls} aria-label={S.title} />
            </button>
          </li>
        )
      })}
    </ol>
  )
}
