'use client';

import { useMemo, useState } from 'react';
import {
  CATEGORY_COLORS,
  RISK_COLORS,
  getRiskCategory,
  calculateStatistics,
} from '../../lib/chartConfig';

/**
 * Polar/Radar Chart Component - Shows average risk per category
 */
export default function CategoryChart({
  results,
  size = 320,
  title = 'Risk by Category',
}) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const stats = useMemo(() => calculateStatistics(results), [results]);

  if (!stats || !stats.categoryStats) {
    return null;
  }

  const categories = Object.entries(stats.categoryStats);
  const numCategories = categories.length;

  if (numCategories === 0) {
    return null;
  }

  const center = size / 2;
  const maxRadius = (size - 80) / 2; // Leave space for labels
  const levels = 5; // Number of concentric circles

  // Calculate angle for each category
  const angleStep = (2 * Math.PI) / numCategories;

  // Generate concentric circles for the grid
  const gridCircles = Array.from({ length: levels }, (_, i) => ({
    radius: ((i + 1) / levels) * maxRadius,
    value: ((i + 1) / levels) * 100,
  }));

  // Generate points for each category
  const dataPoints = categories.map(([category, data], index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const normalizedValue = data.averagePercentile / 100;
    const radius = normalizedValue * maxRadius;

    return {
      category,
      count: data.count,
      averagePercentile: data.averagePercentile,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (maxRadius + 35) * Math.cos(angle),
      labelY: center + (maxRadius + 35) * Math.sin(angle),
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
      riskCategory: getRiskCategory(data.averagePercentile),
      angle,
    };
  });

  // Generate polygon path
  const polygonPath = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z';

  // Generate axis lines
  const axisLines = dataPoints.map((p) => ({
    x1: center,
    y1: center,
    x2: center + maxRadius * Math.cos(p.angle),
    y2: center + maxRadius * Math.sin(p.angle),
  }));

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
      {title && (
        <h3
          style={{
            margin: '0 0 16px',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1e293b',
          }}
        >
          {title}
        </h3>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <svg
            width={size}
            height={size}
            style={{ overflow: 'visible', maxWidth: '100%' }}
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background circles */}
            {gridCircles.map((circle, i) => (
              <g key={i}>
                <circle
                  cx={center}
                  cy={center}
                  r={circle.radius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                {/* Level labels */}
                <text
                  x={center + 4}
                  y={center - circle.radius + 12}
                  fontSize="9"
                  fill="#94a3b8"
                >
                  {circle.value.toFixed(0)}%
                </text>
              </g>
            ))}

            {/* Risk zone coloring */}
            <defs>
              <radialGradient id="riskGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.05" />
                <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.05" />
                <stop offset="80%" stopColor="#ef4444" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
              </radialGradient>
            </defs>
            <circle
              cx={center}
              cy={center}
              r={maxRadius}
              fill="url(#riskGradient)"
            />

            {/* Axis lines */}
            {axisLines.map((line, i) => (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            ))}

            {/* Data polygon */}
            <path
              d={polygonPath}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {dataPoints.map((point, i) => (
              <g key={point.category}>
                {/* Point */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredCategory === point.category ? 8 : 6}
                  fill={point.color}
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    cursor: 'pointer',
                    transition: 'r 0.2s',
                  }}
                  onMouseEnter={() => setHoveredCategory(point.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />

                {/* Category label */}
                <text
                  x={point.labelX}
                  y={point.labelY}
                  textAnchor={
                    Math.cos(point.angle) > 0.3
                      ? 'start'
                      : Math.cos(point.angle) < -0.3
                      ? 'end'
                      : 'middle'
                  }
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight={hoveredCategory === point.category ? '600' : '500'}
                  fill={hoveredCategory === point.category ? point.color : '#475569'}
                  style={{ transition: 'fill 0.2s' }}
                >
                  {point.category}
                </text>
              </g>
            ))}

            {/* Center point */}
            <circle cx={center} cy={center} r="3" fill="#94a3b8" />
          </svg>

          {/* Tooltip */}
          {hoveredCategory && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#1e293b',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                textAlign: 'center',
              }}
            >
              {(() => {
                const data = dataPoints.find((p) => p.category === hoveredCategory);
                return (
                  <>
                    <div
                      style={{
                        fontWeight: '600',
                        color: data?.color,
                        marginBottom: '4px',
                      }}
                    >
                      {hoveredCategory}
                    </div>
                    <div>
                      Avg: {data?.averagePercentile.toFixed(1)}%{' '}
                      <span style={{ color: '#94a3b8' }}>({data?.riskCategory})</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {data?.count} disease{data?.count !== 1 ? 's' : ''}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '16px',
            maxWidth: '100%',
          }}
        >
          {dataPoints.map((point) => (
            <div
              key={point.category}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background:
                  hoveredCategory === point.category ? `${point.color}15` : '#f8fafc',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: `1px solid ${
                  hoveredCategory === point.category ? point.color : 'transparent'
                }`,
              }}
              onMouseEnter={() => setHoveredCategory(point.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: point.color,
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                {point.category}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: RISK_COLORS[point.riskCategory],
                }}
              >
                {point.averagePercentile.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        <p
          style={{
            margin: '12px 0 0',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          Each axis represents a disease category. The distance from center indicates
          average risk percentile.
        </p>
      </div>
    </div>
  );
}
