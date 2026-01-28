'use client';

import { useEffect, useRef, useState } from 'react';
import { MANIM_COLORS, MANIM_EASINGS, manimKeyframes } from './ManimStyles';

/**
 * Animated DNA Helix Component - Manim-style rotating double helix
 *
 * Creates a beautiful 3D-like rotating DNA helix with base pairs,
 * perfect for hero sections and educational content.
 */
export default function AnimatedDNAHelix({
  width = 200,
  height = 300,
  autoPlay = true,
  speed = 1,
  showLabels = false,
  highlightVariant = null, // Index of variant to highlight
  style = {},
}) {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Base pair colors (A-T: warm, G-C: cool)
  const basePairColors = [
    { left: MANIM_COLORS.red, right: MANIM_COLORS.green, label: 'A-T' },
    { left: MANIM_COLORS.blue, right: MANIM_COLORS.yellow, label: 'G-C' },
    { left: MANIM_COLORS.green, right: MANIM_COLORS.red, label: 'T-A' },
    { left: MANIM_COLORS.yellow, right: MANIM_COLORS.blue, label: 'C-G' },
    { left: MANIM_COLORS.red, right: MANIM_COLORS.green, label: 'A-T' },
    { left: MANIM_COLORS.blue, right: MANIM_COLORS.yellow, label: 'G-C' },
    { left: MANIM_COLORS.green, right: MANIM_COLORS.red, label: 'T-A' },
    { left: MANIM_COLORS.yellow, right: MANIM_COLORS.blue, label: 'C-G' },
  ];

  // Intersection observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!autoPlay || !isVisible) return;

    const animate = () => {
      setRotation((r) => (r + 1 * speed) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoPlay, speed, isVisible]);

  const numBasePairs = 8;
  const centerX = width / 2;
  const helixWidth = width * 0.35;
  const verticalSpacing = height / (numBasePairs + 1);

  // Generate helix points for smooth backbone curves
  const generateHelixPoints = (isLeft, numPoints = 50) => {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const progress = i / numPoints;
      const y = progress * height;
      const phase = (progress * Math.PI * 2 * 2) + (rotation * Math.PI / 180);
      const xOffset = Math.sin(phase) * helixWidth;
      const x = isLeft ? centerX - helixWidth + xOffset : centerX + helixWidth - xOffset;
      const depth = Math.cos(phase);
      points.push({ x, y, depth });
    }
    return points;
  };

  const leftBackbone = generateHelixPoints(true);
  const rightBackbone = generateHelixPoints(false);

  // Create smooth path from points
  const createPath = (points) => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  // Calculate base pair positions and depths
  const basePairs = Array.from({ length: numBasePairs }, (_, i) => {
    const y = (i + 1) * verticalSpacing;
    const phase = ((i + 1) / (numBasePairs + 1) * Math.PI * 2 * 2) + (rotation * Math.PI / 180);
    const xOffset = Math.sin(phase) * helixWidth;
    const depth = Math.cos(phase);

    return {
      index: i,
      y,
      leftX: centerX - helixWidth + xOffset,
      rightX: centerX + helixWidth - xOffset,
      depth,
      colors: basePairColors[i % basePairColors.length],
      isHighlighted: highlightVariant === i,
    };
  });

  // Sort by depth for proper rendering order
  const sortedBasePairs = [...basePairs].sort((a, b) => a.depth - b.depth);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width,
        height,
        ...style,
      }}
    >
      <style>{manimKeyframes}</style>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Glow filter */}
          <filter id="dna-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong glow for highlighted variants */}
          <filter id="variant-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for backbones */}
          <linearGradient id="backbone-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={MANIM_COLORS.blue} stopOpacity="0.3" />
            <stop offset="50%" stopColor={MANIM_COLORS.blue} stopOpacity="1" />
            <stop offset="100%" stopColor={MANIM_COLORS.blue} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Left backbone (back layer) */}
        <path
          d={createPath(leftBackbone)}
          fill="none"
          stroke="url(#backbone-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#dna-glow)"
          opacity={0.8}
        />

        {/* Right backbone (back layer) */}
        <path
          d={createPath(rightBackbone)}
          fill="none"
          stroke="url(#backbone-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#dna-glow)"
          opacity={0.8}
        />

        {/* Base pairs - rendered in depth order */}
        {sortedBasePairs.map((bp) => {
          const opacity = 0.4 + (bp.depth + 1) * 0.3;
          const strokeWidth = 2 + (bp.depth + 1) * 1;
          const nodeRadius = 4 + (bp.depth + 1) * 2;

          return (
            <g key={bp.index}>
              {/* Connecting line (base pair) */}
              <line
                x1={bp.leftX}
                y1={bp.y}
                x2={bp.rightX}
                y2={bp.y}
                stroke={bp.isHighlighted ? MANIM_COLORS.yellow : '#ffffff'}
                strokeWidth={strokeWidth}
                opacity={opacity}
                strokeDasharray={bp.isHighlighted ? 'none' : '4,4'}
                filter={bp.isHighlighted ? 'url(#variant-glow)' : 'none'}
              />

              {/* Left nucleotide */}
              <circle
                cx={bp.leftX}
                cy={bp.y}
                r={nodeRadius}
                fill={bp.colors.left}
                opacity={opacity}
                filter="url(#dna-glow)"
                style={{
                  transition: 'r 0.3s ease',
                }}
              />

              {/* Right nucleotide */}
              <circle
                cx={bp.rightX}
                cy={bp.y}
                r={nodeRadius}
                fill={bp.colors.right}
                opacity={opacity}
                filter="url(#dna-glow)"
                style={{
                  transition: 'r 0.3s ease',
                }}
              />

              {/* Labels */}
              {showLabels && bp.depth > 0 && (
                <text
                  x={centerX}
                  y={bp.y + 4}
                  textAnchor="middle"
                  fill={MANIM_COLORS.textPrimary}
                  fontSize="10"
                  opacity={opacity}
                >
                  {bp.colors.label}
                </text>
              )}

              {/* Variant marker */}
              {bp.isHighlighted && (
                <g>
                  <circle
                    cx={centerX}
                    cy={bp.y}
                    r={nodeRadius + 6}
                    fill="none"
                    stroke={MANIM_COLORS.yellow}
                    strokeWidth="2"
                    opacity={opacity}
                    filter="url(#variant-glow)"
                    style={{
                      animation: 'manim-pulse-glow 1.5s ease-in-out infinite',
                    }}
                  />
                  <text
                    x={centerX + helixWidth + 25}
                    y={bp.y + 4}
                    fill={MANIM_COLORS.yellow}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    SNP
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
