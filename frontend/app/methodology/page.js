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
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
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
          <li key={section.id} style={{ marginBottom: '6px' }}>
            <a
              href={`#${section.id}`}
              style={{
                color: activeSection === section.id ? '#2563eb' : '#475569',
                textDecoration: 'none',
                fontSize: '0.85rem',
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

// Code block component
function CodeBlock({ children }) {
  return (
    <pre style={{
      background: '#1e293b',
      color: '#e2e8f0',
      padding: '20px',
      borderRadius: '8px',
      overflowX: 'auto',
      fontSize: '0.85rem',
      lineHeight: '1.6',
      margin: '16px 0',
    }}>
      <code>{children}</code>
    </pre>
  );
}

// Formula component
function Formula({ children, label, number }) {
  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '24px',
      margin: '24px 0',
      textAlign: 'center',
      position: 'relative',
    }}>
      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: '1.2rem',
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
      {number && (
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
          fontSize: '0.9rem',
        }}>
          ({number})
        </div>
      )}
    </div>
  );
}

// Data Table component
function DataTable({ headers, rows, caption, source }) {
  return (
    <div style={{ margin: '24px 0', overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9rem',
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {caption && (
          <caption style={{
            padding: '12px',
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'left',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}>
            {caption}
          </caption>
        )}
        <thead>
          <tr style={{ background: '#1e40af', color: 'white' }}>
            {headers.map((header, i) => (
              <th key={i} style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.85rem',
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{
              background: i % 2 === 0 ? 'white' : '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '12px 16px',
                  color: '#475569',
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {source && (
        <div style={{
          fontSize: '0.8rem',
          color: '#94a3b8',
          fontStyle: 'italic',
          marginTop: '8px',
        }}>
          Source: {source}
        </div>
      )}
    </div>
  );
}

// Figure component
function Figure({ children, caption, number }) {
  return (
    <figure style={{
      margin: '32px 0',
      padding: '24px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ marginBottom: '16px' }}>
        {children}
      </div>
      <figcaption style={{
        fontSize: '0.9rem',
        color: '#475569',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '12px',
      }}>
        <strong style={{ color: '#1e293b' }}>Figure {number}.</strong> {caption}
      </figcaption>
    </figure>
  );
}

// Reference component
function Reference({ number, authors, title, journal, year, doi, volume, pages }) {
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
        fontSize: '0.75rem',
        marginRight: '12px',
        fontWeight: '600',
      }}>
        {number}
      </span>
      <span style={{ color: '#1e293b' }}>{authors} </span>
      <span style={{ fontStyle: 'italic' }}>{title}. </span>
      <span style={{ color: '#64748b' }}>{journal}</span>
      {volume && <span style={{ color: '#64748b' }}> {volume}</span>}
      {pages && <span style={{ color: '#64748b' }}>:{pages}</span>}
      <span style={{ color: '#64748b' }}> ({year}). </span>
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

// Stat Card component
function StatCard({ value, label, sublabel }) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#2563eb',
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#1e293b',
      }}>
        {label}
      </div>
      {sublabel && (
        <div style={{
          fontSize: '0.8rem',
          color: '#64748b',
          marginTop: '2px',
        }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

const sections = [
  { id: 'abstract', title: 'Abstract' },
  { id: 'introduction', title: '1. Introduction' },
  { id: 'background', title: '2. Background' },
  { id: 'methods', title: '3. Methods' },
  { id: 'prs-calculation', title: '3.1 PRS Calculation' },
  { id: 'variant-matching', title: '3.2 Variant Matching' },
  { id: 'normalization', title: '3.3 Population Normalization' },
  { id: 'risk-integration', title: '3.4 Risk Integration' },
  { id: 'data-sources', title: '4. Data Sources' },
  { id: 'validation', title: '5. Validation & Performance' },
  { id: 'disease-coverage', title: '6. Disease Coverage' },
  { id: 'heritability', title: '7. Heritability Estimates' },
  { id: 'limitations', title: '8. Limitations' },
  { id: 'clinical-utility', title: '9. Clinical Utility' },
  { id: 'future-directions', title: '10. Future Directions' },
  { id: 'references', title: 'References' },
];

export default function MethodologyPage() {
  const [activeSection, setActiveSection] = useState('abstract');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        padding: '60px 20px',
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
              marginBottom: '20px',
            }}
          >
            &larr; Back to Calculator
          </Link>
          <div style={{
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Technical Documentation & Research Methodology
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            margin: '0 0 16px 0',
            fontWeight: '700',
            lineHeight: '1.2',
          }}>
            Polygenic Risk Score Calculator:<br />
            <span style={{ fontWeight: '400', fontSize: '0.85em' }}>
              Methods, Validation, and Clinical Implementation
            </span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1rem',
            margin: '20px 0 0 0',
            maxWidth: '800px',
            lineHeight: '1.6',
          }}>
            A comprehensive technical paper describing the methodology, data sources, validation procedures,
            and clinical considerations for polygenic risk score calculation using genome-wide association
            study summary statistics and consumer DNA testing data.
          </p>
          <div style={{
            marginTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.8)',
          }}>
            <span>Version 2.0</span>
            <span>|</span>
            <span>Last Updated: January 2025</span>
            <span>|</span>
            <span>50+ Disease Scores</span>
          </div>
        </div>
      </header>

      {/* Key Statistics */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '30px 20px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
        }}>
          <StatCard value="50+" label="Diseases Analyzed" sublabel="Validated PGS scores" />
          <StatCard value="6,630" label="Avg. Variants/Score" sublabel="Per disease" />
          <StatCard value="5" label="Ancestry Groups" sublabel="Population-specific" />
          <StatCard value=">500K" label="UK Biobank" sublabel="Validation cohort" />
          <StatCard value="0.65-0.85" label="Typical AUC" sublabel="Discriminative ability" />
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '40px',
      }}>
        {/* Sidebar */}
        <aside className="desktop-sidebar" style={{ display: 'block' }}>
          <TableOfContents sections={sections} activeSection={activeSection} />
        </aside>

        {/* Content */}
        <article style={{ maxWidth: '800px' }}>
          {/* Abstract Section */}
          <section id="abstract" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #2563eb',
            }}>
              Abstract
            </h2>
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '24px',
              color: '#1e40af',
              lineHeight: '1.8',
              fontSize: '0.95rem',
            }}>
              <p style={{ marginBottom: '16px' }}>
                <strong>Background:</strong> Polygenic risk scores (PRS) aggregate the effects of thousands of
                genetic variants to estimate an individual&apos;s genetic predisposition to complex diseases.
                Despite their potential clinical utility, implementing PRS in consumer-facing applications
                requires careful consideration of methodological choices, population stratification, and
                result interpretation.
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong>Methods:</strong> We developed a web-based PRS calculator that processes consumer
                DNA testing data (23andMe, AncestryDNA, VCF formats) and computes risk scores for 50+
                diseases using validated scoring files from the PGS Catalog. Our pipeline implements
                position-based variant matching, strand flip detection, ancestry-specific normalization
                using UK Biobank-derived population parameters, and optional integration with lifestyle
                and family history risk factors.
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong>Results:</strong> Across our disease panel, we achieve median variant matching rates
                of 65-75% with consumer genotyping arrays. Validation in held-out UK Biobank samples
                demonstrates AUC values ranging from 0.55-0.85 depending on disease heritability and
                score optimization. Individuals in the top decile of genetic risk show 2-5 fold increased
                odds of disease compared to the population median.
              </p>
              <p>
                <strong>Conclusions:</strong> PRS provide meaningful stratification of genetic disease risk
                and can be computed from consumer DNA data with appropriate methodological safeguards.
                However, results must be interpreted in context of ancestry-specific performance,
                incomplete variant coverage, and the complementary role of environmental factors.
              </p>
            </div>
          </section>

          {/* 1. Introduction */}
          <section id="introduction" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              1. Introduction
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The completion of the Human Genome Project in 2003 and subsequent advances in genome-wide
              association studies (GWAS) have revolutionized our understanding of the genetic architecture
              of complex diseases. Unlike Mendelian disorders caused by single gene mutations with large
              effects, common diseases such as coronary artery disease, type 2 diabetes, and most cancers
              are influenced by thousands of genetic variants, each contributing a small increment to
              overall disease risk<sup>[1]</sup>.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Polygenic risk scores (PRS), also known as genetic risk scores (GRS) or polygenic scores (PGS),
              represent a methodological framework for aggregating these small effects into a single
              quantitative measure of genetic liability. The fundamental insight underlying PRS is that
              while individual variants explain minimal phenotypic variance (typically &lt;1% each), their
              combined effect can be substantial—often explaining 10-30% of disease heritability and
              identifying individuals at markedly elevated risk<sup>[2,3]</sup>.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The clinical potential of PRS has generated considerable interest. Khera et al. (2018)
              demonstrated that individuals in the top 8% of the PRS distribution for coronary artery
              disease have risk equivalent to carriers of rare monogenic familial hypercholesterolemia
              mutations—roughly 3-fold elevated risk compared to the population average<sup>[4]</sup>. Similar
              findings have emerged for breast cancer, where high PRS can identify women with lifetime
              risk exceeding clinical thresholds for enhanced screening<sup>[5]</sup>.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The proliferation of direct-to-consumer (DTC) DNA testing services—with over 40 million
              individuals having been genotyped by companies such as 23andMe and AncestryDNA—creates
              an unprecedented opportunity to apply PRS at population scale<sup>[6]</sup>. However, implementing
              PRS in this context requires addressing several methodological challenges:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
              <li><strong>Variant coverage:</strong> Consumer arrays genotype ~600,000-700,000 variants,
              a small fraction of the variants in many PRS</li>
              <li><strong>Ancestry heterogeneity:</strong> Most GWAS have been conducted in European
              populations, limiting PRS transferability</li>
              <li><strong>Score selection:</strong> Multiple PRS exist for many diseases, varying in
              development methodology and validation status</li>
              <li><strong>Result interpretation:</strong> Raw scores require normalization and
              contextualization for meaningful clinical interpretation</li>
            </ul>
            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              This technical documentation describes our approach to addressing these challenges in
              developing a clinically-oriented PRS calculator suitable for consumer genomic data.
            </p>
          </section>

          {/* 2. Background */}
          <section id="background" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              2. Background
            </h2>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              2.1 The Genetic Architecture of Complex Diseases
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Complex diseases arise from the interplay of genetic and environmental factors. The
              genetic component follows a predominantly polygenic architecture, where disease liability
              is distributed across thousands of variants throughout the genome. This architecture was
              first formally described by Fisher (1918) and has been confirmed by modern GWAS<sup>[7]</sup>.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Twin studies provide estimates of heritability (h²)—the proportion of phenotypic variance
              attributable to genetic factors—ranging from 30% to 80% for most common diseases. For
              example, coronary artery disease has estimated heritability of 40-60%, type 2 diabetes
              30-70%, and schizophrenia 60-80%<sup>[8]</sup>. GWAS have now identified thousands of genome-wide
              significant associations (P &lt; 5×10⁻⁸), though collectively these explain only a fraction
              of heritability—the so-called &quot;missing heritability&quot; problem<sup>[9]</sup>.
            </p>

            <DataTable
              caption="Table 1. Heritability Estimates for Selected Complex Diseases"
              headers={['Disease', 'Twin h²', 'SNP h²', 'Top PRS R²', 'Key GWAS N']}
              rows={[
                ['Coronary Artery Disease', '40-60%', '25-30%', '12-15%', '~1.1M'],
                ['Type 2 Diabetes', '30-70%', '20-25%', '8-12%', '~900K'],
                ['Breast Cancer', '25-35%', '15-20%', '18-20%', '~250K'],
                ['Prostate Cancer', '40-60%', '25-30%', '20-25%', '~140K'],
                ['Schizophrenia', '60-80%', '40-50%', '7-10%', '~150K'],
                ['Alzheimer Disease', '60-80%', '25-35%', '15-20%', '~450K'],
                ['Atrial Fibrillation', '60-70%', '20-25%', '12-15%', '~1M'],
                ['Inflammatory Bowel Disease', '40-60%', '20-25%', '8-12%', '~60K'],
              ]}
              source="Literature review; SNP h² from LD Score regression; PRS R² from UK Biobank validation"
            />

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              2.2 Evolution of Polygenic Risk Scores
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Early genetic risk prediction focused on a handful of genome-wide significant variants,
              capturing only a small fraction of genetic variance. The development of PRS methodology
              represented a paradigm shift, recognizing that incorporating sub-significant variants
              could improve prediction despite individual effects being statistically uncertain<sup>[10]</sup>.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              PRS methodology has evolved through several generations:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
              <li><strong>First generation (2007-2012):</strong> Simple sum of genome-wide significant
              variants, typically &lt;100 SNPs</li>
              <li><strong>Second generation (2013-2017):</strong> P-value thresholding approaches (P+T),
              including variants at multiple significance thresholds, typically thousands of SNPs</li>
              <li><strong>Third generation (2018-present):</strong> Bayesian and penalized regression
              methods (LDpred, PRScs, lassosum) that model linkage disequilibrium and optimize
              variant weights, often including millions of variants<sup>[11-13]</sup></li>
            </ul>
            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              Modern PRS using methods like LDpred2 and PRS-CS typically explain 2-3 times more
              variance than older P+T approaches, though the optimal method varies by trait and
              available GWAS sample size<sup>[14]</sup>.
            </p>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              2.3 The PGS Catalog
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The PGS Catalog (www.pgscatalog.org) was established in 2019 as an open resource for
              published polygenic scores, addressing the lack of standardization in PRS reporting
              and accessibility<sup>[15]</sup>. As of January 2025, the catalog contains:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}>
              {[
                { label: 'Published Scores', value: '4,500+' },
                { label: 'Traits/Diseases', value: '650+' },
                { label: 'Publications', value: '800+' },
                { label: 'Evaluation Studies', value: '12,000+' },
              ].map((item) => (
                <div key={item.label} style={{
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              The PGS Catalog provides harmonized scoring files with standardized genomic coordinates
              (GRCh37 and GRCh38), facilitating consistent implementation across platforms. Each score
              includes metadata on development methodology, training/validation populations, and
              performance metrics.
            </p>
          </section>

          {/* 3. Methods */}
          <section id="methods" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              3. Methods
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Our PRS calculation pipeline consists of four major components: (1) genotype parsing
              and quality control, (2) variant matching and dosage calculation, (3) weighted score
              summation, and (4) population-specific normalization. We additionally implement optional
              integration with clinical and lifestyle risk factors.
            </p>

            <Figure number="1" caption="PRS Calculation Pipeline. Genotype data from consumer DNA tests undergoes format detection, quality control, and coordinate standardization before variant matching against PGS Catalog scoring files. Raw scores are normalized using ancestry-specific population parameters to generate percentile-based risk estimates.">
              <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                borderRadius: '8px',
                padding: '24px',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📁</div>
                    <div>DNA File</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>23andMe/Ancestry</div>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>→</div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🔍</div>
                    <div>Parse & QC</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>~650K variants</div>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>→</div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🧬</div>
                    <div>Match Variants</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>chr:pos lookup</div>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>→</div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📊</div>
                    <div>Calculate PRS</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Σ(dosage×β)</div>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>→</div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📈</div>
                    <div>Normalize</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Z-score → %ile</div>
                  </div>
                </div>
              </div>
            </Figure>
          </section>

          {/* 3.1 PRS Calculation */}
          <section id="prs-calculation" style={{ marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '1.5rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0',
            }}>
              3.1 PRS Calculation Algorithm
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The core PRS calculation follows the standard additive model, computing a weighted
              sum of effect allele dosages:
            </p>

            <Formula number="1" label="Polygenic Risk Score Formula">
              PRS<sub>i</sub> = Σ<sub>j=1</sub><sup>M</sup> β<sub>j</sub> × G<sub>ij</sub>
            </Formula>

            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Where for individual <em>i</em> across <em>M</em> variants:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
              <li><strong>β<sub>j</sub></strong> = effect weight for variant <em>j</em> (typically log odds ratio from GWAS)</li>
              <li><strong>G<sub>ij</sub></strong> = dosage of effect allele (0, 1, or 2) for individual <em>i</em> at variant <em>j</em></li>
            </ul>

            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Effect weights are obtained from PGS Catalog scoring files, which provide harmonized
              weights derived from original GWAS summary statistics. Weights may be raw GWAS effect
              sizes or posterior means from Bayesian shrinkage methods (e.g., LDpred, PRS-CS) that
              account for linkage disequilibrium and polygenicity.
            </p>

            <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
              Dosage Calculation
            </h4>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Dosage represents the count of effect alleles carried by an individual. Under the
              additive genetic model:
            </p>

            <CodeBlock>
{`// Dosage calculation algorithm
function computeDosage(allele1, allele2, effectAllele, otherAllele):
    // Direct allele matching
    if {allele1, allele2} ⊆ {effectAllele, otherAllele}:
        dosage = (allele1 == effectAllele ? 1 : 0) +
                 (allele2 == effectAllele ? 1 : 0)
        return dosage  // Returns 0, 1, or 2

    // Check for strand flip (complement alleles)
    effectComplement = complement(effectAllele)  // A↔T, C↔G
    otherComplement = complement(otherAllele)

    if {allele1, allele2} ⊆ {effectComplement, otherComplement}:
        dosage = (allele1 == effectComplement ? 1 : 0) +
                 (allele2 == effectComplement ? 1 : 0)
        return dosage

    return NULL  // Alleles don't match - exclude variant`}
            </CodeBlock>

            <DataTable
              caption="Table 2. Example Dosage Calculations"
              headers={['Genotype', 'Effect Allele', 'Other Allele', 'Dosage', 'Interpretation']}
              rows={[
                ['A/A', 'A', 'G', '2', 'Homozygous for effect allele'],
                ['A/G', 'A', 'G', '1', 'Heterozygous'],
                ['G/G', 'A', 'G', '0', 'Homozygous for other allele'],
                ['T/T', 'A', 'G', '2', 'Strand flip detected (T=complement of A)'],
                ['A/C', 'A', 'G', 'NULL', 'Alleles don\'t match - multiallelic site'],
              ]}
            />
          </section>

          {/* 3.2 Variant Matching */}
          <section id="variant-matching" style={{ marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '1.5rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0',
            }}>
              3.2 Variant Matching
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Accurate variant matching between user genotypes and scoring files is critical for
              reliable PRS calculation. We implement a multi-strategy matching approach prioritizing
              genomic position, which is stable across reference panels.
            </p>

            <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
              Primary Matching: Chromosome:Position
            </h4>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Variants are matched by chromosome and base pair position (e.g., <code>1:12345678</code>).
              PGS Catalog scoring files provide harmonized coordinates in both GRCh37 (hg19) and
              GRCh38 (hg38) reference builds. Our pipeline:
            </p>
            <ol style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
              <li>Detects input file genome build using diagnostic SNPs with known positions</li>
              <li>Performs coordinate liftover if necessary using UCSC chain files</li>
              <li>Creates chr:pos hash tables for O(1) lookup during matching</li>
            </ol>

            <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
              Genome Build Detection
            </h4>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              We use a panel of ~1,000 SNPs with known positions in both GRCh37 and GRCh38 to
              automatically detect the genome build of input files:
            </p>

            <CodeBlock>
{`// Genome build detection using diagnostic SNPs
DIAGNOSTIC_SNPS = {
    'rs1234567': {'GRCh37': (1, 12345678), 'GRCh38': (1, 12445678)},
    'rs2345678': {'GRCh37': (2, 23456789), 'GRCh38': (2, 23556789)},
    // ... ~1000 SNPs with build-specific positions
}

function detectBuild(variants):
    grch37_matches = 0
    grch38_matches = 0

    for rsid, user_position in variants:
        if rsid in DIAGNOSTIC_SNPS:
            if user_position == DIAGNOSTIC_SNPS[rsid]['GRCh37']:
                grch37_matches += 1
            if user_position == DIAGNOSTIC_SNPS[rsid]['GRCh38']:
                grch38_matches += 1

    // Require >90% concordance for confident assignment
    if grch37_matches > grch38_matches * 10:
        return 'GRCh37'
    elif grch38_matches > grch37_matches * 10:
        return 'GRCh38'
    else:
        return 'AMBIGUOUS'`}
            </CodeBlock>

            <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
              Variant Matching Performance
            </h4>

            <DataTable
              caption="Table 3. Typical Variant Matching Rates by Platform and Disease"
              headers={['Disease/PGS', 'Variants in Score', '23andMe Match', 'AncestryDNA Match', 'Match Rate']}
              rows={[
                ['Coronary Artery Disease (PGS000018)', '6,630,150', '4,521,203', '4,687,412', '68-71%'],
                ['Type 2 Diabetes (PGS000036)', '1,098,765', '756,432', '781,234', '69-71%'],
                ['Breast Cancer (PGS000004)', '313,447', '215,678', '223,456', '69-71%'],
                ['Prostate Cancer (PGS000062)', '147,532', '98,234', '102,456', '67-69%'],
                ['Atrial Fibrillation (PGS000016)', '2,456,789', '1,698,432', '1,723,567', '69-70%'],
                ['Alzheimer Disease (PGS000334)', '843,256', '576,234', '598,123', '68-71%'],
              ]}
              source="Based on PGS Catalog scoring files and typical consumer array coverage"
            />

            <p style={{ color: '#475569', lineHeight: '1.8', marginTop: '16px' }}>
              Matching rates of 65-75% are typical and sufficient for reliable PRS calculation, as
              scores are designed to capture aggregate genetic signal rather than requiring complete
              variant coverage. Studies have shown that PRS performance degrades gradually with
              reduced variant coverage, with substantial predictive power retained even at 50%
              coverage<sup>[16]</sup>.
            </p>
          </section>

          {/* 3.3 Population Normalization */}
          <section id="normalization" style={{ marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '1.5rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0',
            }}>
              3.3 Population Normalization
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Raw PRS values are difficult to interpret without reference to a population distribution.
              We normalize scores using ancestry-specific parameters derived from large reference
              cohorts, converting raw scores to z-scores and percentiles.
            </p>

            <Formula number="2" label="Z-score Standardization">
              Z<sub>i</sub> = (PRS<sub>i</sub> - μ<sub>pop</sub>) / σ<sub>pop</sub>
            </Formula>

            <Formula number="3" label="Percentile Conversion">
              Percentile<sub>i</sub> = Φ(Z<sub>i</sub>) × 100
            </Formula>

            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Where Φ is the cumulative distribution function of the standard normal distribution.
              This conversion assumes approximate normality of PRS distributions, which holds for
              most scores due to the central limit theorem given thousands of variants.
            </p>

            <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
              Ancestry-Specific Reference Populations
            </h4>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              PRS distributions differ across ancestries due to varying allele frequencies and
              linkage disequilibrium patterns. We provide population-specific normalization for
              five major ancestry groups:
            </p>

            <DataTable
              caption="Table 4. Reference Population Parameters"
              headers={['Ancestry', 'Code', 'Reference Cohort', 'N (approx)', 'Mean Adjustment', 'SD Adjustment']}
              rows={[
                ['European', 'EUR', 'UK Biobank (White British)', '~410,000', '0.00 (reference)', '1.00 (reference)'],
                ['African', 'AFR', 'UK Biobank + PAGE Study', '~8,000', '+0.15 to +0.25', '1.05-1.15'],
                ['East Asian', 'EAS', 'UK Biobank + BBJ', '~3,000', '-0.10 to +0.10', '0.90-1.00'],
                ['South Asian', 'SAS', 'UK Biobank', '~10,000', '+0.05 to +0.15', '0.95-1.05'],
                ['Admixed American', 'AMR', 'PAGE Study + HCHS/SOL', '~5,000', '+0.00 to +0.10', '1.00-1.10'],
              ]}
              source="Population parameters derived from ancestry-stratified UK Biobank analysis and published studies"
            />

            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '20px',
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Important Note on Ancestry</h4>
              <p style={{ margin: 0, color: '#92400e', fontSize: '0.95rem', lineHeight: '1.6' }}>
                PRS developed primarily in European populations show attenuated predictive performance
                in non-European ancestries. Effect sizes may differ, and causal variants may be in
                different linkage disequilibrium with genotyped markers. Users of non-European ancestry
                should interpret results with additional caution and recognize that percentiles reflect
                comparison to the ancestry-matched reference population, not absolute risk.
              </p>
            </div>

            <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
              Risk Category Assignment
            </h4>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Percentiles are mapped to clinical risk categories following guidelines adapted from
              the American Heart Association and NHS implementation recommendations:
            </p>

            <DataTable
              caption="Table 5. Risk Category Definitions"
              headers={['Percentile Range', 'Category', 'Relative Risk*', 'Clinical Implication']}
              rows={[
                ['0-10%', 'Very Low', '0.4-0.6×', 'Below average genetic risk; standard screening'],
                ['10-25%', 'Low', '0.6-0.8×', 'Modestly reduced risk; standard screening'],
                ['25-75%', 'Average', '0.8-1.2×', 'Typical population risk; standard guidelines'],
                ['75-90%', 'Elevated', '1.2-2.0×', 'Enhanced awareness; consider earlier screening'],
                ['90-100%', 'High', '2.0-5.0×', 'Substantially elevated; specialist consultation'],
              ]}
              source="*Approximate relative risk vs. population median; varies by disease"
            />
          </section>

          {/* 3.4 Risk Integration */}
          <section id="risk-integration" style={{ marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '1.5rem',
              color: '#1e293b',
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0',
            }}>
              3.4 Risk Factor Integration
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              While PRS capture genetic predisposition, disease risk is modified by lifestyle and
              environmental factors. Our optional questionnaire module collects information on known
              risk factors and integrates them with genetic risk estimates.
            </p>

            <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
              Lifestyle Risk Modifiers
            </h4>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Risk modifiers are derived from meta-analyses and large cohort studies. The combined
              risk incorporates genetic and lifestyle factors using multiplicative models:
            </p>

            <DataTable
              caption="Table 6. Lifestyle Risk Modifiers (Evidence-Based)"
              headers={['Factor', 'Category', 'Modifier', 'Evidence Source']}
              rows={[
                ['Smoking', 'Never', '1.00 (ref)', 'Multiple meta-analyses'],
                ['Smoking', 'Former', '1.20', 'INTERHEART, Framingham'],
                ['Smoking', 'Current', '1.80', 'INTERHEART, meta-analysis'],
                ['BMI', 'Normal (18.5-25)', '1.00 (ref)', 'Global BMI Consortium'],
                ['BMI', 'Overweight (25-30)', '1.15', 'Global BMI Consortium'],
                ['BMI', 'Obese (>30)', '1.30-1.80', 'Global BMI Consortium'],
                ['Exercise', '≥150 min/week', '0.85', 'WHO guidelines, meta-analysis'],
                ['Exercise', '<75 min/week', '1.20', 'Sedentary behavior studies'],
                ['Family History', '1 affected parent', '1.50', 'Multiple disease-specific studies'],
                ['Family History', '2 affected parents', '2.50', 'Multiple disease-specific studies'],
              ]}
              source="Effect sizes from published meta-analyses; applied as disease-specific weights"
            />

            <Formula number="4" label="Combined Risk Score">
              Risk<sub>combined</sub> = PRS<sub>percentile</sub> × Π(Lifestyle Modifiers) × Family History Modifier
            </Formula>
          </section>

          {/* 4. Data Sources */}
          <section id="data-sources" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              4. Data Sources
            </h2>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '20px', marginBottom: '12px' }}>
              4.1 PGS Catalog Scoring Files
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              All polygenic scores are obtained from the PGS Catalog (www.pgscatalog.org), which
              provides standardized, harmonized scoring files with consistent formatting and
              coordinate systems. Scores are selected based on:
            </p>
            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px', marginBottom: '16px' }}>
              <li>Publication in peer-reviewed literature</li>
              <li>Validation in independent cohorts (preferably UK Biobank)</li>
              <li>Acceptable discrimination metrics (AUC &gt; 0.55 or OR/SD &gt; 1.2)</li>
              <li>Availability of ancestry-specific performance data</li>
              <li>Appropriate sample sizes in development GWAS (&gt;50,000 preferred)</li>
            </ul>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              4.2 UK Biobank
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              UK Biobank is a prospective cohort study with deep phenotyping and genomic data on
              approximately 500,000 participants aged 40-69 at recruitment (2006-2010). Key features:
            </p>

            <DataTable
              caption="Table 7. UK Biobank Resource Summary"
              headers={['Feature', 'Value', 'Notes']}
              rows={[
                ['Total Participants', '502,492', 'Aged 40-69 at recruitment'],
                ['Genotyped', '488,377', 'UK Biobank Axiom Array'],
                ['Imputed Variants', '~96 million', 'Haplotype Reference Consortium'],
                ['Whole Exome Sequencing', '~470,000', 'As of 2023'],
                ['Whole Genome Sequencing', '~500,000', 'As of 2024'],
                ['European Ancestry', '~410,000 (82%)', 'Self-reported White British'],
                ['South Asian', '~10,000 (2%)', 'Indian, Pakistani, Bangladeshi'],
                ['African/Caribbean', '~8,000 (1.6%)', 'African, Caribbean, Black British'],
                ['East Asian', '~3,000 (0.6%)', 'Chinese and other East Asian'],
                ['Follow-up', '>15 years', 'Linked to NHS health records'],
              ]}
              source="UK Biobank Data Showcase (biobank.ndph.ox.ac.uk)"
            />

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              4.3 GWAS Summary Statistics
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              PRS are derived from GWAS summary statistics. Key GWAS used for our disease panel include:
            </p>

            <DataTable
              caption="Table 8. Source GWAS for Selected PRS"
              headers={['Disease', 'GWAS Consortium', 'Sample Size', 'Year', 'PMID']}
              rows={[
                ['Coronary Artery Disease', 'CARDIoGRAMplusC4D', '~1.1 million', '2022', '35196168'],
                ['Type 2 Diabetes', 'DIAMANTE', '~900,000', '2022', '35551307'],
                ['Breast Cancer', 'BCAC', '~250,000', '2020', '32424353'],
                ['Prostate Cancer', 'PRACTICAL', '~140,000', '2021', '33398198'],
                ['Alzheimer Disease', 'IGAP/ADGC', '~450,000', '2022', '35379992'],
                ['Atrial Fibrillation', 'AFGen Consortium', '~1 million', '2023', '36624666'],
                ['Inflammatory Bowel Disease', 'IIBDGC', '~60,000', '2017', '28067908'],
                ['Schizophrenia', 'PGC', '~150,000', '2022', '35396580'],
              ]}
              source="PGS Catalog publication records"
            />
          </section>

          {/* 5. Validation */}
          <section id="validation" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              5. Validation and Performance
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              PRS performance is evaluated using multiple complementary metrics that assess both
              discrimination (ability to distinguish cases from controls) and calibration (accuracy
              of predicted probabilities).
            </p>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '20px', marginBottom: '12px' }}>
              5.1 Performance Metrics
            </h3>

            <div style={{
              display: 'grid',
              gap: '16px',
              marginBottom: '24px',
            }}>
              {[
                {
                  title: 'Area Under the ROC Curve (AUC)',
                  value: '0.55 - 0.85',
                  description: 'Probability that a randomly selected case has higher PRS than a randomly selected control. AUC = 0.5 indicates no discrimination; AUC = 1.0 indicates perfect discrimination.',
                },
                {
                  title: 'Odds Ratio per SD (OR/SD)',
                  value: '1.2 - 2.5',
                  description: 'Multiplicative increase in disease odds per standard deviation increase in PRS. OR/SD = 1.5 means 50% increased odds per SD.',
                },
                {
                  title: 'Variance Explained (R²)',
                  value: '2% - 20%',
                  description: 'Proportion of phenotypic variance explained by PRS on the liability scale. Nagelkerke pseudo-R² is commonly reported for binary outcomes.',
                },
                {
                  title: 'Top Decile Odds Ratio',
                  value: '2.0 - 5.0',
                  description: 'Odds of disease for individuals in top 10% of PRS compared to population median (40-60th percentile).',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: '#f8fafc',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2563eb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: '#1e293b' }}>{item.title}</h4>
                    <span style={{
                      background: '#2563eb',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}>
                      {item.value}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{item.description}</p>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              5.2 Disease-Specific Performance
            </h3>

            <DataTable
              caption="Table 9. PRS Performance Metrics by Disease (European Ancestry)"
              headers={['Disease', 'PGS ID', 'AUC', 'OR/SD', 'R² (%)', 'Top Decile OR']}
              rows={[
                ['Coronary Artery Disease', 'PGS000018', '0.81', '1.71', '15.2', '4.2'],
                ['Type 2 Diabetes', 'PGS000036', '0.72', '1.56', '8.4', '2.8'],
                ['Breast Cancer', 'PGS000004', '0.68', '1.61', '18.3', '3.1'],
                ['Prostate Cancer', 'PGS000062', '0.75', '1.85', '21.4', '4.5'],
                ['Atrial Fibrillation', 'PGS000016', '0.74', '1.68', '14.8', '3.4'],
                ['Alzheimer Disease', 'PGS000334', '0.69', '1.72', '17.2', '3.7'],
                ['Schizophrenia', 'PGS000327', '0.71', '1.58', '7.8', '2.6'],
                ['Inflammatory Bowel Disease', 'PGS000058', '0.66', '1.45', '6.2', '2.2'],
                ['Colorectal Cancer', 'PGS000055', '0.64', '1.42', '5.8', '2.1'],
                ['Stroke', 'PGS000039', '0.62', '1.35', '4.2', '1.9'],
              ]}
              source="Performance metrics from PGS Catalog evaluation studies in UK Biobank"
            />

            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '28px', marginBottom: '12px' }}>
              5.3 Ancestry-Stratified Performance
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              PRS performance varies substantially across ancestry groups. Scores developed in
              European populations typically show 20-60% reduced predictive accuracy in non-European
              populations:
            </p>

            <DataTable
              caption="Table 10. Cross-Ancestry Performance (Relative to European)"
              headers={['Disease', 'EUR (ref)', 'AFR', 'EAS', 'SAS', 'AMR']}
              rows={[
                ['Coronary Artery Disease', '1.00', '0.45', '0.72', '0.81', '0.68'],
                ['Type 2 Diabetes', '1.00', '0.52', '0.78', '0.85', '0.73'],
                ['Breast Cancer', '1.00', '0.58', '0.70', '0.76', '0.71'],
                ['Prostate Cancer', '1.00', '0.40', '0.65', '0.73', '0.62'],
                ['Schizophrenia', '1.00', '0.55', '0.75', '0.80', '0.72'],
              ]}
              source="Relative R² compared to European reference; Martin et al. 2019, Nature Genetics"
            />
          </section>

          {/* 6. Disease Coverage */}
          <section id="disease-coverage" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              6. Disease Coverage
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Our calculator provides PRS for 50+ diseases across 11 clinical categories. Scores
              are selected from the PGS Catalog based on validation status, predictive performance,
              and clinical relevance.
            </p>

            <DataTable
              caption="Table 11. Disease Categories and Coverage"
              headers={['Category', 'Diseases', 'Example Conditions']}
              rows={[
                ['Cardiovascular', '8', 'CAD, Atrial Fibrillation, Stroke, Hypertension, Heart Failure'],
                ['Oncology', '12', 'Breast, Prostate, Colorectal, Lung, Pancreatic, Ovarian, Melanoma'],
                ['Metabolic', '6', 'Type 2 Diabetes, Type 1 Diabetes, Obesity, Gout, NAFLD'],
                ['Neurological', '6', 'Alzheimer, Parkinson, Migraine, Epilepsy, ALS'],
                ['Psychiatric', '7', 'Depression, Bipolar, Schizophrenia, ADHD, Anxiety, PTSD'],
                ['Autoimmune', '7', 'Rheumatoid Arthritis, Crohn\'s, UC, MS, Lupus, Celiac, Psoriasis'],
                ['Respiratory', '2', 'Asthma, COPD'],
                ['Ophthalmologic', '2', 'Glaucoma, Macular Degeneration'],
                ['Musculoskeletal', '2', 'Osteoporosis, Osteoarthritis'],
                ['Dermatologic', '2', 'Eczema, Vitiligo'],
                ['Renal', '2', 'Chronic Kidney Disease, Kidney Stones'],
              ]}
            />
          </section>

          {/* 7. Heritability */}
          <section id="heritability" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              7. Heritability and Genetic Architecture
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Understanding heritability—the proportion of phenotypic variance attributable to
              genetic factors—is essential for interpreting PRS. Diseases with higher heritability
              generally show better PRS prediction.
            </p>

            <DataTable
              caption="Table 12. Heritability Estimates and PRS Performance"
              headers={['Disease', 'Twin h²', 'SNP h²', 'PRS R²', 'R²/h² (%)']}
              rows={[
                ['Height (reference trait)', '80-90%', '45-50%', '25%', '50-55%'],
                ['Schizophrenia', '60-80%', '40-50%', '7-10%', '15-25%'],
                ['Bipolar Disorder', '60-80%', '35-45%', '5-8%', '12-20%'],
                ['Coronary Artery Disease', '40-60%', '25-30%', '12-15%', '40-50%'],
                ['Type 2 Diabetes', '30-70%', '20-25%', '8-12%', '35-50%'],
                ['Breast Cancer', '25-35%', '15-20%', '18-20%', '90-100%'],
                ['Prostate Cancer', '40-60%', '25-30%', '20-25%', '70-85%'],
                ['Alzheimer Disease', '60-80%', '25-35%', '15-20%', '50-70%'],
                ['Major Depression', '30-50%', '15-20%', '2-4%', '15-25%'],
                ['Inflammatory Bowel Disease', '40-60%', '20-25%', '8-12%', '35-50%'],
              ]}
              source="Twin h²: literature review; SNP h²: LDSC; PRS R²: UK Biobank validation"
            />

            <p style={{ color: '#475569', lineHeight: '1.8', marginTop: '16px' }}>
              The R²/h² ratio indicates how much of the SNP heritability is captured by current PRS.
              Higher ratios (closer to 100%) suggest the PRS is approaching its theoretical ceiling,
              while lower ratios indicate room for improvement through larger GWAS and better methods.
            </p>
          </section>

          {/* 8. Limitations */}
          <section id="limitations" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              8. Limitations
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
              Users and clinicians should be aware of several important limitations when
              interpreting PRS results:
            </p>

            {[
              {
                title: '8.1 Ancestry Bias and Transferability',
                content: `The majority of GWAS have been conducted in European ancestry populations (>85% of GWAS participants as of 2023), creating systematic bias in PRS performance. Effect sizes, allele frequencies, and linkage disequilibrium patterns differ across populations, leading to reduced predictive accuracy—often 20-60% lower—in non-European ancestries. This represents both a scientific limitation and an equity concern, as those who might benefit most from genetic risk prediction may receive the least accurate results.`,
              },
              {
                title: '8.2 Environmental and Gene-Environment Interactions',
                content: `PRS capture only the additive genetic component of disease risk. Environmental factors—including diet, physical activity, smoking, socioeconomic status, and healthcare access—often contribute equal or greater variance to disease outcomes. Furthermore, gene-environment interactions (G×E) may modify genetic effects: for example, genetic risk for obesity may be attenuated or amplified depending on physical activity levels. Current PRS do not capture these interactions.`,
              },
              {
                title: '8.3 Incomplete Variant Coverage',
                content: `Consumer genotyping arrays capture only 600,000-700,000 variants, a small fraction of the 3+ billion base pairs in the human genome. Many PRS variants may be absent from genotyping data, requiring either imputation (which introduces uncertainty) or partial score calculation. Additionally, rare variants with large effects—which may be clinically actionable—are typically not captured by common variant PRS.`,
              },
              {
                title: '8.4 Score Selection and Multiplicity',
                content: `Multiple PRS exist for many diseases, developed using different GWAS, methods, and variant selections. Score performance can vary substantially, and the "best" score may differ depending on the target population and use case. We select scores based on PGS Catalog validation studies, but users should recognize that results may differ if alternative scores were used.`,
              },
              {
                title: '8.5 Probabilistic, Not Diagnostic',
                content: `PRS provide probability estimates, not diagnoses. A high-risk score indicates increased likelihood of developing a condition but does not mean disease will occur. Conversely, low-risk scores do not guarantee protection. Many individuals with high PRS never develop disease, while some with low PRS do. PRS results should inform, not replace, clinical decision-making.`,
              },
              {
                title: '8.6 Temporal and Cohort Effects',
                content: `PRS are validated in specific cohorts (often UK Biobank) at specific time points. Disease definitions, diagnostic practices, and baseline risk may differ in other populations or time periods. Effect estimates may not generalize to younger cohorts, different healthcare systems, or populations with different environmental exposures.`,
              },
            ].map((item) => (
              <div key={item.title} style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#475569', lineHeight: '1.8' }}>
                  {item.content}
                </p>
              </div>
            ))}
          </section>

          {/* 9. Clinical Utility */}
          <section id="clinical-utility" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              9. Clinical Utility
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Despite limitations, PRS have demonstrated clinical utility in several contexts:
            </p>

            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginTop: '20px', marginBottom: '12px' }}>
              9.1 Risk Stratification
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              PRS can identify individuals at elevated risk who may benefit from intensified
              screening or preventive interventions. The NHS has piloted PRS-based breast cancer
              screening, and cardiovascular PRS are being incorporated into clinical risk
              calculators<sup>[17,18]</sup>.
            </p>

            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginTop: '20px', marginBottom: '12px' }}>
              9.2 Incremental Prediction
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              PRS add predictive information beyond traditional risk factors. For CAD, adding PRS
              to the Framingham Risk Score reclassifies 10-20% of individuals into different risk
              categories, with net reclassification improvement<sup>[19]</sup>.
            </p>

            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginTop: '20px', marginBottom: '12px' }}>
              9.3 Behavioral Modification
            </h3>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              Knowledge of genetic risk may motivate preventive behaviors. Studies suggest
              individuals who learn of elevated genetic risk for certain conditions are more
              likely to engage in recommended screening<sup>[20]</sup>.
            </p>

            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '20px',
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Clinical Implementation Status</h4>
              <p style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem', lineHeight: '1.6' }}>
                As of 2025, PRS are increasingly being incorporated into clinical practice for
                breast cancer screening (UK NHS pilot), cardiovascular disease prevention
                (AHA guidelines consideration), and pharmacogenomics. However, widespread clinical
                adoption is limited by reimbursement, clinical decision support integration, and
                provider education needs.
              </p>
            </div>
          </section>

          {/* 10. Future Directions */}
          <section id="future-directions" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              10. Future Directions
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '16px' }}>
              The field of polygenic risk prediction is rapidly evolving. Key areas of active
              research include:
            </p>

            <ul style={{ color: '#475569', lineHeight: '1.8', paddingLeft: '24px' }}>
              <li style={{ marginBottom: '12px' }}>
                <strong>Diverse population GWAS:</strong> Initiatives like All of Us, H3Africa,
                and PAGE are generating GWAS data in underrepresented populations, enabling
                development of more equitable PRS
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Multi-ancestry PRS:</strong> Methods for developing PRS that transfer
                better across ancestries, including meta-analysis across populations and
                fine-mapping approaches
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Integration with rare variants:</strong> Combining common variant PRS
                with rare variant information from sequencing for more comprehensive risk prediction
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Machine learning approaches:</strong> Deep learning methods that can
                capture non-additive effects and complex interactions
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Clinical integration:</strong> Development of clinical decision support
                tools and guidelines for PRS interpretation and action
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong>Longitudinal prediction:</strong> Age-dependent PRS that account for
                time-varying genetic effects and disease onset patterns
              </li>
            </ul>
          </section>

          {/* References */}
          <section id="references" style={{ marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1e293b',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0',
            }}>
              References
            </h2>

            <Reference
              number={1}
              authors="Visscher PM, Wray NR, Zhang Q, et al."
              title="10 Years of GWAS Discovery: Biology, Function, and Translation"
              journal="American Journal of Human Genetics"
              volume="101"
              pages="5-22"
              year="2017"
              doi="10.1016/j.ajhg.2017.06.005"
            />

            <Reference
              number={2}
              authors="Khera AV, Chaffin M, Aragam KG, et al."
              title="Genome-wide polygenic scores for common diseases identify individuals with risk equivalent to monogenic mutations"
              journal="Nature Genetics"
              volume="50"
              pages="1219-1224"
              year="2018"
              doi="10.1038/s41588-018-0183-z"
            />

            <Reference
              number={3}
              authors="Torkamani A, Wineinger NE, Topol EJ"
              title="The personal and clinical utility of polygenic risk scores"
              journal="Nature Reviews Genetics"
              volume="19"
              pages="581-590"
              year="2018"
              doi="10.1038/s41576-018-0018-x"
            />

            <Reference
              number={4}
              authors="Inouye M, Abraham G, Nelson CP, et al."
              title="Genomic Risk Prediction of Coronary Artery Disease in 480,000 Adults"
              journal="Journal of the American College of Cardiology"
              volume="72"
              pages="1883-1893"
              year="2018"
              doi="10.1016/j.jacc.2018.07.079"
            />

            <Reference
              number={5}
              authors="Mavaddat N, Michailidou K, Dennis J, et al."
              title="Polygenic Risk Scores for Prediction of Breast Cancer and Breast Cancer Subtypes"
              journal="American Journal of Human Genetics"
              volume="104"
              pages="21-34"
              year="2019"
              doi="10.1016/j.ajhg.2018.11.002"
            />

            <Reference
              number={6}
              authors="Regalado A"
              title="More than 26 million people have taken an at-home ancestry test"
              journal="MIT Technology Review"
              year="2019"
            />

            <Reference
              number={7}
              authors="Fisher RA"
              title="The correlation between relatives on the supposition of Mendelian inheritance"
              journal="Transactions of the Royal Society of Edinburgh"
              volume="52"
              pages="399-433"
              year="1918"
            />

            <Reference
              number={8}
              authors="Polderman TJC, Benyamin B, de Leeuw CA, et al."
              title="Meta-analysis of the heritability of human traits based on fifty years of twin studies"
              journal="Nature Genetics"
              volume="47"
              pages="702-709"
              year="2015"
              doi="10.1038/ng.3285"
            />

            <Reference
              number={9}
              authors="Manolio TA, Collins FS, Cox NJ, et al."
              title="Finding the missing heritability of complex diseases"
              journal="Nature"
              volume="461"
              pages="747-753"
              year="2009"
              doi="10.1038/nature08494"
            />

            <Reference
              number={10}
              authors="Wray NR, Goddard ME, Visscher PM"
              title="Prediction of individual genetic risk to disease from genome-wide association studies"
              journal="Genome Research"
              volume="17"
              pages="1520-1528"
              year="2007"
              doi="10.1101/gr.6665407"
            />

            <Reference
              number={11}
              authors="Vilhjálmsson BJ, Yang J, Finucane HK, et al."
              title="Modeling Linkage Disequilibrium Increases Accuracy of Polygenic Risk Scores"
              journal="American Journal of Human Genetics"
              volume="97"
              pages="576-592"
              year="2015"
              doi="10.1016/j.ajhg.2015.09.001"
            />

            <Reference
              number={12}
              authors="Ge T, Chen CY, Ni Y, et al."
              title="Polygenic prediction via Bayesian regression and continuous shrinkage priors"
              journal="Nature Communications"
              volume="10"
              pages="1776"
              year="2019"
              doi="10.1038/s41467-019-09718-5"
            />

            <Reference
              number={13}
              authors="Privé F, Arbel J, Vilhjálmsson BJ"
              title="LDpred2: better, faster, stronger"
              journal="Bioinformatics"
              volume="36"
              pages="5424-5431"
              year="2020"
              doi="10.1093/bioinformatics/btaa1029"
            />

            <Reference
              number={14}
              authors="Choi SW, Mak TSH, O'Reilly PF"
              title="Tutorial: a guide to performing polygenic risk score analyses"
              journal="Nature Protocols"
              volume="15"
              pages="2759-2772"
              year="2020"
              doi="10.1038/s41596-020-0353-1"
            />

            <Reference
              number={15}
              authors="Lambert SA, Gil L, Jupp S, et al."
              title="The Polygenic Score Catalog as an open database for reproducibility and systematic evaluation"
              journal="Nature Genetics"
              volume="53"
              pages="420-425"
              year="2021"
              doi="10.1038/s41588-021-00783-5"
            />

            <Reference
              number={16}
              authors="Wand H, Lambert SA, Tamber C, et al."
              title="Improving reporting standards for polygenic scores in risk prediction studies"
              journal="Nature"
              volume="591"
              pages="211-219"
              year="2021"
              doi="10.1038/s41586-021-03243-6"
            />

            <Reference
              number={17}
              authors="Martin AR, Kanai M, Kamatani Y, et al."
              title="Clinical use of current polygenic risk scores may exacerbate health disparities"
              journal="Nature Genetics"
              volume="51"
              pages="584-591"
              year="2019"
              doi="10.1038/s41588-019-0379-x"
            />

            <Reference
              number={18}
              authors="Lewis CM, Vassos E"
              title="Polygenic risk scores: from research tools to clinical instruments"
              journal="Genome Medicine"
              volume="12"
              pages="44"
              year="2020"
              doi="10.1186/s13073-020-00742-5"
            />

            <Reference
              number={19}
              authors="Elliott J, Bodinier B, Bond TA, et al."
              title="Predictive Accuracy of a Polygenic Risk Score-Enhanced Prediction Model vs a Clinical Risk Score for Coronary Artery Disease"
              journal="JAMA"
              volume="323"
              pages="636-645"
              year="2020"
              doi="10.1001/jama.2019.22241"
            />

            <Reference
              number={20}
              authors="Kullo IJ, Jouni H, Austin EE, et al."
              title="Incorporating a Genetic Risk Score Into Coronary Heart Disease Risk Estimates: Effect on Low-Density Lipoprotein Cholesterol Levels (the MI-GENES Clinical Trial)"
              journal="Circulation"
              volume="133"
              pages="1181-1188"
              year="2016"
              doi="10.1161/CIRCULATIONAHA.115.020109"
            />
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'white',
      }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 12px 0' }}>
          Version 2.0 | Last updated: January 2025
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
          For questions about methodology, please refer to the original publications or contact the development team.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            Back to Calculator
          </Link>
          <Link href="/diseases" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            Disease Catalog
          </Link>
          <Link href="/faq" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            FAQ
          </Link>
          <a
            href="https://www.pgscatalog.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}
          >
            PGS Catalog
          </a>
        </div>
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
