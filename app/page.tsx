'use client'

import { useState } from 'react'

export default function HomePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Assistant Code Generator</h1>
      <textarea
        rows={4}
        placeholder="Describe the app you want to build..."
        style={{ width: '100%', marginTop: 12, padding: 8 }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        style={{ marginTop: 12, padding: '8px 16px' }}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: 20 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 32 }}>
          <h2>📦 Generated Files</h2>
          <ul>
            {result.files?.map((file: any, idx: number) => (
              <li key={idx} style={{ marginBottom: 24 }}>
                <strong>
                  {file.path}/{file.filename}
                </strong>
                <pre
                  style={{
                    background: '#f4f4f4',
                    padding: 12,
                    marginTop: 4,
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto'
                  }}
                >
                  {file.content}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
