'use client';

/**
 * Manim-Style Animation Components
 *
 * A collection of animated components inspired by 3Blue1Brown's Manim library,
 * designed for educational content about polygenic risk scores.
 */

export { default as AnimatedFormula } from './AnimatedFormula';
export { default as AnimatedDNAHelix } from './AnimatedDNAHelix';
export { default as AnimatedDistributionCurve } from './AnimatedDistributionCurve';
export { default as AnimatedRiskModifier } from './AnimatedRiskModifier';
export { default as AnimatedCategoryRadar } from './AnimatedCategoryRadar';

export {
  MANIM_COLORS,
  MANIM_EASINGS,
  MANIM_DURATIONS,
  ManimFilters,
  manimContainerStyle,
  manimKeyframes,
  getStaggerDelay,
  pathAnimationStyle,
} from './ManimStyles';
