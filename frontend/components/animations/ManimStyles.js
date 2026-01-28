'use client';

/**
 * Manim-Inspired Animation Styles and Utilities
 *
 * This module provides styles and utilities that capture the visual essence
 * of 3Blue1Brown's Manim animations: dark backgrounds, smooth mathematical
 * reveals, precise geometry, and educational step-by-step progression.
 */

// Manim-inspired color palette (3Blue1Brown style)
export const MANIM_COLORS = {
  background: '#1a1a2e',
  backgroundDark: '#0f0f1a',
  backgroundGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',

  // Primary colors (3B1B style)
  blue: '#58C4DD',
  teal: '#5CD0B3',
  green: '#83C167',
  yellow: '#FFFF00',
  gold: '#F4D03F',
  orange: '#FF8C00',
  red: '#FC6255',
  pink: '#FF69B4',
  purple: '#9B59B6',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',

  // Accent colors for formulas
  formulaHighlight: '#FFFF00',
  formulaVariable: '#58C4DD',
  formulaOperator: '#FFFFFF',
  formulaNumber: '#83C167',
};

// Animation timing functions (Manim-style smooth easing)
export const MANIM_EASINGS = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
  smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Standard animation durations
export const MANIM_DURATIONS = {
  fast: '0.3s',
  normal: '0.6s',
  slow: '1s',
  verySlow: '1.5s',
  reveal: '0.8s',
};

// Base container style for Manim-style animations
export const manimContainerStyle = {
  background: MANIM_COLORS.backgroundGradient,
  borderRadius: '16px',
  padding: '32px',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
};

// SVG filter definitions for glow effects (Manim signature look)
export const ManimFilters = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <filter id="manim-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="manim-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="manim-gradient-blue" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={MANIM_COLORS.blue} />
        <stop offset="100%" stopColor={MANIM_COLORS.teal} />
      </linearGradient>
      <linearGradient id="manim-gradient-warm" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={MANIM_COLORS.yellow} />
        <stop offset="100%" stopColor={MANIM_COLORS.orange} />
      </linearGradient>
      <linearGradient id="manim-gradient-risk" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={MANIM_COLORS.green} />
        <stop offset="50%" stopColor={MANIM_COLORS.yellow} />
        <stop offset="100%" stopColor={MANIM_COLORS.red} />
      </linearGradient>
    </defs>
  </svg>
);

// CSS keyframes for Manim-style animations
export const manimKeyframes = `
  @keyframes manim-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes manim-draw-path {
    from { stroke-dashoffset: 1000; }
    to { stroke-dashoffset: 0; }
  }

  @keyframes manim-scale-in {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes manim-slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes manim-typewriter {
    from { width: 0; }
    to { width: 100%; }
  }

  @keyframes manim-pulse-glow {
    0%, 100% { filter: drop-shadow(0 0 8px currentColor); }
    50% { filter: drop-shadow(0 0 16px currentColor); }
  }

  @keyframes manim-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes manim-wave {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @keyframes manim-reveal-horizontal {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }

  @keyframes manim-reveal-vertical {
    from { clip-path: inset(100% 0 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }

  @keyframes manim-number-count {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Utility function to create staggered animation delays
export const getStaggerDelay = (index, baseDelay = 0.1) => ({
  animationDelay: `${index * baseDelay}s`,
});

// Utility to create SVG path animation styles
export const pathAnimationStyle = (duration = '1s', delay = '0s') => ({
  strokeDasharray: 1000,
  strokeDashoffset: 1000,
  animation: `manim-draw-path ${duration} ${MANIM_EASINGS.smooth} ${delay} forwards`,
});
