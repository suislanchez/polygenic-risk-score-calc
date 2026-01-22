'use client';

import { useState } from 'react';
import {
  RISK_COLORS,
  RISK_BG_COLORS,
  RISK_TEXT_COLORS,
  getDiseaseCategory,
  getCategoryColor,
  formatDiseaseName,
  getRecommendations,
} from '../../lib/chartConfig';

/**
 * Risk Bar Visualization Component
 */
function RiskBar({ percentile, riskCategory, showLabels = true }) {
  const clampedPercentile = Math.min(100, Math.max(0, percentile));

  return (
    <div style={{ width: '100%', marginTop: '12px' }}>
      <div
        style={{
          position: 'relative',
          height: '10px',
          borderRadius: '5px',
          background:
            'linear-gradient(to right, #22c55e 0%, #86efac 25%, #fbbf24 50%, #fb923c 75%, #ef4444 100%)',
          overflow: 'visible',
        }}
      >
        {/* Risk zone markers */}
        {[20, 40, 60, 80].map((mark) => (
          <div
            key={mark}
            style={{
              position: 'absolute',
              left: `${mark}%`,
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
        {/* User position marker */}
        <div
          style={{
            position: 'absolute',
            left: `${clampedPercentile}%`,
            top: '-5px',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '20px',
            background: 'white',
            border: `3px solid ${RISK_COLORS[riskCategory] || '#64748b'}`,
            borderRadius: '50%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            transition: 'left 0.5s ease-out',
          }}
        />
      </div>
      {showLabels && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '6px',
            fontSize: '0.7rem',
            color: '#94a3b8',
          }}
        >
          <span>Low Risk</span>
          <span>Average</span>
          <span>High Risk</span>
        </div>
      )}
    </div>
  );
}

/**
 * Match Quality Indicator Component
 */
function MatchQualityIndicator({ matchRate }) {
  let quality, color, bgColor;

  if (matchRate >= 80) {
    quality = 'High';
    color = '#16a34a';
    bgColor = '#dcfce7';
  } else if (matchRate >= 60) {
    quality = 'Good';
    color = '#ca8a04';
    bgColor = '#fef9c3';
  } else if (matchRate >= 40) {
    quality = 'Moderate';
    color = '#ea580c';
    bgColor = '#ffedd5';
  } else {
    quality = 'Low';
    color = '#dc2626';
    bgColor = '#fee2e2';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        background: bgColor,
        color: color,
        borderRadius: '10px',
        fontSize: '0.7rem',
        fontWeight: '600',
      }}
      title={`${matchRate.toFixed(1)}% of scoring variants matched in your DNA file`}
    >
      {quality} Match
    </span>
  );
}

/**
 * Expanded Details Section
 */
function ExpandedDetails({ disease, data, riskCategory }) {
  const recommendations = getRecommendations(riskCategory);
  const category = getDiseaseCategory(disease);

  // Gene info - simplified representation
  const geneInfo = {
    coronary_artery_disease: ['LDLR', 'PCSK9', 'APOE', 'LPA'],
    type_2_diabetes: ['TCF7L2', 'PPARG', 'KCNJ11', 'SLC30A8'],
    breast_cancer: ['BRCA1', 'BRCA2', 'TP53', 'CHEK2'],
    alzheimers_disease: ['APOE', 'APP', 'PSEN1', 'PSEN2'],
    prostate_cancer: ['HOXB13', 'BRCA2', 'ATM', 'CHEK2'],
    colorectal_cancer: ['APC', 'MLH1', 'MSH2', 'PMS2'],
  };

  const diseaseKey = disease.toLowerCase().replace(/\s+/g, '_');
  const relatedGenes = geneInfo[diseaseKey] || [];

  // Build PGS Catalog URL if we have the PGS ID
  const pgsId = data.pgs_id;
  const pgsCatalogUrl = pgsId
    ? `https://www.pgscatalog.org/score/${pgsId}/`
    : 'https://www.pgscatalog.org/';

  // External links
  const links = [
    {
      label: pgsId ? `PGS Catalog (${pgsId})` : 'PGS Catalog',
      url: pgsCatalogUrl,
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      ),
    },
    {
      label: 'NIH GeneReviews',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK1116/',
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      label: 'Learn More',
      url: `https://medlineplus.gov/genetics/condition/`,
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0',
        animation: 'slideDown 0.3s ease',
      }}
    >
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Statistics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
            Z-Score
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
            {data.z_score?.toFixed(2) || data.zscore?.toFixed(2) || 'N/A'}
          </div>
        </div>
        <div
          style={{
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
            Raw Score
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
            {data.raw_score?.toFixed(4) || data.raw_prs?.toFixed(4) || 'N/A'}
          </div>
        </div>
        <div
          style={{
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
            Match Rate
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
            {(data.match_rate || (data.matched_variants / data.total_variants) * 100).toFixed(1)}%
          </div>
        </div>
        <div
          style={{
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
            Category
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: getCategoryColor(category),
            }}
          >
            {category}
          </div>
        </div>
      </div>

      {/* PGS Catalog Reference */}
      {data.pgs_id && (
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e40af' }}>
              Score: {data.pgs_id}
            </span>
            <a
              href={`https://www.pgscatalog.org/score/${data.pgs_id}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: 'auto',
                fontSize: '0.8rem',
                color: '#3b82f6',
                textDecoration: 'none',
              }}
            >
              View in PGS Catalog →
            </a>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#475569' }}>
            This score uses {data.total_variants.toLocaleString()} genetic variants from
            peer-reviewed research published in the PGS Catalog.
          </p>
        </div>
      )}

      {/* Related Genes */}
      {relatedGenes.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4
            style={{
              margin: '0 0 8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#475569',
            }}
          >
            Related Genes
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {relatedGenes.map((gene) => (
              <span
                key={gene}
                style={{
                  padding: '4px 10px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                }}
              >
                {gene}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div style={{ marginBottom: '16px' }}>
        <h4
          style={{
            margin: '0 0 8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#475569',
          }}
        >
          Recommendations
        </h4>
        <ul
          style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#475569',
            fontSize: '0.85rem',
            lineHeight: '1.6',
          }}
        >
          {recommendations.map((rec, index) => (
            <li key={index} style={{ marginBottom: '4px' }}>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* External Links */}
      <div>
        <h4
          style={{
            margin: '0 0 8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#475569',
          }}
        >
          Learn More
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#f1f5f9',
                color: '#3b82f6',
                borderRadius: '6px',
                fontSize: '0.8rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e0f2fe';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f1f5f9';
              }}
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced Disease Card Component
 */
export default function DiseaseCard({ disease, data, index = 0, combinedRisk = null }) {
  const [expanded, setExpanded] = useState(false);

  const riskCategory = data.risk_category;
  const category = getDiseaseCategory(disease);
  const displayName = formatDiseaseName(disease);

  // Animation delay based on index
  const animationDelay = `${index * 60}ms`;

  return (
    <div
      style={{
        background: RISK_BG_COLORS[riskCategory] || 'white',
        border: `1px solid ${RISK_COLORS[riskCategory]}30`,
        borderRadius: '12px',
        padding: '20px',
        opacity: 0,
        animation: `fadeInUp 0.4s ease forwards`,
        animationDelay,
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Disease Info */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1e293b',
              }}
            >
              {displayName}
            </h3>
            <span
              style={{
                padding: '2px 8px',
                background: `${getCategoryColor(category)}20`,
                color: getCategoryColor(category),
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: '600',
              }}
            >
              {category}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '6px',
              flexWrap: 'wrap',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '0.85rem',
              }}
            >
              {data.matched_variants.toLocaleString()} / {data.total_variants.toLocaleString()}{' '}
              variants ({data.match_rate?.toFixed(1) || ((data.matched_variants / data.total_variants) * 100).toFixed(1)}%)
            </p>
            <MatchQualityIndicator
              matchRate={data.match_rate || (data.matched_variants / data.total_variants) * 100}
            />
          </div>
        </div>

        {/* Risk Score */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: RISK_COLORS[riskCategory] || '#64748b',
              lineHeight: 1,
            }}
          >
            {data.percentile.toFixed(1)}%
          </div>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginTop: '6px',
              background: RISK_COLORS[riskCategory] || '#e2e8f0',
              color:
                riskCategory === 'Average' || riskCategory === 'Low' ? '#000' : '#fff',
            }}
          >
            {riskCategory}
          </div>

          {/* Combined risk indicator if available */}
          {combinedRisk && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              Combined: {combinedRisk.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Risk Bar */}
      <RiskBar percentile={data.percentile} riskCategory={riskCategory} showLabels={false} />

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '100%',
          marginTop: '16px',
          padding: '10px',
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: '#475569',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'white';
          e.target.style.borderColor = '#94a3b8';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.7)';
          e.target.style.borderColor = '#e2e8f0';
        }}
      >
        {expanded ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
            Hide Details
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            View Details
          </>
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <ExpandedDetails disease={disease} data={data} riskCategory={riskCategory} />
      )}
    </div>
  );
}
