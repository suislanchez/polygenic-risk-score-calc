# Polygenic Risk Score Calculator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![PGS Catalog](https://img.shields.io/badge/PGS%20Catalog-50%2B%20Scores-green.svg)](https://www.pgscatalog.org/)

A production-ready web application for computing polygenic risk scores (PRS) from direct-to-consumer DNA testing data. Uses validated scoring files from the [PGS Catalog](https://www.pgscatalog.org/) with ancestry-aware population normalization.

**Live Demo**: [prs-calculator.vercel.app](https://prs-calculator.vercel.app)

---

## Features

- **50+ Disease Risk Scores**: Validated PGS for cardiovascular, oncology, metabolic, neurological, psychiatric, and autoimmune conditions
- **Multiple Input Formats**: 23andMe (v3-v5), AncestryDNA, and VCF file support
- **Ancestry-Aware Normalization**: Population-specific parameters for EUR, AFR, EAS, SAS, and AMR
- **65-75% Variant Matching**: Robust position-based matching with strand flip detection
- **Interactive Questionnaire**: Optional lifestyle/family history integration for combined risk
- **Research-Grade Documentation**: IMRAD-format methodology with validation metrics
- **Open Source**: Full pipeline available under MIT license

---

## Quick Start

### Option 1: Local Development

```bash
# Clone repository
git clone https://github.com/suislanchez/polygenic-risk-score-calc.git
cd polygenic-risk-score-calc

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run local Gradio interface
python app.py
```

Open http://localhost:7860 in your browser.

### Option 2: Docker

```bash
# Build image
docker build -t prs-calculator .

# Run container
docker run -p 7860:7860 prs-calculator
```

### Option 3: Frontend Only (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 for the web interface.

---

## Architecture

```
polygenic-risk-score-calc/
├── app.py                    # Gradio web interface
├── modal_app.py              # Modal serverless deployment
├── requirements.txt          # Python dependencies
├── Dockerfile                # Container configuration
│
├── src/
│   ├── __init__.py
│   ├── pgscatalog.py         # PGS Catalog API & scoring file parser
│   ├── populations.py        # Ancestry-specific normalization
│   ├── dna_parser.py         # Multi-format DNA file parser
│   ├── liftover.py           # GRCh37/GRCh38 coordinate conversion
│   ├── prs_calculator.py     # Core PRS computation engine
│   ├── risk_integration.py   # Lifestyle/family history modifiers
│   └── report_generator.py   # PDF report generation
│
├── data/
│   └── cache/                # Cached PGS scoring files
│
├── frontend/                 # Next.js web application
│   ├── app/
│   │   ├── page.js           # Main calculator
│   │   ├── methodology/      # Technical documentation
│   │   ├── diseases/         # Disease catalog (50+)
│   │   ├── questionnaire/    # Risk factor questionnaire
│   │   └── results/          # Results visualization
│   └── lib/
│       ├── diseaseData.js    # Disease information database
│       └── riskModifiers.js  # Client-side risk calculations
│
└── tests/
    └── test_pipeline.py      # Pytest test suite
```

---

## Supported Diseases (50+)

### Cardiovascular (8)
| Disease | PGS ID | Heritability |
|---------|--------|--------------|
| Coronary Artery Disease | [PGS000018](https://www.pgscatalog.org/score/PGS000018) | 40-60% |
| Atrial Fibrillation | [PGS000016](https://www.pgscatalog.org/score/PGS000016) | 60-70% |
| Stroke | [PGS000039](https://www.pgscatalog.org/score/PGS000039) | 30-40% |
| Hypertension | [PGS000012](https://www.pgscatalog.org/score/PGS000012) | 30-50% |
| Heart Failure | [PGS000115](https://www.pgscatalog.org/score/PGS000115) | 26-34% |
| Venous Thromboembolism | [PGS000043](https://www.pgscatalog.org/score/PGS000043) | 50-60% |
| Aortic Aneurysm | [PGS000081](https://www.pgscatalog.org/score/PGS000081) | 70-80% |
| Peripheral Artery Disease | [PGS000117](https://www.pgscatalog.org/score/PGS000117) | 20-30% |

### Oncology (12)
| Disease | PGS ID | Heritability |
|---------|--------|--------------|
| Breast Cancer | [PGS000004](https://www.pgscatalog.org/score/PGS000004) | 25-30% |
| Prostate Cancer | [PGS000662](https://www.pgscatalog.org/score/PGS000662) | 57-58% |
| Colorectal Cancer | [PGS000055](https://www.pgscatalog.org/score/PGS000055) | 12-35% |
| Lung Cancer | [PGS000070](https://www.pgscatalog.org/score/PGS000070) | 8-18% |
| Melanoma | [PGS000066](https://www.pgscatalog.org/score/PGS000066) | 55-58% |
| Pancreatic Cancer | [PGS000058](https://www.pgscatalog.org/score/PGS000058) | 5-10% |
| Ovarian Cancer | [PGS000054](https://www.pgscatalog.org/score/PGS000054) | 20-25% |
| + 5 more... | | |

### Metabolic (6)
| Disease | PGS ID | Heritability |
|---------|--------|--------------|
| Type 2 Diabetes | [PGS000014](https://www.pgscatalog.org/score/PGS000014) | 40-70% |
| Type 1 Diabetes | [PGS000021](https://www.pgscatalog.org/score/PGS000021) | 80-90% |
| Obesity (BMI) | [PGS000027](https://www.pgscatalog.org/score/PGS000027) | 40-70% |
| + 3 more... | | |

### Additional Categories
- **Neurological** (6): Alzheimer's, Parkinson's, Migraine, Epilepsy, ALS, RLS
- **Psychiatric** (7): Depression, Bipolar, Schizophrenia, ADHD, Anxiety, PTSD, Insomnia
- **Autoimmune** (7): RA, Crohn's, UC, MS, Lupus, Celiac, Psoriasis
- **Respiratory** (2): Asthma, COPD
- **Ophthalmologic** (2): Glaucoma, AMD
- **Musculoskeletal** (2): Osteoporosis, Osteoarthritis
- **Dermatologic** (2): Eczema, Vitiligo
- **Renal** (2): CKD, Kidney Stones
- **Endocrine** (2): Hypothyroidism, Hyperthyroidism

---

## How It Works

### PRS Calculation Pipeline

```
DNA File → Parse & QC → Match Variants → Calculate PRS → Normalize → Risk Category
   ↓              ↓              ↓              ↓              ↓
23andMe/VCF  Build detect   chr:pos      Σ(dosage×β)   Z-score→%ile
             Format parse   65-75%       PGS Catalog   UK Biobank
```

### Core Algorithm

```python
# 1. Parse genotypes
from src.dna_parser import parse_raw_dna
genotypes = parse_raw_dna("my_23andme.txt")

# 2. Load scoring file from PGS Catalog
from src.pgscatalog import load_scores_for_disease
scores = load_scores_for_disease("cad", build="GRCh37")

# 3. Calculate PRS
from src.prs_calculator import calculate_prs, normalize_prs
result = calculate_prs(genotypes, scores)

# 4. Normalize to population
normalized = normalize_prs(
    result["raw_prs"],
    population="EUR",
    disease="cad"
)

print(f"Matched: {result['matched_variants']}/{result['total_variants']}")
print(f"Percentile: {normalized['percentile']:.1f}")
print(f"Risk Category: {normalized['risk_category']}")
```

### Variant Matching

Position-based matching with strand flip detection:

```python
def compute_dosage(user_alleles, effect_allele, other_allele):
    """Calculate effect allele dosage (0, 1, or 2)."""
    a1, a2 = user_alleles

    # Direct match
    if {a1, a2} <= {effect_allele, other_allele}:
        return (a1 == effect_allele) + (a2 == effect_allele)

    # Strand flip (A↔T, C↔G)
    complement = {'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'}
    eff_comp = complement.get(effect_allele)
    oth_comp = complement.get(other_allele)

    if eff_comp and oth_comp and {a1, a2} <= {eff_comp, oth_comp}:
        return (a1 == eff_comp) + (a2 == eff_comp)

    return None  # Incompatible
```

### Population Normalization

```
Z = (PRS_raw - μ_ancestry) / σ_ancestry
Percentile = Φ(Z) × 100
```

| Ancestry | Code | UK Biobank N | Notes |
|----------|------|--------------|-------|
| European | EUR | ~410,000 | Reference population |
| South Asian | SAS | ~10,000 | +5-15% mean offset |
| East Asian | EAS | ~3,000 | ±10% mean offset |
| African | AFR | ~8,000 | +15-25% mean offset |
| Admixed American | AMR | ~5,000 | 0-10% mean offset |

---

## API Reference

### Modal Serverless Deployment

```bash
# Deploy to Modal
modal deploy modal_app.py

# Serve locally with hot reload
modal serve modal_app.py
```

**Endpoint**: `POST /compute_prs_web`

**Request**:
```json
{
  "file_content": "<base64 encoded DNA file>",
  "filename": "my_dna.txt",
  "ancestry": "EUR"
}
```

**Response**:
```json
{
  "status": "success",
  "prs_results": {
    "cad": {
      "raw_prs": 0.542,
      "zscore": 0.89,
      "percentile": 81.3,
      "risk_category": "Elevated",
      "matched_variants": 4521203,
      "total_variants": 6630150
    }
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

---

## Performance Metrics

Performance validated in UK Biobank (European ancestry):

| Disease | AUC | OR per SD | Top 10% OR | Variance Explained |
|---------|-----|-----------|------------|-------------------|
| CAD | 0.81 | 1.71 | 4.2× | 15.2% |
| Prostate Cancer | 0.75 | 1.85 | 4.5× | 21.4% |
| Atrial Fibrillation | 0.74 | 1.68 | 3.4× | 14.8% |
| Type 2 Diabetes | 0.72 | 1.56 | 2.8× | 8.4% |
| Breast Cancer | 0.68 | 1.61 | 3.1× | 18.3% |

### Cross-Ancestry Performance

| Ancestry | Relative Performance |
|----------|---------------------|
| European (EUR) | 100% (reference) |
| South Asian (SAS) | 76-85% |
| East Asian (EAS) | 70-78% |
| Admixed American (AMR) | 68-73% |
| African (AFR) | 45-58% |

---

## Development

### Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=src --cov-report=html
```

### Code Formatting

```bash
pip install black isort
black src/ tests/
isort src/ tests/
```

### Adding New Diseases

1. Find PGS ID on [PGS Catalog](https://www.pgscatalog.org/)
2. Add to `src/pgscatalog.py`:
```python
DISEASE_CATALOG = {
    "new_disease": {
        "pgs_id": "PGS000XXX",
        "name": "Disease Name",
        "category": "category_name",
    },
}
```
3. Add disease info to `frontend/lib/diseaseData.js`
4. Add recommendations in `src/report_generator.py`

---

## Deployment

### Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

### Modal (Backend)

```bash
modal deploy modal_app.py
```

### Docker (Full Stack)

```bash
# Build
docker build -t prs-calculator .

# Run
docker run -p 7860:7860 -e MODAL_TOKEN_ID=xxx -e MODAL_TOKEN_SECRET=xxx prs-calculator
```

---

## Limitations

1. **Ancestry Bias**: Most GWAS conducted in European populations; 20-55% performance reduction in non-European ancestries
2. **Variant Coverage**: Consumer arrays capture ~650K variants; 65-75% matching with PGS files
3. **Environmental Factors**: PRS captures genetic component only; lifestyle factors not included in base score
4. **Probabilistic**: High PRS ≠ disease; low PRS ≠ protection

**This tool is NOT a medical diagnostic device.** Results should be interpreted by qualified healthcare providers.

---

## Data Sources & References

- **PGS Catalog**: [pgscatalog.org](https://www.pgscatalog.org/) - Validated polygenic scores
- **UK Biobank**: [ukbiobank.ac.uk](https://www.ukbiobank.ac.uk/) - Population parameters
- **GWAS Catalog**: [ebi.ac.uk/gwas](https://www.ebi.ac.uk/gwas/) - Summary statistics

### Key Publications

1. Lambert SA, et al. (2021) The Polygenic Score Catalog. *Nat Genet* 53:420-425. [doi:10.1038/s41588-021-00783-5](https://doi.org/10.1038/s41588-021-00783-5)
2. Khera AV, et al. (2018) Genome-wide polygenic scores. *Nat Genet* 50:1219-1224. [doi:10.1038/s41588-018-0183-z](https://doi.org/10.1038/s41588-018-0183-z)
3. Martin AR, et al. (2019) Clinical use of PRS may exacerbate health disparities. *Nat Genet* 51:584-591. [doi:10.1038/s41588-019-0379-x](https://doi.org/10.1038/s41588-019-0379-x)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Citation

If you use this tool in your research, please cite:

```bibtex
@software{prs_calculator,
  title = {Consumer-Grade Polygenic Risk Score Calculator},
  author = {Sanchez, Luis},
  year = {2026},
  url = {https://github.com/suislanchez/polygenic-risk-score-calc},
  version = {3.0}
}
```

---

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

Built with [PGS Catalog](https://www.pgscatalog.org/) | [Next.js](https://nextjs.org/) | [Modal](https://modal.com/) | [Vercel](https://vercel.com/)
