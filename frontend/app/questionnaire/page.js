'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import QuestionnaireForm from '../../components/questionnaire/QuestionnaireForm'

// Color scheme
const COLORS = {
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  secondary: '#0d9488',
  secondaryDark: '#0f766e',
  background: '#f8fafc',
  cardBg: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    // Check if questionnaire was already completed
    const completed = localStorage.getItem('prs_questionnaire_completed')
    if (completed === 'true') {
      // Redirect to main page if already completed
      router.push('/')
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleComplete = (data) => {
    // Mark questionnaire as complete and redirect
    localStorage.setItem('prs_questionnaire_completed', 'true')
    localStorage.setItem('prs_questionnaire_data', JSON.stringify(data))
    router.push('/')
  }

  const handleStartOver = () => {
    // Clear saved data and reset
    localStorage.removeItem('prs_questionnaire_completed')
    localStorage.removeItem('prs_questionnaire_data')
    setShowWelcome(true)
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${COLORS.border}`,
          borderTop: `3px solid ${COLORS.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (showWelcome) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.background,
        padding: '40px 20px',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '36px',
            }}>
              <span role="img" aria-label="clipboard">&#128203;</span>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
              fontWeight: '700',
              color: COLORS.text,
              marginBottom: '12px',
            }}>
              Pre-Test Questionnaire
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: COLORS.textLight,
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}>
              Enhance your genetic risk assessment with lifestyle and family history information
            </p>
          </div>

          {/* Welcome Card */}
          <div style={{
            background: COLORS.cardBg,
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: COLORS.text,
              marginBottom: '20px',
            }}>
              Why complete this questionnaire?
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  icon: '&#128200;',
                  title: 'More Accurate Results',
                  description: 'Lifestyle factors can significantly modify genetic risk. Including this data improves accuracy.',
                },
                {
                  icon: '&#128106;',
                  title: 'Family History Matters',
                  description: 'Having relatives with certain conditions can increase your risk beyond genetics alone.',
                },
                {
                  icon: '&#128161;',
                  title: 'Personalized Insights',
                  description: 'Get recommendations tailored to your specific risk factors and lifestyle.',
                },
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  background: `${COLORS.primary}08`,
                  borderRadius: '12px',
                  border: `1px solid ${COLORS.primary}20`,
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: `linear-gradient(135deg, ${COLORS.primary}20, ${COLORS.secondary}20)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>
                    <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: COLORS.text,
                      marginBottom: '4px',
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: COLORS.textLight,
                      margin: 0,
                      lineHeight: '1.5',
                    }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: `${COLORS.secondary}10`,
              borderRadius: '12px',
              border: `1px solid ${COLORS.secondary}30`,
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: COLORS.text,
                margin: 0,
                lineHeight: '1.6',
              }}>
                <strong>Privacy Note:</strong> All information is stored locally on your device and is never transmitted
                to our servers. Your data is used solely to enhance your risk calculations.
              </p>
            </div>
          </div>

          {/* What to Expect */}
          <div style={{
            background: COLORS.cardBg,
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: COLORS.text,
              marginBottom: '20px',
            }}>
              What to expect
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '16px',
              textAlign: 'center',
            }}>
              {[
                { label: '5 Steps', sublabel: 'Quick sections' },
                { label: '5-10 min', sublabel: 'Estimated time' },
                { label: 'Optional', sublabel: 'Skip any section' },
                { label: 'Saved', sublabel: 'Auto-saved progress' },
              ].map((item, index) => (
                <div key={index} style={{
                  padding: '16px',
                  background: COLORS.background,
                  borderRadius: '12px',
                }}>
                  <div style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: COLORS.primary,
                    marginBottom: '4px',
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: COLORS.textLight,
                  }}>
                    {item.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <button
              onClick={() => setShowWelcome(false)}
              style={{
                width: '100%',
                padding: '18px 32px',
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${COLORS.primary}40`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 6px 20px ${COLORS.primary}50`
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 4px 14px ${COLORS.primary}40`
              }}
            >
              Begin Questionnaire
            </button>

            <button
              onClick={() => router.push('/')}
              style={{
                width: '100%',
                padding: '16px 32px',
                background: 'transparent',
                color: COLORS.textLight,
                border: `2px solid ${COLORS.border}`,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary
                e.currentTarget.style.color = COLORS.primary
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = COLORS.border
                e.currentTarget.style.color = COLORS.textLight
              }}
            >
              Skip for now - Go directly to DNA upload
            </button>
          </div>

          {/* Footer */}
          <p style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: COLORS.textLight,
            marginTop: '24px',
          }}>
            You can always complete this questionnaire later from the main page
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.background,
      paddingTop: '20px',
      paddingBottom: '40px',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '0 20px',
        marginBottom: '10px',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: '700',
          color: COLORS.text,
          marginBottom: '8px',
        }}>
          Pre-Test Questionnaire
        </h1>
        <p style={{
          fontSize: '1rem',
          color: COLORS.textLight,
        }}>
          Enhance your genetic risk assessment accuracy
        </p>
      </div>

      <QuestionnaireForm onComplete={handleComplete} />

      {/* Back to Welcome Button */}
      <div style={{
        textAlign: 'center',
        marginTop: '16px',
      }}>
        <button
          onClick={() => setShowWelcome(true)}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            color: COLORS.textLight,
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline',
          }}
        >
          Back to Introduction
        </button>
      </div>
    </div>
  )
}
