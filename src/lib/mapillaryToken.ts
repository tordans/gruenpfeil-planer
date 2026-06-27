/**
 * Mapillary access token handling. Default comes from the build-time env var;
 * the user can override it at runtime (persisted to localStorage), mirroring the
 * official mapillary/api-demo "Change access token" flow.
 */
const LS_KEY = 'gp.mapillaryToken'

const ENV_TOKEN = (import.meta.env.VITE_MAPILLARY_TOKEN as string | undefined) ?? ''

export function getMapillaryToken(): string {
  try {
    return localStorage.getItem(LS_KEY) || ENV_TOKEN
  } catch {
    return ENV_TOKEN
  }
}

export function setMapillaryToken(token: string): void {
  try {
    if (token) localStorage.setItem(LS_KEY, token)
    else localStorage.removeItem(LS_KEY)
  } catch {
    /* ignore */
  }
}

export function hasMapillaryToken(): boolean {
  return getMapillaryToken().trim().length > 0
}
