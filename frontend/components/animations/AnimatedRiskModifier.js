'use client';

import { useState, useEffect, useRef } from 'react';
import { MANIM_COLORS, MANIM_EASINGS, ManimFilters, manimKeyframes } from './ManimStyles';

/**
 * Animated Risk Modifier Component - Shows how lifestyle factors modify genetic risk
 *
 * Creates a Manim-style visualization showing base genetic risk and how
 * modifiable factors (smoking, BMI, exercise, etc.) adjust the final risk.
 */
export default function AnimatedRiskModifier({
  baseRisk = 50,
  modifiers = [],
  width = 450,
  height = 200,
  autoPlay = true,
  title = 'How Lifestyle Modifies Your Genetic Risk',
}) {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [currentModifierIndex, setCurrentModifierIndex] = useState(-1);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Default modifiers if none provided
  const defaultModifiers = [
    { name: 'Smoking', impact: +15, color: MANIM_COLORS.red, icon: '🚬' },
    { name: 'Exercise', impact: -10, color: MANIM_COLORS.green, icon: '🏃' },
    { name: 'Diet', impact: -5, color: MANIM_COLORS.teal, icon: '🥗' },
  ];

  const activeModifiers = modifiers.length > 0 ? modifiers : defaultModifiers;

  // Calculate cumulative risk at each step
  const riskSteps = activeModifiers.reduce(
    (acc, mod, i) => {
      const prevRisk = acc[acc.length - 1].risk;
      const newRisk = Math.max(0, Math.min(100, prevRisk + mod.impact));
      acc.push({ risk: newRisk, modifier: mod, index: i });
      return acc;
    },
    [{ risk: baseRisk, modifier: null, index: -1 }]
  );

  const finalRisk = riskSteps[riskSteps.length - 1].risk;

  const padding = { top: 30, right: 30, bottom: 40, left: 30 };
  const barWidth = width - padding.left - padding.right;
  const barHeight = 24;
  const barY = height / 2 - barHeight / 2;

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

    // Phase 1: Show bar
    setTimeout(() => setAnimationPhase(1), 100);

    // Phase 2: Show base risk
    setTimeout(() => setAnimationPhase(2), 600);

    // Phase 3+: Apply modifiers one by one
    activeModifiers.forEach((_, i) => {
      setTimeout(() => {
        setCurrentModifierIndex(i);
        setAnimationPhase(3 + i);
      }, 1200 + i * 1000);
    });

    // Final phase: Complete
    setTimeout(() => {
      setAnimationPhase(3 + activeModifiers.length);
    }, 1200 + activeModifiers.length * 1000 + 500);
  }, [isVisible, activeModifiers.length]);

  const restart = () => {
    setAnimationPhase(0);
    setCurrentModifierIndex(-1);
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 100);
  };

  // Get current displayed risk based on animation phase
  const getCurrentRisk = () => {
    if (animationPhase < 2) return 0;
    if (currentModifierIndex < 0) return baseRisk;
    return riskSteps[currentModifierIndex + 1]?.risk || baseRisk;
  };

  const displayedRisk = getCurrentRisk();

  // Risk color
  const getRiskColor = (risk) => {
    if (risk < 30) return MANIM_COLORS.green;
    if (risk < 50) return MANIM_COLORS.teal;
    if (risk < 70) return MANIM_COLORS.yellow;
    if (risk < 85) return MANIM_COLORS.orange;
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
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '20px',
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
          <linearGradient id="risk-bar-bg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={MANIM_COLORS.green} stopOpacity="0.3" />
            <stop offset="50%" stopColor={MANIM_COLORS.yellow} stopOpacity="0.3" />
            <stop offset="100%" stopColor={MANIM_COLORS.red} stopOpacity="0.3" />
          </linearGradient>
          <filter id="marker-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Phase 1: Risk bar background */}
        <g
          style={{
            opacity: animationPhase >= 1 ? 1 : 0,
            transition: `opacity 0.5s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {/* Bar background */}
          <rect
            x={padding.left}
            y={barY}
            width={barWidth}
            height={barHeight}
            rx={barHeight / 2}
            fill="url(#risk-bar-bg)"
            stroke={MANIM_COLORS.textMuted}
            strokeWidth="1"
          />

          {/* Scale labels */}
          {[0, 25, 50, 75, 100].map((val) => (
            <g key={val}>
              <line
                x1={padding.left + (val / 100) * barWidth}
                y1={barY + barHeight + 4}
                x2={padding.left + (val / 100) * barWidth}
                y2={barY + barHeight + 10}
                stroke={MANIM_COLORS.textMuted}
                strokeWidth="1"
              />
              <text
                x={padding.left + (val / 100) * barWidth}
                y={barY + barHeight + 24}
                textAnchor="middle"
                fill={MANIM_COLORS.textSecondary}
                fontSize="10"
              >
                {val}%
              </text>
            </g>
          ))}
        </g>

        {/* Phase 2+: Risk marker */}
        <g
          style={{
            opacity: animationPhase >= 2 ? 1 : 0,
            transition: `opacity 0.3s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {/* Filled portion */}
          <rect
            x={padding.left}
            y={barY}
            width={Math.max(0, (displayedRisk / 100) * barWidth)}
            height={barHeight}
            rx={barHeight / 2}
            fill={getRiskColor(displayedRisk)}
            style={{
              transition: `width 0.6s ${MANIM_EASINGS.smooth}, fill 0.6s ${MANIM_EASINGS.smooth}`,
            }}
          />

          {/* Marker */}
          <g
            style={{
              transform: `translateX(${padding.left + (displayedRisk / 100) * barWidth}px)`,
              transition: `transform 0.6s ${MANIM_EASINGS.smooth}`,
            }}
          >
            <circle
              cx={0}
              cy={barY + barHeight / 2}
              r={14}
              fill={MANIM_COLORS.backgroundDark}
              stroke={getRiskColor(displayedRisk)}
              strokeWidth="3"
              filter="url(#marker-glow)"
            />
            <text
              x={0}
              y={barY + barHeight / 2 + 4}
              textAnchor="middle"
              fill={getRiskColor(displayedRisk)}
              fontSize="10"
              fontWeight="bold"
            >
              {displayedRisk.toFixed(0)}
            </text>
          </g>
        </g>

        {/* Labels */}
        <text
          x={padding.left}
          y={barY - 10}
          fill={MANIM_COLORS.green}
          fontSize="11"
          style={{
            opacity: animationPhase >= 1 ? 0.7 : 0,
            transition: `opacity 0.3s ${MANIM_EASINGS.smooth}`,
          }}
        >
          Low Risk
        </text>
        <text
          x={padding.left + barWidth}
          y={barY - 10}
          textAnchor="end"
          fill={MANIM_COLORS.red}
          fontSize="11"
          style={{
            opacity: animationPhase >= 1 ? 0.7 : 0,
            transition: `opacity 0.3s ${MANIM_EASINGS.smooth}`,
          }}
        >
          High Risk
        </text>
      </svg>

      {/* Modifier cards */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '20px',
          flexWrap: 'wrap',
        }}
      >
        {/* Base genetic risk */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: animationPhase >= 2 ? `${MANIM_COLORS.blue}20` : 'transparent',
            border: `1px solid ${animationPhase >= 2 ? MANIM_COLORS.blue : MANIM_COLORS.textMuted}`,
            borderRadius: '8px',
            opacity: animationPhase >= 2 ? 1 : 0.3,
            transition: `all 0.4s ${MANIM_EASINGS.smooth}`,
          }}
        >
          <span style={{ fontSize: '16px' }}>🧬</span>
          <div>
            <div style={{ fontSize: '0.75rem', color: MANIM_COLORS.textSecondary }}>Genetic Base</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: MANIM_COLORS.blue }}>
              {baseRisk}%
            </div>
          </div>
        </div>

        {/* Modifier cards */}
        {activeModifiers.map((mod, i) => {
          const isActive = currentModifierIndex >= i;
          const isCurrent = currentModifierIndex === i;

          return (
            <div
              key={mod.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: isActive ? `${mod.color}20` : 'transparent',
                border: `1px solid ${isActive ? mod.color : MANIM_COLORS.textMuted}`,
                borderRadius: '8px',
                opacity: isActive ? 1 : 0.3,
                transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                transition: `all 0.4s ${MANIM_EASINGS.smooth}`,
              }}
            >
              <span style={{ fontSize: '16px' }}>{mod.icon}</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: MANIM_COLORS.textSecondary }}>
                  {mod.name}
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: mod.impact > 0 ? MANIM_COLORS.red : MANIM_COLORS.green,
                  }}
                >
                  {mod.impact > 0 ? '+' : ''}{mod.impact}%
                </div>
              </div>
            </div>
          );
        })}

        {/* Final risk */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: animationPhase >= 3 + activeModifiers.length ? `${getRiskColor(finalRisk)}30` : 'transparent',
            border: `2px solid ${animationPhase >= 3 + activeModifiers.length ? getRiskColor(finalRisk) : MANIM_COLORS.textMuted}`,
            borderRadius: '8px',
            opacity: animationPhase >= 3 + activeModifiers.length ? 1 : 0.3,
            transition: `all 0.4s ${MANIM_EASINGS.smooth}`,
          }}
        >
          <span style={{ fontSize: '16px' }}>📊</span>
          <div>
            <div style={{ fontSize: '0.75rem', color: MANIM_COLORS.textSecondary }}>Final Risk</div>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: getRiskColor(finalRisk),
              }}
            >
              {finalRisk.toFixed(0)}%
            </div>
          </div>
        </div>
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
