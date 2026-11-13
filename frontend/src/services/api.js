const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    if (!res.ok) throw new Error(`Healthcheck failed with status ${res.status}`)
    return await res.json()
  } catch (err) {
    return { status: 'error', message: err.message }
  }
}

export async function uploadAndAnalyzeReport(file) {
  if (!file) {
    throw new Error('Please select a report file (PDF, JPG, or PNG).')
  }

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/reports/analyze`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    let errorDetail = `Analysis failed with status ${res.status}`
    try {
      const errJson = await res.json()
      errorDetail = errJson.detail || errorDetail
    } catch {
      // fallback
    }
    throw new Error(errorDetail)
  }

  return await res.json()
}
