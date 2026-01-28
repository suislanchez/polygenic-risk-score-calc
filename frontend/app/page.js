'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import RiskGauge from '../components/ui/RiskGauge'
import ProgressBar from '../components/ui/ProgressBar'
import { AnimatedDNAHelix, AnimatedRiskModifier } from '../components/animations'
import {
  calculateCombinedRisk,
  getRiskCategory,
  generateRiskSummary,
  calculateBMI,
  getBMICategory,
} from '../lib/riskModifiers'

// Storage keys
const RESULTS_STORAGE_KEY = 'prs_results'
const QUESTIONNAIRE_STORAGE_KEY = 'prs_questionnaire'

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

// DNA Helix Icon
const DNAIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 15c6.667-6 13.333 0 20-6" />
    <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
    <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
    <path d="M17 6l-2.5-2.5" />
    <path d="M14 8l-3-3" />
    <path d="M7 18l2.5 2.5" />
    <path d="M3.5 14.5l.5.5" />
    <path d="M20 9l.5.5" />
    <path d="M6.5 12.5l1 1" />
    <path d="M16.5 10.5l1 1" />
    <path d="M10 16l-2 2" />
  </svg>
)

// Upload Icon
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

// Clipboard Icon
const ClipboardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 14l2 2 4-4" />
  </svg>
)

// Chart Icon
const ChartIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

// Shield Icon
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

// Database Icon
const DatabaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)

// Globe Icon
const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

// Check Circle Icon
const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

// Eye Icon
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid var(--color-border, #e2e8f0)',
        borderTop: '4px solid var(--color-primary, #0ea5e9)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ marginTop: '20px', color: 'var(--color-text-secondary, #64748b)', fontSize: '1.1rem' }}>
        Analyzing your DNA...
      </p>
      <p style={{ color: 'var(--color-text-muted, #94a3b8)', fontSize: '0.9rem' }}>
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
function RiskBar({ percentile, riskCategory, adjustedPercentile }) {
  const clampedPercentile = Math.min(100, Math.max(0, percentile))
  const clampedAdjusted = adjustedPercentile ? Math.min(100, Math.max(0, adjustedPercentile)) : null

  return (
    <div style={{ width: '100%', marginTop: '12px' }}>
      <div style={{
        position: 'relative',
        height: '8px',
        borderRadius: '4px',
        background: 'linear-gradient(to right, #22c55e 0%, #86efac 25%, #fbbf24 50%, #fb923c 75%, #ef4444 100%)',
        overflow: 'visible',
      }}>
        {/* Original marker (if adjusted exists) */}
        {clampedAdjusted !== null && clampedAdjusted !== clampedPercentile && (
          <div style={{
            position: 'absolute',
            left: `${clampedPercentile}%`,
            top: '-2px',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            background: '#94a3b8',
            borderRadius: '50%',
            opacity: 0.5,
          }} />
        )}
        {/* Main Marker */}
        <div style={{
          position: 'absolute',
          left: `${clampedAdjusted !== null ? clampedAdjusted : clampedPercentile}%`,
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
        color: 'var(--color-text-muted, #94a3b8)',
      }}>
        <span>Low Risk</span>
        <span>High Risk</span>
      </div>
    </div>
  )
}

// Risk Summary Component
function RiskSummary({ results, useAdjusted }) {
  const counts = { 'Very Low': 0, 'Low': 0, 'Average': 0, 'Elevated': 0, 'High': 0 }

  Object.values(results).forEach(data => {
    const category = useAdjusted && data.adjusted_risk_category
      ? data.adjusted_risk_category
      : data.risk_category
    if (counts.hasOwnProperty(category)) {
      counts[category]++
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

// Questionnaire Summary Card Component
function QuestionnaireSummaryCard({ data, onEdit, onClear }) {
  const bmi = data.height && data.weight
    ? calculateBMI(data.height, data.weight)
    : null

  const riskSummary = generateRiskSummary(data)

  return (
    <Card style={{
      background: 'linear-gradient(135deg, var(--color-primary-light, #e0f2fe), var(--color-secondary-light, #ccfbf1))',
      border: '1px solid var(--color-primary, #0ea5e9)',
      marginBottom: 'var(--spacing-6, 1.5rem)',
    }} padding="md">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--spacing-4, 1rem)',
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: 'var(--font-size-lg, 1.125rem)',
            color: 'var(--color-secondary-dark, #115e59)',
            fontWeight: 'var(--font-weight-semibold, 600)',
          }}>
            Pre-Test Questionnaire Complete
          </h3>
          <p style={{
            margin: '4px 0 0',
            fontSize: 'var(--font-size-sm, 0.875rem)',
            color: 'var(--color-text-secondary, #64748b)',
          }}>
            Risk modifiers will be applied to your results
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--spacing-3, 0.75rem)',
        marginBottom: 'var(--spacing-4, 1rem)',
      }}>
        {data.age && (
          <div style={{ background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-lg, 0.5rem)' }}>
            <div style={{ fontSize: 'var(--font-size-xs, 0.75rem)', color: 'var(--color-text-secondary, #64748b)' }}>Age</div>
            <div style={{ fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-text-primary, #1e293b)' }}>{data.age} years</div>
          </div>
        )}
        {data.biologicalSex && (
          <div style={{ background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-lg, 0.5rem)' }}>
            <div style={{ fontSize: 'var(--font-size-xs, 0.75rem)', color: 'var(--color-text-secondary, #64748b)' }}>Sex</div>
            <div style={{ fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-text-primary, #1e293b)', textTransform: 'capitalize' }}>
              {data.biologicalSex}
            </div>
          </div>
        )}
        {bmi && (
          <div style={{ background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-lg, 0.5rem)' }}>
            <div style={{ fontSize: 'var(--font-size-xs, 0.75rem)', color: 'var(--color-text-secondary, #64748b)' }}>BMI</div>
            <div style={{ fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-text-primary, #1e293b)' }}>
              {bmi.toFixed(1)} ({getBMICategory(bmi)})
            </div>
          </div>
        )}
        {data.smokingStatus && (
          <div style={{ background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-lg, 0.5rem)' }}>
            <div style={{ fontSize: 'var(--font-size-xs, 0.75rem)', color: 'var(--color-text-secondary, #64748b)' }}>Smoking</div>
            <div style={{ fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-text-primary, #1e293b)', textTransform: 'capitalize' }}>
              {data.smokingStatus === 'never' ? 'Never' : data.smokingStatus === 'former' ? 'Former' : 'Current'}
            </div>
          </div>
        )}
        {data.exerciseFrequency && (
          <div style={{ background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-lg, 0.5rem)' }}>
            <div style={{ fontSize: 'var(--font-size-xs, 0.75rem)', color: 'var(--color-text-secondary, #64748b)' }}>Exercise</div>
            <div style={{ fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-text-primary, #1e293b)', textTransform: 'capitalize' }}>
              {data.exerciseFrequency === 'veryActive' ? 'Very Active' :
               data.exerciseFrequency === 'active' ? 'Active' :
               data.exerciseFrequency === 'moderate' ? 'Moderate' : 'Sedentary'}
            </div>
          </div>
        )}
        {data.familyHistory && Object.keys(data.familyHistory).length > 0 && (
          <div style={{ background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-lg, 0.5rem)' }}>
            <div style={{ fontSize: 'var(--font-size-xs, 0.75rem)', color: 'var(--color-text-secondary, #64748b)' }}>Family History</div>
            <div style={{ fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-text-primary, #1e293b)' }}>
              {Object.keys(data.familyHistory).length} condition(s)
            </div>
          </div>
        )}
      </div>

      {(riskSummary.positiveFactors.length > 0 || riskSummary.riskFactors.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {riskSummary.positiveFactors.map((factor, i) => (
            <span
              key={`pos-${i}`}
              style={{
                padding: '4px 10px',
                background: 'var(--color-success-light, #dcfce7)',
                color: '#166534',
                borderRadius: 'var(--radius-full, 9999px)',
                fontSize: 'var(--font-size-xs, 0.75rem)',
              }}
            >
              + {factor}
            </span>
          ))}
          {riskSummary.riskFactors.map((factor, i) => (
            <span
              key={`risk-${i}`}
              style={{
                padding: '4px 10px',
                background: 'var(--color-danger-light, #fee2e2)',
                color: '#991b1b',
                borderRadius: 'var(--radius-full, 9999px)',
                fontSize: 'var(--font-size-xs, 0.75rem)',
              }}
            >
              - {factor}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

// Disease Card Component with Adjusted Risk
function DiseaseCard({ disease, data, index, questionnaireData }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80)
    return () => clearTimeout(timer)
  }, [index])

  // Calculate adjusted risk if questionnaire data exists
  let adjustedData = null
  if (questionnaireData && Object.keys(questionnaireData).length > 0) {
    const combined = calculateCombinedRisk(data.percentile, questionnaireData, disease)
    adjustedData = {
      adjustedPercentile: combined.adjustedPercentile,
      adjustedCategory: getRiskCategory(combined.adjustedPercentile),
      lifestyleModifier: combined.lifestyleModifier,
      familyModifier: combined.familyModifier,
    }
  }

  const displayPercentile = adjustedData ? adjustedData.adjustedPercentile : data.percentile
  const displayCategory = adjustedData ? adjustedData.adjustedCategory : data.risk_category
  const hasAdjustment = adjustedData && Math.abs(adjustedData.adjustedPercentile - data.percentile) > 0.5

  return (
    <Card
      style={{
        background: RISK_BG_COLORS[displayCategory] || 'white',
        border: `1px solid ${RISK_COLORS[displayCategory]}40`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
      padding="md"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            textTransform: 'capitalize',
            fontSize: 'var(--font-size-lg, 1.125rem)',
            color: 'var(--color-text-primary, #1e293b)',
          }}>
            {disease.replace(/_/g, ' ')}
          </h3>
          <p style={{
            margin: '4px 0 0',
            color: 'var(--color-text-secondary, #64748b)',
            fontSize: 'var(--font-size-sm, 0.875rem)'
          }}>
            {data.matched_variants.toLocaleString()} / {data.total_variants.toLocaleString()} variants matched
          </p>
          {hasAdjustment && (
            <p style={{
              margin: '6px 0 0',
              color: 'var(--color-secondary, #0d9488)',
              fontSize: 'var(--font-size-xs, 0.75rem)',
              fontStyle: 'italic',
            }}>
              Genetic: {data.percentile.toFixed(1)}% | Adjusted with lifestyle/family factors
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right', marginLeft: '16px' }}>
          <div style={{
            fontSize: 'var(--font-size-3xl, 1.875rem)',
            fontWeight: 'var(--font-weight-bold, 700)',
            color: RISK_COLORS[displayCategory] || 'var(--color-text-secondary, #64748b)',
            lineHeight: 1,
          }}>
            {displayPercentile.toFixed(1)}%
          </div>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full, 9999px)',
            fontSize: 'var(--font-size-xs, 0.75rem)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            marginTop: '6px',
            background: RISK_COLORS[displayCategory] || 'var(--color-border, #e2e8f0)',
            color: displayCategory === 'Average' ? '#000' : '#fff',
          }}>
            {displayCategory}
          </div>
        </div>
      </div>
      <RiskBar
        percentile={data.percentile}
        riskCategory={displayCategory}
        adjustedPercentile={adjustedData?.adjustedPercentile}
      />
    </Card>
  )
}

// Hero Section Component
function HeroSection({ onGetStarted }) {
  return (
    <section style={{
      position: 'relative',
      background: 'var(--gradient-dna, linear-gradient(135deg, #0c4a6e 0%, #155e75 25%, #0891b2 50%, #0d9488 75%, #115e59 100%))',
      color: 'white',
      padding: 'var(--spacing-16, 4rem) var(--spacing-5, 1.25rem)',
      overflow: 'hidden',
    }}>
      {/* Background DNA pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c2 10 8 15 8 30s-6 20-8 30c-2-10-8-15-8-30s6-20 8-30z' fill='white' fill-opacity='0.3'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />

      <div style={{
        maxWidth: 'var(--container-lg, 1024px)',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
      }}>
        {/* Animated DNA Helix - Manim-style */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-4, 1rem)',
        }}>
          <AnimatedDNAHelix
            width={120}
            height={160}
            autoPlay={true}
            speed={0.8}
            highlightVariant={3}
            style={{
              filter: 'drop-shadow(0 0 20px rgba(88, 196, 221, 0.4))',
            }}
          />
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 'var(--font-weight-bold, 700)',
          marginBottom: 'var(--spacing-4, 1rem)',
          lineHeight: 'var(--line-height-tight, 1.25)',
        }}>
          Understand Your<br />
          <span style={{
            background: 'linear-gradient(90deg, #38bdf8, #2dd4bf)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Genetic Risk Profile
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: 'rgba(255,255,255,0.9)',
          maxWidth: '600px',
          margin: '0 auto var(--spacing-8, 2rem)',
          lineHeight: 'var(--line-height-relaxed, 1.75)',
        }}>
          Calculate polygenic risk scores for 50+ diseases using validated scores from the PGS Catalog.
          Upload your DNA data and get comprehensive insights in minutes.
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--spacing-4, 1rem)',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-10, 2.5rem)',
        }}>
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            style={{
              background: 'white',
              color: 'var(--color-primary-dark, #0369a1)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            Get Started Free
          </Button>
          <Button
            variant="outline"
            size="lg"
            style={{
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
            }}
            onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </div>

        {/* Supported formats badges */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--spacing-3, 0.75rem)',
          justifyContent: 'center',
        }}>
          {['23andMe', 'AncestryDNA', 'VCF'].map(format => (
            <span key={format} style={{
              background: 'rgba(255,255,255,0.15)',
              padding: 'var(--spacing-2, 0.5rem) var(--spacing-4, 1rem)',
              borderRadius: 'var(--radius-full, 9999px)',
              fontSize: 'var(--font-size-sm, 0.875rem)',
              backdropFilter: 'blur(10px)',
            }}>
              {format} supported
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// Stats Section Component
function StatsSection() {
  const stats = [
    { value: '50+', label: 'Diseases Analyzed', icon: <DatabaseIcon /> },
    { value: '5', label: 'Ancestries Supported', icon: <GlobeIcon /> },
    { value: 'PGS', label: 'Catalog Validated', icon: <ShieldIcon /> },
  ]

  return (
    <section style={{
      background: 'var(--color-surface, #ffffff)',
      padding: 'var(--spacing-12, 3rem) var(--spacing-5, 1.25rem)',
      borderBottom: '1px solid var(--color-border, #e2e8f0)',
    }}>
      <div style={{
        maxWidth: 'var(--container-lg, 1024px)',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-8, 2rem)',
        textAlign: 'center',
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-3, 0.75rem)',
          }}>
            <div style={{
              color: 'var(--color-primary, #0ea5e9)',
              marginBottom: 'var(--spacing-2, 0.5rem)',
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: 'var(--font-size-4xl, 2.25rem)',
              fontWeight: 'var(--font-weight-bold, 700)',
              color: 'var(--color-text-primary, #1e293b)',
              lineHeight: 1,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm, 0.875rem)',
              color: 'var(--color-text-secondary, #64748b)',
              fontWeight: 'var(--font-weight-medium, 500)',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Process Steps Section Component
function ProcessSection() {
  const steps = [
    {
      number: '1',
      title: 'Upload DNA File',
      description: 'Securely upload your genetic data from 23andMe, AncestryDNA, or VCF format.',
      icon: <UploadIcon />,
    },
    {
      number: '2',
      title: 'Complete Questionnaire',
      description: 'Add lifestyle and family history data for more accurate risk assessment.',
      icon: <ClipboardIcon />,
    },
    {
      number: '3',
      title: 'Get Results',
      description: 'Receive comprehensive polygenic risk scores for 50+ diseases.',
      icon: <ChartIcon />,
    },
  ]

  return (
    <section id="methodology" style={{
      background: 'var(--color-background, #f8fafc)',
      padding: 'var(--spacing-16, 4rem) var(--spacing-5, 1.25rem)',
    }}>
      <div style={{
        maxWidth: 'var(--container-lg, 1024px)',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-12, 3rem)' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 'var(--font-weight-bold, 700)',
            color: 'var(--color-text-primary, #1e293b)',
            marginBottom: 'var(--spacing-4, 1rem)',
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg, 1.125rem)',
            color: 'var(--color-text-secondary, #64748b)',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Get your genetic risk assessment in three simple steps
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-8, 2rem)',
        }}>
          {steps.map((step, index) => (
            <Card key={index} hover padding="lg" style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--color-primary-light, #e0f2fe)',
                borderRadius: 'var(--radius-2xl, 1rem)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-5, 1.25rem)',
                color: 'var(--color-primary, #0ea5e9)',
              }}>
                {step.icon}
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'var(--gradient-primary, linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%))',
                borderRadius: 'var(--radius-full, 9999px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '-48px auto 0',
                position: 'relative',
                top: '-16px',
                left: '40px',
                color: 'white',
                fontSize: 'var(--font-size-sm, 0.875rem)',
                fontWeight: 'var(--font-weight-bold, 700)',
              }}>
                {step.number}
              </div>
              <h3 style={{
                fontSize: 'var(--font-size-xl, 1.25rem)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-text-primary, #1e293b)',
                marginBottom: 'var(--spacing-3, 0.75rem)',
              }}>
                {step.title}
              </h3>
              <p style={{
                color: 'var(--color-text-secondary, #64748b)',
                lineHeight: 'var(--line-height-relaxed, 1.75)',
              }}>
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Section Component
function FeaturesSection() {
  const features = [
    'PGS Catalog validated polygenic scores',
    'Support for 5 major ancestry groups',
    '50+ diseases and traits analyzed',
    'Lifestyle and family history integration',
    'Comprehensive risk categorization',
    'Educational resources included',
  ]

  return (
    <section style={{
      background: 'var(--color-surface, #ffffff)',
      padding: 'var(--spacing-16, 4rem) var(--spacing-5, 1.25rem)',
    }}>
      <div style={{
        maxWidth: 'var(--container-lg, 1024px)',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--spacing-12, 3rem)',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 'var(--font-weight-bold, 700)',
            color: 'var(--color-text-primary, #1e293b)',
            marginBottom: 'var(--spacing-4, 1rem)',
          }}>
            Scientific Rigor Meets<br />
            <span style={{ color: 'var(--color-primary, #0ea5e9)' }}>User-Friendly Design</span>
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg, 1.125rem)',
            color: 'var(--color-text-secondary, #64748b)',
            marginBottom: 'var(--spacing-6, 1.5rem)',
            lineHeight: 'var(--line-height-relaxed, 1.75)',
          }}>
            Our calculator uses validated polygenic scores from the PGS Catalog, ensuring accuracy and reliability
            while presenting results in an easy-to-understand format.
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {features.map((feature, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3, 0.75rem)',
                padding: 'var(--spacing-2, 0.5rem) 0',
                color: 'var(--color-text-primary, #1e293b)',
              }}>
                <span style={{ color: 'var(--color-success, #22c55e)' }}>
                  <CheckCircleIcon />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Card padding="lg" shadow="xl" style={{ maxWidth: '320px' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-4, 1rem)' }}>
              <p style={{
                fontSize: 'var(--font-size-sm, 0.875rem)',
                color: 'var(--color-text-secondary, #64748b)',
                marginBottom: 'var(--spacing-2, 0.5rem)',
              }}>
                Example Risk Gauge
              </p>
              <h4 style={{
                fontSize: 'var(--font-size-lg, 1.125rem)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-text-primary, #1e293b)',
              }}>
                Type 2 Diabetes
              </h4>
            </div>
            <RiskGauge percentile={72.5} riskCategory="Elevated" size={240} />
          </Card>
        </div>
      </div>
    </section>
  )
}

// Interactive Animation Demo Section - Manim-style
function AnimationDemoSection() {
  return (
    <section style={{
      background: 'var(--color-surface-secondary, #f8fafc)',
      padding: 'var(--spacing-16, 4rem) var(--spacing-5, 1.25rem)',
    }}>
      <div style={{
        maxWidth: 'var(--container-lg, 1024px)',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
          fontWeight: 'var(--font-weight-bold, 700)',
          color: 'var(--color-text-primary, #1e293b)',
          marginBottom: 'var(--spacing-3, 0.75rem)',
        }}>
          See How <span style={{ color: 'var(--color-primary, #0ea5e9)' }}>Lifestyle</span> Affects Your Risk
        </h2>
        <p style={{
          fontSize: 'var(--font-size-lg, 1.125rem)',
          color: 'var(--color-text-secondary, #64748b)',
          marginBottom: 'var(--spacing-8, 2rem)',
          maxWidth: '600px',
          margin: '0 auto var(--spacing-8, 2rem)',
        }}>
          Genetics isn't destiny. Watch how modifiable factors like smoking, exercise, and diet
          can significantly adjust your genetic risk score.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <AnimatedRiskModifier
            baseRisk={60}
            modifiers={[
              { name: 'No Smoking', impact: -8, color: '#83C167', icon: '🚭' },
              { name: 'Exercise', impact: -12, color: '#5CD0B3', icon: '🏃' },
              { name: 'Healthy Diet', impact: -7, color: '#58C4DD', icon: '🥗' },
            ]}
            width={500}
            height={200}
            autoPlay={true}
            title="Example: Reducing Cardiovascular Risk"
          />
        </div>
        <p style={{
          fontSize: 'var(--font-size-sm, 0.875rem)',
          color: 'var(--color-text-muted, #94a3b8)',
          marginTop: 'var(--spacing-4, 1rem)',
          fontStyle: 'italic',
        }}>
          Animation inspired by 3Blue1Brown's educational visualizations
        </p>
      </div>
    </section>
  )
}

// Calculator Section Component
function CalculatorSection({ questionnaireData, questionnaireCompleted, onClearQuestionnaire }) {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [ancestry, setAncestry] = useState(questionnaireData?.ancestry || 'EUR')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (questionnaireData?.ancestry) {
      setAncestry(questionnaireData.ancestry)
    }
  }, [questionnaireData])

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
        // Store results in localStorage for the results page
        localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(data))
        // Also store questionnaire data if available
        if (questionnaireData) {
          localStorage.setItem(QUESTIONNAIRE_STORAGE_KEY, JSON.stringify(questionnaireData))
        }
      } else {
        setError(data.message || 'Computation failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Navigate to detailed results page
  const handleViewDetailedResults = () => {
    router.push('/results')
  }

  // Sort results by adjusted percentile (highest risk first)
  const sortedResults = results?.prs_results
    ? Object.entries(results.prs_results).sort((a, b) => {
        const percentileA = questionnaireData
          ? calculateCombinedRisk(a[1].percentile, questionnaireData, a[0]).adjustedPercentile
          : a[1].percentile
        const percentileB = questionnaireData
          ? calculateCombinedRisk(b[1].percentile, questionnaireData, b[0]).adjustedPercentile
          : b[1].percentile
        return percentileB - percentileA
      })
    : []

  return (
    <section id="calculator" style={{
      background: 'var(--color-background, #f8fafc)',
      padding: 'var(--spacing-16, 4rem) var(--spacing-5, 1.25rem)',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-10, 2.5rem)' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 'var(--font-weight-bold, 700)',
            color: 'var(--color-text-primary, #1e293b)',
            marginBottom: 'var(--spacing-4, 1rem)',
          }}>
            Calculate Your Risk Scores
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg, 1.125rem)',
            color: 'var(--color-text-secondary, #64748b)',
          }}>
            Upload your DNA data to get started
          </p>
        </div>

        {/* Questionnaire CTA or Summary */}
        {!questionnaireCompleted ? (
          <Link href="/questionnaire" style={{ textDecoration: 'none' }}>
            <Card
              hover
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-light, #e0f2fe), var(--color-secondary-light, #ccfbf1))',
                border: '2px dashed var(--color-primary, #0ea5e9)',
                marginBottom: 'var(--spacing-6, 1.5rem)',
                cursor: 'pointer',
              }}
              padding="md"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4, 1rem)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--gradient-primary, linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%))',
                  borderRadius: 'var(--radius-xl, 0.75rem)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'white',
                }}>
                  <ClipboardIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: 'var(--font-size-lg, 1.125rem)',
                    color: 'var(--color-secondary-dark, #115e59)',
                    fontWeight: 'var(--font-weight-semibold, 600)',
                  }}>
                    Complete Pre-Test Questionnaire (Recommended)
                  </h3>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: 'var(--font-size-sm, 0.875rem)',
                    color: 'var(--color-text-secondary, #64748b)',
                  }}>
                    Enhance accuracy with lifestyle, family history, and biometric data
                  </p>
                </div>
                <div style={{
                  color: 'var(--color-primary, #0ea5e9)',
                  fontSize: '24px',
                }}>
                  &rarr;
                </div>
              </div>
            </Card>
          </Link>
        ) : questionnaireData ? (
          <QuestionnaireSummaryCard
            data={questionnaireData}
            onEdit={() => window.location.href = '/questionnaire'}
            onClear={onClearQuestionnaire}
          />
        ) : null}

        {/* Form */}
        <Card padding="lg" shadow="lg" style={{ marginBottom: 'var(--spacing-8, 2rem)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 'var(--spacing-6, 1.5rem)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--spacing-2, 0.5rem)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-text-primary, #1e293b)',
              }}>
                Upload DNA File
              </label>
              <div style={{
                border: file ? '2px solid var(--color-success, #22c55e)' : '2px dashed var(--color-border, #e2e8f0)',
                borderRadius: 'var(--radius-xl, 0.75rem)',
                padding: 'var(--spacing-8, 2rem)',
                textAlign: 'center',
                background: file ? 'var(--color-success-light, #dcfce7)' : 'var(--color-border-light, #f1f5f9)',
                cursor: 'pointer',
                transition: 'all var(--transition-base, 200ms ease)',
                position: 'relative',
              }}>
                <input
                  type="file"
                  accept=".txt,.csv,.tsv,.vcf"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
                {file ? (
                  <div>
                    <div style={{ color: 'var(--color-success, #22c55e)', marginBottom: 'var(--spacing-2, 0.5rem)' }}>
                      <CheckCircleIcon />
                    </div>
                    <p style={{ fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-success-dark, #16a34a)' }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-sm, 0.875rem)', color: 'var(--color-text-secondary, #64748b)' }}>
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: 'var(--color-text-muted, #94a3b8)', marginBottom: 'var(--spacing-2, 0.5rem)' }}>
                      <UploadIcon />
                    </div>
                    <p style={{ color: 'var(--color-text-secondary, #64748b)' }}>
                      Drag & drop or click to upload
                    </p>
                    <p style={{ fontSize: 'var(--font-size-sm, 0.875rem)', color: 'var(--color-text-muted, #94a3b8)', marginTop: 'var(--spacing-2, 0.5rem)' }}>
                      Supports 23andMe, AncestryDNA, and VCF formats
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-6, 1.5rem)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--spacing-2, 0.5rem)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                color: 'var(--color-text-primary, #1e293b)',
              }}>
                Select Ancestry
                {questionnaireCompleted && questionnaireData?.ancestry && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: 'var(--font-size-sm, 0.875rem)',
                    fontWeight: 'var(--font-weight-normal, 400)',
                    color: 'var(--color-secondary, #0d9488)',
                  }}>
                    (from questionnaire)
                  </span>
                )}
              </label>
              <select
                value={ancestry}
                onChange={(e) => setAncestry(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-4, 1rem)',
                  borderRadius: 'var(--radius-xl, 0.75rem)',
                  border: '2px solid var(--color-border, #e2e8f0)',
                  fontSize: 'var(--font-size-base, 1rem)',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast, 150ms ease)',
                }}
              >
                {ANCESTRY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!file || loading}
              leftIcon={!loading && <DNAIcon size={24} />}
            >
              {loading ? 'Analyzing...' : 'Calculate Risk Scores'}
            </Button>
          </form>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card shadow="md">
            <LoadingSpinner />
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card style={{
            background: 'var(--color-danger-light, #fee2e2)',
            border: '1px solid var(--color-danger, #ef4444)',
            marginBottom: 'var(--spacing-6, 1.5rem)',
          }} padding="md">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3, 0.75rem)',
              color: 'var(--color-danger-dark, #dc2626)',
            }}>
              <strong>Error:</strong>
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Results */}
        {results && !loading && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <style jsx>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <Card padding="lg" shadow="md" style={{ marginBottom: 'var(--spacing-6, 1.5rem)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: 'var(--spacing-4, 1rem)',
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: 'var(--font-size-xl, 1.25rem)',
                  color: 'var(--color-text-primary, #1e293b)',
                }}>
                  Analysis Results
                  {questionnaireCompleted && (
                    <span style={{
                      marginLeft: '12px',
                      fontSize: 'var(--font-size-sm, 0.875rem)',
                      fontWeight: 'var(--font-weight-normal, 400)',
                      color: 'var(--color-secondary, #0d9488)',
                      background: 'var(--color-secondary-light, #ccfbf1)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full, 9999px)',
                    }}>
                      Enhanced with questionnaire data
                    </span>
                  )}
                </h2>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleViewDetailedResults}
                  leftIcon={<EyeIcon />}
                >
                  View Detailed Results
                </Button>
              </div>

              <div style={{
                background: 'var(--color-success-light, #dcfce7)',
                padding: 'var(--spacing-4, 1rem)',
                borderRadius: 'var(--radius-lg, 0.5rem)',
                marginBottom: 'var(--spacing-5, 1.25rem)',
                border: '1px solid var(--color-success, #22c55e)',
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-5, 1.25rem)',
                  fontSize: 'var(--font-size-sm, 0.875rem)',
                }}>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>File: </span>
                    <strong>{results.metadata?.filename}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Variants: </span>
                    <strong>{results.metadata?.variant_count?.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Diseases: </span>
                    <strong>{results.metadata?.diseases_computed}</strong>
                  </div>
                </div>
              </div>

              <RiskSummary results={results.prs_results} useAdjusted={questionnaireCompleted} />
            </Card>

            <div style={{ display: 'grid', gap: 'var(--spacing-4, 1rem)' }}>
              {sortedResults.map(([disease, data], index) => (
                <DiseaseCard
                  key={disease}
                  disease={disease}
                  data={data}
                  index={index}
                  questionnaireData={questionnaireCompleted ? questionnaireData : null}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// Main Page Component
export default function Home() {
  const [questionnaireData, setQuestionnaireData] = useState(null)
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false)

  // Load questionnaire data from localStorage on mount
  useEffect(() => {
    const completed = localStorage.getItem('prs_questionnaire_completed')
    const savedData = localStorage.getItem('prs_questionnaire_data')

    if (completed === 'true' && savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setQuestionnaireData(parsed)
        setQuestionnaireCompleted(true)
      } catch (e) {
        console.error('Failed to parse questionnaire data:', e)
      }
    }
  }, [])

  const handleClearQuestionnaire = () => {
    localStorage.removeItem('prs_questionnaire_completed')
    localStorage.removeItem('prs_questionnaire_data')
    setQuestionnaireData(null)
    setQuestionnaireCompleted(false)
  }

  const scrollToCalculator = () => {
    setTimeout(() => {
      document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-background, #f8fafc)',
    }}>
      <Header currentPage="home" />

      <main style={{ flex: 1 }}>
        <HeroSection onGetStarted={scrollToCalculator} />
        <StatsSection />
        <ProcessSection />
        <FeaturesSection />
        <AnimationDemoSection />
        <CalculatorSection
          questionnaireData={questionnaireData}
          questionnaireCompleted={questionnaireCompleted}
          onClearQuestionnaire={handleClearQuestionnaire}
        />
      </main>

      <Footer />
    </div>
  )
}
