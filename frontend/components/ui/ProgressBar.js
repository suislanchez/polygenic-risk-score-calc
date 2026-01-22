'use client'

import { forwardRef, useEffect, useState } from 'react'

const colorVariants = {
  blue: {
    background: 'var(--color-primary)',
    light: 'var(--color-primary-light)',
    gradient: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
  },
  green: {
    background: 'var(--color-success)',
    light: 'var(--color-success-light)',
    gradient: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
  },
  red: {
    background: 'var(--color-danger)',
    light: 'var(--color-danger-light)',
    gradient: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
  },
  teal: {
    background: 'var(--color-secondary)',
    light: 'var(--color-secondary-light)',
    gradient: 'linear-gradient(90deg, #0d9488 0%, #2dd4bf 100%)',
  },
  warning: {
    background: 'var(--color-warning)',
    light: 'var(--color-warning-light)',
    gradient: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
  },
  risk: {
    background: 'var(--gradient-risk)',
    light: '#f1f5f9',
    gradient: 'var(--gradient-risk)',
  },
}

const sizes = {
  sm: {
    height: '6px',
    borderRadius: 'var(--radius-sm)',
  },
  md: {
    height: '10px',
    borderRadius: 'var(--radius-md)',
  },
  lg: {
    height: '14px',
    borderRadius: 'var(--radius-lg)',
  },
}

const ProgressBar = forwardRef(({
  value = 0,
  max = 100,
  color = 'blue',
  size = 'md',
  showPercentage = false,
  animated = true,
  striped = false,
  label = '',
  className = '',
  style = {},
  ...props
}, ref) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const colorStyles = colorVariants[color] || colorVariants.blue
  const sizeStyles = sizes[size] || sizes.md

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setAnimatedValue(percentage)
    }
  }, [percentage, animated])

  const containerStyles = {
    width: '100%',
    ...style,
  }

  const labelContainerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-2)',
  }

  const labelStyles = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-primary)',
  }

  const percentageStyles = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-secondary)',
  }

  const trackStyles = {
    width: '100%',
    background: colorStyles.light,
    borderRadius: sizeStyles.borderRadius,
    height: sizeStyles.height,
    overflow: 'hidden',
    position: 'relative',
  }

  const fillStyles = {
    width: `${animatedValue}%`,
    height: '100%',
    background: striped
      ? `repeating-linear-gradient(
          45deg,
          ${colorStyles.background},
          ${colorStyles.background} 10px,
          rgba(255,255,255,0.2) 10px,
          rgba(255,255,255,0.2) 20px
        )`
      : colorStyles.gradient,
    borderRadius: sizeStyles.borderRadius,
    transition: animated ? 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    position: 'relative',
  }

  const shimmerStyles = animated ? {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
    animation: 'progress-shimmer 2s infinite',
  } : {}

  return (
    <>
      {animated && (
        <style jsx global>{`
          @keyframes progress-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      )}
      <div ref={ref} style={containerStyles} className={className} {...props}>
        {(label || showPercentage) && (
          <div style={labelContainerStyles}>
            {label && <span style={labelStyles}>{label}</span>}
            {showPercentage && (
              <span style={percentageStyles}>{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        <div style={trackStyles} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
          <div style={fillStyles}>
            {animated && animatedValue > 0 && <div style={shimmerStyles} />}
          </div>
        </div>
      </div>
    </>
  )
})

ProgressBar.displayName = 'ProgressBar'

export default ProgressBar
