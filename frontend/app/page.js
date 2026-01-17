'use client'

import { useState, useEffect } from 'react'

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

const RISK_BG_COLORS = {
  'Very Low': '#dcfce7',
  'Low': '#d1fae5',
  'Average': '#fef3c7',
  'Elevated': '#ffedd5',
  'High': '#fee2e2',
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ marginTop: '20px', color: '#64748b', fontSize: '1.1rem' }}>
        Analyzing your DNA...
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
        This may take up to 2 minutes
      </p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Risk Bar Visualization Component
function RiskBar({ percentile, riskCategory }) {
  const clampedPercentile = Math.min(100, Math.max(0, percentile))

  return (
    <div style={{ width: '100%', marginTop: '12px' }}>
      <div style={{
        position: 'relative',
        height: '8px',
        borderRadius: '4px',
        background: 'linear-gradient(to right, #22c55e 0%, #86efac 25%, #fbbf24 50%, #fb923c 75%, #ef4444 100%)',
        overflow: 'visible',
      }}>
        {/* Marker */}
        <div style={{
          position: 'absolute',
          left: `${clampedPercentile}%`,
          top: '-4px',
          transform: 'translateX(-50%)',
          width: '16px',
          height: '16px',
          background: 'white',
          border: `3px solid ${RISK_COLORS[riskCategory] || '#64748b'}`,
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '4px',
        fontSize: '0.7rem',
        color: '#94a3b8',
      }}>
        <span>Low Risk</span>
        <span>High Risk</span>
      </div>
    </div>
  )
}

// Risk Summary Component
function RiskSummary({ results }) {
  const counts = { 'Very Low': 0, 'Low': 0, 'Average': 0, 'Elevated': 0, 'High': 0 }

  Object.values(results).forEach(data => {
    if (counts.hasOwnProperty(data.risk_category)) {
      counts[data.risk_category]++
    }
  })

  const summaryItems = [
    { label: 'High', count: counts['High'], color: '#ef4444', bg: '#fee2e2' },
    { label: 'Elevated', count: counts['Elevated'], color: '#fb923c', bg: '#ffedd5' },
    { label: 'Average', count: counts['Average'], color: '#d97706', bg: '#fef3c7' },
    { label: 'Low', count: counts['Low'], color: '#22c55e', bg: '#d1fae5' },
    { label: 'Very Low', count: counts['Very Low'], color: '#16a34a', bg: '#dcfce7' },
  ].filter(item => item.count > 0)

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '20px',
    }}>
      {summaryItems.map(item => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: item.bg,
            borderRadius: '20px',
            border: `1px solid ${item.color}40`,
          }}
        >
          <span style={{
            fontWeight: '700',
            fontSize: '1.2rem',
            color: item.color,
          }}>
            {item.count}
          </span>
          <span style={{
            color: item.color,
            fontWeight: '500',
            fontSize: '0.9rem',
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// Disease Card Component
function DiseaseCard({ disease, data, index }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div
      style={{
        background: RISK_BG_COLORS[data.risk_category] || 'white',
        border: `1px solid ${RISK_COLORS[data.risk_category]}40`,
        borderRadius: '12px',
        padding: '20px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            textTransform: 'capitalize',
            fontSize: '1.1rem',
            color: '#1e293b',
          }}>
            {disease.replace(/_/g, ' ')}
          </h3>
          <p style={{
            margin: '4px 0 0',
            color: '#64748b',
            fontSize: '0.85rem'
          }}>
            {data.matched_variants.toLocaleString()} / {data.total_variants.toLocaleString()} variants matched
          </p>
        </div>
        <div style={{ textAlign: 'right', marginLeft: '16px' }}>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: RISK_COLORS[data.risk_category] || '#64748b',
            lineHeight: 1,
          }}>
            {data.percentile.toFixed(1)}%
          </div>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginTop: '6px',
            background: RISK_COLORS[data.risk_category] || '#e2e8f0',
            color: data.risk_category === 'Average' ? '#000' : '#fff',
          }}>
            {data.risk_category}
          </div>
        </div>
      </div>
      <RiskBar percentile={data.percentile} riskCategory={data.risk_category} />
    </div>
  )
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

  // Sort results by percentile (highest risk first)
  const sortedResults = results?.prs_results
    ? Object.entries(results.prs_results).sort((a, b) => b[1].percentile - a[1].percentile)
    : []

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px 20px',
      minHeight: '100vh',
      background: '#f8fafc',
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        marginBottom: '40px',
        padding: '30px',
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        borderRadius: '16px',
        color: 'white',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
          marginBottom: '10px',
          fontWeight: '700',
        }}>
          Polygenic Risk Score Calculator
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
          margin: 0,
        }}>
          Clinical-grade genetic risk assessment powered by PGS Catalog
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '15px',
          flexWrap: 'wrap',
        }}>
          {['23andMe', 'AncestryDNA', 'VCF'].map(format => (
            <span key={format} style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
            }}>
              {format}
            </span>
          ))}
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{
        background: 'white',
        padding: 'clamp(20px, 5vw, 30px)',
        borderRadius: '16px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#1e293b',
          }}>
            Upload DNA File
          </label>
          <div style={{
            border: file ? '2px solid #22c55e' : '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            background: file ? '#f0fdf4' : '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            <input
              type="file"
              accept=".txt,.csv,.tsv,.vcf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
            />
            {file ? (
              <div>
                <span style={{ fontSize: '2rem' }}>✓</span>
                <p style={{ margin: '8px 0 0', fontWeight: '600', color: '#16a34a' }}>
                  {file.name}
                </p>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '2rem' }}>📁</span>
                <p style={{ margin: '8px 0 0', color: '#64748b' }}>
                  Drag & drop or click to upload
                </p>
              </div>
            )}
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: '#64748b',
            marginTop: '8px',
            textAlign: 'center',
          }}>
            Supports 23andMe, AncestryDNA, and VCF formats
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#1e293b',
          }}>
            Select Ancestry
          </label>
          <select
            value={ancestry}
            onChange={(e) => setAncestry(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
              background: 'white',
              cursor: 'pointer',
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
            padding: '16px',
            background: !file || loading
              ? '#94a3b8'
              : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: !file || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: !file || loading ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.4)',
          }}
        >
          {loading ? '⏳ Analyzing...' : '🧬 Calculate Risk Scores'}
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        }}>
          <LoadingSpinner />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '20px',
          borderRadius: '12px',
          color: '#dc2626',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <strong>Error</strong>
            <p style={{ margin: '4px 0 0' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div style={{
          animation: 'fadeIn 0.5s ease',
        }}>
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{
              margin: '0 0 16px',
              fontSize: '1.4rem',
              color: '#1e293b',
            }}>
              Analysis Results
            </h2>

            <div style={{
              background: '#f0fdf4',
              padding: '16px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '1px solid #bbf7d0',
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                fontSize: '0.95rem',
              }}>
                <div>
                  <span style={{ color: '#64748b' }}>File: </span>
                  <strong>{results.metadata?.filename}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Variants: </span>
                  <strong>{results.metadata?.variant_count?.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Diseases: </span>
                  <strong>{results.metadata?.diseases_computed}</strong>
                </div>
              </div>
            </div>

            <RiskSummary results={results.prs_results} />
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {sortedResults.map(([disease, data], index) => (
              <DiseaseCard
                key={disease}
                disease={disease}
                data={data}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        padding: '24px',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
      }}>
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <p style={{
            margin: 0,
            color: '#92400e',
            fontSize: '0.9rem',
            lineHeight: '1.6',
          }}>
            <strong>⚠️ Medical Disclaimer:</strong> This tool provides genetic risk estimates for educational purposes only.
            Results should NOT be used for medical decisions. Genetic risk is just one factor in disease development.
            Always consult a qualified healthcare provider for personalized medical advice.
          </p>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
          Powered by <a href="https://www.pgscatalog.org" target="_blank" rel="noopener" style={{ color: '#3b82f6' }}>PGS Catalog</a> validated scores
        </p>
      </footer>
    </div>
  )
}
