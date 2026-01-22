'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DISEASES, DISEASE_CATEGORIES, getDiseasesByCategory } from '../../lib/diseaseData';

// Category colors
const CATEGORY_COLORS = {
  cardiovascular: { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626', icon: '#ef4444' },
  oncology: { bg: '#f3e8ff', border: '#d8b4fe', text: '#7c3aed', icon: '#8b5cf6' },
  metabolic: { bg: '#dbeafe', border: '#93c5fd', text: '#2563eb', icon: '#3b82f6' },
  neurological: { bg: '#cffafe', border: '#67e8f9', text: '#0891b2', icon: '#06b6d4' },
  psychiatric: { bg: '#e0e7ff', border: '#a5b4fc', text: '#4f46e5', icon: '#6366f1' },
  autoimmune: { bg: '#d1fae5', border: '#6ee7b7', text: '#059669', icon: '#10b981' },
  respiratory: { bg: '#e0f2fe', border: '#7dd3fc', text: '#0284c7', icon: '#0ea5e9' },
  ophthalmologic: { bg: '#ede9fe', border: '#c4b5fd', text: '#7c3aed', icon: '#8b5cf6' },
  musculoskeletal: { bg: '#ffedd5', border: '#fdba74', text: '#ea580c', icon: '#f97316' },
  dermatologic: { bg: '#fce7f3', border: '#f9a8d4', text: '#db2777', icon: '#ec4899' },
  renal: { bg: '#ccfbf1', border: '#5eead4', text: '#0d9488', icon: '#14b8a6' },
  endocrine: { bg: '#fef3c7', border: '#fcd34d', text: '#d97706', icon: '#f59e0b' },
};

// Disease card component
function DiseaseCard({ disease, onExpand, isExpanded }) {
  const colors = CATEGORY_COLORS[disease.category] || CATEGORY_COLORS.metabolic;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={() => onExpand(disease.id)}
    >
      {/* Card Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '1.05rem',
            color: '#1e293b',
            fontWeight: '600',
          }}>
            {disease.name}
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
          }}>
            <span style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '500',
              background: colors.bg,
              color: colors.text,
            }}>
              {DISEASE_CATEGORIES[disease.category]?.name || disease.category}
            </span>
            <span style={{
              fontSize: '0.8rem',
              color: '#64748b',
            }}>
              {disease.pgsId}
            </span>
          </div>
        </div>
        <div style={{
          textAlign: 'right',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: colors.text,
          }}>
            {disease.heritability}
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            textTransform: 'uppercase',
          }}>
            Heritability
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          borderTop: `1px solid ${colors.border}`,
          padding: '20px',
          background: '#fafafa',
        }}>
          {/* Description */}
          <p style={{
            margin: '0 0 16px 0',
            color: '#475569',
            lineHeight: '1.6',
            fontSize: '0.95rem',
          }}>
            {disease.description}
          </p>

          {/* Key Genes */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '0.85rem',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Key Genes
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {disease.keyGenes.slice(0, 8).map((gene) => (
                <span
                  key={gene}
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    background: '#f1f5f9',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#475569',
                    fontFamily: 'monospace',
                  }}
                >
                  {gene}
                </span>
              ))}
              {disease.keyGenes.length > 8 && (
                <span style={{
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                }}>
                  +{disease.keyGenes.length - 8} more
                </span>
              )}
            </div>
          </div>

          {/* Risk Factors */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '0.85rem',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Risk Factors
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              columns: '2',
              columnGap: '20px',
            }}>
              {disease.riskFactors.slice(0, 6).map((factor, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '0.85rem',
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          {/* Prevention */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '0.85rem',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Prevention Strategies
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
            }}>
              {disease.prevention.slice(0, 4).map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '0.85rem',
                    color: '#475569',
                    marginBottom: '4px',
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.8rem',
            color: '#94a3b8',
          }}>
            <span>Source: {disease.heritabilitySource}</span>
            <a
              href={`https://www.pgscatalog.org/score/${disease.pgsId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb' }}
              onClick={(e) => e.stopPropagation()}
            >
              View in PGS Catalog &rarr;
            </a>
          </div>
        </div>
      )}

      {/* Expand indicator */}
      <div style={{
        padding: '8px',
        textAlign: 'center',
        background: colors.bg,
        color: colors.text,
        fontSize: '0.8rem',
        fontWeight: '500',
      }}>
        {isExpanded ? 'Click to collapse' : 'Click for details'}
      </div>
    </div>
  );
}

// Category filter button
function CategoryButton({ category, isActive, onClick, count }) {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.metabolic;
  const categoryInfo = DISEASE_CATEGORIES[category] || { name: category };

  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '20px',
        border: `1px solid ${isActive ? colors.text : '#e2e8f0'}`,
        background: isActive ? colors.bg : 'white',
        color: isActive ? colors.text : '#64748b',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: isActive ? '600' : '400',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
      }}
    >
      {categoryInfo.name}
      <span style={{
        background: isActive ? colors.text : '#e2e8f0',
        color: isActive ? 'white' : '#64748b',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '0.75rem',
        fontWeight: '600',
      }}>
        {count}
      </span>
    </button>
  );
}

export default function DiseasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedDisease, setExpandedDisease] = useState(null);

  // Get diseases organized by category
  const diseasesByCategory = useMemo(() => getDiseasesByCategory(), []);

  // Filter diseases based on search and category
  const filteredDiseases = useMemo(() => {
    let diseases = Object.values(DISEASES);

    // Filter by category
    if (selectedCategory !== 'all') {
      diseases = diseases.filter((d) => d.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      diseases = diseases.filter((d) =>
        d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.keyGenes.some((g) => g.toLowerCase().includes(query)) ||
        d.pgsId.toLowerCase().includes(query)
      );
    }

    return diseases;
  }, [searchQuery, selectedCategory]);

  // Group filtered diseases by category for display
  const groupedDiseases = useMemo(() => {
    const groups = {};
    filteredDiseases.forEach((disease) => {
      if (!groups[disease.category]) {
        groups[disease.category] = [];
      }
      groups[disease.category].push(disease);
    });
    return groups;
  }, [filteredDiseases]);

  // Count diseases per category
  const categoryCounts = useMemo(() => {
    const counts = { all: Object.values(DISEASES).length };
    Object.values(DISEASES).forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, []);

  const handleExpand = (diseaseId) => {
    setExpandedDisease(expandedDisease === diseaseId ? null : diseaseId);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        padding: '40px 20px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            &larr; Back to Calculator
          </Link>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            margin: '0 0 12px 0',
            fontWeight: '700',
          }}>
            Disease Catalog
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            margin: 0,
            maxWidth: '700px',
          }}>
            Explore 50+ diseases and conditions with detailed genetic information, heritability estimates, and prevention strategies
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            marginTop: '24px',
          }}>
            {[
              { value: Object.keys(DISEASES).length, label: 'Diseases' },
              { value: Object.keys(DISEASE_CATEGORIES).length, label: 'Categories' },
              { value: 'PGS Catalog', label: 'Data Source' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
      }}>
        {/* Search and Filters */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          {/* Search */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search diseases by name, gene, or PGS ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
            />
          </div>

          {/* Category Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <CategoryButton
              category="all"
              isActive={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              count={categoryCounts.all}
            />
            {Object.keys(DISEASE_CATEGORIES).map((category) => (
              <CategoryButton
                key={category}
                category={category}
                isActive={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                count={categoryCounts[category] || 0}
              />
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={{
          marginBottom: '24px',
          color: '#64748b',
          fontSize: '0.95rem',
        }}>
          Showing {filteredDiseases.length} of {Object.keys(DISEASES).length} diseases
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Disease Grid by Category */}
        {filteredDiseases.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '16px',
            color: '#64748b',
          }}>
            <p style={{ fontSize: '1.1rem', margin: '0 0 12px 0' }}>
              No diseases found matching your criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          Object.entries(groupedDiseases).map(([category, diseases]) => {
            const categoryInfo = DISEASE_CATEGORIES[category] || { name: category };
            const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.metabolic;

            return (
              <section key={category} style={{ marginBottom: '40px' }}>
                {/* Category Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.border}`,
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.icon,
                    fontSize: '1.2rem',
                    fontWeight: '700',
                  }}>
                    {categoryInfo.name.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{
                      margin: 0,
                      fontSize: '1.4rem',
                      color: '#1e293b',
                    }}>
                      {categoryInfo.name}
                    </h2>
                    <p style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#64748b',
                    }}>
                      {categoryInfo.description} ({diseases.length} diseases)
                    </p>
                  </div>
                </div>

                {/* Disease Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px',
                }}>
                  {diseases.map((disease) => (
                    <DiseaseCard
                      key={disease.id}
                      disease={disease}
                      onExpand={handleExpand}
                      isExpanded={expandedDisease === disease.id}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}

        {/* Info Box */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '40px',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#1e40af' }}>
            Understanding Heritability
          </h3>
          <p style={{ margin: '0 0 12px 0', color: '#1e40af', lineHeight: '1.6' }}>
            Heritability estimates represent the proportion of variation in a trait or disease
            risk that can be attributed to genetic factors in a given population. A heritability
            of 50% means that about half of the variation in disease risk is due to genetic
            differences between individuals.
          </p>
          <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.6' }}>
            <strong>Important:</strong> High heritability does not mean a condition is
            inevitable. Environmental factors, lifestyle choices, and preventive measures can
            significantly influence actual disease outcomes regardless of genetic predisposition.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'white',
      }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
          Disease information sourced from peer-reviewed research and the PGS Catalog
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
          <Link href="/methodology" style={{ color: '#2563eb' }}>
            View Methodology
          </Link>
          {' '}&bull;{' '}
          <a
            href="https://www.pgscatalog.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb' }}
          >
            PGS Catalog
          </a>
          {' '}&bull;{' '}
          <Link href="/faq" style={{ color: '#2563eb' }}>
            FAQ
          </Link>
        </p>
      </footer>

      {/* Responsive styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          main > div:first-child > div:last-child {
            flex-wrap: nowrap;
            overflow-x: auto;
            padding-bottom: 8px;
          }
          section > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
