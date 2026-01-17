# Polygenic Risk Score Calculator

A clinical-grade Polygenic Risk Score (PRS) calculator that computes genetic risk for multiple diseases using validated scores from the [PGS Catalog](https://www.pgscatalog.org/).

## Features

- **10+ Disease Risk Scores**: Cardiovascular disease, breast cancer, type 2 diabetes, prostate cancer, Alzheimer's, and more
- **Multiple Input Formats**: Support for 23andMe, AncestryDNA, and VCF files
- **Ancestry-Aware Normalization**: Population-specific risk percentiles for EUR, AFR, EAS, SAS, and AMR ancestries
- **Clinical Reports**: NHS-grade PDF reports with risk visualizations and actionable recommendations
- **Serverless Deployment**: Modal-based scalable infrastructure
- **Web Interface**: User-friendly Gradio UI for file upload and results

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/polygenic-risk-score-calc.git
cd polygenic-risk-score-calc

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Run Locally (Gradio)

```bash
python app.py
```

Open http://localhost:7860 in your browser.

### Run Tests

```bash
pytest tests/test_pipeline.py -v
```

## Architecture

```
polygenic-risk-score-calc/
├── app.py                 # Gradio web interface
├── modal_app.py           # Modal serverless deployment
├── requirements.txt       # Python dependencies
│
├── src/
│   ├── __init__.py
│   ├── pgscatalog.py      # PGS Catalog API client & scoring file parser
│   ├── populations.py     # Ancestry-specific normalization parameters
│   ├── dna_parser.py      # Multi-format DNA file parser
│   ├── liftover.py        # Genome coordinate conversion (GRCh37/GRCh38)
│   ├── prs_calculator.py  # Core PRS computation engine
│   ├── imputation.py      # Michigan Imputation Server integration
│   └── report_generator.py# NHS-grade PDF report generation
│
├── data/
│   └── cache/             # Cached PGS scoring files
│
├── tests/
│   └── test_pipeline.py   # Comprehensive pytest suite
│
├── test_data/             # Sample files for testing
│   ├── sample_23andme.txt
│   ├── sample_vcf.vcf
│   └── sample_ancestrydna.txt
│
└── frontend/              # Next.js Vercel frontend (optional)
    └── app/
```

## Supported Diseases

| Disease | PGS ID | Category |
|---------|--------|----------|
| Coronary Artery Disease | PGS000018 | Cardiovascular |
| Atrial Fibrillation | PGS000016 | Cardiovascular |
| Stroke | PGS000039 | Cardiovascular |
| Breast Cancer | PGS000004 | Oncology |
| Prostate Cancer | PGS000662 | Oncology |
| Colorectal Cancer | PGS000055 | Oncology |
| Type 2 Diabetes | PGS000014 | Metabolic |
| Obesity (BMI) | PGS000027 | Metabolic |
| Alzheimer's Disease | PGS000334 | Neurological |
| Major Depression | PGS000297 | Neurological |

## How It Works

### 1. Parse DNA File

The parser auto-detects file format and extracts genotypes:

```python
from src.dna_parser import parse_raw_dna

genotypes = parse_raw_dna("my_23andme.txt")
print(f"Loaded {len(genotypes)} variants")
```

### 2. Load PGS Scoring Files

Scoring files are downloaded from PGS Catalog and cached locally:

```python
from src.pgscatalog import load_scores_for_disease

scores = load_scores_for_disease("breast_cancer", build="GRCh37")
print(f"Score has {len(scores)} variants")
```

### 3. Calculate PRS

Match variants and compute weighted sum:

```python
from src.prs_calculator import calculate_prs, normalize_prs

result = calculate_prs(genotypes, scores)
normalized = normalize_prs(result["raw_prs"], population="EUR")

print(f"Matched: {result['matched_variants']}/{result['total_variants']}")
print(f"Percentile: {normalized['percentile']:.1f}")
print(f"Risk Category: {normalized['risk_category']}")
```

### 4. Generate Report

Create a clinical PDF report:

```python
from src.report_generator import generate_pdf_report

prs_results = {
    "breast_cancer": {"percentile": 85, "risk_category": "Elevated", ...},
    "cad": {"percentile": 45, "risk_category": "Average", ...},
}

generate_pdf_report(prs_results, user_info, "report.pdf")
```

## API Reference

### Modal Endpoint

Deploy serverless API with Modal:

```bash
modal deploy modal_app.py
```

**Endpoint:** `POST /compute_prs_web`

**Request:**
```json
{
  "file_content": "<base64 encoded file>",
  "filename": "my_dna.txt",
  "ancestry": "EUR"
}
```

**Response:**
```json
{
  "status": "success",
  "prs_results": {
    "cad": {
      "raw_prs": 0.542,
      "zscore": 0.89,
      "percentile": 81.3,
      "risk_category": "Elevated",
      "matched_variants": 4521,
      "total_variants": 6630
    },
    ...
  },
  "metadata": {
    "filename": "my_dna.txt",
    "format": "23andme",
    "build": "GRCh37",
    "ancestry": "EUR",
    "variant_count": 650000
  }
}
```

### Population Codes

| Code | Ancestry |
|------|----------|
| EUR | European |
| AFR | African |
| EAS | East Asian |
| SAS | South Asian |
| AMR | Latino/Admixed American |

### Risk Categories

| Percentile | Category | Color |
|------------|----------|-------|
| 0-10% | Very Low | Green |
| 10-25% | Low | Light Green |
| 25-75% | Average | Yellow |
| 75-90% | Elevated | Orange |
| 90-100% | High | Red |

## Local Development

### Environment Setup

```bash
# Install dev dependencies
pip install -r requirements.txt
pip install pytest pytest-cov black isort

# Format code
black src/ tests/
isort src/ tests/

# Run tests with coverage
pytest tests/ -v --cov=src --cov-report=html
```

### Running Modal Locally

```bash
# Serve locally (hot reload)
modal serve modal_app.py

# Deploy to Modal cloud
modal deploy modal_app.py
```

### Adding New Diseases

1. Find the PGS ID on [PGS Catalog](https://www.pgscatalog.org/)
2. Add entry to `DISEASE_CATALOG` in `src/pgscatalog.py`:

```python
DISEASE_CATALOG = {
    ...
    "new_disease": {
        "pgs_id": "PGS000XXX",
        "name": "New Disease Name",
        "category": "category_name",
    },
}
```

3. Add recommendations in `src/report_generator.py`

## Technical Details

### PRS Algorithm

```
PRS_raw = Σ(dosage_i × effect_weight_i)
PRS_zscore = (PRS_raw - population_mean) / population_sd
PRS_percentile = Φ(PRS_zscore)  # Standard normal CDF
```

Where:
- `dosage` = count of effect alleles (0, 1, or 2)
- `effect_weight` = log-odds ratio from GWAS
- Population parameters from ancestry-matched reference panels

### Variant Matching

1. **Primary**: Match by genomic position (chr:pos)
2. **Strand Flip Detection**: Check A/T ↔ T/A, C/G ↔ G/C complements
3. **Allele Alignment**: Ensure effect allele orientation matches

### Build Conversion

Uses [pyliftover](https://github.com/konstantint/pyliftover) for GRCh37 ↔ GRCh38 coordinate conversion with UCSC chain files.

## Limitations

- **Not for Clinical Diagnosis**: Results are for research/educational purposes only
- **Ancestry Bias**: Most PGS scores were developed in European populations
- **Environmental Factors**: Genetic risk doesn't account for lifestyle, diet, etc.
- **Variant Coverage**: Consumer genotyping arrays capture ~0.1% of genome

## References

- [PGS Catalog](https://www.pgscatalog.org/) - Source of validated polygenic scores
- [UK Biobank](https://www.ukbiobank.ac.uk/) - Population reference data
- [AHA 2019 Guidelines](https://www.ahajournals.org/) - Clinical risk thresholds
- [Lewis & Vassos 2020](https://doi.org/10.1038/s41576-020-0224-1) - PRS review

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

**This tool is NOT a medical diagnostic device.** Polygenic risk scores indicate genetic predisposition and do not account for lifestyle factors, family history, or environmental influences. Results should be interpreted by a qualified healthcare provider. Do not make medical decisions based solely on these results.

---

Built with [PGS Catalog](https://www.pgscatalog.org/) | [Gradio](https://gradio.app/) | [Modal](https://modal.com/)
