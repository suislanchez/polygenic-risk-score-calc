'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MANIM_COLORS, MANIM_EASINGS, ManimFilters, manimKeyframes } from './ManimStyles';

/**
 * Animated Distribution Curve - Manim-style bell curve with user positioning
 *
 * Shows an animated bell curve that draws itself, then positions the user
 * with smooth animations and educational annotations.
 */
export default function AnimatedDistributionCurve({
  percentile = 50,
  width = 500,
  height = 280,
  autoPlay = true,
  showAnnotations = true,
  title = 'Your Position in the Population',
}) {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const padding = { top: 40, right: 40, bottom: 50, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Normal distribution function
  const normalPDF = (x, mean, stdDev) => {
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return Math.exp(exponent) / (stdDev * Math.sqrt(2 * Math.PI));
  };

  // Generate curve data
  const curveData = useMemo(() => {
    const points = [];
    const mean = 50;
    const stdDev = 16.67;
    const numPoints = 100;
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

  // Create curve path
  const curvePath = curveData.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Area under curve path
  const areaPath = `
    ${curvePath}
    L ${padding.left + chartWidth} ${padding.top + chartHeight}
    L ${padding.left} ${padding.top + chartHeight}
    Z
  `;

  // User position
  const userY = padding.top + (1 - normalPDF(percentile, 50, 16.67) / curveData.maxY) * chartHeight;
  const userX = padding.left + (percentile / 100) * chartWidth;

  // Risk zones
  const riskZones = [
    { start: 0, end: 20, color: MANIM_COLORS.green, label: 'Low Risk' },
    { start: 20, end: 40, color: MANIM_COLORS.teal, label: 'Below Avg' },
    { start: 40, end: 60, color: MANIM_COLORS.yellow, label: 'Average' },
    { start: 60, end: 80, color: MANIM_COLORS.orange, label: 'Elevated' },
    { start: 80, end: 100, color: MANIM_COLORS.red, label: 'High Risk' },
  ];

  const currentZone = riskZones.find(z => percentile >= z.start && percentile < z.end) || riskZones[4];

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

  // Get path length for animation
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Animation phases
  useEffect(() => {
    if (!isVisible) return;

    const phases = [
      { delay: 0, phase: 1 },      // Draw axes
      { delay: 600, phase: 2 },    // Draw curve
      { delay: 1800, phase: 3 },   // Show risk zones
      { delay: 2400, phase: 4 },   // Show user position
      { delay: 3200, phase: 5 },   // Show annotations
    ];

    phases.forEach(({ delay, phase }) => {
      setTimeout(() => setAnimationPhase(phase), delay);
    });
  }, [isVisible]);

  const restart = () => {
    setAnimationPhase(0);
    setTimeout(() => setIsVisible(true), 100);
    setIsVisible(false);
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

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible', maxWidth: '100%' }}
      >
        <defs>
          <linearGradient id="curve-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={MANIM_COLORS.green} />
            <stop offset="25%" stopColor={MANIM_COLORS.teal} />
            <stop offset="50%" stopColor={MANIM_COLORS.yellow} />
            <stop offset="75%" stopColor={MANIM_COLORS.orange} />
            <stop offset="100%" stopColor={MANIM_COLORS.red} />
          </linearGradient>
          <linearGradient id="area-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={MANIM_COLORS.green} stopOpacity="0.15" />
            <stop offset="50%" stopColor={MANIM_COLORS.yellow} stopOpacity="0.15" />
            <stop offset="100%" stopColor={MANIM_COLORS.red} stopOpacity="0.15" />
          </linearGradient>
          <filter id="curve-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Phase 1: Axes */}
        <g
          style={{
            opacity: animationPhase >= 1 ? 1 : 0,
            transition: `opacity 0.5s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke={MANIM_COLORS.textSecondary}
            strokeWidth="2"
          />

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke={MANIM_COLORS.textSecondary}
            strokeWidth="2"
          />

          {/* X-axis labels */}
          {[0, 25, 50, 75, 100].map((tick, i) => (
            <g
              key={tick}
              style={{
                opacity: animationPhase >= 1 ? 1 : 0,
                transition: `opacity 0.3s ${MANIM_EASINGS.smooth} ${i * 0.1}s`,
              }}
            >
              <line
                x1={padding.left + (tick / 100) * chartWidth}
                y1={padding.top + chartHeight}
                x2={padding.left + (tick / 100) * chartWidth}
                y2={padding.top + chartHeight + 6}
                stroke={MANIM_COLORS.textSecondary}
                strokeWidth="1"
              />
              <text
                x={padding.left + (tick / 100) * chartWidth}
                y={padding.top + chartHeight + 22}
                textAnchor="middle"
                fill={MANIM_COLORS.textSecondary}
                fontSize="12"
              >
                {tick}%
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={padding.left + chartWidth / 2}
            y={height - 8}
            textAnchor="middle"
            fill={MANIM_COLORS.textSecondary}
            fontSize="12"
          >
            Risk Percentile
          </text>
        </g>

        {/* Phase 2: Curve drawing animation */}
        <g
          style={{
            opacity: animationPhase >= 2 ? 1 : 0,
            transition: `opacity 0.3s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {/* Filled area */}
          <path
            d={areaPath}
            fill="url(#area-gradient)"
            style={{
              opacity: animationPhase >= 2 ? 1 : 0,
              transition: `opacity 1s ${MANIM_EASINGS.smooth} 0.5s`,
            }}
          />

          {/* Main curve with drawing animation */}
          <path
            ref={pathRef}
            d={curvePath}
            fill="none"
            stroke="url(#curve-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#curve-glow)"
            style={{
              strokeDasharray: pathLength || 1000,
              strokeDashoffset: animationPhase >= 2 ? 0 : pathLength || 1000,
              transition: `stroke-dashoffset 1.2s ${MANIM_EASINGS.smooth}`,
            }}
          />
        </g>

        {/* Phase 3: Risk zone indicators */}
        <g
          style={{
            opacity: animationPhase >= 3 ? 1 : 0,
            transition: `opacity 0.5s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {riskZones.map((zone, i) => (
            <rect
              key={zone.label}
              x={padding.left + (zone.start / 100) * chartWidth}
              y={padding.top + chartHeight + 35}
              width={(chartWidth * (zone.end - zone.start)) / 100}
              height="6"
              fill={zone.color}
              rx="3"
              style={{
                opacity: animationPhase >= 3 ? 0.8 : 0,
                transform: animationPhase >= 3 ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: `${padding.left + (zone.start / 100) * chartWidth}px center`,
                transition: `all 0.4s ${MANIM_EASINGS.smooth} ${i * 0.1}s`,
              }}
            />
          ))}
        </g>

        {/* Phase 4: User position */}
        <g
          style={{
            opacity: animationPhase >= 4 ? 1 : 0,
            transition: `opacity 0.5s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {/* Vertical line to user position */}
          <line
            x1={userX}
            y1={padding.top}
            x2={userX}
            y2={padding.top + chartHeight}
            stroke={currentZone.color}
            strokeWidth="2"
            strokeDasharray="6,4"
            style={{
              opacity: animationPhase >= 4 ? 0.7 : 0,
              transition: `opacity 0.3s ${MANIM_EASINGS.smooth}`,
            }}
          />

          {/* User marker on curve */}
          <circle
            cx={userX}
            cy={userY}
            r={animationPhase >= 4 ? 10 : 0}
            fill={MANIM_COLORS.background}
            stroke={currentZone.color}
            strokeWidth="3"
            filter="url(#curve-glow)"
            style={{
              transition: `r 0.5s ${MANIM_EASINGS.bounce}`,
            }}
          />

          {/* Inner dot */}
          <circle
            cx={userX}
            cy={userY}
            r={animationPhase >= 4 ? 4 : 0}
            fill={currentZone.color}
            style={{
              transition: `r 0.5s ${MANIM_EASINGS.bounce} 0.1s`,
            }}
          />
        </g>

        {/* Phase 5: Annotations */}
        {showAnnotations && (
          <g
            style={{
              opacity: animationPhase >= 5 ? 1 : 0,
              transition: `opacity 0.5s ${MANIM_EASINGS.smooth}`,
            }}
          >
            {/* User label box */}
            <g
              style={{
                transform: animationPhase >= 5 ? 'translateY(0)' : 'translateY(-10px)',
                transition: `transform 0.4s ${MANIM_EASINGS.smooth}`,
              }}
            >
              <rect
                x={userX - 45}
                y={padding.top - 35}
                width={90}
                height={28}
                rx="6"
                fill={currentZone.color}
              />
              <text
                x={userX}
                y={padding.top - 16}
                textAnchor="middle"
                fill={MANIM_COLORS.backgroundDark}
                fontSize="13"
                fontWeight="bold"
              >
                You: {percentile.toFixed(0)}%
              </text>
            </g>

            {/* Risk category label */}
            <g
              style={{
                opacity: animationPhase >= 5 ? 1 : 0,
                transition: `opacity 0.4s ${MANIM_EASINGS.smooth} 0.2s`,
              }}
            >
              <text
                x={userX}
                y={padding.top + chartHeight + 55}
                textAnchor="middle"
                fill={currentZone.color}
                fontSize="11"
                fontWeight="600"
              >
                {currentZone.label}
              </text>
            </g>

            {/* Population label */}
            <text
              x={padding.left + 10}
              y={padding.top + 20}
              fill={MANIM_COLORS.textSecondary}
              fontSize="11"
              style={{
                opacity: animationPhase >= 5 ? 1 : 0,
                transition: `opacity 0.4s ${MANIM_EASINGS.smooth} 0.3s`,
              }}
            >
              Population Distribution
            </text>
          </g>
        )}
      </svg>

      {/* Replay button */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          onClick={restart}
          style={{
            background: 'transparent',
            border: `1px solid ${MANIM_COLORS.textMuted}`,
            color: MANIM_COLORS.textSecondary,
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
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
