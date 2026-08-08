const FALLBACK_API = 'http://localhost:8080'
export const API = import.meta.env.VITE_API_URL || FALLBACK_API

if (!import.meta.env.VITE_API_URL) {
  console.warn('[apiConfig] VITE_API_URL is not defined. Falling back to ' + FALLBACK_API)
}
