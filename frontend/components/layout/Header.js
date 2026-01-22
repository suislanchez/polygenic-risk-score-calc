'use client'

import { useState } from 'react'
import Link from 'next/link'

const Header = ({ currentPage = 'home' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', id: 'home' },
    { href: '/methodology', label: 'Methodology', id: 'methodology' },
    { href: '/about', label: 'About', id: 'about' },
  ]

  const headerStyles = {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 'var(--z-sticky)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--color-border)',
    padding: '0 var(--spacing-5)',
  }

  const containerStyles = {
    maxWidth: 'var(--container-xl)',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  }

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    textDecoration: 'none',
    color: 'var(--color-text-primary)',
  }

  const logoIconStyles = {
    width: '36px',
    height: '36px',
    background: 'var(--gradient-primary)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 'var(--font-size-lg)',
  }

  const logoTextStyles = {
    fontWeight: 'var(--font-weight-bold)',
    fontSize: 'var(--font-size-lg)',
    background: 'var(--gradient-primary)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }

  const navStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  }

  const navLinkStyles = (isActive) => ({
    padding: 'var(--spacing-2) var(--spacing-4)',
    textDecoration: 'none',
    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    fontWeight: 'var(--font-weight-medium)',
    fontSize: 'var(--font-size-sm)',
    borderRadius: 'var(--radius-lg)',
    transition: 'all var(--transition-fast)',
    background: isActive ? 'var(--color-primary-light)' : 'transparent',
  })

  const mobileMenuButtonStyles = {
    display: 'none',
    padding: 'var(--spacing-2)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
  }

  const mobileNavStyles = {
    display: mobileMenuOpen ? 'flex' : 'none',
    position: 'absolute',
    top: '64px',
    left: 0,
    right: 0,
    background: 'white',
    flexDirection: 'column',
    padding: 'var(--spacing-4)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-lg)',
  }

  const DNAIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
      <path d="M17 6l-2.5-2.5" />
      <path d="M14 8l-3-3" />
      <path d="M7 18l2.5 2.5" />
      <path d="M3.5 14.5l.5.5" />
      <path d="M20 9l.5.5" />
      <path d="M6.5 12.5l1 1" />
      <path d="M16.5 10.5l1 1" />
      <path d="M10 16l-2 2" />
    </svg>
  )

  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )

  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )

  return (
    <>
      <style jsx>{`
        @media (max-width: 640px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .mobile-nav {
            display: ${mobileMenuOpen ? 'flex' : 'none'} !important;
          }
        }
      `}</style>
      <header style={headerStyles}>
        <div style={containerStyles}>
          <Link href="/" style={logoStyles}>
            <div style={logoIconStyles}>
              <DNAIcon />
            </div>
            <span style={logoTextStyles}>PRS Calculator</span>
          </Link>

          <nav style={navStyles} className="desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                style={navLinkStyles(currentPage === item.id)}
                onMouseEnter={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.background = 'var(--color-border-light)'
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            style={mobileMenuButtonStyles}
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <nav style={mobileNavStyles} className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              style={{
                ...navLinkStyles(currentPage === item.id),
                padding: 'var(--spacing-3) var(--spacing-4)',
                display: 'block',
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  )
}

export default Header
