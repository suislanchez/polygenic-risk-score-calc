'use client';

import { useState, useMemo } from 'react';
import {
  RISK_COLORS,
  RISK_BG_COLORS,
  getRiskCategory,
  normalPDF,
  distributionConfig,
} from '../../lib/chartConfig';

/**
 * Distribution Curve Component - Shows bell curve with user's position
 */
export default function DistributionCurve({
  percentile,
  title = 'Population Distribution',
  width = 400,
  height = 220,
  showTooltip = true,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const padding = { top: 20, right: 30, bottom: 40, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate distribution curve points
  const curveData = useMemo(() => {
    const points = [];
    const mean = 50;
    const stdDev = 16.67; // Approximately covers 0-100 within 3 std devs
    const numPoints = 100;

    // Find max Y for scaling
    const maxY = normalPDF(mean, mean, stdDev);

    for (let i = 0; i <= numPoints; i++) {
      const x = (i / numPoints) * 100;
      const y = normalPDF(x, mean, stdDev);
      const svgX = padding.left + (x / 100) * chartWidth;
      const svgY = padding.top + (1 - y / maxY) * chartHeight;

      points.push({ x: svgX, y: svgY, percentile: x, density: y });
    }

    return { points, maxY };
  }, [chartWidth, chartHeight, padding.left, padding.top]);

  // Create SVG path for the curve
  const curvePath = curveData.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create filled area path
  const areaPath = `
    ${curvePath}
    L ${padding.left + chartWidth} ${padding.top + chartHeight}
    L ${padding.left} ${padding.top + chartHeight}
    Z
  `;

  // Calculate user's position on the curve
  const userPoint = curveData.points.find(
    (p) => Math.abs(p.percentile - percentile) < 1
  ) || {
    x: padding.left + (percentile / 100) * chartWidth,
    y:
      padding.top +
      (1 - normalPDF(percentile, 50, 16.67) / curveData.maxY) * chartHeight,
    percentile,
  };

  const riskCategory = getRiskCategory(percentile);

  // Risk zone boundaries
  const riskZones = [
    { start: 0, end: 20, color: RISK_COLORS['Very Low'], label: 'Very Low' },
    { start: 20, end: 40, color: RISK_COLORS['Low'], label: 'Low' },
    { start: 40, end: 60, color: RISK_COLORS['Average'], label: 'Average' },
    { start: 60, end: 80, color: RISK_COLORS['Elevated'], label: 'Elevated' },
    { start: 80, end: 100, color: RISK_COLORS['High'], label: 'High' },
  ];

  // Generate shaded region path for current risk category
  const currentZone = riskZones.find(
    (z) => percentile >= z.start && percentile < z.end
  ) || riskZones[riskZones.length - 1];

  const shadedPoints = curveData.points.filter(
    (p) => p.percentile >= currentZone.start && p.percentile <= currentZone.end
  );

  const shadedPath =
    shadedPoints.length > 0
      ? `
    M ${padding.left + (currentZone.start / 100) * chartWidth} ${padding.top + chartHeight}
    ${shadedPoints.map((p) => `L ${p.x} ${p.y}`).join(' ')}
    L ${padding.left + (currentZone.end / 100) * chartWidth} ${padding.top + chartHeight}
    Z
  `
      : '';

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

      <div style={{ position: 'relative' }}>
        <svg
          width={width}
          height={height}
          style={{ overflow: 'visible', maxWidth: '100%' }}
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Definitions */}
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={RISK_COLORS['Very Low']} />
              <stop offset="25%" stopColor={RISK_COLORS['Low']} />
              <stop offset="50%" stopColor={RISK_COLORS['Average']} />
              <stop offset="75%" stopColor={RISK_COLORS['Elevated']} />
              <stop offset="100%" stopColor={RISK_COLORS['High']} />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={RISK_COLORS['Very Low']} stopOpacity="0.1" />
              <stop offset="25%" stopColor={RISK_COLORS['Low']} stopOpacity="0.1" />
              <stop offset="50%" stopColor={RISK_COLORS['Average']} stopOpacity="0.1" />
              <stop offset="75%" stopColor={RISK_COLORS['Elevated']} stopOpacity="0.1" />
              <stop offset="100%" stopColor={RISK_COLORS['High']} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left + (tick / 100) * chartWidth}
                y1={padding.top}
                x2={padding.left + (tick / 100) * chartWidth}
                y2={padding.top + chartHeight}
                stroke="#e2e8f0"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left + (tick / 100) * chartWidth}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {tick}%
              </text>
            </g>
          ))}

          {/* Risk zone labels at bottom */}
          {riskZones.map((zone) => (
            <rect
              key={zone.label}
              x={padding.left + (zone.start / 100) * chartWidth}
              y={padding.top + chartHeight + 28}
              width={(chartWidth * (zone.end - zone.start)) / 100}
              height="8"
              fill={zone.color}
              opacity="0.6"
              rx="2"
            />
          ))}

          {/* Filled area under curve */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Shaded region for current risk */}
          <path d={shadedPath} fill={currentZone.color} opacity="0.3" />

          {/* Main curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {/* User position marker - vertical line */}
          <line
            x1={userPoint.x}
            y1={padding.top}
            x2={userPoint.x}
            y2={padding.top + chartHeight}
            stroke={RISK_COLORS[riskCategory]}
            strokeWidth="2"
            strokeDasharray="6,4"
          />

          {/* User position marker - circle on curve */}
          <circle
            cx={userPoint.x}
            cy={userPoint.y}
            r="8"
            fill="white"
            stroke={RISK_COLORS[riskCategory]}
            strokeWidth="3"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() =>
              setHoveredPoint({ x: userPoint.x, y: userPoint.y, percentile })
            }
            onMouseLeave={() => setHoveredPoint(null)}
          />

          {/* User position label */}
          <g transform={`translate(${userPoint.x}, ${padding.top - 5})`}>
            <rect
              x="-30"
              y="-25"
              width="60"
              height="22"
              rx="4"
              fill={RISK_COLORS[riskCategory]}
            />
            <text
              x="0"
              y="-10"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="white"
            >
              You: {percentile.toFixed(0)}%
            </text>
          </g>

          {/* X-axis label */}
          <text
            x={padding.left + chartWidth / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="12"
            fill="#64748b"
          >
            Risk Percentile
          </text>
        </svg>

        {/* Tooltip */}
        {showTooltip && hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: hoveredPoint.x - 60,
              top: hoveredPoint.y - 70,
              background: '#1e293b',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontWeight: '600' }}>
              {hoveredPoint.percentile.toFixed(1)}th percentile
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{riskCategory} Risk</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}
      >
        {riskZones.map((zone) => (
          <div
            key={zone.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                background: zone.color,
              }}
            />
            {zone.label}
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
        The bell curve shows the distribution of genetic risk in the population. Your
        position indicates where you fall relative to others.
      </p>
    </div>
  );
}
