import axios from 'axios'

declare global {
  interface Window {
    __APP_CONFIG__?: {
      apiBaseUrl?: string
    }
  }
}

const runtimeBaseUrl =
  typeof window !== 'undefined'
    ? window.__APP_CONFIG__?.apiBaseUrl
    : undefined

const baseURL =
  (runtimeBaseUrl && runtimeBaseUrl.length > 0 ? runtimeBaseUrl : undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string) ||
  ''

const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  transformRequest: [
    (data) => {
      // Allow FormData etc. to pass through untouched
      if (data instanceof FormData) return data
      return data !== undefined ? JSON.stringify(data) : data
    }
  ]
})

export default http


