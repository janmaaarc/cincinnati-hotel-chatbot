export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const getApiUrl = (path) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`
  }
  return path
}
