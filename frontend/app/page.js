'use client'

import { useState } from 'react'

const ANCESTRY_OPTIONS = [
  { value: 'EUR', label: 'European' },
  { value: 'AFR', label: 'African' },
  { value: 'EAS', label: 'East Asian' },
  { value: 'AMR', label: 'Latino/Admixed American' },
  { value: 'SAS', label: 'South Asian' },
]

const RISK_COLORS = {
  'Very Low': '#22c55e',
  'Low': '#86efac',
  'Average': '#fbbf24',
  'Elevated': '#fb923c',
  'High': '#ef4444',
}

export default function Home() {
  const [file, setFile] = useState(null)
  const [ancestry, setAncestry] = useState('EUR')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ancestry', ancestry)

      const response = await fetch('/api/compute', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.status === 'success') {
        setResults(data)
      } else {
        setError(data.message || 'Computation failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#1e40af' }}>
          Polygenic Risk Score Calculator
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Calculate your genetic risk for 10 diseases using validated PGS Catalog scores
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{
        background: '#f8fafc',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Upload DNA File
          </label>
          <input
            type="file"
            accept=".txt,.csv,.tsv,.vcf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          />
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '5px' }}>
            Supports 23andMe, AncestryDNA, and VCF formats
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Select Ancestry
          </label>
          <select
            value={ancestry}
            onChange={(e) => setAncestry(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '1rem'
            }}
          >
            {ANCESTRY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#94a3b8' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Computing...' : 'Calculate Risk Scores'}
        </button>
      </form>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '15px',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {results && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>Results</h2>

          <div style={{
            background: '#f0fdf4',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <strong>File:</strong> {results.metadata?.filename} |
            <strong> Variants:</strong> {results.metadata?.variant_count?.toLocaleString()} |
            <strong> Diseases:</strong> {results.metadata?.diseases_computed}
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            {Object.entries(results.prs_results || {}).map(([disease, data]) => (
              <div
                key={disease}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                    {disease.replace(/_/g, ' ')}
                  </h3>
                  <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    {data.matched_variants} / {data.total_variants} variants matched
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: RISK_COLORS[data.risk_category] || '#64748b'
                  }}>
                    {data.percentile.toFixed(1)}%
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: RISK_COLORS[data.risk_category] || '#e2e8f0',
                    color: data.risk_category === 'Average' ? '#000' : '#fff'
                  }}>
                    {data.risk_category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer style={{
        marginTop: '60px',
        padding: '20px',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.85rem'
      }}>
        <p>
          <strong>Disclaimer:</strong> This tool provides genetic risk estimates for educational purposes only.
          Results should NOT be used for medical decisions. Always consult a healthcare provider.
        </p>
      </footer>
    </div>
  )
}
