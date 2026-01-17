#!/usr/bin/env python3
"""Quick sanity test for the PRS pipeline."""

import sys

def test_imports():
    """Test all modules import correctly."""
    print("Testing imports...")

    from src import pgscatalog
    from src import populations
    from src import dna_parser
    from src import liftover
    from src import imputation
    from src import prs_calculator
    from src import report_generator

    print("  All imports OK")

def test_disease_catalog():
    """Test disease catalog is populated."""
    from src.pgscatalog import DISEASE_CATALOG, list_available_diseases

    diseases = list_available_diseases()
    print(f"  {len(diseases)} diseases available:")
    for d in diseases:
        print(f"    - {d['name']} ({d['pgs_id']})")

def test_populations():
    """Test population parameters."""
    from src.populations import get_population_params, get_risk_category

    print("  Population params:")
    for pop in ["EUR", "AFR", "EAS", "SAS", "AMR"]:
        params = get_population_params(pop)
        print(f"    {pop}: mean={params['mean']}, sd={params['sd']}")

    print("  Risk categories:")
    for pct in [5, 15, 50, 80, 95]:
        cat = get_risk_category(pct)
        print(f"    {pct}th percentile → {cat['label']}")

def test_download_score():
    """Test downloading a PGS scoring file."""
    from src.pgscatalog import load_scores_for_disease

    print("  Downloading breast cancer PRS (PGS000004)...")
    try:
        scores = load_scores_for_disease("breast_cancer", build="GRCh37")
        print(f"    Loaded {len(scores)} variants")
        print(f"    Columns: {list(scores.columns)}")
        print(f"    Effect weight range: {scores['effect_weight'].min():.4f} to {scores['effect_weight'].max():.4f}")
        return True
    except Exception as e:
        print(f"    Download failed (may need internet): {e}")
        return False

def main():
    print("=" * 60)
    print("PRS Pipeline Sanity Test")
    print("=" * 60)

    print("\n1. Testing imports...")
    test_imports()

    print("\n2. Disease catalog...")
    test_disease_catalog()

    print("\n3. Population parameters...")
    test_populations()

    print("\n4. Download test (requires internet)...")
    success = test_download_score()

    print("\n" + "=" * 60)
    if success:
        print("ALL TESTS PASSED - Pipeline ready!")
        print("\nNext steps:")
        print("  1. Run Gradio app: python app.py")
        print("  2. Upload a 23andMe file to test")
        print("  3. Deploy to Modal: modal deploy modal_app.py")
    else:
        print("PARTIAL SUCCESS - Imports work, but download needs internet")
    print("=" * 60)

if __name__ == "__main__":
    main()
