import sign721 from '~/assets/zeichen-721.svg'
import { twMerge } from 'tailwind-merge'

type Sign721Props = {
  className?: string
}

/** Official StVO sign 721 (Grünpfeil für den Radverkehr), public domain via Wikimedia. */
export function Sign721({ className }: Sign721Props) {
  return (
    <img
      src={sign721}
      alt="Verkehrszeichen 721: Grünpfeilschild mit Beschränkung auf den Radverkehr"
      width={315}
      height={420}
      className={twMerge('h-auto w-20 shrink-0 sm:w-24', className)}
    />
  )
}
