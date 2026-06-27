import type { ComponentType } from 'react'

/** Common props shared by lucide-react icons and our custom ones. */
export type IconProps = {
  size?: number | string
  className?: string
  strokeWidth?: number
}

export type Icon = ComponentType<IconProps>

/** Lucide has no traffic-light glyph — small custom SVG matching the lucide look. */
export function TrafficLight({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="8" y="2" width="8" height="20" rx="3" />
      <circle cx="12" cy="7" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="12" cy="17" r="1.4" />
    </svg>
  )
}
