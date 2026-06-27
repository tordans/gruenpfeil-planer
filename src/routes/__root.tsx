import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { MapProvider } from 'react-map-gl/maplibre'
import { zDoc } from '~/domain/doc'
import { Stepper } from '~/components/Stepper'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // The whole check document lives in the URL search params.
  validateSearch: zDoc,
  component: RootLayout,
})

function RootLayout() {
  return (
    <MapProvider>
      <div className="flex h-full flex-col">
        <header className="no-print flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900">Grünpfeil-Planer</span>
            <span className="text-sm text-gray-500">Zeichen 721 · Radverkehr · VwV-StVO XII</span>
          </div>
        </header>
        <Stepper />
        <main className="min-h-0 flex-1">
          <Outlet />
        </main>
      </div>
    </MapProvider>
  )
}
