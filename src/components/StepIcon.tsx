import { twMerge } from 'tailwind-merge'
import type { Step } from '~/domain/steps'

type Props = {
  step: Step
  size?: number
  /** rounded badge with the step colour (used in list + map markers) */
  badge?: boolean
  className?: string
  active?: boolean
}

/**
 * The one place a step's icon is rendered — guarantees the task list item and
 * the map pin/marker show the identical glyph + colour.
 */
export function StepIcon({ step, size = 18, badge = true, className, active }: Props) {
  const Icon = step.icon
  if (!badge) return <Icon size={size} className={className} />
  return (
    <span
      className={twMerge(
        'flex items-center justify-center rounded-full text-white shadow ring-2 ring-white',
        active && 'ring-yellow-300',
        className,
      )}
      style={{
        backgroundColor: step.color,
        width: size + 14,
        height: size + 14,
      }}
      title={`${step.no} · ${step.label}`}
    >
      <Icon size={size} />
    </span>
  )
}
