'use client';

import { useState } from 'react';
import Link from 'next/link';

// Table of Contents component
function TableOfContents({ sections, activeSection }) {
  return (
    <nav style={{
      position: 'sticky',
      top: '20px',
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '24px',
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        Table of Contents
      </h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {sections.map((section) => (
          <li key={section.id} style={{ marginBottom: '8px' }}>
            <a
              href={`#${section.id}`}
              style={{
                color: activeSection === section.id ? '#2563eb' : '#475569',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: activeSection === section.id ? '600' : '400',
                display: 'block',
                padding: '4px 0',
                borderLeft: activeSection === section.id ? '3px solid #2563eb' : '3px solid transparent',
                paddingLeft: '12px',
                transition: 'all 0.2s ease',
              }}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Expandable section component
function ExpandableSection({ title, icon, children, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#1e293b',
          }}>
            {title}
          </span>
        </div>
        <span style={{
          fontSize: '1.2rem',
          color: '#64748b',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}>
          {expanded ? '-' : '+'}
        </span>
      </button>
      {expanded && (
        <div style={{
          padding: '0 24px 24px',
          color: '#475569',
          lineHeight: '1.8',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Code block component
function CodeBlock({ children }) {
  return (
    <pre style={{
      background: '#1e293b',
      color: '#e2e8f0',
      padding: '20px',
      borderRadius: '8px',
      overflowX: 'auto',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      margin: '16px 0',
    }}>
      <code>{children}</code>
    </pre>
  );
}

// Formula component
function Formula({ children, label }) {
  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: '1.3rem',
        color: '#1e293b',
        marginBottom: label ? '12px' : 0,
      }}>
        {children}
      </div>
      {label && (
        <div style={{
          fontSize: '0.85rem',
          color: '#64748b',
          fontStyle: 'italic',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

// Reference component
function Reference({ number, authors, title, journal, year, doi }) {
  return (
    <div style={{
      padding: '12px 16px',
      background: '#f8fafc',
      borderRadius: '6px',
      marginBottom: '12px',
      fontSize: '0.9rem',
      lineHeight: '1.6',
    }}>
      <span style={{
        display: 'inline-block',
        background: '#2563eb',
        color: 'white',
        width: '24px',
        height: '24px',
        borderRadius: '4px',
        textAlign: 'center',
        lineHeight: '24px',
        fontSize: '0.8rem',
        marginRight: '12px',
        fontWeight: '600',
      }}>
        {number}
      </span>
      <span style={{ color: '#1e293b' }}>{authors}. </span>
      <span style={{ fontStyle: 'italic' }}>{title}. </span>
      <span style={{ color: '#64748b' }}>{journal} ({year}). </span>
      {doi && (
        <a
          href={`https://doi.org/${doi}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2563eb' }}
        >
          doi:{doi}
        </a>
      )}
    </div>
  );
}

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'how-prs-works', title: 'How PRS Works' },
  { id: 'algorithm', title: 'The Algorithm' },
  { id: 'normalization', title: 'Population Normalization' },
  { id: 'variant-matching', title: 'Variant Matching' },
  { id: 'data-sources', title: 'Data Sources' },
  { id: 'validation', title: 'Validation' },
  { id: 'limitations', title: 'Limitations' },
  { id: 'references', title: 'References' },
];

export default function MethodologyPage() {
  const [activeSection, setActiveSection] = useState('overview');

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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            Research Methodology
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            margin: 0,
            maxWidth: '700px',
          }}>
            Understanding the science behind polygenic risk score calculation and interpretation
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '40px',
      }}>
        {/* Sidebar */}
        <aside style={{
          display: 'none',
        }}>
          <TableOfContents sections={sections} activeSection={activeSection} />
        </aside>

        {/* Desktop Sidebar */}
        <aside className="desktop-sidebar" style={{
          display: 'block',
        }}>
          <TableOfContents sections={sections} activeSection={activeSection} />
        </aside>

        {/* Content */}
        <div>
          {/* Overview Section */}
          <section id="overview" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              Overview
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Polygenic Risk Scores (PRS) represent one of the most significant advances in translating
              genetic research into clinical practice. Unlike traditional genetic tests that focus on
              single genes with large effects (such as BRCA1/2 for breast cancer), PRS aggregate the
              effects of thousands to millions of genetic variants across the genome, each contributing
              a small amount to disease risk.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              This calculator implements state-of-the-art PRS methodology using validated scores from
              the PGS Catalog, the world&apos;s largest open resource for polygenic scores. Our approach
              combines rigorous statistical methods with user-friendly interpretation to make genetic
              risk assessment accessible while maintaining scientific accuracy.
            </p>
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '20px',
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Key Points</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af' }}>
                <li>PRS combine effects of many genetic variants</li>
                <li>Scores are validated in independent populations</li>
                <li>Results are expressed as population percentiles</li>
                <li>Environmental factors are not captured by genetics alone</li>
              </ul>
            </div>
          </section>

          {/* How PRS Works Section */}
          <section id="how-prs-works" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              How Polygenic Risk Scores Work
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The foundation of PRS lies in Genome-Wide Association Studies (GWAS), which scan the
              entire genome to identify genetic variants associated with diseases or traits. These
              studies compare the genetic makeup of individuals with and without a condition to find
              variants that occur more frequently in affected individuals.
            </p>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              From GWAS to PRS
            </h3>
            <ol style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>Discovery Phase:</strong> Researchers conduct GWAS in large cohorts (often
                hundreds of thousands of participants) to identify genetic variants associated with
                a disease. Each variant is assigned an &quot;effect weight&quot; representing its contribution
                to disease risk.
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Score Development:</strong> Scientists select which variants to include in
                the score and optimize the weights. Modern PRS may include anywhere from a few hundred
                to several million variants.
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Validation:</strong> The score is tested in independent populations to ensure
                it accurately predicts disease risk. This step is crucial for confirming the score
                works beyond the original study population.
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Application:</strong> Individual genotypes are matched against the scoring
                file, and a weighted sum produces the final PRS value. This raw score is then
                compared to a reference population to generate a percentile.
              </li>
            </ol>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              The Polygenic Nature of Complex Diseases
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Most common diseases are &quot;polygenic,&quot; meaning they are influenced by many genes
              working together rather than a single gene. For example, coronary artery disease
              risk is influenced by variants affecting lipid metabolism, inflammation, blood
              pressure regulation, and many other biological pathways.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              While each individual variant typically has a small effect (often changing risk by
              less than 1%), their combined effect can be substantial. Individuals in the top
              percentiles of genetic risk may have 2-5 times higher disease risk compared to
              those in the lowest percentiles.
            </p>
          </section>

          {/* Algorithm Section */}
          <section id="algorithm" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              The Algorithm
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
              The core PRS calculation is elegant in its simplicity while being powerful in its
              ability to aggregate genetic information:
            </p>

            <Formula label="Core Polygenic Risk Score Formula">
              PRS = &Sigma;<sub>i=1</sub><sup>n</sup> (dosage<sub>i</sub> &times; effect_weight<sub>i</sub>)
            </Formula>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              Understanding the Components
            </h3>

            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '20px',
            }}>
              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '4px solid #2563eb',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Dosage (0, 1, or 2)</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                  The number of effect alleles an individual carries at each genetic position.
                  Humans have two copies of each chromosome, so dosage ranges from 0 (no risk
                  alleles) to 2 (two risk alleles). This represents the additive genetic model.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '4px solid #059669',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Effect Weight (Beta/Log-OR)</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                  The magnitude and direction of each variant&apos;s effect on disease risk. Positive
                  weights indicate increased risk; negative weights indicate protective effects.
                  These are typically derived from GWAS as log odds ratios or effect sizes.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '4px solid #7c3aed',
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Summation (&Sigma;)</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                  The weighted contributions of all variants are summed together. A typical PRS
                  may include thousands to millions of variants, though many modern scores focus
                  on a curated set of the most predictive variants.
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              Implementation Details
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '12px' }}>
              Our implementation follows best practices for PRS calculation:
            </p>
            <CodeBlock>
{`// Pseudocode for PRS calculation
function calculatePRS(userVariants, scoringFile):
    prs_sum = 0
    matched_variants = 0

    for each variant in scoringFile:
        // Match by chromosome:position and/or rsID
        userGenotype = matchVariant(userVariants, variant)

        if userGenotype exists:
            // Calculate dosage based on effect allele
            dosage = countEffectAlleles(userGenotype, variant.effectAllele)
            prs_sum += dosage * variant.effectWeight
            matched_variants += 1

    return {
        raw_score: prs_sum,
        variants_matched: matched_variants,
        total_variants: scoringFile.length
    }`}
            </CodeBlock>
          </section>

          {/* Population Normalization Section */}
          <section id="normalization" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              Population Normalization
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
              Raw PRS values are difficult to interpret in isolation. To make scores meaningful,
              we normalize them against a reference population to produce percentiles.
            </p>

            <Formula label="Z-score Standardization">
              Z = (PRS<sub>individual</sub> - &mu;<sub>population</sub>) / &sigma;<sub>population</sub>
            </Formula>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              Reference Populations
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              We use ancestry-specific reference populations derived from large biobanks including:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px' }}>
              <li><strong>European (EUR):</strong> Based on UK Biobank and other European cohorts</li>
              <li><strong>African (AFR):</strong> Derived from African ancestry participants in various studies</li>
              <li><strong>East Asian (EAS):</strong> Based on East Asian population studies</li>
              <li><strong>South Asian (SAS):</strong> Derived from South Asian cohorts</li>
              <li><strong>Latino/Admixed American (AMR):</strong> Based on admixed American populations</li>
            </ul>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              Percentile Interpretation
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              After standardization, scores are converted to percentiles, indicating what proportion
              of the reference population has a lower genetic risk score:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '16px',
            }}>
              {[
                { range: '0-20%', label: 'Very Low', color: '#22c55e', bg: '#dcfce7' },
                { range: '20-40%', label: 'Low', color: '#86efac', bg: '#d1fae5' },
                { range: '40-60%', label: 'Average', color: '#d97706', bg: '#fef3c7' },
                { range: '60-80%', label: 'Elevated', color: '#fb923c', bg: '#ffedd5' },
                { range: '80-100%', label: 'High', color: '#ef4444', bg: '#fee2e2' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: item.bg,
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: `1px solid ${item.color}40`,
                  }}
                >
                  <div style={{ fontWeight: '600', color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.range}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Variant Matching Section */}
          <section id="variant-matching" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              Variant Matching Process
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
              Accurate variant matching between user genotypes and scoring files is critical for
              reliable PRS calculation. We employ multiple matching strategies:
            </p>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              Matching Strategies
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '12px 16px',
                  fontWeight: '600',
                  color: '#1e293b',
                }}>
                  1. Position-based Matching (Primary)
                </div>
                <div style={{ padding: '16px', color: '#64748b' }}>
                  Variants are matched by chromosome and genomic position (chr:pos). This is the
                  most reliable method as positions are stable across different reference panels.
                  Example: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>1:12345</code>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '12px 16px',
                  fontWeight: '600',
                  color: '#1e293b',
                }}>
                  2. rsID-based Matching (Secondary)
                </div>
                <div style={{ padding: '16px', color: '#64748b' }}>
                  dbSNP reference SNP IDs (rsIDs) provide another matching key. While convenient,
                  rsIDs can be merged or retired over time, so position-based matching is preferred.
                  Example: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>rs12345</code>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              Allele Handling
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '12px' }}>
              When matching variants, we must handle allele representation carefully:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px' }}>
              <li><strong>Forward vs. Reverse Strand:</strong> We normalize all variants to the forward strand</li>
              <li><strong>Effect Allele Orientation:</strong> Dosage is calculated based on the effect allele defined in the scoring file</li>
              <li><strong>Ambiguous SNPs:</strong> A/T and C/G variants require special handling due to strand ambiguity</li>
              <li><strong>Multiallelic Sites:</strong> Positions with more than two alleles are handled according to the specific effect allele</li>
            </ul>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              Supported File Formats
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '12px' }}>
              Our calculator supports multiple consumer DNA testing formats:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {[
                { name: '23andMe', ext: '.txt', variants: '~600K-700K' },
                { name: 'AncestryDNA', ext: '.txt/.csv', variants: '~700K' },
                { name: 'VCF', ext: '.vcf', variants: 'Variable' },
              ].map((format) => (
                <div
                  key={format.name}
                  style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                    {format.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Format: {format.ext}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Typical variants: {format.variants}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Data Sources Section */}
          <section id="data-sources" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              Data Sources
            </h2>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '20px', marginBottom: '12px' }}>
              PGS Catalog
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The PGS Catalog (<a href="https://www.pgscatalog.org" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>www.pgscatalog.org</a>)
              is an open database of published polygenic scores maintained by the European
              Bioinformatics Institute (EMBL-EBI) and the University of Cambridge. It provides:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px' }}>
              <li>Standardized scoring files with harmonized genomic coordinates</li>
              <li>Detailed metadata about score development and validation</li>
              <li>Performance metrics across different populations</li>
              <li>Links to original publications for full transparency</li>
            </ul>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              UK Biobank
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Many of the scores we use were developed or validated using UK Biobank data, a
              prospective cohort study with deep genetic and phenotypic data on approximately
              500,000 participants. The UK Biobank provides:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px' }}>
              <li>Large sample sizes for robust statistical inference</li>
              <li>Longitudinal health records for outcome validation</li>
              <li>Diverse genetic ancestry representation</li>
              <li>Quality-controlled genotype data</li>
            </ul>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              Reference Population Statistics
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              Population-level statistics (means and standard deviations) for score normalization
              are derived from large reference panels, including 1000 Genomes Project data and
              ancestry-matched subsets of biobank cohorts.
            </p>
          </section>

          {/* Validation Section */}
          <section id="validation" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              Validation
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
              All PRS included in this calculator have undergone rigorous validation procedures:
            </p>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '20px', marginBottom: '12px' }}>
              Validation Criteria
            </h3>
            <div style={{
              display: 'grid',
              gap: '16px',
            }}>
              {[
                {
                  title: 'Independent Replication',
                  description: 'Scores must demonstrate predictive performance in cohorts not used for development',
                  icon: 'A',
                },
                {
                  title: 'Publication Record',
                  description: 'All scores are from peer-reviewed publications with transparent methodology',
                  icon: 'P',
                },
                {
                  title: 'Sample Size',
                  description: 'Development GWAS typically include >100,000 participants for adequate power',
                  icon: 'N',
                },
                {
                  title: 'Effect Size Consistency',
                  description: 'Variant effects should be directionally consistent across populations',
                  icon: 'E',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: '#f8fafc',
                    padding: '20px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>{item.title}</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              Performance Metrics
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '12px' }}>
              PRS performance is typically evaluated using:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px' }}>
              <li><strong>Area Under the ROC Curve (AUC):</strong> Measures discrimination between cases and controls</li>
              <li><strong>Odds Ratio per SD:</strong> Risk increase per standard deviation increase in PRS</li>
              <li><strong>Variance Explained (R&sup2;):</strong> Proportion of trait variance attributable to PRS</li>
              <li><strong>Hazard Ratio:</strong> For prospective studies, the relative rate of disease onset</li>
            </ul>
          </section>

          {/* Limitations Section */}
          <section id="limitations" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              Limitations
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
              While PRS represent a powerful tool for risk stratification, users should be aware
              of several important limitations:
            </p>

            <ExpandableSection title="Ancestry Bias" icon="*" defaultExpanded={true}>
              <p style={{ marginBottom: '12px' }}>
                Most GWAS have been conducted in populations of European ancestry, leading to
                several issues:
              </p>
              <ul style={{ marginTop: '8px', paddingLeft: '24px' }}>
                <li>PRS typically perform best in European populations</li>
                <li>Predictive accuracy often decreases in non-European populations</li>
                <li>Variant frequencies and effect sizes may differ across ancestries</li>
                <li>Linkage disequilibrium patterns vary between populations</li>
              </ul>
              <p style={{ marginTop: '12px' }}>
                We provide ancestry-specific normalization, but users of non-European ancestry
                should interpret results with additional caution. Efforts are underway to develop
                more diverse and transferable PRS.
              </p>
            </ExpandableSection>

            <ExpandableSection title="Environmental Factors" icon="*" defaultExpanded={true}>
              <p style={{ marginBottom: '12px' }}>
                PRS capture only the genetic component of disease risk. Many conditions are
                heavily influenced by environmental and lifestyle factors not reflected in
                genetic scores:
              </p>
              <ul style={{ marginTop: '8px', paddingLeft: '24px' }}>
                <li>Diet and nutrition</li>
                <li>Physical activity levels</li>
                <li>Smoking and alcohol use</li>
                <li>Environmental exposures</li>
                <li>Socioeconomic factors</li>
                <li>Access to healthcare</li>
              </ul>
              <p style={{ marginTop: '12px' }}>
                A high genetic risk score does not mean disease is inevitable, just as a low
                score does not guarantee protection.
              </p>
            </ExpandableSection>

            <ExpandableSection title="Incomplete Variant Coverage" icon="*" defaultExpanded={true}>
              <p style={{ marginBottom: '12px' }}>
                Consumer DNA tests genotype only a subset of genetic variants:
              </p>
              <ul style={{ marginTop: '8px', paddingLeft: '24px' }}>
                <li>Typical arrays capture 600,000-700,000 variants</li>
                <li>This represents a small fraction of the genome</li>
                <li>Not all PRS variants may be present in your genotype file</li>
                <li>Rare variants with large effects are often not captured</li>
              </ul>
              <p style={{ marginTop: '12px' }}>
                We report the number of variants matched for each score to provide transparency
                about coverage.
              </p>
            </ExpandableSection>

            <ExpandableSection title="Gene-Environment Interactions" icon="*" defaultExpanded={true}>
              <p>
                The effect of genetic variants can be modified by environmental factors
                (gene-environment interactions). For example, the genetic risk for obesity may
                be more or less pronounced depending on physical activity levels. Current PRS
                do not capture these interactions.
              </p>
            </ExpandableSection>

            <ExpandableSection title="Not Diagnostic" icon="*" defaultExpanded={true}>
              <p>
                PRS provide risk estimates, not diagnoses. A high-risk score indicates increased
                probability of developing a condition over a lifetime but does not mean you have
                or will definitely develop the disease. Conversely, a low-risk score does not
                rule out disease. Clinical diagnosis requires proper medical evaluation.
              </p>
            </ExpandableSection>

            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '24px',
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Important Disclaimer</h4>
              <p style={{ margin: 0, color: '#92400e', fontSize: '0.95rem' }}>
                This tool is for educational and research purposes only. Results should not
                be used for medical decisions without consultation with qualified healthcare
                professionals. Genetic risk is just one factor in disease development.
              </p>
            </div>
          </section>

          {/* References Section */}
          <section id="references" style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              References
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
              Key publications underlying our methodology and the PRS we implement:
            </p>

            <Reference
              number={1}
              authors="Lambert SA, Gil L, Jupp S, et al."
              title="The Polygenic Score Catalog as an open database for reproducibility and systematic evaluation"
              journal="Nature Genetics"
              year="2021"
              doi="10.1038/s41588-021-00783-5"
            />

            <Reference
              number={2}
              authors="Khera AV, Chaffin M, Aragam KG, et al."
              title="Genome-wide polygenic scores for common diseases identify individuals with risk equivalent to monogenic mutations"
              journal="Nature Genetics"
              year="2018"
              doi="10.1038/s41588-018-0183-z"
            />

            <Reference
              number={3}
              authors="Wand H, Lambert SA, Tamber C, et al."
              title="Improving reporting standards for polygenic scores in risk prediction studies"
              journal="Nature"
              year="2021"
              doi="10.1038/s41586-021-03243-6"
            />

            <Reference
              number={4}
              authors="Martin AR, Kanai M, Kamatani Y, et al."
              title="Clinical use of current polygenic risk scores may exacerbate health disparities"
              journal="Nature Genetics"
              year="2019"
              doi="10.1038/s41588-019-0379-x"
            />

            <Reference
              number={5}
              authors="Choi SW, Mak TSH, O'Reilly PF"
              title="Tutorial: a guide to performing polygenic risk score analyses"
              journal="Nature Protocols"
              year="2020"
              doi="10.1038/s41596-020-0353-1"
            />

            <Reference
              number={6}
              authors="Bycroft C, Freeman C, Petkova D, et al."
              title="The UK Biobank resource with deep phenotyping and genomic data"
              journal="Nature"
              year="2018"
              doi="10.1038/s41586-018-0579-z"
            />

            <Reference
              number={7}
              authors="Torkamani A, Wineinger NE, Topol EJ"
              title="The personal and clinical utility of polygenic risk scores"
              journal="Nature Reviews Genetics"
              year="2018"
              doi="10.1038/s41576-018-0018-x"
            />

            <Reference
              number={8}
              authors="Lewis CM, Vassos E"
              title="Polygenic risk scores: from research tools to clinical instruments"
              journal="Genome Medicine"
              year="2020"
              doi="10.1186/s13073-020-00742-5"
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'white',
      }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 12px 0' }}>
          Last updated: January 2025
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
          For questions about methodology, please refer to the original publications.
        </p>
      </footer>

      {/* Responsive styles */}
      <style jsx global>{`
        @media (max-width: 900px) {
          main {
            grid-template-columns: 1fr !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
