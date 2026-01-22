'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import RiskOverview from '../../components/results/RiskOverview';
import DiseaseCard from '../../components/results/DiseaseCard';
import DistributionCurve from '../../components/results/DistributionCurve';
import CategoryChart from '../../components/results/CategoryChart';
import ExportPanel from '../../components/results/ExportPanel';
import {
  getDiseaseCategory,
  formatDiseaseName,
  CATEGORY_COLORS,
  RISK_COLORS,
  calculateStatistics,
} from '../../lib/chartConfig';

// Storage keys
const RESULTS_STORAGE_KEY = 'prs_results';
const QUESTIONNAIRE_STORAGE_KEY = 'prs_questionnaire';

// Sort options
const SORT_OPTIONS = [
  { value: 'percentile-desc', label: 'Highest Risk First' },
  { value: 'percentile-asc', label: 'Lowest Risk First' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'variants-desc', label: 'Most Variants' },
];

// Filter options for risk levels
const RISK_FILTER_OPTIONS = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'High', label: 'High Risk Only' },
  { value: 'Elevated', label: 'Elevated & High' },
  { value: 'Average', label: 'Average & Above' },
  { value: 'Low', label: 'Low Risk Only' },
];

/**
 * Results Page - Dedicated page for viewing PRS results
 */
export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [questionnaireData, setQuestionnaireData] = useState(null);

  // UI State
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('percentile-desc');
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);

  // Load results from localStorage on mount
  useEffect(() => {
    const loadResults = () => {
      try {
        const storedResults = localStorage.getItem(RESULTS_STORAGE_KEY);
        const storedQuestionnaire = localStorage.getItem(QUESTIONNAIRE_STORAGE_KEY);

        if (storedResults) {
          const parsed = JSON.parse(storedResults);
          setResults(parsed.prs_results || {});
          setMetadata(parsed.metadata || {});
        } else {
          // No results found, redirect to home
          router.push('/');
          return;
        }

        if (storedQuestionnaire) {
          setQuestionnaireData(JSON.parse(storedQuestionnaire));
        }
      } catch (error) {
        console.error('Error loading results:', error);
        router.push('/');
        return;
      }

      setLoading(false);
    };

    loadResults();
  }, [router]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!results) return null;
    return calculateStatistics(results);
  }, [results]);

  // Get unique categories from results
  const categories = useMemo(() => {
    if (!results) return [];
    const cats = new Set();
    Object.keys(results).forEach((disease) => {
      cats.add(getDiseaseCategory(disease));
    });
    return ['all', ...Array.from(cats).sort()];
  }, [results]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    if (!results) return [];

    let filtered = Object.entries(results);

    // Category filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(
        ([disease]) => getDiseaseCategory(disease) === activeTab
      );
    }

    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(([, data]) => {
        const cat = data.risk_category;
        if (riskFilter === 'High') return cat === 'High';
        if (riskFilter === 'Elevated') return cat === 'High' || cat === 'Elevated';
        if (riskFilter === 'Average')
          return cat === 'High' || cat === 'Elevated' || cat === 'Average';
        if (riskFilter === 'Low') return cat === 'Low' || cat === 'Very Low';
        return true;
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(([disease]) =>
        formatDiseaseName(disease).toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'percentile-desc':
          return b[1].percentile - a[1].percentile;
        case 'percentile-asc':
          return a[1].percentile - b[1].percentile;
        case 'name-asc':
          return formatDiseaseName(a[0]).localeCompare(formatDiseaseName(b[0]));
        case 'name-desc':
          return formatDiseaseName(b[0]).localeCompare(formatDiseaseName(a[0]));
        case 'variants-desc':
          return b[1].matched_variants - a[1].matched_variants;
        default:
          return 0;
      }
    });

    return filtered;
  }, [results, activeTab, riskFilter, searchQuery, sortBy]);

  // Handle new analysis
  const handleNewAnalysis = () => {
    router.push('/');
  };

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#64748b' }}>Loading your results...</p>
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // No results state (shouldn't normally reach here due to redirect)
  if (!results || Object.keys(results).length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: '0 0 16px', color: '#1e293b' }}>No Results Found</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            It looks like you haven't analyzed your DNA yet.
          </p>
          <button
            onClick={handleNewAnalysis}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Start Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: 'white',
          padding: '24px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                fontWeight: '700',
              }}
            >
              Your Genetic Risk Results
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.9rem',
                opacity: 0.9,
              }}
            >
              {metadata?.filename && `File: ${metadata.filename}`}
              {metadata?.variant_count &&
                ` | ${metadata.variant_count.toLocaleString()} variants analyzed`}
            </p>
          </div>
          <button
            onClick={handleNewAnalysis}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            New Analysis
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 20px 60px',
        }}
      >
        {/* Risk Overview Section */}
        <RiskOverview
          results={results}
          metadata={metadata}
          questionnaireData={questionnaireData}
        />

        {/* Charts Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          {/* Distribution Curve */}
          <DistributionCurve
            percentile={stats?.averagePercentile || 50}
            title="Your Position in Population Distribution"
            width={380}
            height={240}
          />

          {/* Category Radar Chart */}
          <CategoryChart
            results={results}
            size={300}
            title="Risk Profile by Category"
          />
        </div>

        {/* Export Panel */}
        <div style={{ marginBottom: '24px' }}>
          <ExportPanel results={results} metadata={metadata} />
        </div>

        {/* Disease List Section */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1e293b',
              }}
            >
              Disease Risk Analysis
              <span
                style={{
                  marginLeft: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: '#64748b',
                }}
              >
                {filteredResults.length} of {Object.keys(results).length} diseases
              </span>
            </h2>
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '12px',
              marginBottom: '16px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {categories.map((cat) => {
              const isActive = activeTab === cat;
              const catColor = cat === 'all' ? '#3b82f6' : CATEGORY_COLORS[cat];
              const count =
                cat === 'all'
                  ? Object.keys(results).length
                  : Object.keys(results).filter(
                      (d) => getDiseaseCategory(d) === cat
                    ).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: isActive ? `${catColor}15` : '#f8fafc',
                    color: isActive ? catColor : '#64748b',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                  <span
                    style={{
                      background: isActive ? catColor : '#cbd5e1',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filters Row */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}
          >
            {/* Search */}
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search diseases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              style={{
                padding: '10px 32px 10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: 'white',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              {RISK_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px 32px 10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: 'white',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Disease Cards Grid */}
          {filteredResults.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#64748b',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                style={{ margin: '0 auto 16px' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p style={{ margin: 0 }}>
                No diseases match your current filters.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredResults.map(([disease, data], index) => (
                <DiseaseCard
                  key={disease}
                  disease={disease}
                  data={data}
                  index={index}
                  combinedRisk={
                    questionnaireData?.combinedRisks?.[disease] || null
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div
          style={{
            marginTop: '32px',
            padding: '20px',
            background: '#fef3c7',
            borderRadius: '12px',
            border: '1px solid #fcd34d',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
              style={{ flexShrink: 0, marginTop: '2px' }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <h3
                style={{
                  margin: '0 0 8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#92400e',
                }}
              >
                Medical Disclaimer
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#92400e',
                  lineHeight: '1.6',
                }}
              >
                These results are for educational and informational purposes only. Genetic risk
                scores indicate statistical predisposition, not diagnosis. Many factors
                including environment, lifestyle, and other genes influence disease risk.
                Always consult with a qualified healthcare provider before making any medical
                decisions based on genetic information.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            marginTop: '32px',
            textAlign: 'center',
            padding: '20px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Powered by{' '}
            <a
              href="https://www.pgscatalog.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'none' }}
            >
              PGS Catalog
            </a>{' '}
            validated polygenic scores
          </p>
        </footer>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          header {
            position: static !important;
          }
          button,
          select,
          input {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
