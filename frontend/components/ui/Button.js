'use client'

import { forwardRef } from 'react'

const variants = {
  primary: {
    background: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    hoverBackground: 'var(--color-primary-hover)',
    shadow: 'var(--shadow-primary)',
  },
  secondary: {
    background: 'var(--color-secondary)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    hoverBackground: 'var(--color-secondary-hover)',
    shadow: '0 4px 14px 0 rgba(13, 148, 136, 0.4)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: '2px solid var(--color-primary)',
    hoverBackground: 'var(--color-primary-light)',
    shadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: 'none',
    hoverBackground: 'var(--color-border-light)',
    shadow: 'none',
  },
  danger: {
    background: 'var(--color-danger)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    hoverBackground: 'var(--color-danger-dark)',
    shadow: 'var(--shadow-danger)',
  },
  success: {
    background: 'var(--color-success)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    hoverBackground: 'var(--color-success-dark)',
    shadow: 'var(--shadow-success)',
  },
}

const sizes = {
  sm: {
    padding: '8px 16px',
    fontSize: 'var(--font-size-sm)',
    borderRadius: 'var(--radius-lg)',
    minHeight: '32px',
  },
  md: {
    padding: '12px 24px',
    fontSize: 'var(--font-size-base)',
    borderRadius: 'var(--radius-xl)',
    minHeight: '44px',
  },
  lg: {
    padding: '16px 32px',
    fontSize: 'var(--font-size-lg)',
    borderRadius: 'var(--radius-xl)',
    minHeight: '52px',
  },
}

const Spinner = ({ size }) => {
  const spinnerSize = size === 'sm' ? '14px' : size === 'lg' ? '22px' : '18px'

  return (
    <span
      style={{
        display: 'inline-block',
        width: spinnerSize,
        height: spinnerSize,
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'button-spin 0.6s linear infinite',
        marginRight: '8px',
      }}
    />
  )
}

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  type = 'button',
  onClick,
  className = '',
  style = {},
  ...props
}, ref) => {
  const variantStyles = variants[variant] || variants.primary
  const sizeStyles = sizes[size] || sizes.md
  const isDisabled = disabled || loading

  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 'var(--font-weight-semibold)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    outline: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : 'auto',
    opacity: isDisabled ? 0.6 : 1,
    ...sizeStyles,
    background: variantStyles.background,
    color: variantStyles.color,
    border: variantStyles.border,
    boxShadow: isDisabled ? 'none' : variantStyles.shadow,
    ...style,
  }

  const handleMouseEnter = (e) => {
    if (!isDisabled) {
      e.currentTarget.style.background = variantStyles.hoverBackground
      e.currentTarget.style.transform = 'translateY(-1px)'
    }
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.background = variantStyles.background
    e.currentTarget.style.transform = 'translateY(0)'
  }

  const handleMouseDown = (e) => {
    if (!isDisabled) {
      e.currentTarget.style.transform = 'translateY(0) scale(0.98)'
    }
  }

  const handleMouseUp = (e) => {
    if (!isDisabled) {
      e.currentTarget.style.transform = 'translateY(-1px) scale(1)'
    }
  }

  return (
    <>
      <style jsx global>{`
        @keyframes button-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={buttonStyles}
        className={className}
        {...props}
      >
        {loading && <Spinner size={size} />}
        {!loading && leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
      </button>
    </>
  )
})

Button.displayName = 'Button'

export default Button
