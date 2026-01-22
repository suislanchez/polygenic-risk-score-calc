'use client';

import { useState } from 'react';
import Link from 'next/link';

// FAQ Item component with accordion behavior
function FAQItem({ question, answer, isOpen, onToggle, category }) {
  const categoryColors = {
    general: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
    results: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
    accuracy: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
    privacy: { bg: '#f3e8ff', border: '#d8b4fe', text: '#7c3aed' },
    medical: { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626' },
  };

  const colors = categoryColors[category] || categoryColors.general;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      marginBottom: '12px',
      overflow: 'hidden',
      border: isOpen ? `2px solid ${colors.border}` : '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '20px 24px',
          background: isOpen ? colors.bg : 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: '1.05rem',
          fontWeight: '600',
          color: isOpen ? colors.text : '#1e293b',
          lineHeight: '1.4',
        }}>
          {question}
        </span>
        <span style={{
          flexShrink: 0,
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: isOpen ? colors.text : '#f1f5f9',
          color: isOpen ? 'white' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: '300',
          transition: 'all 0.2s ease',
        }}>
          {isOpen ? '-' : '+'}
        </span>
      </button>
      {isOpen && (
        <div style={{
          padding: '0 24px 24px',
          color: '#475569',
          lineHeight: '1.8',
        }}>
          {answer}
        </div>
      )}
    </div>
  );
}

// Category section component
function CategorySection({ title, description, faqs, openItems, onToggle }) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{
        fontSize: '1.5rem',
        color: '#1e293b',
        marginBottom: '8px',
      }}>
        {title}
      </h2>
      <p style={{
        color: '#64748b',
        marginBottom: '24px',
        fontSize: '0.95rem',
      }}>
        {description}
      </p>
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          category={faq.category}
          isOpen={openItems.includes(`${title}-${index}`)}
          onToggle={() => onToggle(`${title}-${index}`)}
        />
      ))}
    </section>
  );
}

// Result interpretation guide
function InterpretationGuide() {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '48px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        color: '#1e293b',
        marginBottom: '24px',
      }}>
        Result Interpretation Guide
      </h2>

      <p style={{
        color: '#475569',
        lineHeight: '1.8',
        marginBottom: '24px',
      }}>
        Your polygenic risk score represents your genetic predisposition compared to others
        in a reference population. Here is how to interpret your percentile:
      </p>

      <div style={{
        display: 'grid',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {[
          {
            range: '0-20th percentile',
            label: 'Very Low Risk',
            color: '#22c55e',
            bg: '#dcfce7',
            description: 'Your genetic risk is lower than 80% of the reference population. This suggests below-average genetic predisposition, but does not eliminate risk entirely. Lifestyle factors and regular health screenings remain important.',
          },
          {
            range: '20-40th percentile',
            label: 'Low Risk',
            color: '#86efac',
            bg: '#d1fae5',
            description: 'Your genetic risk is lower than 60-80% of the reference population. You have somewhat reduced genetic risk, but standard preventive care recommendations still apply.',
          },
          {
            range: '40-60th percentile',
            label: 'Average Risk',
            color: '#d97706',
            bg: '#fef3c7',
            description: 'Your genetic risk is similar to the average person in the reference population. Follow standard health recommendations for your age and demographic.',
          },
          {
            range: '60-80th percentile',
            label: 'Elevated Risk',
            color: '#fb923c',
            bg: '#ffedd5',
            description: 'Your genetic risk is higher than 60-80% of the reference population. Consider discussing with your healthcare provider whether enhanced screening or lifestyle modifications might be beneficial.',
          },
          {
            range: '80-100th percentile',
            label: 'High Risk',
            color: '#ef4444',
            bg: '#fee2e2',
            description: 'Your genetic risk is higher than 80% of the reference population. This may warrant discussion with a healthcare provider about personalized prevention strategies or enhanced screening protocols.',
          },
        ].map((tier) => (
          <div
            key={tier.label}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '20px',
              background: tier.bg,
              borderRadius: '12px',
              border: `1px solid ${tier.color}40`,
            }}
          >
            <div style={{
              flexShrink: 0,
              width: '100px',
            }}>
              <div style={{
                fontWeight: '700',
                color: tier.color,
                marginBottom: '4px',
              }}>
                {tier.label}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#64748b',
              }}>
                {tier.range}
              </div>
            </div>
            <div style={{
              color: '#475569',
              fontSize: '0.95rem',
              lineHeight: '1.6',
            }}>
              {tier.description}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
          Important Context
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b' }}>
          <li>Risk categories are based on population distributions and represent relative, not absolute, risk</li>
          <li>A &quot;high risk&quot; score does not mean you will develop the condition</li>
          <li>A &quot;low risk&quot; score does not guarantee you will not develop the condition</li>
          <li>Genetic risk is just one factor; lifestyle, environment, and other factors play crucial roles</li>
        </ul>
      </div>
    </div>
  );
}

const faqCategories = [
  {
    title: 'General Questions',
    description: 'Basic information about polygenic risk scores and how they work',
    faqs: [
      {
        category: 'general',
        question: 'What is a Polygenic Risk Score (PRS)?',
        answer: (
          <>
            <p>
              A Polygenic Risk Score (PRS) is a numerical estimate of your genetic predisposition
              to a particular trait or disease. Unlike tests for single-gene mutations (like
              BRCA1/2 for breast cancer), PRS combine the effects of many genetic variants
              across your genome, each contributing a small amount to overall risk.
            </p>
            <p style={{ marginTop: '12px' }}>
              Think of it like height: there is no single &quot;height gene,&quot; but rather thousands
              of genetic variants that each contribute a tiny amount. Similarly, most common
              diseases are influenced by many genetic variants working together, plus
              environmental factors.
            </p>
            <p style={{ marginTop: '12px' }}>
              PRS are calculated by multiplying the number of risk alleles you carry at each
              genetic position by the effect size of that variant, then summing across all
              variants in the score.
            </p>
          </>
        ),
      },
      {
        category: 'general',
        question: 'How is my PRS calculated?',
        answer: (
          <>
            <p>
              Your PRS is calculated using this formula:
            </p>
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              margin: '12px 0',
              fontFamily: 'Georgia, serif',
              textAlign: 'center',
            }}>
              PRS = Sum of (dosage x effect_weight) for all variants
            </div>
            <p>Where:</p>
            <ul>
              <li><strong>Dosage (0, 1, or 2):</strong> The number of effect alleles you carry at each position</li>
              <li><strong>Effect weight:</strong> How much each allele contributes to risk, based on scientific studies</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              The raw score is then compared to a reference population to generate your percentile,
              which tells you where you fall relative to others of similar ancestry.
            </p>
          </>
        ),
      },
      {
        category: 'general',
        question: 'What genetic testing services are compatible?',
        answer: (
          <>
            <p>
              Our calculator supports raw data files from several popular consumer genetic
              testing services:
            </p>
            <ul>
              <li><strong>23andMe:</strong> Download your raw data from Settings and Privacy and select &quot;Download Raw Data&quot;</li>
              <li><strong>AncestryDNA:</strong> Go to Settings and select &quot;Download DNA Data&quot;</li>
              <li><strong>VCF files:</strong> Standard variant call format files from clinical or research sequencing</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Most consumer DNA tests genotype around 600,000-700,000 genetic variants, which
              is sufficient to calculate meaningful PRS for most diseases in our catalog.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Understanding Your Results',
    description: 'How to interpret what your risk scores mean',
    faqs: [
      {
        category: 'results',
        question: 'What does my percentile mean?',
        answer: (
          <>
            <p>
              Your percentile indicates where your genetic risk falls compared to a reference
              population of similar ancestry. For example, if you are in the 75th percentile
              for coronary artery disease risk, it means your genetic risk is higher than
              approximately 75% of the reference population.
            </p>
            <p style={{ marginTop: '12px' }}>
              <strong>Important clarifications:</strong>
            </p>
            <ul>
              <li>Percentiles represent <em>relative</em> genetic risk, not absolute probability</li>
              <li>Being in the 90th percentile does NOT mean you have a 90% chance of developing the disease</li>
              <li>The actual disease risk depends on baseline prevalence, which varies by condition</li>
              <li>Environmental and lifestyle factors significantly modify genetic risk</li>
            </ul>
          </>
        ),
      },
      {
        category: 'results',
        question: 'Should I be worried about high-risk scores?',
        answer: (
          <>
            <p>
              A high genetic risk score warrants awareness but not panic. Here is why:
            </p>
            <ul>
              <li>
                <strong>Genetic risk is not destiny:</strong> Many people with high genetic
                risk never develop the condition, while some with low genetic risk do.
              </li>
              <li>
                <strong>Modifiable factors matter:</strong> For many diseases, lifestyle
                modifications can significantly reduce risk regardless of genetics.
              </li>
              <li>
                <strong>Knowledge is power:</strong> Understanding your genetic predispositions
                allows you to work with healthcare providers on targeted prevention strategies.
              </li>
              <li>
                <strong>Screening opportunities:</strong> High genetic risk may justify earlier
                or more frequent screening for some conditions.
              </li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              If you have concerns about specific high-risk results, we recommend discussing
              them with a healthcare provider or genetic counselor who can provide personalized
              guidance based on your complete medical history.
            </p>
          </>
        ),
      },
      {
        category: 'results',
        question: 'Why might my score differ from other calculators or services?',
        answer: (
          <>
            <p>
              Differences in PRS results between services can occur for several reasons:
            </p>
            <ul>
              <li>
                <strong>Different scoring files:</strong> Various PRS exist for each disease,
                developed by different research groups with different variants and weights.
              </li>
              <li>
                <strong>Reference populations:</strong> The population used for normalization
                affects percentile calculations.
              </li>
              <li>
                <strong>Variant coverage:</strong> Different DNA tests capture different subsets
                of genetic variants, affecting which can be matched to scoring files.
              </li>
              <li>
                <strong>Score version:</strong> PRS are continuously refined as new research
                emerges; newer versions may differ from older ones.
              </li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              We use validated scores from the PGS Catalog to ensure scientific rigor and
              reproducibility. For any specific score, you can view the original publication
              and methodology.
            </p>
          </>
        ),
      },
      {
        category: 'results',
        question: 'What does "variants matched" mean?',
        answer: (
          <>
            <p>
              The &quot;variants matched&quot; metric shows how many genetic variants from the scoring
              file were found in your DNA data file. This is important for several reasons:
            </p>
            <ul>
              <li>
                <strong>Higher matching is better:</strong> More matched variants generally
                means a more accurate score calculation.
              </li>
              <li>
                <strong>Consumer tests have limits:</strong> Typical consumer DNA tests only
                capture about 600,000-700,000 variants, so not all PRS variants will be present.
              </li>
              <li>
                <strong>Match rates vary:</strong> Different diseases have different match
                rates depending on how well the PRS variants overlap with consumer test panels.
              </li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Generally, scores remain informative even with partial matching, as the most
              important variants are typically well-represented on consumer arrays. Match
              rates above 50% are generally considered adequate for risk stratification.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Accuracy & Limitations',
    description: 'Important context about what PRS can and cannot tell you',
    faqs: [
      {
        category: 'accuracy',
        question: 'How accurate are these results?',
        answer: (
          <>
            <p>
              PRS accuracy depends on several factors:
            </p>
            <ul>
              <li>
                <strong>Condition-specific:</strong> PRS perform better for highly heritable
                conditions (like type 1 diabetes, ~80% heritability) than for those with lower
                heritability (like stroke, ~30-40%).
              </li>
              <li>
                <strong>Ancestry matters:</strong> Most PRS were developed in European
                populations and may be less predictive for other ancestries. We provide
                ancestry-specific normalization, but underlying variant effects may still differ.
              </li>
              <li>
                <strong>Population-level vs. individual:</strong> PRS are excellent at
                stratifying populations into risk groups but are less precise for individual
                prediction.
              </li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Typical PRS can identify individuals at 2-5x increased risk compared to the
              general population. This level of risk stratification is clinically meaningful
              for population health but should be interpreted alongside other clinical factors.
            </p>
          </>
        ),
      },
      {
        category: 'accuracy',
        question: 'Why are PRS less accurate for non-European ancestries?',
        answer: (
          <>
            <p>
              This is a significant limitation of current PRS, stemming from historical research
              biases:
            </p>
            <ul>
              <li>
                <strong>Discovery bias:</strong> Over 80% of GWAS participants have been of
                European ancestry, so discovered variants and effect sizes are optimized for
                this population.
              </li>
              <li>
                <strong>Linkage disequilibrium:</strong> The correlation patterns between genetic
                variants differ across populations, affecting how well proxy variants capture
                true causal effects.
              </li>
              <li>
                <strong>Allele frequencies:</strong> Some risk variants are more or less common
                in different populations, affecting their contribution to the score.
              </li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              The scientific community is actively working to develop more transferable PRS
              and include more diverse populations in genetic studies. Until then, individuals
              of non-European ancestry should interpret results with additional caution.
            </p>
          </>
        ),
      },
      {
        category: 'accuracy',
        question: 'What factors do PRS NOT capture?',
        answer: (
          <>
            <p>
              PRS measure genetic predisposition only. They do not account for:
            </p>
            <ul>
              <li><strong>Environmental factors:</strong> Diet, exercise, pollution exposure, etc.</li>
              <li><strong>Lifestyle choices:</strong> Smoking, alcohol use, sleep habits</li>
              <li><strong>Medical history:</strong> Previous conditions, medications, surgeries</li>
              <li><strong>Family medical history:</strong> May capture genetic risk not in PRS</li>
              <li><strong>Gene-environment interactions:</strong> How genes and environment interact</li>
              <li><strong>Rare variants:</strong> Most PRS focus on common variants; rare mutations with large effects are often not included</li>
              <li><strong>Epigenetics:</strong> Modifications that affect gene expression without changing DNA sequence</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              For a complete risk assessment, genetic information should be combined with
              clinical data, family history, and lifestyle factors in consultation with
              healthcare providers.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Comparison with Other Services',
    description: 'How this tool differs from commercial offerings',
    faqs: [
      {
        category: 'general',
        question: 'How is this different from 23andMe health reports?',
        answer: (
          <>
            <p>
              There are several key differences between our calculator and 23andMe health reports:
            </p>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '12px',
              fontSize: '0.9rem',
            }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #e2e8f0' }}>Feature</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #e2e8f0' }}>This Calculator</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid #e2e8f0' }}>23andMe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Diseases covered</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>50+ conditions</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Limited selection</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Score source</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>PGS Catalog (peer-reviewed)</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Proprietary algorithms</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Transparency</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Full methodology disclosed</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Limited details</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>FDA approval</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Research/educational use</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Some reports FDA-authorized</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Data privacy</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Processed locally, never stored</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>Stored on company servers</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px' }}>Cost</td>
                  <td style={{ padding: '8px' }}>Free</td>
                  <td style={{ padding: '8px' }}>Included with kit or subscription</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: '16px' }}>
              23andMe reports are designed for consumer use and have undergone regulatory review
              for specific claims. Our tool provides more comprehensive coverage using validated
              research scores but is intended for educational purposes only.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Privacy & Data',
    description: 'How we handle your genetic information',
    faqs: [
      {
        category: 'privacy',
        question: 'Is my genetic data stored or shared?',
        answer: (
          <>
            <p>
              <strong>No, your genetic data is never stored or shared.</strong>
            </p>
            <p style={{ marginTop: '12px' }}>
              Our privacy-first design ensures:
            </p>
            <ul>
              <li><strong>Local processing:</strong> All calculations happen in your web browser</li>
              <li><strong>No server storage:</strong> Your genetic data never leaves your device</li>
              <li><strong>No accounts:</strong> We do not collect personal information</li>
              <li><strong>No tracking:</strong> We do not track individual users or results</li>
              <li><strong>Automatic cleanup:</strong> Any temporary data is deleted when you close the page</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              You can verify these claims by examining our open-source code or using browser
              developer tools to monitor network traffic during analysis.
            </p>
          </>
        ),
      },
      {
        category: 'privacy',
        question: 'Can I download or save my results?',
        answer: (
          <>
            <p>
              Yes, you can save your results by:
            </p>
            <ul>
              <li>Taking a screenshot of the results page</li>
              <li>Printing the page to PDF using your browser&apos;s print function</li>
              <li>Manually recording your scores</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Note that since we do not store any data, if you clear your browser or close
              the page, you would need to re-upload your genetic file to calculate scores
              again. This is by design to protect your privacy.
            </p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Medical & Clinical Questions',
    description: 'Important information about clinical use of results',
    faqs: [
      {
        category: 'medical',
        question: 'Can I share my results with my doctor?',
        answer: (
          <>
            <p>
              Yes, sharing your PRS results with your healthcare provider can be valuable,
              especially if you have elevated risk scores. Here are some tips:
            </p>
            <ul>
              <li>
                <strong>Print or save your results:</strong> Create a PDF or screenshot to
                bring to your appointment.
              </li>
              <li>
                <strong>Provide context:</strong> Explain that these are polygenic risk scores
                from validated PGS Catalog scores.
              </li>
              <li>
                <strong>Discuss in context:</strong> PRS should be interpreted alongside your
                personal medical history, family history, and lifestyle factors.
              </li>
              <li>
                <strong>Ask about implications:</strong> Your doctor can help determine if
                any results warrant changes to screening schedules or preventive measures.
              </li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Not all healthcare providers are familiar with PRS interpretation. If you want
              specialized guidance, consider consulting a genetic counselor.
            </p>
          </>
        ),
      },
      {
        category: 'medical',
        question: 'Should I make medical decisions based on these results?',
        answer: (
          <>
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <strong style={{ color: '#dc2626' }}>Important:</strong>
              <span style={{ color: '#dc2626' }}> Do NOT make medical decisions based solely on these results.</span>
            </div>
            <p>
              This tool is for educational and research purposes only. You should NOT use
              these results to:
            </p>
            <ul>
              <li>Start, stop, or change any medication</li>
              <li>Skip recommended screenings</li>
              <li>Self-diagnose any condition</li>
              <li>Make major lifestyle changes without medical guidance</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Always consult with qualified healthcare professionals for personalized medical
              advice. PRS provide one piece of information among many that should be considered
              in clinical decision-making.
            </p>
          </>
        ),
      },
      {
        category: 'medical',
        question: 'What should I do if I have very high risk scores for multiple conditions?',
        answer: (
          <>
            <p>
              If you have elevated genetic risk for multiple conditions:
            </p>
            <ol>
              <li>
                <strong>Do not panic:</strong> High genetic risk does not guarantee disease
                development, especially with appropriate prevention.
              </li>
              <li>
                <strong>Prioritize by actionability:</strong> Focus on conditions where
                prevention or early detection is effective (e.g., cardiovascular disease,
                certain cancers).
              </li>
              <li>
                <strong>Consult healthcare providers:</strong> Discuss your results with
                your primary care physician or a genetic counselor.
              </li>
              <li>
                <strong>Consider comprehensive screening:</strong> Your doctor may recommend
                earlier or more frequent screening for certain conditions.
              </li>
              <li>
                <strong>Focus on modifiable risk factors:</strong> Many conditions share
                common preventive measures (exercise, diet, not smoking).
              </li>
            </ol>
            <p style={{ marginTop: '12px' }}>
              Remember that optimizing lifestyle factors can significantly reduce disease
              risk regardless of genetic predisposition.
            </p>
          </>
        ),
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState(['General Questions-0']);

  const toggleItem = (itemId) => {
    setOpenItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const expandAll = () => {
    const allIds = faqCategories.flatMap((cat, catIndex) =>
      cat.faqs.map((_, faqIndex) => `${cat.title}-${faqIndex}`)
    );
    setOpenItems(allIds);
  };

  const collapseAll = () => {
    setOpenItems([]);
  };

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
            Frequently Asked Questions
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            margin: 0,
            maxWidth: '700px',
          }}>
            Everything you need to know about polygenic risk scores and how to interpret your results
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 20px',
      }}>
        {/* Quick Navigation */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '1rem' }}>
                Quick Navigation
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Jump to a section or expand/collapse all questions
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={expandAll}
                style={{
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#475569',
                  fontSize: '0.9rem',
                }}
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                style={{
                  padding: '8px 16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#475569',
                  fontSize: '0.9rem',
                }}
              >
                Collapse All
              </button>
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '16px',
          }}>
            {faqCategories.map((cat) => (
              <a
                key={cat.title}
                href={`#${cat.title.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  padding: '6px 14px',
                  background: '#eff6ff',
                  borderRadius: '6px',
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                }}
              >
                {cat.title}
              </a>
            ))}
          </div>
        </div>

        {/* Result Interpretation Guide */}
        <InterpretationGuide />

        {/* FAQ Categories */}
        {faqCategories.map((category) => (
          <div key={category.title} id={category.title.toLowerCase().replace(/\s+/g, '-')}>
            <CategorySection
              title={category.title}
              description={category.description}
              faqs={category.faqs}
              openItems={openItems}
              onToggle={toggleItem}
            />
          </div>
        ))}

        {/* Still Have Questions */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: 'white',
          textAlign: 'center',
        }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>
            Still Have Questions?
          </h2>
          <p style={{
            margin: '0 0 24px 0',
            opacity: 0.9,
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Check out our detailed methodology documentation or contact us for more information.
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link
              href="/methodology"
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#1e40af',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              View Methodology
            </Link>
            <Link
              href="/about"
              style={{
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'white',
        marginTop: '40px',
      }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
          Questions based on common user inquiries and genetic counseling guidelines
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
          <Link href="/methodology" style={{ color: '#2563eb' }}>
            Methodology
          </Link>
          {' '}&bull;{' '}
          <Link href="/diseases" style={{ color: '#2563eb' }}>
            Disease Catalog
          </Link>
          {' '}&bull;{' '}
          <Link href="/about" style={{ color: '#2563eb' }}>
            About
          </Link>
        </p>
      </footer>
    </div>
  );
}
