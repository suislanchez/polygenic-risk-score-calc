# Contributing to PRS Calculator

Thank you for your interest in contributing to PRS Calculator! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Python version, browser)
- **Sample data** if applicable (anonymized/synthetic only)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Use case** explaining why this enhancement would be useful
- **Proposed solution** with as much detail as possible
- **Alternatives considered** if any

### Adding New Disease Scores

To add a new PGS Catalog score:

1. Verify the score exists in [PGS Catalog](https://www.pgscatalog.org)
2. Add entry to `frontend/lib/diseaseData.js` with:
   - PGS ID
   - Disease name and category
   - Heritability estimate
   - Key genes
   - Risk factors and prevention strategies
3. Add population normalization parameters to `src/population_params.py`
4. Add test case to verify the score loads correctly

### Improving Documentation

Documentation improvements are always welcome:

- Fix typos or clarify existing documentation
- Add examples or tutorials
- Translate documentation to other languages
- Improve inline code comments

## Development Setup

### Backend (Python)

```bash
# Clone the repository
git clone https://github.com/suislanchez/polygenic-risk-score-calc.git
cd polygenic-risk-score-calc

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run tests
python -m pytest tests/

# Start local Gradio interface
python app.py
```

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

### Docker

```bash
# Build and run with Docker
docker build -t prs-calculator .
docker run -p 7860:7860 prs-calculator
```

## Pull Request Process

1. **Fork** the repository and create your branch from `main`
2. **Make changes** following the coding standards below
3. **Add tests** for any new functionality
4. **Update documentation** if needed
5. **Run tests** to ensure nothing is broken
6. **Submit PR** with a clear description of changes

### PR Title Format

Use conventional commit format:
- `feat: Add new disease score for X`
- `fix: Correct strand flip detection for A/T SNPs`
- `docs: Update methodology documentation`
- `refactor: Optimize variant matching performance`
- `test: Add tests for population normalization`

## Coding Standards

### Python

- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints for function signatures
- Write docstrings for public functions (Google style)
- Keep functions focused and under 50 lines when possible

```python
def compute_prs(variants: pd.DataFrame, weights: pd.DataFrame) -> float:
    """
    Compute polygenic risk score from variants and weights.

    Args:
        variants: DataFrame with columns ['chr', 'pos', 'allele1', 'allele2']
        weights: DataFrame with columns ['chr', 'pos', 'effect_allele', 'weight']

    Returns:
        Raw polygenic risk score as weighted sum of effect allele dosages.

    Raises:
        ValueError: If required columns are missing from input DataFrames.
    """
    # Implementation
```

### JavaScript/React

- Use functional components with hooks
- Follow ESLint configuration in the project
- Use descriptive variable and function names
- Keep components focused (single responsibility)

```javascript
// Good: Descriptive, focused component
function RiskCategoryBadge({ percentile }) {
  const category = getRiskCategory(percentile);
  return (
    <span className={`badge badge-${category.color}`}>
      {category.label}
    </span>
  );
}
```

## Testing

### Python Tests

```bash
# Run all tests
python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=src --cov-report=html

# Run specific test file
python -m pytest tests/test_prs_calculator.py -v
```

### Test Data

- Use synthetic/simulated genotype data for tests
- Never commit real user data
- Test edge cases (missing variants, strand flips, different file formats)

### What to Test

- Variant matching accuracy
- Dosage calculation (including strand flips)
- Population normalization
- File format parsing (23andMe, AncestryDNA, VCF)
- Error handling for malformed inputs

## Questions?

Feel free to open an issue for any questions about contributing. We're happy to help!

## Recognition

Contributors will be acknowledged in:
- The project README
- Release notes
- Academic publications (for substantial contributions)

Thank you for helping improve PRS Calculator!
