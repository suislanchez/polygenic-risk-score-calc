'use client'

import { forwardRef } from 'react'

const paddingOptions = {
  none: '0',
  sm: 'var(--spacing-3)',
  md: 'var(--spacing-5)',
  lg: 'var(--spacing-8)',
}

const Card = forwardRef(({
  children,
  padding = 'md',
  hover = false,
  bordered = false,
  shadow = 'md',
  className = '',
  style = {},
  onClick,
  ...props
}, ref) => {
  const shadowMap = {
    none: 'none',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  }

  const cardStyles = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-2xl)',
    padding: paddingOptions[padding] || paddingOptions.md,
    boxShadow: shadowMap[shadow] || shadowMap.md,
    border: bordered ? '1px solid var(--color-border)' : 'none',
    transition: hover ? 'all var(--transition-base)' : 'none',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }

  const handleMouseEnter = (e) => {
    if (hover) {
      e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
      e.currentTarget.style.transform = 'translateY(-4px)'
    }
  }

  const handleMouseLeave = (e) => {
    if (hover) {
      e.currentTarget.style.boxShadow = shadowMap[shadow] || shadowMap.md
      e.currentTarget.style.transform = 'translateY(0)'
    }
  }

  return (
    <div
      ref={ref}
      style={cardStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// Card Header Component
const CardHeader = forwardRef(({
  children,
  className = '',
  style = {},
  ...props
}, ref) => {
  const headerStyles = {
    padding: 'var(--spacing-5)',
    paddingBottom: 'var(--spacing-4)',
    borderBottom: '1px solid var(--color-border-light)',
    ...style,
  }

  return (
    <div ref={ref} style={headerStyles} className={className} {...props}>
      {children}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

// Card Body Component
const CardBody = forwardRef(({
  children,
  padding = 'md',
  className = '',
  style = {},
  ...props
}, ref) => {
  const bodyStyles = {
    padding: paddingOptions[padding] || paddingOptions.md,
    ...style,
  }

  return (
    <div ref={ref} style={bodyStyles} className={className} {...props}>
      {children}
    </div>
  )
})

CardBody.displayName = 'CardBody'

// Card Footer Component
const CardFooter = forwardRef(({
  children,
  className = '',
  style = {},
  ...props
}, ref) => {
  const footerStyles = {
    padding: 'var(--spacing-4) var(--spacing-5)',
    borderTop: '1px solid var(--color-border-light)',
    background: 'var(--color-border-light)',
    borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)',
    ...style,
  }

  return (
    <div ref={ref} style={footerStyles} className={className} {...props}>
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'

// Card Title Component
const CardTitle = forwardRef(({
  children,
  as: Tag = 'h3',
  className = '',
  style = {},
  ...props
}, ref) => {
  const titleStyles = {
    margin: 0,
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-primary)',
    lineHeight: 'var(--line-height-tight)',
    ...style,
  }

  return (
    <Tag ref={ref} style={titleStyles} className={className} {...props}>
      {children}
    </Tag>
  )
})

CardTitle.displayName = 'CardTitle'

// Card Description Component
const CardDescription = forwardRef(({
  children,
  className = '',
  style = {},
  ...props
}, ref) => {
  const descStyles = {
    margin: 'var(--spacing-2) 0 0',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 'var(--line-height-normal)',
    ...style,
  }

  return (
    <p ref={ref} style={descStyles} className={className} {...props}>
      {children}
    </p>
  )
})

CardDescription.displayName = 'CardDescription'

export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription }
export default Card
