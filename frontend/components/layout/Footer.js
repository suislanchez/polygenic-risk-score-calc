'use client'

import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerStyles = {
    background: 'var(--color-surface)',
    borderTop: '1px solid var(--color-border)',
    padding: 'var(--spacing-12) var(--spacing-5) var(--spacing-8)',
    marginTop: 'auto',
  }

  const containerStyles = {
    maxWidth: 'var(--container-xl)',
    margin: '0 auto',
  }

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-8)',
    marginBottom: 'var(--spacing-8)',
  }

  const sectionStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  }

  const sectionTitleStyles = {
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--spacing-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  const linkStyles = {
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    fontSize: 'var(--font-size-sm)',
    transition: 'color var(--transition-fast)',
  }

  const disclaimerStyles = {
    background: 'var(--color-warning-light)',
    border: '1px solid var(--color-warning)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-4)',
    marginBottom: 'var(--spacing-8)',
  }

  const disclaimerTextStyles = {
    margin: 0,
    color: '#92400e',
    fontSize: 'var(--font-size-sm)',
    lineHeight: 'var(--line-height-relaxed)',
  }

  const bottomStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    paddingTop: 'var(--spacing-6)',
    borderTop: '1px solid var(--color-border)',
    textAlign: 'center',
  }

  const attributionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  }

  const copyrightStyles = {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
  }

  const PGSLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M8 12h8M12 8v8" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  return (
    <footer style={footerStyles}>
      <div style={containerStyles}>
        {/* Disclaimer */}
        <div style={disclaimerStyles}>
          <p style={disclaimerTextStyles}>
            <strong>Medical Disclaimer:</strong> This tool provides genetic risk estimates for educational and research purposes only.
            Results should NOT be used for medical decisions. Polygenic risk scores represent only one factor in disease susceptibility
            and do not account for environmental factors, lifestyle, or family history. Always consult a qualified healthcare provider
            or genetic counselor for personalized medical advice.
          </p>
        </div>

        {/* Footer links grid */}
        <div style={gridStyles}>
          <div style={sectionStyles}>
            <h4 style={sectionTitleStyles}>Resources</h4>
            <Link
              href="/methodology"
              style={linkStyles}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              Methodology
            </Link>
            <Link
              href="/about"
              style={linkStyles}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              About Us
            </Link>
            <a
              href="https://www.pgscatalog.org"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyles}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              PGS Catalog
            </a>
          </div>

          <div style={sectionStyles}>
            <h4 style={sectionTitleStyles}>Legal</h4>
            <Link
              href="/privacy"
              style={linkStyles}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              style={linkStyles}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              Terms of Service
            </Link>
            <Link
              href="/disclaimer"
              style={linkStyles}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            >
              Medical Disclaimer
            </Link>
          </div>

          <div style={sectionStyles}>
            <h4 style={sectionTitleStyles}>Supported Formats</h4>
            <span style={{ ...linkStyles, cursor: 'default' }}>23andMe</span>
            <span style={{ ...linkStyles, cursor: 'default' }}>AncestryDNA</span>
            <span style={{ ...linkStyles, cursor: 'default' }}>VCF Files</span>
          </div>

          <div style={sectionStyles}>
            <h4 style={sectionTitleStyles}>Ancestry Support</h4>
            <span style={{ ...linkStyles, cursor: 'default' }}>European (EUR)</span>
            <span style={{ ...linkStyles, cursor: 'default' }}>African (AFR)</span>
            <span style={{ ...linkStyles, cursor: 'default' }}>East Asian (EAS)</span>
            <span style={{ ...linkStyles, cursor: 'default' }}>South Asian (SAS)</span>
            <span style={{ ...linkStyles, cursor: 'default' }}>Latino/Admixed (AMR)</span>
          </div>
        </div>

        {/* Bottom section */}
        <div style={bottomStyles}>
          <div style={attributionStyles}>
            <span>Powered by</span>
            <a
              href="https://www.pgscatalog.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-1)',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              <PGSLogo />
              PGS Catalog
            </a>
            <span>validated polygenic scores</span>
          </div>
          <p style={copyrightStyles}>
            {currentYear} PRS Calculator. For research and educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
