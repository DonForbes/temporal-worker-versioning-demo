import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || ''

const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default http


