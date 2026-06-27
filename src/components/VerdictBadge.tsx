import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { Verdict } from '~/domain/evaluate'
import { VERDICT_LABEL } from '~/domain/evaluate'

const STYLE: Record<Verdict, { wrap: string; icon: typeof CheckCircle2 }> = {
  zulaessig: { wrap: 'bg-green-100 text-green-900 ring-green-300', icon: CheckCircle2 },
  bedingt: { wrap: 'bg-amber-100 text-amber-900 ring-amber-300', icon: AlertTriangle },
  unzulaessig: { wrap: 'bg-red-100 text-red-900 ring-red-300', icon: XCircle },
}

export function VerdictBadge({ verdict, size = 'lg' }: { verdict: Verdict; size?: 'sm' | 'lg' }) {
  const s = STYLE[verdict]
  const Icon = s.icon
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg font-semibold ring-1 ${s.wrap} ${
        size === 'lg' ? 'px-4 py-2 text-lg' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <Icon size={size === 'lg' ? 22 : 16} />
      {VERDICT_LABEL[verdict]}
    </span>
  )
}
