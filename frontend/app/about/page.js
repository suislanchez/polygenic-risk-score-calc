'use client';

import Link from 'next/link';

// Feature card component
function FeatureCard({ icon, title, description }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: '#eff6ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        fontSize: '1.5rem',
      }}>
        {icon}
      </div>
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '1.1rem',
        color: '#1e293b',
      }}>
        {title}
      </h3>
      <p style={{
        margin: 0,
        color: '#64748b',
        lineHeight: '1.6',
        fontSize: '0.95rem',
      }}>
        {description}
      </p>
    </div>
  );
}

// Info card component
function InfoCard({ title, children, variant = 'default' }) {
  const styles = {
    default: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      titleColor: '#1e293b',
    },
    warning: {
      background: '#fef3c7',
      border: '1px solid #fcd34d',
      titleColor: '#92400e',
    },
    info: {
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      titleColor: '#1e40af',
    },
    success: {
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      titleColor: '#166534',
    },
  };

  const style = styles[variant];

  return (
    <div style={{
      background: style.background,
      border: style.border,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      <h3 style={{
        margin: '0 0 12px 0',
        color: style.titleColor,
        fontSize: '1.1rem',
      }}>
        {title}
      </h3>
      <div style={{ color: '#475569', lineHeight: '1.7' }}>
        {children}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        padding: '40px 20px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            &larr; Back to Calculator
          </Link>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            margin: '0 0 12px 0',
            fontWeight: '700',
          }}>
            About PRS Calculator
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            margin: 0,
            maxWidth: '700px',
          }}>
            Making genetic risk assessment accessible, transparent, and scientifically rigorous
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px',
      }}>
        {/* Project Overview */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '1.6rem',
            color: '#1e293b',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px solid #e2e8f0',
          }}>
            Project Overview
          </h2>
          <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
            The PRS Calculator is an open-source tool designed to help individuals understand
            their genetic predisposition to various health conditions. By analyzing DNA data
            from consumer genetic testing services (such as 23andMe or AncestryDNA), we
            calculate polygenic risk scores for over 50 diseases and conditions.
          </p>
          <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
            Our mission is to bridge the gap between cutting-edge genetic research and
            individuals seeking to understand their health risks. We believe that access to
            genetic information should be democratized while maintaining the highest standards
            of scientific accuracy and responsible communication of results.
          </p>
          <p style={{ color: '#475569', lineHeight: '1.8' }}>
            This project leverages validated polygenic scores from the PGS Catalog, ensuring
            that all calculations are based on peer-reviewed research and meet rigorous
            quality standards.
          </p>
        </section>

        {/* Key Features */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '1.6rem',
            color: '#1e293b',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px solid #e2e8f0',
          }}>
            Key Features
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            <FeatureCard
              icon="O"
              title="50+ Disease Scores"
              description="Comprehensive coverage of cardiovascular, oncological, metabolic, neurological, psychiatric, and autoimmune conditions using validated PGS Catalog scores."
            />
            <FeatureCard
              icon="O"
              title="Privacy-First Design"
              description="Your genetic data never leaves your device. All calculations are performed locally in your browser, ensuring complete data privacy."
            />
            <FeatureCard
              icon="O"
              title="Multiple Ancestries"
              description="Ancestry-specific population normalization for European, African, East Asian, South Asian, and Latino/Admixed American populations."
            />
            <FeatureCard
              icon="O"
              title="Multiple Formats"
              description="Support for 23andMe, AncestryDNA, and VCF file formats. Simply upload your raw data file to get started."
            />
            <FeatureCard
              icon="O"
              title="Scientific Transparency"
              description="Full documentation of our methodology, data sources, and limitations. Every score links back to its original publication."
            />
            <FeatureCard
              icon="O"
              title="Educational Resources"
              description="Detailed information about each disease, including heritability estimates, key genes, risk factors, and prevention strategies."
            />
          </div>
        </section>

        {/* Data Privacy */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '1.6rem',
            color: '#1e293b',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px solid #e2e8f0',
          }}>
            Data Privacy Statement
          </h2>

          <InfoCard title="Your Privacy is Our Priority" variant="success">
            <p style={{ margin: '0 0 16px 0' }}>
              We take data privacy extremely seriously. Here is exactly what happens with your
              genetic data:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>No Data Storage:</strong> Your genetic data is processed entirely in
                memory and is never stored on our servers or any external database.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Client-Side Processing:</strong> All PRS calculations are performed
                locally in your web browser. Your raw genetic data never leaves your device.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>No Tracking:</strong> We do not track individual users or their results.
                No personal information is collected.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Open Source:</strong> Our code is open source and can be audited by
                anyone to verify our privacy claims.
              </li>
              <li>
                <strong>Temporary Files:</strong> Any temporary files created during processing
                are automatically deleted when you close the browser tab.
              </li>
            </ul>
          </InfoCard>

          <p style={{ color: '#475569', lineHeight: '1.8' }}>
            We believe that individuals should have control over their own genetic information.
            By processing all data locally, we eliminate the risks associated with centralized
            data storage while still providing valuable genetic insights.
          </p>
        </section>

        {/* Data Sources & Attribution */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '1.6rem',
            color: '#1e293b',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px solid #e2e8f0',
          }}>
            Data Sources & Attribution
          </h2>

          <InfoCard title="PGS Catalog" variant="info">
            <p style={{ margin: '0 0 12px 0' }}>
              This tool uses polygenic scores from the{' '}
              <a
                href="https://www.pgscatalog.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb' }}
              >
                PGS Catalog
              </a>
              , an open database of published polygenic scores developed and maintained by the
              European Bioinformatics Institute (EMBL-EBI) and the University of Cambridge.
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              The PGS Catalog provides standardized, harmonized scoring files that meet rigorous
              quality standards. Each score is linked to its original publication, ensuring full
              scientific transparency.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Citation:</strong> Lambert SA, Gil L, Jupp S, et al. The Polygenic Score
              Catalog as an open database for reproducibility and systematic evaluation. Nature
              Genetics (2021). doi:10.1038/s41588-021-00783-5
            </p>
          </InfoCard>

          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
            Additional Data Sources
          </h3>
          <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>UK Biobank:</strong> Population statistics and validation cohorts
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>1000 Genomes Project:</strong> Reference population allele frequencies
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>dbSNP:</strong> Variant identifiers and reference information
            </li>
            <li>
              <strong>Published GWAS:</strong> Effect sizes and variant associations from
              peer-reviewed genome-wide association studies
            </li>
          </ul>
        </section>

        {/* Medical Disclaimer */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '1.6rem',
            color: '#1e293b',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px solid #e2e8f0',
          }}>
            Medical Disclaimer
          </h2>

          <InfoCard title="Important: Read Before Use" variant="warning">
            <p style={{ margin: '0 0 16px 0', fontWeight: '600' }}>
              This tool provides genetic risk estimates for educational and informational
              purposes only. It is NOT a medical device and should NOT be used for:
            </p>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Diagnosing any disease or medical condition</li>
              <li style={{ marginBottom: '8px' }}>Making medical treatment decisions</li>
              <li style={{ marginBottom: '8px' }}>Replacing professional medical advice</li>
              <li style={{ marginBottom: '8px' }}>Determining the need for medical testing</li>
              <li>Making decisions about medication or lifestyle changes without consulting a healthcare provider</li>
            </ul>
            <p style={{ margin: '0 0 16px 0' }}>
              <strong>Genetic risk is only one factor</strong> in disease development. Many
              conditions are heavily influenced by environmental factors, lifestyle choices, and
              other non-genetic factors that this tool does not assess.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Always consult with qualified healthcare professionals</strong> for
              personalized medical advice. If you have concerns about your health or genetic
              risk, please speak with a physician or certified genetic counselor.
            </p>
          </InfoCard>

          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
            Understanding Your Results
          </h3>
          <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '12px' }}>
            When interpreting your polygenic risk scores, please keep in mind:
          </p>
          <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              A <strong>high-risk score</strong> does not mean you will definitely develop a
              condition. It indicates you may have a higher probability compared to others.
            </li>
            <li style={{ marginBottom: '8px' }}>
              A <strong>low-risk score</strong> does not guarantee you will not develop a
              condition. Many people with low genetic risk still develop diseases.
            </li>
            <li style={{ marginBottom: '8px' }}>
              Risk scores are <strong>relative to a reference population</strong> and may be
              less accurate for individuals of non-European ancestry.
            </li>
            <li>
              Scores reflect <strong>lifetime risk</strong> and do not indicate when (or if) a
              condition might develop.
            </li>
          </ul>
        </section>

        {/* Researchers */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '1.6rem',
            color: '#1e293b',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px solid #e2e8f0',
          }}>
            Researchers
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {/* Luis Sanchez */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                }}>
                  LS
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '1.2rem' }}>
                    Luis Sanchez
                  </h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                    Computer Science @ UC Berkeley
                  </p>
                </div>
              </div>

              <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '16px' }}>
                Berkeley CS student (3.9 GPA) and Chancellor's Scholar. Software engineer at Robolabs building
                memory aid apps for dementia patients. Previously at Duolingo, Adobe, and P&G. Won YC's Dedalus
                Hackathon and 7+ hackathons total. Contributed to the Dolphin Emulator used by millions.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <a href="https://suislanchez.com" target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '6px 12px',
                    background: '#1e40af',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                  }}>
                  Website
                </a>
                <a href="https://github.com/suislanchez" target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '6px 12px',
                    background: '#24292e',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                  }}>
                  GitHub
                </a>
                <a href="https://linkedin.com/in/suislanchez" target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '6px 12px',
                    background: '#0077b5',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                  }}>
                  LinkedIn
                </a>
                <a href="https://twitter.com/suislanchez" target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '6px 12px',
                    background: '#1da1f2',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                  }}>
                  X
                </a>
              </div>
            </div>

            {/* Shubhankar Tripathy */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                }}>
                  ST
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '1.2rem' }}>
                    Shubhankar Tripathy
                  </h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                    AI Researcher | Stanford, MIT, Berkeley
                  </p>
                </div>
              </div>

              <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '16px' }}>
                AI Researcher specializing in Intelligence, RL, and Agentic Systems. Triple major (CS, Math,
                Data Science) from UMass Amherst. Google CSRMP Fellow. Co-founder of CADSA (40+ university
                network). Won CalHacks 1st Prize. Ex-Data Science at Dell Technologies.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <a href="https://linkedin.com/in/shubhankartripathy" target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '6px 12px',
                    background: '#0077b5',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                  }}>
                  LinkedIn
                </a>
                <a href="https://github.com/shubhankartripathy" target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: '6px 12px',
                    background: '#24292e',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                  }}>
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Links */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '1.6rem',
            color: '#1e293b',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px solid #e2e8f0',
          }}>
            Contact & Links
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Source Code</h4>
              <p style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '0.95rem' }}>
                Open source on GitHub:
              </p>
              <a
                href="https://github.com/suislanchez/polygenic-risk-score-calc"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'none' }}
              >
                suislanchez/polygenic-risk-score-calc
              </a>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Issues & Feedback</h4>
              <p style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '0.95rem' }}>
                Report bugs or request features:
              </p>
              <a
                href="https://github.com/suislanchez/polygenic-risk-score-calc/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'none' }}
              >
                GitHub Issues
              </a>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Cite This Project</h4>
              <p style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '0.95rem' }}>
                Use the "Cite this repository" button:
              </p>
              <a
                href="https://github.com/suislanchez/polygenic-risk-score-calc"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'none' }}
              >
                View Citation
              </a>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 style={{
            fontSize: '1.6rem',
            color: '#1e293b',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px solid #e2e8f0',
          }}>
            Learn More
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {[
              { href: '/methodology', label: 'Research Methodology', desc: 'How PRS scores are calculated' },
              { href: '/diseases', label: 'Disease Catalog', desc: 'All 50+ supported conditions' },
              { href: '/faq', label: 'FAQ', desc: 'Common questions answered' },
              { href: '/', label: 'Calculator', desc: 'Calculate your risk scores' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  fontWeight: '600',
                  color: '#2563eb',
                  marginBottom: '4px',
                }}>
                  {link.label} &rarr;
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                }}>
                  {link.desc}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '40px 20px',
        background: 'white',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
            PRS Calculator - Making genetic risk assessment accessible
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Data provided by{' '}
            <a
              href="https://www.pgscatalog.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb' }}
            >
              PGS Catalog
            </a>
            {' '}&bull;{' '}
            <Link href="/methodology" style={{ color: '#2563eb' }}>
              Methodology
            </Link>
            {' '}&bull;{' '}
            <Link href="/faq" style={{ color: '#2563eb' }}>
              FAQ
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
