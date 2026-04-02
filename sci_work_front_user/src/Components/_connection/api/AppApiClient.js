export const getApiMethod = (baseUrl, sessionToken, method) => {
    
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${sessionToken}`
  })

  const methods = {
    get: async (path) => {
      const response = await fetch(`${baseUrl}/${path}`, { headers: getHeaders() })
      if (!response.ok) throw new Error(`GET ${path} failed: ${response.status}`)
      return response.json()
    },

    patch: async (path, payload) => {
      const response = await fetch(`${baseUrl}/${path}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error(`PATCH ${path} failed: ${response.status}`)
      return response.json()
    },

    post: async (path, payload) => {
      const response = await fetch(`${baseUrl}/${path}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error(`POST ${path} failed: ${response.status}`)
      return response.json()
    }
  }

  return methods[method.toLowerCase()]
}