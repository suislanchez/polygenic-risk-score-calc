'use client';

import { useMemo } from 'react';
import {
  RISK_COLORS,
  RISK_BG_COLORS,
  CATEGORY_COLORS,
  calculateStatistics,
  getRiskCategory,
  getPercentileColor,
} from '../../lib/chartConfig';

/**
 * Circular Gauge Component - Shows overall genetic risk
 */
function CircularGauge({ percentile, size = 180 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const strokeWidth = 12;
  const riskCategory = getRiskCategory(percentile);
  const color = getPercentileColor(percentile);

  // Calculate the stroke dashoffset for the progress
  const progress = percentile / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: color,
            lineHeight: 1,
          }}
        >
          {percentile.toFixed(0)}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
          percentile
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: color,
            marginTop: '4px',
            padding: '2px 8px',
            background: RISK_BG_COLORS[riskCategory],
            borderRadius: '12px',
          }}
        >
          {riskCategory}
        </div>
      </div>
    </div>
  );
}

/**
 * Donut Chart Component - Shows category breakdown
 */
function DonutChart({ categoryStats, size = 200 }) {
  const center = size / 2;
  const outerRadius = (size - 20) / 2;
  const innerRadius = outerRadius * 0.6;

  const categories = Object.entries(categoryStats);
  const total = categories.reduce((sum, [, data]) => sum + data.count, 0);

  // Calculate segments
  let currentAngle = -90; // Start from top
  const segments = categories.map(([category, data]) => {
    const angle = (data.count / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;

    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);
    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      category,
      count: data.count,
      path,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
    };
  });

  return (
    <div style={{ position: 'relative' }}>
      <svg width={size} height={size}>
        {segments.map((segment, index) => (
          <path
            key={segment.category}
            d={segment.path}
            fill={segment.color}
            opacity={0.85}
            style={{
              transition: 'opacity 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.target.style.opacity = 1)}
            onMouseLeave={(e) => (e.target.style.opacity = 0.85)}
          >
            <title>
              {segment.category}: {segment.count} disease{segment.count !== 1 ? 's' : ''}
            </title>
          </path>
        ))}
      </svg>
      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
          {total}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Diseases</div>
      </div>
    </div>
  );
}

/**
 * Category Legend Component
 */
function CategoryLegend({ categoryStats }) {
  const sortedCategories = Object.entries(categoryStats).sort(
    (a, b) => b[1].count - a[1].count
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sortedCategories.map(([category, data]) => (
        <div
          key={category}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
            }}
          />
          <span style={{ color: '#475569', flex: 1 }}>{category}</span>
          <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.count}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Statistics Card Component
 */
function StatCard({ label, value, sublabel, color, icon }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: color ? `${color}15` : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: color || '#1e293b',
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {label}
          </div>
          {sublabel && (
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Risk Overview Panel - Main Component
 */
export default function RiskOverview({ results, metadata, questionnaireData }) {
  const stats = useMemo(() => calculateStatistics(results), [results]);

  if (!stats) {
    return null;
  }

  const hasQuestionnaire = questionnaireData && Object.keys(questionnaireData).length > 0;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        marginBottom: '24px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
          }}
        >
          Risk Overview
        </h2>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Summary of your genetic risk profile
          {hasQuestionnaire && ' combined with lifestyle factors'}
        </p>
      </div>

      {/* Main content grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Overall Risk Gauge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '12px',
          }}
        >
          <h3
            style={{
              margin: '0 0 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Average Genetic Risk
          </h3>
          <CircularGauge percentile={stats.averagePercentile} />
        </div>

        {/* Category Breakdown */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '12px',
          }}
        >
          <h3
            style={{
              margin: '0 0 16px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Category Distribution
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <DonutChart categoryStats={stats.categoryStats} size={160} />
            <CategoryLegend categoryStats={stats.categoryStats} />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          label="Total Diseases Analyzed"
          value={stats.totalDiseases}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          }
          color="#3b82f6"
        />
        <StatCard
          label="High Risk Conditions"
          value={stats.highRiskCount}
          sublabel={stats.highRiskCount > 0 ? 'Requires attention' : 'None detected'}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
          color="#ef4444"
        />
        <StatCard
          label="Elevated Risk Conditions"
          value={stats.elevatedRiskCount}
          sublabel="Above average risk"
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fb923c"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
          color="#fb923c"
        />
        <StatCard
          label="Average Percentile"
          value={`${stats.averagePercentile.toFixed(1)}%`}
          sublabel="Across all conditions"
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
          color="#22c55e"
        />
      </div>

      {/* Combined Risk Indicator (if questionnaire data available) */}
      {hasQuestionnaire && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: '#eff6ff',
            borderRadius: '12px',
            border: '1px solid #bfdbfe',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <div style={{ fontWeight: '600', color: '#1e40af' }}>
                Combined Risk Assessment
              </div>
              <div style={{ fontSize: '0.85rem', color: '#3b82f6' }}>
                Your results include both genetic factors and lifestyle questionnaire responses
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
