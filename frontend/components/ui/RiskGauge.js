'use client'

import { forwardRef, useEffect, useState } from 'react'

const RiskGauge = forwardRef(({
  percentile = 50,
  riskCategory = 'Average',
  size = 200,
  animated = true,
  showLabel = true,
  className = '',
  style = {},
  ...props
}, ref) => {
  const [animatedPercentile, setAnimatedPercentile] = useState(0)

  // Clamp percentile to valid range
  const clampedPercentile = Math.min(100, Math.max(0, percentile))

  useEffect(() => {
    if (animated) {
      // Animate the needle
      const duration = 1000
      const startTime = Date.now()
      const startValue = animatedPercentile

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Easing function: ease-out-cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        const currentValue = startValue + (clampedPercentile - startValue) * eased

        setAnimatedPercentile(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    } else {
      setAnimatedPercentile(clampedPercentile)
    }
  }, [clampedPercentile, animated])

  // Calculate needle angle (180 degrees = full arc, from left to right)
  // 0% = -90deg (left), 100% = 90deg (right)
  const needleAngle = -90 + (animatedPercentile / 100) * 180

  // Calculate center position and radius
  const centerX = size / 2
  const centerY = size * 0.6
  const radius = size * 0.4
  const needleLength = radius * 0.85

  // Risk category colors
  const riskColors = {
    'Very Low': '#22c55e',
    'Low': '#86efac',
    'Average': '#fbbf24',
    'Elevated': '#fb923c',
    'High': '#ef4444',
  }

  const needleColor = riskColors[riskCategory] || '#64748b'

  // Create arc segments for the gauge background
  const createArcPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = centerX + outerRadius * Math.cos(startRad)
    const y1 = centerY + outerRadius * Math.sin(startRad)
    const x2 = centerX + outerRadius * Math.cos(endRad)
    const y2 = centerY + outerRadius * Math.sin(endRad)
    const x3 = centerX + innerRadius * Math.cos(endRad)
    const y3 = centerY + innerRadius * Math.sin(endRad)
    const x4 = centerX + innerRadius * Math.cos(startRad)
    const y4 = centerY + innerRadius * Math.sin(startRad)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  // Color stops for gradient (green to yellow to red)
  const segments = [
    { start: -180, end: -144, color: '#22c55e' },  // Very Low (0-20%)
    { start: -144, end: -108, color: '#86efac' },  // Low (20-40%)
    { start: -108, end: -72, color: '#fbbf24' },   // Average (40-60%)
    { start: -72, end: -36, color: '#fb923c' },    // Elevated (60-80%)
    { start: -36, end: 0, color: '#ef4444' },      // High (80-100%)
  ]

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...style,
  }

  return (
    <div ref={ref} style={containerStyles} className={className} {...props}>
      <svg
        width={size}
        height={size * 0.65}
        viewBox={`0 0 ${size} ${size * 0.65}`}
        style={{ overflow: 'visible' }}
      >
        {/* Gauge arc segments */}
        {segments.map((segment, index) => (
          <path
            key={index}
            d={createArcPath(segment.start, segment.end, radius * 0.7, radius)}
            fill={segment.color}
            opacity={0.9}
          />
        ))}

        {/* Inner shadow/depth effect */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={radius * 0.65}
          ry={radius * 0.65}
          fill="white"
          filter="url(#innerShadow)"
        />

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.55}
          fill="white"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />

        {/* Needle */}
        <g
          style={{
            transformOrigin: `${centerX}px ${centerY}px`,
            transform: `rotate(${needleAngle}deg)`,
            transition: animated ? 'none' : 'transform 0.3s ease',
          }}
        >
          {/* Needle shape */}
          <polygon
            points={`
              ${centerX},${centerY - 6}
              ${centerX + needleLength},${centerY}
              ${centerX},${centerY + 6}
            `}
            fill={needleColor}
            style={{
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
            }}
          />
          {/* Needle center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={10}
            fill={needleColor}
            stroke="white"
            strokeWidth="3"
          />
        </g>

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = -180 + (tick / 100) * 180
          const rad = (angle * Math.PI) / 180
          const innerR = radius * 1.02
          const outerR = radius * 1.1
          const x1 = centerX + innerR * Math.cos(rad)
          const y1 = centerY + innerR * Math.sin(rad)
          const x2 = centerX + outerR * Math.cos(rad)
          const y2 = centerY + outerR * Math.sin(rad)
          const labelR = radius * 1.2
          const labelX = centerX + labelR * Math.cos(rad)
          const labelY = centerY + labelR * Math.sin(rad)

          return (
            <g key={tick}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={size * 0.055}
                fill="#94a3b8"
                fontWeight="500"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Inner shadow filter definition */}
        <defs>
          <filter id="innerShadow">
            <feOffset dx="0" dy="2" />
            <feGaussianBlur stdDeviation="3" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="#000" floodOpacity="0.1" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      {/* Percentile value display */}
      <div
        style={{
          textAlign: 'center',
          marginTop: `-${size * 0.2}px`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: size * 0.18,
            fontWeight: '700',
            color: needleColor,
            lineHeight: 1,
          }}
        >
          {clampedPercentile.toFixed(1)}
        </div>
        <div
          style={{
            fontSize: size * 0.07,
            color: '#94a3b8',
            marginTop: '2px',
          }}
        >
          percentile
        </div>
      </div>

      {/* Risk category label */}
      {showLabel && (
        <div
          style={{
            marginTop: size * 0.08,
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: needleColor,
            color: riskCategory === 'Average' || riskCategory === 'Low' ? '#1e293b' : 'white',
            fontWeight: '600',
            fontSize: size * 0.07,
          }}
        >
          {riskCategory}
        </div>
      )}
    </div>
  )
})

RiskGauge.displayName = 'RiskGauge'

export default RiskGauge
