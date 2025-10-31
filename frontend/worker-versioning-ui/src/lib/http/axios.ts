import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || ''

const http = axios.create({
  baseURL,
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


