---
title: 'PRS Calculator: A Web-Based Tool for Computing Polygenic Risk Scores from Consumer Genotyping Data'
tags:
  - Python
  - JavaScript
  - genomics
  - polygenic risk scores
  - genetics
  - bioinformatics
  - precision medicine
authors:
  - name: Luis Sanchez
    orcid: 0000-0000-0000-0000
    affiliation: 1
  - name: Shubhankar Tripathy
    orcid: 0000-0000-0000-0000
    affiliation: 2
affiliations:
  - name: University of California, Berkeley
    index: 1
  - name: Stanford University
    index: 2
date: 22 January 2026
bibliography: paper.bib
---

# Summary

Polygenic risk scores (PRS) aggregate the effects of thousands to millions of common genetic variants to estimate an individual's genetic predisposition to complex diseases [@Torkamani2018]. While PRS have demonstrated clinical utility for conditions including coronary artery disease [@Khera2018], breast cancer [@Mavaddat2019], and type 2 diabetes, implementing them with consumer direct-to-consumer (DTC) genotyping data remains challenging due to variant coverage limitations, population stratification, and interpretability concerns.

We present PRS Calculator, an open-source web application that computes polygenic risk scores from 23andMe, AncestryDNA, and VCF files using validated scoring files from the PGS Catalog [@Lambert2021]. The tool implements position-based variant matching with strand flip detection, achieving 65-75% variant coverage on consumer arrays, and provides ancestry-aware population normalization for five major ancestry groups using UK Biobank-derived parameters.

# Statement of Need

Over 40 million individuals have undergone DTC DNA testing [@Regalado2019], creating substantial demand for tools that can extract clinically meaningful insights from this data. While several PRS tools exist for research contexts (e.g., PRSice-2, PLINK), they require bioinformatics expertise and are not designed for consumer genotyping formats. Commercial services that offer PRS analysis often lack transparency in their methods and scoring file sources.

PRS Calculator addresses this gap by providing:

1. **Accessibility**: A web interface requiring no programming knowledge, with support for common DTC file formats
2. **Transparency**: Open-source code with documented methodology and traceable scoring files from the PGS Catalog
3. **Comprehensiveness**: Risk scores for 50+ diseases across cardiovascular, oncologic, metabolic, neurological, and autoimmune categories
4. **Ancestry awareness**: Population-specific normalization to account for allele frequency differences across ancestries
5. **Clinical context**: Results include risk categories, population percentiles, and evidence-based lifestyle recommendations

The tool is designed for educational and research purposes, enabling individuals to explore their genetic risk profiles while understanding the probabilistic nature and limitations of PRS.

# Features and Implementation

## Architecture

PRS Calculator consists of three components:

- **Backend**: Python-based PRS calculation engine using NumPy and Pandas for efficient variant matching and score computation
- **Frontend**: Next.js React application providing an interactive user interface with real-time results visualization
- **API**: RESTful endpoints for programmatic access, deployable via Modal serverless infrastructure or local Docker containers

## Variant Matching Algorithm

The core algorithm matches user genotypes to PGS Catalog scoring files using chromosome:position coordinates rather than rsIDs, avoiding complications from identifier merging and reference build inconsistencies. For each matched position, allele compatibility is verified with automatic strand flip detection for ambiguous A/T and C/G polymorphisms:

```python
def compute_dosage(user_alleles, effect_allele, other_allele):
    """Calculate effect allele dosage with strand flip handling."""
    complement = {'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'}

    # Direct match
    if set(user_alleles) <= {effect_allele, other_allele}:
        return sum(a == effect_allele for a in user_alleles)

    # Strand flip check
    eff_comp = complement.get(effect_allele)
    oth_comp = complement.get(other_allele)
    if eff_comp and {user_alleles} <= {eff_comp, oth_comp}:
        return sum(a == eff_comp for a in user_alleles)

    return None  # Incompatible
```

## Population Normalization

Raw PRS values are converted to interpretable percentiles using the standard normal transformation:

$$Z = \frac{PRS_{raw} - \mu_{ancestry}}{\sigma_{ancestry}}$$

$$Percentile = \Phi(Z) \times 100$$

Population parameters (μ and σ) are derived from ancestry-stratified UK Biobank data for European (EUR), South Asian (SAS), East Asian (EAS), African (AFR), and Admixed American (AMR) populations.

## Disease Coverage

The calculator includes validated PGS Catalog scores for 50+ conditions:

| Category | Example Diseases | PGS Sources |
|----------|-----------------|-------------|
| Cardiovascular | CAD, Atrial Fibrillation, Stroke | PGS000018, PGS000016, PGS000039 |
| Oncologic | Breast, Prostate, Colorectal Cancer | PGS000004, PGS000062, PGS000055 |
| Metabolic | Type 2 Diabetes, Obesity, Gout | PGS000036, PGS000027, PGS000091 |
| Neurological | Alzheimer's, Parkinson's, Schizophrenia | PGS000334, PGS000089, PGS000327 |
| Autoimmune | Rheumatoid Arthritis, IBD, Celiac | PGS000052, PGS000044, PGS000098 |

## Results Visualization

Results are presented through an interactive dashboard featuring:

- Risk category assignments (Low/Average/Elevated/High) with color-coded indicators
- Population distribution curves showing the user's percentile position
- Disease-specific information cards with heritability estimates, key genetic variants, and modifiable risk factors
- Exportable PDF reports for healthcare provider consultation

# Validation and Performance

Variant matching rates across 50+ scoring files average 68% on typical consumer arrays, consistent with expected coverage given that many PRS variants are imputed rather than directly genotyped. Studies demonstrate that PRS retain substantial predictive power at 50-75% variant coverage [@Wand2021].

Performance metrics reported in the application derive from PGS Catalog evaluation studies, primarily in UK Biobank, with AUC values ranging from 0.65-0.85 and top-decile odds ratios of 2.0-4.5× depending on the disease [@Khera2018; @Lewis2020].

We transparently communicate cross-ancestry performance limitations, with expected 20-55% attenuation in non-European populations [@Martin2019], and emphasize that PRS provide genetic risk estimates that should be interpreted alongside clinical factors.

# Availability and Documentation

- **Web Application**: https://prs-calculator.vercel.app
- **Source Code**: https://github.com/suislanchez/polygenic-risk-score-calc
- **Documentation**: Full methodology available at /methodology page
- **License**: MIT

# Acknowledgments

We acknowledge the PGS Catalog for providing curated, harmonized polygenic scoring files, and UK Biobank for population reference data. This tool is intended for educational and research purposes; users should consult healthcare providers for clinical decisions.

# References
