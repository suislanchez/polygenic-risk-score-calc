#!/usr/bin/env python3
"""
Generate comprehensive research context PDF for the Polygenic Risk Score Calculator.

This document provides complete technical context for use in research papers
and as input for AI assistants working on the project.
"""

from pathlib import Path
from datetime import datetime
from weasyprint import HTML, CSS

OUTPUT_PATH = Path(__file__).parent / "PRS_Calculator_Research_Context.pdf"

HTML_CONTENT = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Polygenic Risk Score Calculator - Technical Documentation</title>
    <style>
        @page {
            size: A4;
            margin: 2cm 2.5cm;
            @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 10pt;
                color: #666;
            }
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
        }

        .cover {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            page-break-after: always;
        }

        .cover h1 {
            font-size: 28pt;
            color: #1e3a5f;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .cover .subtitle {
            font-size: 16pt;
            color: #4a5568;
            margin-bottom: 40px;
        }

        .cover .meta {
            font-size: 12pt;
            color: #666;
            margin-top: 60px;
        }

        .toc {
            page-break-after: always;
        }

        .toc h2 {
            font-size: 18pt;
            margin-bottom: 20px;
            color: #1e3a5f;
        }

        .toc-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dotted #ccc;
        }

        h1 {
            font-size: 20pt;
            color: #1e3a5f;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #1e3a5f;
            page-break-after: avoid;
        }

        h2 {
            font-size: 14pt;
            color: #2d5a87;
            margin: 25px 0 12px 0;
            page-break-after: avoid;
        }

        h3 {
            font-size: 12pt;
            color: #3d7ab5;
            margin: 18px 0 10px 0;
            page-break-after: avoid;
        }

        p {
            margin-bottom: 12px;
            text-align: justify;
        }

        ul, ol {
            margin: 12px 0 12px 25px;
        }

        li {
            margin-bottom: 6px;
        }

        code {
            font-family: 'Courier New', monospace;
            font-size: 9.5pt;
            background: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
        }

        pre {
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            background: #f8f8f8;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 12px;
            margin: 15px 0;
            overflow-x: auto;
            white-space: pre-wrap;
            page-break-inside: avoid;
        }

        .formula {
            background: #f0f4f8;
            border-left: 4px solid #1e3a5f;
            padding: 15px 20px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            page-break-inside: avoid;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10pt;
            page-break-inside: avoid;
        }

        th {
            background: #1e3a5f;
            color: white;
            padding: 10px 12px;
            text-align: left;
            font-weight: 600;
        }

        td {
            padding: 8px 12px;
            border-bottom: 1px solid #e0e0e0;
        }

        tr:nth-child(even) {
            background: #f9fafb;
        }

        .note {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 15px;
            margin: 15px 0;
            page-break-inside: avoid;
        }

        .important {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 12px 15px;
            margin: 15px 0;
            page-break-inside: avoid;
        }

        .section {
            page-break-inside: avoid;
        }

        .architecture-diagram {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            white-space: pre;
            line-height: 1.4;
        }
    </style>
</head>
<body>

<!-- Cover Page -->
<div class="cover">
    <h1>Polygenic Risk Score Calculator</h1>
    <div class="subtitle">Technical Documentation & Research Context</div>
    <p style="font-size: 14pt; color: #4a5568;">
        A clinical-grade tool for computing multi-disease genetic risk assessments<br>
        using validated scores from the PGS Catalog
    </p>
    <div class="meta">
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Generated:</strong> """ + datetime.now().strftime("%B %d, %Y") + """</p>
        <p><strong>Repository:</strong> polygenic-risk-score-calc</p>
    </div>
</div>

<!-- Table of Contents -->
<div class="toc">
    <h2>Table of Contents</h2>
    <div class="toc-item"><span>1. Executive Summary</span><span>3</span></div>
    <div class="toc-item"><span>2. System Architecture</span><span>4</span></div>
    <div class="toc-item"><span>3. Core Algorithm</span><span>6</span></div>
    <div class="toc-item"><span>4. Data Sources & PGS Catalog Integration</span><span>8</span></div>
    <div class="toc-item"><span>5. Module Documentation</span><span>10</span></div>
    <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.1 DNA Parser (dna_parser.py)</span><span>10</span></div>
    <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.2 Liftover (liftover.py)</span><span>11</span></div>
    <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.3 PGS Catalog Client (pgscatalog.py)</span><span>12</span></div>
    <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.4 Population Parameters (populations.py)</span><span>13</span></div>
    <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.5 PRS Calculator (prs_calculator.py)</span><span>14</span></div>
    <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.6 Imputation (imputation.py)</span><span>16</span></div>
    <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.7 Report Generator (report_generator.py)</span><span>17</span></div>
    <div class="toc-item"><span>6. Deployment Architecture</span><span>18</span></div>
    <div class="toc-item"><span>7. Disease Catalog</span><span>19</span></div>
    <div class="toc-item"><span>8. Population Genetics & Normalization</span><span>20</span></div>
    <div class="toc-item"><span>9. Technical Dependencies</span><span>21</span></div>
    <div class="toc-item"><span>10. API Reference</span><span>22</span></div>
    <div class="toc-item"><span>11. Clinical Considerations</span><span>24</span></div>
    <div class="toc-item"><span>12. Future Enhancements</span><span>25</span></div>
</div>

<!-- Section 1: Executive Summary -->
<h1>1. Executive Summary</h1>

<p>The <strong>Polygenic Risk Score (PRS) Calculator</strong> is a comprehensive software system designed to compute genetic risk assessments for multiple diseases using consumer genetic testing data. The system processes raw DNA files from popular direct-to-consumer (DTC) testing services (23andMe, AncestryDNA) and standard VCF files, matching genetic variants against validated scoring files from the PGS Catalog to generate population-normalized risk percentiles.</p>

<h2>Key Capabilities</h2>
<ul>
    <li><strong>Multi-format DNA parsing:</strong> 23andMe, AncestryDNA, and VCF file support with automatic format detection</li>
    <li><strong>Genome build handling:</strong> Automatic detection and liftover between GRCh37 (hg19) and GRCh38 (hg38)</li>
    <li><strong>10-disease risk panel:</strong> Validated PGS Catalog scores for cardiovascular, oncological, metabolic, and neurological conditions</li>
    <li><strong>Ancestry-aware normalization:</strong> Population-specific z-score conversion for EUR, AFR, EAS, SAS, and AMR ancestries</li>
    <li><strong>Optional genotype imputation:</strong> Michigan Imputation Server integration for enhanced variant coverage (2% → 98%)</li>
    <li><strong>Clinical-grade reporting:</strong> NHS/AHA-compliant PDF reports with risk visualizations and actionable recommendations</li>
    <li><strong>Serverless deployment:</strong> Modal.com integration for scalable, pay-per-use cloud execution</li>
</ul>

<h2>Target Use Cases</h2>
<ol>
    <li><strong>Consumer genetic interpretation:</strong> Enabling individuals to understand disease risk from existing DTC genetic data</li>
    <li><strong>Research applications:</strong> Batch processing for cohort studies and biobank analyses</li>
    <li><strong>Clinical decision support:</strong> Providing risk stratification to inform preventive care discussions</li>
    <li><strong>Educational tools:</strong> Demonstrating polygenic score methodology for genetics education</li>
</ol>

<div class="note">
    <strong>Important:</strong> This tool provides genetic risk estimates for educational and research purposes only. Results should not be used for clinical diagnosis without consultation with qualified healthcare providers.
</div>

<!-- Section 2: System Architecture -->
<h1>2. System Architecture</h1>

<p>The system follows a modular pipeline architecture with clear separation of concerns across six functional layers:</p>

<div class="architecture-diagram">
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   Gradio Web UI  │  │  Modal HTTP API  │  │   CLI Interface  │          │
│  │    (app.py)      │  │  (modal_app.py)  │  │  (test_pipeline) │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
└───────────┼──────────────────────┼──────────────────────┼───────────────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INPUT LAYER                                       │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                     dna_parser.py                                 │       │
│  │  • Format detection (23andMe, AncestryDNA, VCF)                  │       │
│  │  • Build detection (GRCh37/GRCh38) via position heuristics       │       │
│  │  • Unified DataFrame output: [rsid, chrom, pos, allele1, allele2]│       │
│  └──────────────────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                      liftover.py                                  │       │
│  │  • UCSC chain file management                                     │       │
│  │  • Coordinate conversion via pyliftover                          │       │
│  │  • Build normalization to target reference                        │       │
│  └──────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                     pgscatalog.py                                 │       │
│  │  • REST API client (https://www.pgscatalog.org/rest)             │       │
│  │  • Harmonized scoring file download (FTP)                         │       │
│  │  • Local caching in data/cache/                                   │       │
│  │  • TSV parsing with metadata extraction                           │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                     populations.py                                │       │
│  │  • Population normalization constants (EUR, AFR, EAS, SAS, AMR)  │       │
│  │  • Risk category thresholds (Very Low → High)                    │       │
│  │  • Disease-specific ancestry adjustments                          │       │
│  └──────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPUTATION LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                    prs_calculator.py                              │       │
│  │  • Variant matching (chr:pos primary, rsID fallback)             │       │
│  │  • Strand flip handling (complement detection)                    │       │
│  │  • Dosage computation (0/1/2 effect allele count)                │       │
│  │  • Weighted sum: PRS = Σ(dosage × effect_weight)                 │       │
│  │  • Z-score normalization & percentile conversion                  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                     imputation.py                                 │       │
│  │  • VCF preparation for Michigan Imputation Server                │       │
│  │  • Job submission, polling, and result download                  │       │
│  │  • Dosage extraction from imputed VCF (DS field)                 │       │
│  │  • Merge with genotyped variants (R² filtering)                  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OUTPUT LAYER                                        │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                   report_generator.py                             │       │
│  │  • Clinical HTML report generation                                │       │
│  │  • PDF conversion via WeasyPrint                                  │       │
│  │  • Risk visualization (color-coded bars)                          │       │
│  │  • AHA/NHS clinical recommendations                               │       │
│  └──────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
</div>

<h2>Data Flow</h2>
<ol>
    <li><strong>Input:</strong> User uploads raw DNA file (23andMe/AncestryDNA/VCF)</li>
    <li><strong>Parse:</strong> Format auto-detection, genotype extraction, build identification</li>
    <li><strong>Normalize:</strong> Coordinate liftover to GRCh37 (standard reference)</li>
    <li><strong>Load Scores:</strong> Download/cache harmonized PGS Catalog scoring files</li>
    <li><strong>Match:</strong> Align user variants to scoring file by chr:pos or rsID</li>
    <li><strong>Compute:</strong> Calculate weighted dosage sum for each disease</li>
    <li><strong>Normalize:</strong> Convert raw PRS to z-score using ancestry-specific parameters</li>
    <li><strong>Classify:</strong> Map z-score to percentile and risk category</li>
    <li><strong>Report:</strong> Generate clinical PDF with visualizations and recommendations</li>
</ol>

<!-- Section 3: Core Algorithm -->
<h1>3. Core Algorithm</h1>

<p>The Polygenic Risk Score calculation follows a well-established methodology used in clinical genetics research. The algorithm consists of four primary stages: variant matching, dosage computation, score aggregation, and population normalization.</p>

<h2>3.1 Mathematical Foundation</h2>

<div class="formula">
<strong>Raw PRS Calculation:</strong>

    PRS_raw = Σ (dosage_i × effect_weight_i)

    where:
    • dosage_i ∈ {0, 1, 2} = count of effect alleles at variant i
    • effect_weight_i = log(OR) or beta from GWAS for variant i
    • summation over all matched variants

<strong>Population Normalization:</strong>

    PRS_zscore = (PRS_raw - μ_pop) / σ_pop

    where:
    • μ_pop = population-specific mean (e.g., EUR: 0.0)
    • σ_pop = population-specific standard deviation (e.g., EUR: 1.0)

<strong>Percentile Conversion:</strong>

    percentile = Φ(PRS_zscore) × 100

    where:
    • Φ = standard normal cumulative distribution function (scipy.stats.norm.cdf)
</div>

<h2>3.2 Variant Matching Strategy</h2>

<p>The system employs a hierarchical matching strategy to maximize variant overlap:</p>

<table>
    <tr>
        <th>Priority</th>
        <th>Method</th>
        <th>Description</th>
        <th>Success Rate</th>
    </tr>
    <tr>
        <td>1</td>
        <td>chr:pos match</td>
        <td>Chromosome and position (harmonized coordinates)</td>
        <td>~95% for harmonized PGS files</td>
    </tr>
    <tr>
        <td>2</td>
        <td>rsID match</td>
        <td>dbSNP reference SNP identifier</td>
        <td>~80% (rsID availability varies)</td>
    </tr>
    <tr>
        <td>3</td>
        <td>Strand flip</td>
        <td>Match after complementing alleles (A↔T, C↔G)</td>
        <td>Recovers ~2-5% additional</td>
    </tr>
</table>

<h2>3.3 Dosage Computation</h2>

<p>For each matched variant, the dosage represents the count of effect alleles (0, 1, or 2):</p>

<pre>
def compute_dosage(allele1, allele2, effect_allele, other_allele):
    # Example:
    # - Genotype: A/G, Effect allele: G, Other allele: A
    # - Result: dosage = 1 (one copy of effect allele G)

    genotype = {allele1, allele2}
    if genotype == {effect_allele, other_allele}:
        # Heterozygous
        return 1.0
    elif genotype == {effect_allele}:
        # Homozygous effect
        return 2.0
    elif genotype == {other_allele}:
        # Homozygous reference
        return 0.0
    else:
        # Check strand flip (complement)
        ...
</pre>

<h2>3.4 Strand Flip Detection</h2>

<p>DNA can be sequenced from either strand, requiring complement detection for A/T and C/G SNPs:</p>

<pre>
COMPLEMENT = {"A": "T", "T": "A", "C": "G", "G": "C"}

def get_complement(allele):
    return "".join(COMPLEMENT[b] for b in allele)

# Example: Scoring file has C/T, genotype file has G/A
# After complementing: G/A → C/T (match!)
</pre>

<!-- Section 4: Data Sources -->
<h1>4. Data Sources & PGS Catalog Integration</h1>

<h2>4.1 PGS Catalog Overview</h2>

<p>The <strong>Polygenic Score Catalog</strong> (www.pgscatalog.org) is the authoritative open database of published polygenic scores. Maintained by the EMBL-EBI and NHGRI, it provides:</p>

<ul>
    <li>Standardized scoring file formats</li>
    <li>Harmonized coordinates for GRCh37 and GRCh38</li>
    <li>Validation metadata and publication links</li>
    <li>REST API for programmatic access</li>
</ul>

<h2>4.2 API Endpoints Used</h2>

<table>
    <tr>
        <th>Endpoint</th>
        <th>Purpose</th>
        <th>Example</th>
    </tr>
    <tr>
        <td>/rest/score/{pgs_id}</td>
        <td>Score metadata</td>
        <td>/rest/score/PGS000018</td>
    </tr>
    <tr>
        <td>FTP: /scores/{pgs_id}/ScoringFiles/Harmonized/</td>
        <td>Harmonized scoring file</td>
        <td>PGS000018_hmPOS_GRCh37.txt.gz</td>
    </tr>
</table>

<h2>4.3 Scoring File Format</h2>

<p>PGS Catalog harmonized files contain the following essential columns:</p>

<pre>
#pgs_id=PGS000018
#trait_mapped=coronary artery disease
#genome_build=GRCh37
rsID    chr_name    chr_position    effect_allele    other_allele    effect_weight    hm_chr    hm_pos
rs123   1           12345           A                G               0.0234           1         12345
rs456   2           67890           C                T               -0.0156          2         67890
...
</pre>

<h2>4.4 Local Caching Strategy</h2>

<p>Scoring files are cached locally to minimize API load and improve performance:</p>

<pre>
data/
└── cache/
    ├── PGS000018_GRCh37.txt
    ├── PGS000004_GRCh37.txt
    ├── hg19ToHg38.over.chain.gz  (liftover chain)
    └── ...
</pre>

<!-- Section 5: Module Documentation -->
<h1>5. Module Documentation</h1>

<h2>5.1 DNA Parser (src/dna_parser.py)</h2>

<p><strong>Purpose:</strong> Unified parser for consumer genetic test formats with automatic detection.</p>

<h3>Supported Formats</h3>
<table>
    <tr>
        <th>Format</th>
        <th>Structure</th>
        <th>Detection Method</th>
    </tr>
    <tr>
        <td>23andMe</td>
        <td>rsid, chromosome, position, genotype (e.g., "AG")</td>
        <td>Header contains "23andMe" or 4-column TSV</td>
    </tr>
    <tr>
        <td>AncestryDNA</td>
        <td>rsid, chromosome, position, allele1, allele2</td>
        <td>Header contains "AncestryDNA" or 5-column TSV</td>
    </tr>
    <tr>
        <td>VCF</td>
        <td>Standard VCF 4.2+ with GT field</td>
        <td>##fileformat=VCF header or .vcf extension</td>
    </tr>
</table>

<h3>Key Functions</h3>
<pre>
detect_format(filepath) → str           # "23andme" | "ancestrydna" | "vcf"
detect_build(filepath) → str            # "GRCh37" | "GRCh38"
parse_raw_dna(filepath) → pd.DataFrame  # Main entry point
get_genotype_summary(df) → dict         # QC statistics
</pre>

<h3>Build Detection Heuristics</h3>
<p>Uses known SNP positions to detect genome build:</p>
<pre>
BUILD_DETECTION_SNPS = {
    "rs7412":    {"GRCh37": ("19", 45412079), "GRCh38": ("19", 44908822)},
    "rs429358":  {"GRCh37": ("19", 45411941), "GRCh38": ("19", 44908684)},
    # ... additional well-characterized SNPs
}
</pre>

<h2>5.2 Liftover (src/liftover.py)</h2>

<p><strong>Purpose:</strong> Coordinate conversion between genome builds using UCSC chain files and pyliftover.</p>

<h3>Supported Conversions</h3>
<ul>
    <li>GRCh37 (hg19) → GRCh38 (hg38)</li>
    <li>GRCh38 (hg38) → GRCh37 (hg19)</li>
</ul>

<h3>Key Functions</h3>
<pre>
get_chain_file(from_build, to_build) → Path     # Download chain if needed
liftover_position(chrom, pos, from, to) → tuple # Single position conversion
liftover_dataframe(df, target_build) → df       # Add lifted coordinates
ensure_build(df, target_build) → df             # Convert & filter
</pre>

<h3>Coordinate Handling</h3>
<p>pyliftover uses 0-based coordinates internally; the module handles conversion to/from 1-based genomic coordinates used in input files.</p>

<h2>5.3 PGS Catalog Client (src/pgscatalog.py)</h2>

<p><strong>Purpose:</strong> REST API client and scoring file parser for PGS Catalog data.</p>

<h3>Disease Catalog</h3>
<pre>
DISEASE_CATALOG = {
    "cad":              {"pgs_id": "PGS000018", "name": "Coronary Artery Disease"},
    "breast_cancer":    {"pgs_id": "PGS000004", "name": "Breast Cancer"},
    "t2d":              {"pgs_id": "PGS000014", "name": "Type 2 Diabetes"},
    "prostate_cancer":  {"pgs_id": "PGS000662", "name": "Prostate Cancer"},
    "alzheimers":       {"pgs_id": "PGS000334", "name": "Alzheimer's Disease"},
    "colorectal_cancer":{"pgs_id": "PGS000055", "name": "Colorectal Cancer"},
    "afib":             {"pgs_id": "PGS000016", "name": "Atrial Fibrillation"},
    "stroke":           {"pgs_id": "PGS000039", "name": "Stroke"},
    "obesity":          {"pgs_id": "PGS000027", "name": "Obesity (BMI)"},
    "depression":       {"pgs_id": "PGS000297", "name": "Major Depression"},
}
</pre>

<h3>Key Functions</h3>
<pre>
get_score_metadata(pgs_id) → dict                    # API metadata fetch
download_scoring_file(pgs_id, build) → Path          # Download & cache
parse_scoring_file(filepath) → pd.DataFrame          # TSV parsing
load_scores_for_disease(disease, build) → pd.DataFrame  # Main entry point
</pre>

<h2>5.4 Population Parameters (src/populations.py)</h2>

<p><strong>Purpose:</strong> Population-specific normalization constants and risk category definitions.</p>

<h3>Population Parameters</h3>
<table>
    <tr>
        <th>Ancestry</th>
        <th>Code</th>
        <th>Mean (μ)</th>
        <th>SD (σ)</th>
        <th>Notes</th>
    </tr>
    <tr><td>European</td><td>EUR</td><td>0.0</td><td>1.0</td><td>Reference population</td></tr>
    <tr><td>African</td><td>AFR</td><td>0.2</td><td>1.1</td><td>Higher variance</td></tr>
    <tr><td>East Asian</td><td>EAS</td><td>-0.1</td><td>0.9</td><td>Lower variance</td></tr>
    <tr><td>South Asian</td><td>SAS</td><td>0.1</td><td>1.0</td><td>Slight positive shift</td></tr>
    <tr><td>Latino/Admixed</td><td>AMR</td><td>0.05</td><td>1.05</td><td>Intermediate parameters</td></tr>
</table>

<h3>Risk Categories</h3>
<table>
    <tr>
        <th>Category</th>
        <th>Percentile Range</th>
        <th>Color Code</th>
        <th>Clinical Action</th>
    </tr>
    <tr><td>Very Low</td><td>0-10%</td><td>#22c55e (Green)</td><td>Standard screening</td></tr>
    <tr><td>Low</td><td>10-25%</td><td>#86efac (Light green)</td><td>Standard screening</td></tr>
    <tr><td>Average</td><td>25-75%</td><td>#fbbf24 (Yellow)</td><td>Follow standard recommendations</td></tr>
    <tr><td>Elevated</td><td>75-90%</td><td>#fb923c (Orange)</td><td>Enhanced screening; consult physician</td></tr>
    <tr><td>High</td><td>90-100%</td><td>#ef4444 (Red)</td><td>Specialist consultation recommended</td></tr>
</table>

<h2>5.5 PRS Calculator (src/prs_calculator.py)</h2>

<p><strong>Purpose:</strong> Core computation engine for polygenic risk scores with ancestry adjustment.</p>

<h3>Key Functions</h3>
<pre>
match_variants(genotypes_df, scores_df) → pd.DataFrame
    # Match by chr:pos (primary) or rsID, handle strand flips

compute_dosage(allele1, allele2, effect_allele, other_allele) → float
    # Convert genotype to 0/1/2 dosage

calculate_prs(genotypes_df, scores_df) → dict
    # Returns: matched_variants, total_variants, match_rate, raw_prs

normalize_prs(raw_prs, population="EUR") → dict
    # Returns: zscore, percentile, risk_category

compute_single_disease(genotypes_df, disease, population) → dict
    # Full pipeline for one disease

compute_all_diseases(genotypes_df, diseases=None, population="EUR") → dict
    # Batch computation with elevated risk summary
</pre>

<h3>Match Rate Expectations</h3>
<table>
    <tr>
        <th>Input Type</th>
        <th>Typical Variants</th>
        <th>Expected Match Rate</th>
    </tr>
    <tr><td>23andMe v5</td><td>~650,000</td><td>1-5% without imputation</td></tr>
    <tr><td>AncestryDNA v2</td><td>~700,000</td><td>1-5% without imputation</td></tr>
    <tr><td>Post-imputation</td><td>~40,000,000</td><td>70-98% of scoring file</td></tr>
</table>

<h2>5.6 Imputation (src/imputation.py)</h2>

<p><strong>Purpose:</strong> Michigan Imputation Server integration for enhanced variant coverage.</p>

<h3>Workflow</h3>
<ol>
    <li><strong>Prepare:</strong> Convert genotypes to per-chromosome VCF 4.2 format</li>
    <li><strong>Submit:</strong> Upload to Michigan Imputation Server via REST API</li>
    <li><strong>Poll:</strong> Check job status until completion</li>
    <li><strong>Download:</strong> Retrieve imputed VCF files with dosage (DS) field</li>
    <li><strong>Merge:</strong> Combine imputed variants with genotyped (prefer genotyped)</li>
</ol>

<h3>Key Functions</h3>
<pre>
prepare_vcf_for_imputation(genotypes_df, output_dir) → list[Path]
submit_imputation_job(vcf_files, reference_panel, build, population) → job_id
check_job_status(job_id) → dict
download_imputed_results(job_id, output_dir) → list[Path]
parse_imputed_vcf(vcf_path) → pd.DataFrame  # Extracts DS field
merge_with_genotyped(imputed_df, genotyped_df, r2_threshold=0.3) → pd.DataFrame
</pre>

<h3>Quality Filtering</h3>
<p>Imputed variants are filtered by R² (imputation quality score). Default threshold: R² ≥ 0.3</p>

<h2>5.7 Report Generator (src/report_generator.py)</h2>

<p><strong>Purpose:</strong> NHS-grade clinical report generation with visualizations and recommendations.</p>

<h3>Report Components</h3>
<ul>
    <li><strong>Header:</strong> Patient ID, ancestry, report date, source file</li>
    <li><strong>Executive Summary:</strong> Top elevated risks with visual bars</li>
    <li><strong>Full Results Table:</strong> All diseases with percentile, category, z-score, variant coverage</li>
    <li><strong>Risk Legend:</strong> Color-coded category explanations</li>
    <li><strong>Recommendations:</strong> Per-disease clinical actions based on risk level</li>
    <li><strong>Disclaimer:</strong> Standard clinical disclaimer per NHS/AHA guidelines</li>
</ul>

<h3>Key Functions</h3>
<pre>
generate_html_report(prs_results, user_info) → str
generate_pdf_report(prs_results, user_info, output_path) → Path
generate_summary_text(prs_results) → str  # Plain text version
get_recommendations(disease, risk_category) → list[str]
</pre>

<!-- Section 6: Deployment Architecture -->
<h1>6. Deployment Architecture</h1>

<h2>6.1 Local Development</h2>
<pre>
# Install dependencies
pip install -r requirements.txt

# Run Gradio web interface
python app.py
# → Launches on http://localhost:7860
</pre>

<h2>6.2 Modal Serverless Deployment</h2>

<p>The <code>modal_app.py</code> provides serverless deployment on Modal.com:</p>

<pre>
# Deploy to Modal
modal deploy modal_app.py

# Local testing
modal serve modal_app.py
</pre>

<h3>Modal Functions</h3>
<table>
    <tr>
        <th>Function</th>
        <th>Timeout</th>
        <th>Memory</th>
        <th>Purpose</th>
    </tr>
    <tr><td>compute_prs</td><td>10 min</td><td>2 GB</td><td>Core PRS computation</td></tr>
    <tr><td>generate_report_pdf</td><td>2 min</td><td>1 GB</td><td>PDF generation</td></tr>
    <tr><td>process_full</td><td>15 min</td><td>2 GB</td><td>Complete workflow</td></tr>
    <tr><td>compute_prs_web</td><td>10 min</td><td>2 GB</td><td>HTTP endpoint</td></tr>
</table>

<h2>6.3 HTTP API</h2>

<p>The <code>compute_prs_web</code> endpoint accepts POST requests:</p>

<pre>
POST /compute_prs_web
Content-Type: application/json

{
    "file_content": "&lt;base64-encoded DNA file&gt;",
    "filename": "23andme.txt",
    "ancestry": "EUR"
}

Response:
{
    "status": "success",
    "prs_results": {...},
    "metadata": {...}
}
</pre>

<!-- Section 7: Disease Catalog -->
<h1>7. Disease Catalog</h1>

<p>The system computes PRS for 10 validated conditions across four disease categories:</p>

<h2>Cardiovascular (3 conditions)</h2>
<table>
    <tr><th>Disease</th><th>PGS ID</th><th>Variants</th><th>Publication</th></tr>
    <tr><td>Coronary Artery Disease</td><td>PGS000018</td><td>~6.6M</td><td>Khera et al. 2018</td></tr>
    <tr><td>Atrial Fibrillation</td><td>PGS000016</td><td>~1M</td><td>Bycroft et al. 2018</td></tr>
    <tr><td>Stroke</td><td>PGS000039</td><td>~2M</td><td>Abraham et al. 2019</td></tr>
</table>

<h2>Oncology (3 conditions)</h2>
<table>
    <tr><th>Disease</th><th>PGS ID</th><th>Variants</th><th>Publication</th></tr>
    <tr><td>Breast Cancer</td><td>PGS000004</td><td>313</td><td>Mavaddat et al. 2019</td></tr>
    <tr><td>Prostate Cancer</td><td>PGS000662</td><td>~200</td><td>Conti et al. 2021</td></tr>
    <tr><td>Colorectal Cancer</td><td>PGS000055</td><td>~100</td><td>Thomas et al. 2020</td></tr>
</table>

<h2>Metabolic (2 conditions)</h2>
<table>
    <tr><th>Disease</th><th>PGS ID</th><th>Variants</th><th>Publication</th></tr>
    <tr><td>Type 2 Diabetes</td><td>PGS000014</td><td>~1M</td><td>Mahajan et al. 2018</td></tr>
    <tr><td>Obesity (BMI)</td><td>PGS000027</td><td>~2M</td><td>Locke et al. 2015</td></tr>
</table>

<h2>Neurological (2 conditions)</h2>
<table>
    <tr><th>Disease</th><th>PGS ID</th><th>Variants</th><th>Publication</th></tr>
    <tr><td>Alzheimer's Disease</td><td>PGS000334</td><td>~100K</td><td>Kunkle et al. 2019</td></tr>
    <tr><td>Major Depression</td><td>PGS000297</td><td>~100K</td><td>Howard et al. 2019</td></tr>
</table>

<!-- Section 8: Population Genetics -->
<h1>8. Population Genetics & Normalization</h1>

<h2>8.1 Why Population Normalization Matters</h2>

<p>Raw PRS values are not directly comparable across individuals of different ancestries due to:</p>

<ul>
    <li><strong>Allele frequency differences:</strong> Effect alleles have varying frequencies across populations</li>
    <li><strong>Linkage disequilibrium patterns:</strong> LD structure differs between ancestries</li>
    <li><strong>GWAS discovery bias:</strong> Most PRS are developed primarily in European cohorts</li>
</ul>

<h2>8.2 Normalization Approach</h2>

<p>The system uses ancestry-specific reference distributions to convert raw scores to percentiles:</p>

<div class="formula">
<strong>For a user with ancestry A and raw PRS score S:</strong>

1. Look up population parameters: μ_A, σ_A
2. Compute z-score: z = (S - μ_A) / σ_A
3. Convert to percentile: p = Φ(z) × 100
4. Classify risk: Very Low (p < 10) → High (p ≥ 90)
</div>

<h2>8.3 Limitations</h2>

<div class="important">
<strong>Important Caveat:</strong> PRS transferability across ancestries remains an active research area. Scores developed in European populations may have reduced predictive accuracy in other ancestries. The population parameters used here are simplified approximations and should be validated against ancestry-matched reference cohorts for clinical applications.
</div>

<!-- Section 9: Technical Dependencies -->
<h1>9. Technical Dependencies</h1>

<h2>Core Dependencies</h2>
<table>
    <tr><th>Package</th><th>Version</th><th>Purpose</th></tr>
    <tr><td>pandas</td><td>≥2.0</td><td>DataFrame operations, TSV parsing</td></tr>
    <tr><td>numpy</td><td>≥1.24</td><td>Numerical operations</td></tr>
    <tr><td>scipy</td><td>≥1.11</td><td>Statistical functions (norm.cdf)</td></tr>
    <tr><td>requests</td><td>≥2.31</td><td>HTTP client for API calls</td></tr>
</table>

<h2>Web Interface</h2>
<table>
    <tr><th>Package</th><th>Version</th><th>Purpose</th></tr>
    <tr><td>gradio</td><td>≥4.0</td><td>Web UI framework</td></tr>
    <tr><td>weasyprint</td><td>≥60.0</td><td>HTML to PDF conversion</td></tr>
</table>

<h2>Genomics</h2>
<table>
    <tr><th>Package</th><th>Version</th><th>Purpose</th></tr>
    <tr><td>pyliftover</td><td>≥0.4</td><td>Coordinate liftover</td></tr>
    <tr><td>cyvcf2</td><td>≥0.30</td><td>VCF parsing (optional)</td></tr>
</table>

<h2>Deployment</h2>
<table>
    <tr><th>Package</th><th>Version</th><th>Purpose</th></tr>
    <tr><td>modal</td><td>≥0.60</td><td>Serverless deployment</td></tr>
    <tr><td>stripe</td><td>≥7.0</td><td>Payment processing (optional)</td></tr>
</table>

<!-- Section 10: API Reference -->
<h1>10. API Reference</h1>

<h2>Main Entry Points</h2>

<h3>parse_raw_dna(filepath: Path) → pd.DataFrame</h3>
<p>Parse any supported DNA file format.</p>
<pre>
Input: Path to 23andMe, AncestryDNA, or VCF file
Output: DataFrame with columns:
    - rsid: str (e.g., "rs12345")
    - chrom: str (e.g., "1", "X")
    - pos: int (1-based position)
    - allele1: str (e.g., "A")
    - allele2: str (e.g., "G")
    - genotype: str (e.g., "AG")
    - build: str ("GRCh37" or "GRCh38")
</pre>

<h3>load_scores_for_disease(disease: str, build: str) → pd.DataFrame</h3>
<p>Load PGS Catalog scoring file for a disease.</p>
<pre>
Input:
    - disease: Disease key (e.g., "cad", "breast_cancer")
    - build: "GRCh37" or "GRCh38"
Output: DataFrame with columns:
    - rsid, chr_name, chr_position
    - effect_allele, other_allele
    - effect_weight
    - hm_chr, hm_pos (harmonized)
</pre>

<h3>compute_all_diseases(genotypes_df, diseases=None, population="EUR") → dict</h3>
<p>Compute PRS for multiple diseases.</p>
<pre>
Output: {
    "population": "EUR",
    "results": {
        "cad": {
            "raw_prs": 1.234,
            "zscore": 0.89,
            "percentile": 81.3,
            "risk_category": "Elevated",
            "matched_variants": 156,
            "total_variants": 6630000,
            "match_rate": 0.002
        },
        ...
    },
    "elevated_risks": [...],  # Top 5 with percentile ≥ 75
    "total_diseases_analyzed": 10,
    "diseases_with_data": 10
}
</pre>

<h3>generate_pdf_report(prs_results, user_info, output_path) → Path</h3>
<p>Generate clinical PDF report.</p>
<pre>
Input:
    - prs_results: Dict from compute_all_diseases
    - user_info: {"patient_id": str, "ancestry": str, "filename": str}
    - output_path: Path for PDF output
Output: Path to generated PDF
</pre>

<!-- Section 11: Clinical Considerations -->
<h1>11. Clinical Considerations</h1>

<h2>11.1 Appropriate Use</h2>

<p>This tool is designed for:</p>
<ul>
    <li>Educational purposes and personal interest</li>
    <li>Research applications with appropriate IRB approval</li>
    <li>Clinical decision support when interpreted by qualified providers</li>
</ul>

<h2>11.2 Limitations</h2>

<ol>
    <li><strong>Not diagnostic:</strong> PRS indicate predisposition, not disease presence</li>
    <li><strong>Incomplete picture:</strong> Genetic risk is one factor; environment, lifestyle, and family history matter</li>
    <li><strong>Ancestry bias:</strong> Most PRS developed in European populations; reduced accuracy in other ancestries</li>
    <li><strong>Variant coverage:</strong> DTC arrays capture only ~2-5% of scoring variants without imputation</li>
    <li><strong>Score selection:</strong> Many alternative PGS exist; selected scores may not be optimal for all populations</li>
</ol>

<h2>11.3 Recommendations for Clinical Use</h2>

<div class="note">
<ol>
    <li>Results should be interpreted by genetic counselors or physicians familiar with PRS</li>
    <li>Use imputation mode for improved accuracy when possible</li>
    <li>Consider ancestry limitations when counseling non-European patients</li>
    <li>Integrate PRS with family history, lifestyle, and clinical biomarkers</li>
    <li>Follow established clinical guidelines (AHA, NCCN, etc.) for screening decisions</li>
</ol>
</div>

<!-- Section 12: Future Enhancements -->
<h1>12. Future Enhancements</h1>

<h2>Planned Features</h2>

<ol>
    <li><strong>Expanded disease catalog:</strong> Additional conditions (lupus, IBD, schizophrenia, etc.)</li>
    <li><strong>Multi-ancestry PRS:</strong> Integration of ancestry-specific scores as they become available</li>
    <li><strong>Pharmacogenomics:</strong> Drug response predictions (DPYD, TPMT, CYP2D6)</li>
    <li><strong>Family history integration:</strong> Combined PRS + family history risk models</li>
    <li><strong>Longitudinal tracking:</strong> Risk trajectory monitoring over time</li>
    <li><strong>Clinical integration:</strong> EHR-compatible FHIR output format</li>
    <li><strong>Enhanced imputation:</strong> Direct integration with TOPMed or local imputation servers</li>
</ol>

<h2>Technical Improvements</h2>

<ul>
    <li>GPU acceleration for large-scale batch processing</li>
    <li>Caching layer for frequently accessed PGS files</li>
    <li>Streaming parser for very large VCF files</li>
    <li>Multi-sample VCF support for family analysis</li>
</ul>

<div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #666;">
    <p><strong>Polygenic Risk Score Calculator - Technical Documentation</strong></p>
    <p>Generated: """ + datetime.now().strftime("%B %d, %Y at %H:%M") + """</p>
    <p>Version 1.0.0</p>
</div>

</body>
</html>
"""

def generate_pdf():
    """Generate the research context PDF."""
    print("Generating PRS Calculator Research Context PDF...")

    # PDF-specific CSS optimizations
    pdf_css = CSS(string="""
        @page {
            size: A4;
            margin: 2cm 2.5cm;
        }

        h1 {
            page-break-after: avoid;
        }

        h2, h3 {
            page-break-after: avoid;
        }

        table, pre, .formula, .note, .important {
            page-break-inside: avoid;
        }

        .cover {
            page-break-after: always;
        }

        .toc {
            page-break-after: always;
        }
    """)

    html = HTML(string=HTML_CONTENT)
    html.write_pdf(OUTPUT_PATH, stylesheets=[pdf_css])

    print(f"PDF generated successfully: {OUTPUT_PATH}")
    print(f"File size: {OUTPUT_PATH.stat().st_size / 1024:.1f} KB")
    return OUTPUT_PATH


if __name__ == "__main__":
    generate_pdf()
