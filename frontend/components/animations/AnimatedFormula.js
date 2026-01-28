'use client';

import { useState, useEffect, useRef } from 'react';
import { MANIM_COLORS, MANIM_EASINGS, ManimFilters, manimKeyframes } from './ManimStyles';

/**
 * Animated Formula Component - Manim-style mathematical formula reveal
 *
 * Creates a step-by-step animation showing how PRS is calculated,
 * with each component appearing in sequence with smooth transitions.
 */
export default function AnimatedFormula({
  autoPlay = true,
  showControls = true,
  onComplete,
}) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const totalSteps = 6;

  // Intersection observer for viewport-based autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && autoPlay) {
          setIsVisible(true);
          setIsPlaying(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [autoPlay]);

  // Animation progression
  useEffect(() => {
    if (!isPlaying || !isVisible) return;

    if (step < totalSteps) {
      const timer = setTimeout(() => {
        setStep((s) => s + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
      onComplete?.();
    }
  }, [step, isPlaying, isVisible, onComplete]);

  const restart = () => {
    setStep(0);
    setIsPlaying(true);
  };

  const stepLabels = [
    'Starting with genetic variants...',
    'Each variant has an effect size (β)...',
    'Multiply by genotype (0, 1, or 2)...',
    'Sum all variant contributions...',
    'Normalize by ancestry...',
    'Final Polygenic Risk Score!',
  ];

  return (
    <div
      ref={containerRef}
      style={{
        background: MANIM_COLORS.backgroundGradient,
        borderRadius: '16px',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <style>{manimKeyframes}</style>
      <ManimFilters />

      {/* Title */}
      <h4
        style={{
          color: MANIM_COLORS.textPrimary,
          fontSize: '1.1rem',
          fontWeight: '600',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        How PRS is Calculated
      </h4>

      {/* Animation Canvas */}
      <svg
        width="100%"
        height="200"
        viewBox="0 0 500 200"
        style={{ overflow: 'visible' }}
      >
        {/* Step 1: Variants appear */}
        <g
          style={{
            opacity: step >= 1 ? 1 : 0,
            transition: `opacity 0.8s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {[0, 1, 2].map((i) => (
            <g
              key={i}
              style={{
                opacity: step >= 1 ? 1 : 0,
                transform: step >= 1 ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s ${MANIM_EASINGS.smooth} ${i * 0.15}s`,
              }}
            >
              <circle
                cx={80 + i * 60}
                cy={60}
                r={20}
                fill="none"
                stroke={MANIM_COLORS.blue}
                strokeWidth="2"
                filter="url(#manim-glow)"
              />
              <text
                x={80 + i * 60}
                y={65}
                textAnchor="middle"
                fill={MANIM_COLORS.blue}
                fontSize="14"
                fontFamily="Georgia, serif"
              >
                SNP{i + 1}
              </text>
            </g>
          ))}
          <text
            x={310}
            y={65}
            fill={MANIM_COLORS.textSecondary}
            fontSize="24"
          >
            ...
          </text>
        </g>

        {/* Step 2: Effect sizes appear */}
        <g
          style={{
            opacity: step >= 2 ? 1 : 0,
            transition: `opacity 0.8s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {[0, 1, 2].map((i) => (
            <g
              key={i}
              style={{
                opacity: step >= 2 ? 1 : 0,
                transform: step >= 2 ? 'scale(1)' : 'scale(0)',
                transformOrigin: `${80 + i * 60}px 100px`,
                transition: `all 0.5s ${MANIM_EASINGS.bounce} ${i * 0.15}s`,
              }}
            >
              <text
                x={80 + i * 60}
                y={105}
                textAnchor="middle"
                fill={MANIM_COLORS.yellow}
                fontSize="16"
                fontFamily="Georgia, serif"
                fontStyle="italic"
              >
                β{i + 1}
              </text>
            </g>
          ))}
        </g>

        {/* Step 3: Multiplication symbols and genotypes */}
        <g
          style={{
            opacity: step >= 3 ? 1 : 0,
            transition: `opacity 0.8s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <text
                x={80 + i * 60}
                y={125}
                textAnchor="middle"
                fill={MANIM_COLORS.textPrimary}
                fontSize="14"
                style={{
                  opacity: step >= 3 ? 1 : 0,
                  transition: `opacity 0.4s ${MANIM_EASINGS.smooth} ${i * 0.1}s`,
                }}
              >
                ×
              </text>
              <text
                x={80 + i * 60}
                y={145}
                textAnchor="middle"
                fill={MANIM_COLORS.green}
                fontSize="14"
                fontFamily="Georgia, serif"
                style={{
                  opacity: step >= 3 ? 1 : 0,
                  transition: `opacity 0.4s ${MANIM_EASINGS.smooth} ${0.2 + i * 0.1}s`,
                }}
              >
                G{i + 1}
              </text>
            </g>
          ))}
        </g>

        {/* Step 4: Summation symbol and formula */}
        <g
          style={{
            opacity: step >= 4 ? 1 : 0,
            transition: `opacity 0.8s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {/* Big Sigma */}
          <text
            x={380}
            y={100}
            textAnchor="middle"
            fill={MANIM_COLORS.textPrimary}
            fontSize="60"
            fontFamily="Georgia, serif"
            style={{
              opacity: step >= 4 ? 1 : 0,
              transform: step >= 4 ? 'scale(1)' : 'scale(0)',
              transformOrigin: '380px 80px',
              transition: `all 0.6s ${MANIM_EASINGS.bounce}`,
            }}
          >
            Σ
          </text>
          <text
            x={380}
            y={135}
            textAnchor="middle"
            fill={MANIM_COLORS.textSecondary}
            fontSize="12"
            fontFamily="Georgia, serif"
            style={{
              opacity: step >= 4 ? 1 : 0,
              transition: `opacity 0.4s ${MANIM_EASINGS.smooth} 0.3s`,
            }}
          >
            i=1 to n
          </text>

          {/* Terms being summed */}
          <text
            x={430}
            y={90}
            textAnchor="start"
            fill={MANIM_COLORS.yellow}
            fontSize="18"
            fontFamily="Georgia, serif"
            fontStyle="italic"
            style={{
              opacity: step >= 4 ? 1 : 0,
              transition: `opacity 0.4s ${MANIM_EASINGS.smooth} 0.4s`,
            }}
          >
            β
          </text>
          <text
            x={443}
            y={95}
            textAnchor="start"
            fill={MANIM_COLORS.yellow}
            fontSize="12"
            fontFamily="Georgia, serif"
          >
            i
          </text>
          <text
            x={452}
            y={90}
            textAnchor="start"
            fill={MANIM_COLORS.textPrimary}
            fontSize="18"
          >
            ×
          </text>
          <text
            x={470}
            y={90}
            textAnchor="start"
            fill={MANIM_COLORS.green}
            fontSize="18"
            fontFamily="Georgia, serif"
          >
            G
          </text>
          <text
            x={485}
            y={95}
            textAnchor="start"
            fill={MANIM_COLORS.green}
            fontSize="12"
            fontFamily="Georgia, serif"
          >
            i
          </text>
        </g>

        {/* Step 5: Division by ancestry */}
        <g
          style={{
            opacity: step >= 5 ? 1 : 0,
            transition: `opacity 0.8s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {/* Fraction line */}
          <line
            x1={350}
            y1={150}
            x2={500}
            y2={150}
            stroke={MANIM_COLORS.textPrimary}
            strokeWidth="2"
            style={{
              opacity: step >= 5 ? 1 : 0,
              transition: `opacity 0.4s ${MANIM_EASINGS.smooth}`,
            }}
          />
          <text
            x={425}
            y={175}
            textAnchor="middle"
            fill={MANIM_COLORS.orange}
            fontSize="14"
            fontFamily="Georgia, serif"
            style={{
              opacity: step >= 5 ? 1 : 0,
              transition: `opacity 0.4s ${MANIM_EASINGS.smooth} 0.3s`,
            }}
          >
            Ancestry Norm
          </text>
        </g>

        {/* Step 6: Final PRS result */}
        <g
          style={{
            opacity: step >= 6 ? 1 : 0,
            transition: `opacity 0.8s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {/* Arrow */}
          <path
            d="M 250 170 L 250 185 L 340 185"
            fill="none"
            stroke={MANIM_COLORS.teal}
            strokeWidth="2"
            markerEnd="url(#arrow)"
            style={{
              opacity: step >= 6 ? 1 : 0,
              transition: `opacity 0.4s ${MANIM_EASINGS.smooth}`,
            }}
          />

          {/* PRS Box */}
          <rect
            x={15}
            y={160}
            width={80}
            height={35}
            rx={8}
            fill={MANIM_COLORS.teal}
            filter="url(#manim-glow-strong)"
            style={{
              opacity: step >= 6 ? 1 : 0,
              transform: step >= 6 ? 'scale(1)' : 'scale(0)',
              transformOrigin: '55px 177px',
              transition: `all 0.6s ${MANIM_EASINGS.bounce} 0.2s`,
            }}
          />
          <text
            x={55}
            y={183}
            textAnchor="middle"
            fill={MANIM_COLORS.backgroundDark}
            fontSize="18"
            fontWeight="bold"
            style={{
              opacity: step >= 6 ? 1 : 0,
              transition: `opacity 0.4s ${MANIM_EASINGS.smooth} 0.5s`,
            }}
          >
            PRS
          </text>
        </g>

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={MANIM_COLORS.teal} />
          </marker>
        </defs>
      </svg>

      {/* Step indicator */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '24px',
          minHeight: '24px',
        }}
      >
        <p
          style={{
            color: MANIM_COLORS.textSecondary,
            fontSize: '0.9rem',
            margin: 0,
            transition: `opacity 0.3s ${MANIM_EASINGS.smooth}`,
          }}
        >
          {step > 0 ? stepLabels[step - 1] : 'Watch the animation...'}
        </p>
      </div>

      {/* Progress dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '16px',
        }}
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i < step ? MANIM_COLORS.teal : MANIM_COLORS.textMuted,
              transition: `background 0.3s ${MANIM_EASINGS.smooth}`,
            }}
          />
        ))}
      </div>

      {/* Controls */}
      {showControls && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '16px',
          }}
        >
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
            Replay Animation
          </button>
        </div>
      )}
    </div>
  );
}
