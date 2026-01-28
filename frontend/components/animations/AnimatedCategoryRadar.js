'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MANIM_COLORS, MANIM_EASINGS, ManimFilters, manimKeyframes } from './ManimStyles';

/**
 * Animated Category Radar Chart - Manim-style polar/radar visualization
 *
 * Shows risk by disease category with animated drawing, axis reveals,
 * and smooth data point transitions.
 */
export default function AnimatedCategoryRadar({
  data = [],
  size = 350,
  autoPlay = true,
  title = 'Risk Profile by Category',
}) {
  const [animationPhase, setAnimationPhase] = useState(0);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Default data if none provided
  const defaultData = [
    { category: 'Cardiovascular', percentile: 65, color: '#FC6255' },
    { category: 'Oncology', percentile: 45, color: '#FF8C00' },
    { category: 'Metabolic', percentile: 72, color: '#F4D03F' },
    { category: 'Neurological', percentile: 38, color: '#9B59B6' },
    { category: 'Autoimmune', percentile: 55, color: '#58C4DD' },
    { category: 'Respiratory', percentile: 42, color: '#5CD0B3' },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  const numCategories = chartData.length;

  const center = size / 2;
  const maxRadius = (size - 100) / 2;
  const levels = 5;
  const angleStep = (2 * Math.PI) / numCategories;

  // Generate grid circles
  const gridCircles = Array.from({ length: levels }, (_, i) => ({
    radius: ((i + 1) / levels) * maxRadius,
    value: ((i + 1) / levels) * 100,
  }));

  // Generate data points
  const dataPoints = useMemo(() => {
    return chartData.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const normalizedValue = item.percentile / 100;
      const radius = normalizedValue * maxRadius;

      return {
        ...item,
        index,
        angle,
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + (maxRadius + 40) * Math.cos(angle),
        labelY: center + (maxRadius + 40) * Math.sin(angle),
        axisEndX: center + maxRadius * Math.cos(angle),
        axisEndY: center + maxRadius * Math.sin(angle),
      };
    });
  }, [chartData, center, maxRadius, angleStep]);

  // Polygon path
  const polygonPath = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z';

  // Center polygon (for animation start)
  const centerPolygonPath = dataPoints
    .map((_, i) => `${i === 0 ? 'M' : 'L'} ${center} ${center}`)
    .join(' ') + ' Z';

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && autoPlay) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [autoPlay]);

  // Animation sequence
  useEffect(() => {
    if (!isVisible) return;

    const phases = [
      { delay: 100, phase: 1 },   // Grid circles
      { delay: 600, phase: 2 },   // Axis lines
      { delay: 1200, phase: 3 },  // Labels
      { delay: 1800, phase: 4 },  // Data polygon
      { delay: 2400, phase: 5 },  // Data points
    ];

    phases.forEach(({ delay, phase }) => {
      setTimeout(() => setAnimationPhase(phase), delay);
    });
  }, [isVisible]);

  const restart = () => {
    setAnimationPhase(0);
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 100);
  };

  // Risk color helper
  const getRiskColor = (percentile) => {
    if (percentile < 30) return MANIM_COLORS.green;
    if (percentile < 50) return MANIM_COLORS.teal;
    if (percentile < 70) return MANIM_COLORS.yellow;
    if (percentile < 85) return MANIM_COLORS.orange;
    return MANIM_COLORS.red;
  };

  return (
    <div
      ref={containerRef}
      style={{
        background: MANIM_COLORS.backgroundGradient,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <style>{manimKeyframes}</style>
      <ManimFilters />

      {title && (
        <h4
          style={{
            color: MANIM_COLORS.textPrimary,
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {title}
        </h4>
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ overflow: 'visible' }}
          >
            <defs>
              <radialGradient id="radar-bg-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={MANIM_COLORS.green} stopOpacity="0.05" />
                <stop offset="50%" stopColor={MANIM_COLORS.yellow} stopOpacity="0.08" />
                <stop offset="100%" stopColor={MANIM_COLORS.red} stopOpacity="0.12" />
              </radialGradient>
              <filter id="radar-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="point-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background */}
            <circle
              cx={center}
              cy={center}
              r={maxRadius}
              fill="url(#radar-bg-gradient)"
              style={{
                opacity: animationPhase >= 1 ? 1 : 0,
                transition: `opacity 0.5s ${MANIM_EASINGS.smooth}`,
              }}
            />

            {/* Phase 1: Grid circles */}
            {gridCircles.map((circle, i) => (
              <g key={i}>
                <circle
                  cx={center}
                  cy={center}
                  r={circle.radius}
                  fill="none"
                  stroke={MANIM_COLORS.textMuted}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  style={{
                    opacity: animationPhase >= 1 ? 0.4 : 0,
                    transform: animationPhase >= 1 ? 'scale(1)' : 'scale(0)',
                    transformOrigin: `${center}px ${center}px`,
                    transition: `all 0.4s ${MANIM_EASINGS.smooth} ${i * 0.1}s`,
                  }}
                />
                {/* Level label */}
                <text
                  x={center + 6}
                  y={center - circle.radius + 14}
                  fill={MANIM_COLORS.textMuted}
                  fontSize="9"
                  style={{
                    opacity: animationPhase >= 1 ? 0.6 : 0,
                    transition: `opacity 0.3s ${MANIM_EASINGS.smooth} ${0.3 + i * 0.1}s`,
                  }}
                >
                  {circle.value.toFixed(0)}%
                </text>
              </g>
            ))}

            {/* Phase 2: Axis lines */}
            {dataPoints.map((point, i) => (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={point.axisEndX}
                y2={point.axisEndY}
                stroke={MANIM_COLORS.textMuted}
                strokeWidth="1"
                style={{
                  opacity: animationPhase >= 2 ? 0.5 : 0,
                  strokeDasharray: '200',
                  strokeDashoffset: animationPhase >= 2 ? 0 : 200,
                  transition: `all 0.4s ${MANIM_EASINGS.smooth} ${i * 0.08}s`,
                }}
              />
            ))}

            {/* Phase 3: Category labels */}
            {dataPoints.map((point, i) => (
              <text
                key={`label-${i}`}
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
                fill={hoveredCategory === point.category ? point.color || getRiskColor(point.percentile) : MANIM_COLORS.textSecondary}
                fontSize="11"
                fontWeight={hoveredCategory === point.category ? '600' : '400'}
                style={{
                  opacity: animationPhase >= 3 ? 1 : 0,
                  transform: animationPhase >= 3 ? 'translateY(0)' : 'translateY(10px)',
                  transition: `all 0.3s ${MANIM_EASINGS.smooth} ${i * 0.08}s`,
                }}
              >
                {point.category}
              </text>
            ))}

            {/* Phase 4: Data polygon */}
            <path
              d={animationPhase >= 4 ? polygonPath : centerPolygonPath}
              fill={`${MANIM_COLORS.blue}30`}
              stroke={MANIM_COLORS.blue}
              strokeWidth="2"
              strokeLinejoin="round"
              filter="url(#radar-glow)"
              style={{
                opacity: animationPhase >= 4 ? 1 : 0,
                transition: `all 0.8s ${MANIM_EASINGS.smooth}`,
              }}
            />

            {/* Phase 5: Data points */}
            {dataPoints.map((point, i) => {
              const pointColor = point.color || getRiskColor(point.percentile);
              const isHovered = hoveredCategory === point.category;

              return (
                <g key={`point-${i}`}>
                  <circle
                    cx={animationPhase >= 5 ? point.x : center}
                    cy={animationPhase >= 5 ? point.y : center}
                    r={isHovered ? 10 : 7}
                    fill={pointColor}
                    stroke={MANIM_COLORS.backgroundDark}
                    strokeWidth="2"
                    filter={isHovered ? 'url(#point-glow)' : 'url(#radar-glow)'}
                    style={{
                      cursor: 'pointer',
                      opacity: animationPhase >= 5 ? 1 : 0,
                      transition: `all 0.5s ${MANIM_EASINGS.smooth} ${i * 0.1}s`,
                    }}
                    onMouseEnter={() => setHoveredCategory(point.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                </g>
              );
            })}

            {/* Center point */}
            <circle
              cx={center}
              cy={center}
              r="4"
              fill={MANIM_COLORS.textMuted}
              style={{
                opacity: animationPhase >= 1 ? 1 : 0,
                transition: `opacity 0.3s ${MANIM_EASINGS.smooth}`,
              }}
            />
          </svg>

          {/* Tooltip */}
          {hoveredCategory && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: MANIM_COLORS.backgroundDark,
                border: `1px solid ${MANIM_COLORS.textMuted}`,
                padding: '12px 16px',
                borderRadius: '8px',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {(() => {
                const point = dataPoints.find((p) => p.category === hoveredCategory);
                const color = point?.color || getRiskColor(point?.percentile);
                return (
                  <>
                    <div style={{ color, fontWeight: '600', marginBottom: '4px' }}>
                      {hoveredCategory}
                    </div>
                    <div style={{ color: MANIM_COLORS.textPrimary, fontSize: '1.1rem' }}>
                      {point?.percentile.toFixed(0)}%
                    </div>
                    <div style={{ color: MANIM_COLORS.textSecondary, fontSize: '0.75rem' }}>
                      Risk Percentile
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginTop: '20px',
        }}
      >
        {dataPoints.map((point) => {
          const color = point.color || getRiskColor(point.percentile);
          const isHovered = hoveredCategory === point.category;

          return (
            <div
              key={point.category}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: isHovered ? `${color}20` : 'transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                border: `1px solid ${isHovered ? color : 'transparent'}`,
                transition: `all 0.2s ${MANIM_EASINGS.smooth}`,
              }}
              onMouseEnter={() => setHoveredCategory(point.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: color,
                }}
              />
              <span style={{ color: MANIM_COLORS.textSecondary, fontSize: '0.75rem' }}>
                {point.category}
              </span>
              <span style={{ color, fontSize: '0.75rem', fontWeight: '600' }}>
                {point.percentile.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Replay button */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          onClick={restart}
          style={{
            background: 'transparent',
            border: `1px solid ${MANIM_COLORS.textMuted}`,
            color: MANIM_COLORS.textSecondary,
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            transition: `all 0.2s ${MANIM_EASINGS.smooth}`,
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = MANIM_COLORS.teal;
            e.target.style.color = MANIM_COLORS.teal;
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = MANIM_COLORS.textMuted;
            e.target.style.color = MANIM_COLORS.textSecondary;
          }}
        >
          Replay
        </button>
      </div>
    </div>
  );
}
