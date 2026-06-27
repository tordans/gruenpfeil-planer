import { useMemo, type ReactNode } from 'react'
import {
  Map,
  Source,
  Layer,
  Marker,
  NavigationControl,
  ScaleControl,
  AttributionControl,
  type MapLayerMouseEvent,
  type ViewStateChangeEvent,
} from 'react-map-gl/maplibre'
import type { FeatureCollection } from 'geojson'
import { useDoc } from '~/lib/useDoc'
import { decodeGeo } from '~/domain/geoParam'
import { STEP_BY_ID, getStep } from '~/domain/steps'
import { StepIcon } from '~/components/StepIcon'
import { TrafficLight } from '~/components/icons'
import { mapillaryTileUrl, MLY_IMAGE_LAYER, ONE_YEAR_MS } from '~/domain/mapillary'

const BASEMAP = 'https://tiles.openfreemap.org/styles/liberty'
const DEFAULT_VIEW = { longitude: 13.404954, latitude: 52.520008, zoom: 12 }
export const COVERAGE_POINTS_LAYER = 'mly-image-points'
export const COVERAGE_CONES_LAYER = 'mly-image-cones'

type Props = {
  mapId?: string
  /** generic map click (after coverage picking is handled) */
  onMapClick?: (lngLat: [number, number], e: MapLayerMouseEvent) => void
  /** show Mapillary coverage + cones and make them clickable */
  coverage?: boolean
  coverageYears?: number
  onPickImage?: (imageId: string) => void
  cursor?: string
  /** preview of a feature currently being drawn */
  draft?: FeatureCollection | null
  /** candidate OSM ways (highlight for picking) */
  overlay?: FeatureCollection | null
  /** extra markers / overlays */
  children?: ReactNode
  /** capture the canvas for screenshots (report) */
  preserveDrawingBuffer?: boolean
}

export function MapCanvas({
  mapId = 'pruefmap',
  onMapClick,
  coverage = false,
  coverageYears = 2,
  onPickImage,
  cursor,
  draft,
  overlay,
  children,
  preserveDrawingBuffer = false,
}: Props) {
  const [doc, setDoc] = useDoc()

  const initialView = useMemo(() => {
    if (doc.view?.lng != null && doc.view?.lat != null) {
      return { longitude: doc.view.lng, latitude: doc.view.lat, zoom: doc.view.zoom ?? 17 }
    }
    if (doc.signal) return { longitude: doc.signal.lng, latitude: doc.signal.lat, zoom: 18 }
    return DEFAULT_VIEW
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Drawn features (geo) coloured per step.
  const drawn = useMemo(() => {
    const fc = decodeGeo(doc.geo)
    const features = fc.features.map((f) => ({
      ...f,
      properties: { ...f.properties, color: getStep(f.properties.step)?.color ?? '#334155' },
    }))
    return { type: 'FeatureCollection', features } as FeatureCollection
  }, [doc.geo])

  // from / to movement lines.
  const movement = useMemo(() => {
    const features: FeatureCollection['features'] = []
    if (doc.from?.coords?.length)
      features.push({
        type: 'Feature',
        properties: { color: STEP_BY_ID.from.color, role: 'from' },
        geometry: { type: 'LineString', coordinates: doc.from.coords },
      })
    if (doc.to?.coords?.length)
      features.push({
        type: 'Feature',
        properties: { color: STEP_BY_ID.to.color, role: 'to' },
        geometry: { type: 'LineString', coordinates: doc.to.coords },
      })
    return { type: 'FeatureCollection', features } as FeatureCollection
  }, [doc.from, doc.to])

  const coverageFilter = useMemo(
    () => ['>=', ['get', 'captured_at'], Date.now() - coverageYears * ONE_YEAR_MS] as never,
    [coverageYears],
  )

  function handleClick(e: MapLayerMouseEvent) {
    const feature = e.features?.[0]
    if (coverage && feature && onPickImage) {
      const id = feature.properties?.id
      if (id) {
        onPickImage(String(id))
        return
      }
    }
    onMapClick?.([e.lngLat.lng, e.lngLat.lat], e)
  }

  function handleMoveEnd(e: ViewStateChangeEvent) {
    const { longitude, latitude, zoom, bearing } = e.viewState
    setDoc((prev) => ({
      ...prev,
      view: {
        lng: round(longitude),
        lat: round(latitude),
        zoom: Math.round(zoom * 100) / 100,
        bearing: Math.round(bearing),
      },
    }))
  }

  const interactiveLayerIds = coverage ? [COVERAGE_CONES_LAYER, COVERAGE_POINTS_LAYER] : []

  return (
    <Map
      id={mapId}
      initialViewState={initialView}
      mapStyle={BASEMAP}
      onClick={handleClick}
      onMoveEnd={handleMoveEnd}
      onLoad={(e) => e.target.resize()}
      interactiveLayerIds={interactiveLayerIds}
      cursor={cursor}
      attributionControl={false}
      preserveDrawingBuffer={preserveDrawingBuffer}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <NavigationControl position="top-right" />
      <ScaleControl />
      <AttributionControl
        compact
        customAttribution="© OpenStreetMap · OpenFreeMap · Mapillary"
      />

      {/* Mapillary coverage */}
      {coverage && (
        <Source id="mly" type="vector" tiles={[mapillaryTileUrl()]} minzoom={6} maxzoom={14}>
          <Layer
            id={COVERAGE_CONES_LAYER}
            type="symbol"
            source-layer={MLY_IMAGE_LAYER}
            filter={coverageFilter}
            layout={{
              'text-field': '➤',
              'text-size': 18,
              'text-rotate': ['get', 'compass_angle'],
              'text-rotation-alignment': 'map',
              'text-allow-overlap': true,
              'text-ignore-placement': true,
            }}
            paint={{ 'text-color': '#16a34a', 'text-halo-color': '#fff', 'text-halo-width': 1 }}
          />
          <Layer
            id={COVERAGE_POINTS_LAYER}
            type="circle"
            source-layer={MLY_IMAGE_LAYER}
            filter={coverageFilter}
            paint={{
              'circle-radius': 4,
              'circle-color': '#0a7d28',
              'circle-stroke-color': '#fff',
              'circle-stroke-width': 1,
            }}
          />
        </Source>
      )}

      {/* candidate OSM ways to pick from */}
      {overlay && (
        <Source id="overlay" type="geojson" data={overlay}>
          <Layer
            id="overlay-line"
            type="line"
            paint={{ 'line-color': '#f59e0b', 'line-width': 6, 'line-opacity': 0.45 }}
          />
        </Source>
      )}

      {/* movement (from/to) */}
      <Source id="movement" type="geojson" data={movement}>
        <Layer
          id="movement-line"
          type="line"
          paint={{ 'line-color': ['get', 'color'], 'line-width': 5, 'line-opacity': 0.85 }}
        />
        <Layer
          id="movement-arrow"
          type="symbol"
          layout={{
            'symbol-placement': 'line',
            'text-field': '▶',
            'text-size': 16,
            'text-keep-upright': false,
            'symbol-spacing': 80,
          }}
          paint={{ 'text-color': ['get', 'color'], 'text-halo-color': '#fff', 'text-halo-width': 1 }}
        />
      </Source>

      {/* drawn features */}
      <Source id="drawn" type="geojson" data={drawn}>
        <Layer
          id="drawn-fill"
          type="fill"
          filter={['==', ['geometry-type'], 'Polygon']}
          paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.25 }}
        />
        <Layer
          id="drawn-line"
          type="line"
          filter={['!=', ['geometry-type'], 'Point']}
          paint={{ 'line-color': ['get', 'color'], 'line-width': 3 }}
        />
        <Layer
          id="drawn-point"
          type="circle"
          filter={['==', ['geometry-type'], 'Point']}
          paint={{
            'circle-radius': 5,
            'circle-color': ['get', 'color'],
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 1.5,
          }}
        />
      </Source>

      {/* draft preview while drawing */}
      {draft && (
        <Source id="draft" type="geojson" data={draft}>
          <Layer
            id="draft-line"
            type="line"
            paint={{ 'line-color': '#eab308', 'line-width': 3, 'line-dasharray': [2, 1] }}
          />
          <Layer
            id="draft-point"
            type="circle"
            filter={['==', ['geometry-type'], 'Point']}
            paint={{ 'circle-radius': 4, 'circle-color': '#eab308' }}
          />
        </Source>
      )}

      {/* signal marker */}
      {doc.signal && (
        <Marker longitude={doc.signal.lng} latitude={doc.signal.lat} anchor="bottom">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow ring-2 ring-white"
            title="LZA / Signal"
          >
            <TrafficLight size={18} />
          </span>
        </Marker>
      )}

      {/* from / to start icons (anchored at line start) */}
      {doc.from?.coords?.[0] && (
        <Marker longitude={doc.from.coords[0][0]} latitude={doc.from.coords[0][1]}>
          <StepIcon step={STEP_BY_ID.from} size={14} />
        </Marker>
      )}
      {doc.to?.coords?.[0] && (
        <Marker longitude={doc.to.coords[0][0]} latitude={doc.to.coords[0][1]}>
          <StepIcon step={STEP_BY_ID.to} size={14} />
        </Marker>
      )}

      {/* inspection pins per step */}
      {Object.entries(doc.answers ?? {}).flatMap(([stepId, st]) => {
        const step = getStep(stepId)
        if (!step || !st.pins) return []
        return st.pins.map((p, i) => (
          <Marker key={`${stepId}-${i}`} longitude={p[0]} latitude={p[1]} anchor="bottom">
            <StepIcon step={step} size={14} />
          </Marker>
        ))
      })}

      {children}
    </Map>
  )
}

function round(n: number): number {
  return Math.round(n * 1e6) / 1e6
}
