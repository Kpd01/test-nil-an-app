// Utility functions to prevent API caching

export const createNoCacheHeaders = () => ({
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
})

export const fetchWithNoCache = async (url: string, options: RequestInit = {}) => {
  const timestamp = Date.now()
  const separator = url.includes("?") ? "&" : "?"
  const urlWithTimestamp = `${url}${separator}_t=${timestamp}`

  return fetch(urlWithTimestamp, {
    ...options,
    headers: {
      ...createNoCacheHeaders(),
      ...options.headers,
    },
  })
}

export const revalidatePage = () => {
  if (typeof window !== "undefined") {
    // Force page reload without cache
    window.location.reload()
  }
}
