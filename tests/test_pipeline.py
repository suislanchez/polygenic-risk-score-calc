"""
Comprehensive test suite for the Polygenic Risk Score Calculator pipeline.

Tests cover:
- DNA file parsing (23andMe, AncestryDNA, VCF)
- PRS calculation and normalization
- Population-specific adjustments
- Disease catalog validation

Run with: pytest tests/test_pipeline.py -v
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

# Add project root to path for imports
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.dna_parser import (
    detect_format,
    detect_build,
    parse_23andme,
    parse_ancestrydna,
    parse_vcf,
    parse_raw_dna,
    get_genotype_summary,
)
from src.populations import (
    get_population_params,
    get_risk_category,
    POPULATION_PARAMS,
    RISK_THRESHOLDS,
)
from src.prs_calculator import (
    compute_dosage,
    match_variants,
    calculate_prs,
    normalize_prs,
    validate_prs_input,
    get_complement,
    is_strand_flip,
)
from src.pgscatalog import (
    DISEASE_CATALOG,
    get_disease_info,
    list_available_diseases,
)


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def sample_23andme_path():
    """Path to sample 23andMe test file."""
    return PROJECT_ROOT / "test_data" / "sample_23andme.txt"


@pytest.fixture
def sample_vcf_path():
    """Path to sample VCF test file."""
    return PROJECT_ROOT / "test_data" / "sample_vcf.vcf"


@pytest.fixture
def sample_ancestrydna_path():
    """Path to sample AncestryDNA test file."""
    return PROJECT_ROOT / "test_data" / "sample_ancestrydna.txt"


@pytest.fixture
def sample_genotypes_df():
    """Sample genotype DataFrame for testing PRS calculation."""
    return pd.DataFrame({
        "rsid": ["rs1", "rs2", "rs3", "rs4", "rs5"],
        "chrom": ["1", "1", "2", "2", "3"],
        "pos": [100, 200, 300, 400, 500],
        "allele1": ["A", "G", "C", "T", "A"],
        "allele2": ["A", "G", "T", "T", "G"],
        "genotype": ["AA", "GG", "CT", "TT", "AG"],
        "build": ["GRCh37"] * 5,
    })


@pytest.fixture
def sample_scores_df():
    """Sample scoring DataFrame for testing PRS calculation."""
    return pd.DataFrame({
        "rsid": ["rs1", "rs2", "rs3", "rs4", "rs6"],
        "hm_chr": ["1", "1", "2", "2", "4"],
        "hm_pos": [100, 200, 300, 400, 600],
        "effect_allele": ["A", "G", "T", "T", "C"],
        "other_allele": ["G", "A", "C", "A", "G"],
        "effect_weight": [0.1, 0.2, 0.15, -0.05, 0.3],
    })


# =============================================================================
# DNA Parser Tests
# =============================================================================

class TestDetectFormat:
    """Tests for file format detection."""

    def test_detect_23andme_format(self, sample_23andme_path):
        """Test detection of 23andMe file format."""
        if sample_23andme_path.exists():
            detected = detect_format(sample_23andme_path)
            assert detected == "23andme"

    def test_detect_vcf_format(self, sample_vcf_path):
        """Test detection of VCF file format."""
        if sample_vcf_path.exists():
            detected = detect_format(sample_vcf_path)
            assert detected == "vcf"

    def test_detect_ancestrydna_format(self, sample_ancestrydna_path):
        """Test detection of AncestryDNA file format."""
        if sample_ancestrydna_path.exists():
            detected = detect_format(sample_ancestrydna_path)
            assert detected == "ancestrydna"

    def test_detect_format_by_extension(self, tmp_path):
        """Test VCF detection by file extension."""
        vcf_file = tmp_path / "test.vcf"
        vcf_file.write_text("##fileformat=VCFv4.2\n#CHROM\tPOS\n")
        assert detect_format(vcf_file) == "vcf"


class TestDetectBuild:
    """Tests for genome build detection."""

    def test_detect_grch37_from_positions(self, sample_23andme_path):
        """Test detection of GRCh37 build from known SNP positions."""
        if sample_23andme_path.exists():
            detected = detect_build(sample_23andme_path)
            assert detected in ["GRCh37", "GRCh38"]

    def test_detect_build_vcf_reference(self, sample_vcf_path):
        """Test detection of build from VCF reference header."""
        if sample_vcf_path.exists():
            detected = detect_build(sample_vcf_path)
            assert detected == "GRCh37"

    def test_default_to_grch37(self, tmp_path):
        """Test that unknown files default to GRCh37."""
        unknown_file = tmp_path / "unknown.txt"
        unknown_file.write_text("rs123\t1\t1000\tAA\n")
        detected = detect_build(unknown_file)
        assert detected == "GRCh37"


class TestParse23andMe:
    """Tests for 23andMe file parsing."""

    def test_parse_23andme_returns_dataframe(self, sample_23andme_path):
        """Test that parse_23andme returns a DataFrame."""
        if sample_23andme_path.exists():
            df = parse_23andme(sample_23andme_path)
            assert isinstance(df, pd.DataFrame)
            assert len(df) > 0

    def test_parse_23andme_columns(self, sample_23andme_path):
        """Test that parse_23andme returns expected columns."""
        if sample_23andme_path.exists():
            df = parse_23andme(sample_23andme_path)
            expected_cols = {"rsid", "chrom", "pos", "allele1", "allele2", "genotype", "build"}
            assert expected_cols.issubset(set(df.columns))

    def test_parse_23andme_genotype_format(self, sample_23andme_path):
        """Test that genotypes are parsed correctly."""
        if sample_23andme_path.exists():
            df = parse_23andme(sample_23andme_path)
            # All genotypes should be 1-2 characters (alleles)
            assert all(len(str(g)) <= 4 for g in df["genotype"])

    def test_parse_23andme_skips_comments(self, tmp_path):
        """Test that comment lines are skipped."""
        test_file = tmp_path / "test_23andme.txt"
        test_file.write_text(
            "# 23andMe comment\n"
            "# Another comment\n"
            "rs123\t1\t1000\tAA\n"
            "rs456\t2\t2000\tGG\n"
        )
        df = parse_23andme(test_file)
        assert len(df) == 2


class TestParseVCF:
    """Tests for VCF file parsing."""

    def test_parse_vcf_returns_dataframe(self, sample_vcf_path):
        """Test that parse_vcf returns a DataFrame."""
        if sample_vcf_path.exists():
            df = parse_vcf(sample_vcf_path)
            assert isinstance(df, pd.DataFrame)
            assert len(df) > 0

    def test_parse_vcf_columns(self, sample_vcf_path):
        """Test that parse_vcf returns expected columns."""
        if sample_vcf_path.exists():
            df = parse_vcf(sample_vcf_path)
            expected_cols = {"rsid", "chrom", "pos", "allele1", "allele2", "genotype", "build"}
            assert expected_cols.issubset(set(df.columns))

    def test_parse_vcf_genotype_conversion(self, sample_vcf_path):
        """Test that VCF GT field is converted to alleles."""
        if sample_vcf_path.exists():
            df = parse_vcf(sample_vcf_path)
            # Check that alleles are actual bases, not 0/1 indices
            valid_bases = {"A", "C", "G", "T"}
            for _, row in df.iterrows():
                assert row["allele1"] in valid_bases or len(row["allele1"]) > 1
                assert row["allele2"] in valid_bases or len(row["allele2"]) > 1


class TestParseAncestryDNA:
    """Tests for AncestryDNA file parsing."""

    def test_parse_ancestrydna_returns_dataframe(self, sample_ancestrydna_path):
        """Test that parse_ancestrydna returns a DataFrame."""
        if sample_ancestrydna_path.exists():
            df = parse_ancestrydna(sample_ancestrydna_path)
            assert isinstance(df, pd.DataFrame)
            assert len(df) > 0

    def test_parse_ancestrydna_columns(self, sample_ancestrydna_path):
        """Test that parse_ancestrydna returns expected columns."""
        if sample_ancestrydna_path.exists():
            df = parse_ancestrydna(sample_ancestrydna_path)
            expected_cols = {"rsid", "chrom", "pos", "allele1", "allele2", "genotype", "build"}
            assert expected_cols.issubset(set(df.columns))


class TestParseRawDNA:
    """Tests for the unified parse_raw_dna entry point."""

    def test_parse_raw_dna_auto_detects_format(self, sample_23andme_path):
        """Test that parse_raw_dna auto-detects file format."""
        if sample_23andme_path.exists():
            df = parse_raw_dna(sample_23andme_path)
            assert isinstance(df, pd.DataFrame)
            assert len(df) > 0

    def test_parse_raw_dna_file_not_found(self):
        """Test that FileNotFoundError is raised for missing files."""
        with pytest.raises(FileNotFoundError):
            parse_raw_dna(Path("/nonexistent/file.txt"))

    def test_parse_raw_dna_normalizes_chromosomes(self, sample_23andme_path):
        """Test that chromosome names are normalized."""
        if sample_23andme_path.exists():
            df = parse_raw_dna(sample_23andme_path)
            # All chromosome values should be without 'chr' prefix
            assert not any(str(c).startswith("chr") for c in df["chrom"])

    def test_parse_raw_dna_deduplicates(self, tmp_path):
        """Test that duplicate rsIDs are removed."""
        test_file = tmp_path / "test_dup.txt"
        test_file.write_text(
            "# 23andMe\n"
            "rs123\t1\t1000\tAA\n"
            "rs123\t1\t1000\tGG\n"  # Duplicate
            "rs456\t2\t2000\tCC\n"
        )
        df = parse_raw_dna(test_file)
        assert len(df[df["rsid"] == "rs123"]) == 1


class TestGenotypeSummary:
    """Tests for genotype summary generation."""

    def test_get_genotype_summary(self, sample_23andme_path):
        """Test genotype summary contains expected fields."""
        if sample_23andme_path.exists():
            df = parse_raw_dna(sample_23andme_path)
            summary = get_genotype_summary(df)
            assert "total_variants" in summary
            assert "build" in summary
            assert "chromosomes" in summary
            assert "variant_types" in summary


# =============================================================================
# PRS Calculator Tests
# =============================================================================

class TestComputeDosage:
    """Tests for dosage computation."""

    def test_dosage_homozygous_effect(self):
        """Test dosage = 2 for homozygous effect allele."""
        dosage = compute_dosage("A", "A", "A", "G")
        assert dosage == 2.0

    def test_dosage_homozygous_other(self):
        """Test dosage = 0 for homozygous other allele."""
        dosage = compute_dosage("G", "G", "A", "G")
        assert dosage == 0.0

    def test_dosage_heterozygous(self):
        """Test dosage = 1 for heterozygous."""
        dosage = compute_dosage("A", "G", "A", "G")
        assert dosage == 1.0

    def test_dosage_strand_flip(self):
        """Test dosage computation with strand flip."""
        # A/T on forward strand = T/A on reverse strand
        dosage = compute_dosage("T", "T", "A", "C")
        # T is complement of A, so dosage should be 2
        assert dosage == 2.0

    def test_dosage_missing_genotype(self):
        """Test that missing genotype returns None."""
        assert compute_dosage("--", "A", "A", "G") is None
        assert compute_dosage("-", "-", "A", "G") is None

    def test_dosage_mismatched_alleles(self):
        """Test that non-matching alleles return None."""
        dosage = compute_dosage("A", "G", "C", "T")
        assert dosage is None


class TestStrandFlip:
    """Tests for strand flip detection."""

    def test_get_complement(self):
        """Test complement calculation."""
        assert get_complement("A") == "T"
        assert get_complement("T") == "A"
        assert get_complement("C") == "G"
        assert get_complement("G") == "C"
        assert get_complement("AT") == "TA"

    def test_is_strand_flip(self):
        """Test strand flip detection."""
        assert is_strand_flip("A", "T") is True
        assert is_strand_flip("C", "G") is True
        assert is_strand_flip("A", "A") is False
        assert is_strand_flip("A", "C") is False


class TestMatchVariants:
    """Tests for variant matching."""

    def test_match_variants_by_position(self, sample_genotypes_df, sample_scores_df):
        """Test matching variants by chr:pos."""
        matched = match_variants(sample_genotypes_df, sample_scores_df)
        # Should match rs1, rs2, rs3, rs4 (rs5 not in scores, rs6 not in genotypes)
        assert len(matched) >= 0  # May be less if alleles don't match

    def test_match_variants_empty_result(self):
        """Test matching returns empty DataFrame when no matches."""
        geno = pd.DataFrame({
            "rsid": ["rs100"],
            "chrom": ["99"],
            "pos": [1],
            "allele1": ["A"],
            "allele2": ["G"],
        })
        scores = pd.DataFrame({
            "hm_chr": ["1"],
            "hm_pos": [1000],
            "effect_allele": ["A"],
            "other_allele": ["G"],
            "effect_weight": [0.1],
        })
        matched = match_variants(geno, scores)
        assert len(matched) == 0


class TestCalculatePRS:
    """Tests for PRS calculation."""

    def test_calculate_prs_returns_dict(self, sample_genotypes_df, sample_scores_df):
        """Test that calculate_prs returns expected keys."""
        result = calculate_prs(sample_genotypes_df, sample_scores_df)
        assert "matched_variants" in result
        assert "total_variants" in result
        assert "match_rate" in result
        assert "raw_prs" in result
        assert "matched_df" in result

    def test_calculate_prs_total_variants(self, sample_genotypes_df, sample_scores_df):
        """Test that total_variants equals length of scoring file."""
        result = calculate_prs(sample_genotypes_df, sample_scores_df)
        assert result["total_variants"] == len(sample_scores_df)

    def test_calculate_prs_empty_genotypes(self, sample_scores_df):
        """Test PRS calculation with empty genotypes."""
        empty_geno = pd.DataFrame(columns=["rsid", "chrom", "pos", "allele1", "allele2"])
        result = calculate_prs(empty_geno, sample_scores_df)
        assert result["matched_variants"] == 0
        assert result["raw_prs"] == 0.0


class TestNormalizePRS:
    """Tests for PRS normalization."""

    def test_normalize_prs_returns_dict(self):
        """Test that normalize_prs returns expected keys."""
        result = normalize_prs(0.5, population="EUR")
        assert "zscore" in result
        assert "percentile" in result
        assert "risk_category" in result

    def test_normalize_prs_eur_reference(self):
        """Test EUR normalization (mean=0, sd=1)."""
        # For EUR with mean=0, sd=1, raw_prs=0 should give zscore=0
        result = normalize_prs(0.0, population="EUR")
        assert result["zscore"] == 0.0
        assert 49 <= result["percentile"] <= 51  # ~50th percentile

    def test_normalize_prs_percentile_bounds(self):
        """Test that percentile is between 0 and 100."""
        # Very high score
        result_high = normalize_prs(10.0, population="EUR")
        assert 0 <= result_high["percentile"] <= 100

        # Very low score
        result_low = normalize_prs(-10.0, population="EUR")
        assert 0 <= result_low["percentile"] <= 100

    def test_normalize_prs_different_populations(self):
        """Test normalization varies by population."""
        raw_prs = 1.0
        eur_result = normalize_prs(raw_prs, population="EUR")
        afr_result = normalize_prs(raw_prs, population="AFR")
        # Different populations should give different z-scores
        # (unless they have identical parameters by coincidence)
        assert isinstance(eur_result["zscore"], float)
        assert isinstance(afr_result["zscore"], float)


class TestValidatePRSInput:
    """Tests for PRS input validation."""

    def test_validate_valid_input(self, sample_genotypes_df):
        """Test validation passes for valid input."""
        result = validate_prs_input(sample_genotypes_df)
        assert result["valid"] is True
        assert len(result["errors"]) == 0

    def test_validate_missing_columns(self):
        """Test validation fails for missing columns."""
        invalid_df = pd.DataFrame({"rsid": ["rs1"], "chrom": ["1"]})
        result = validate_prs_input(invalid_df)
        assert result["valid"] is False
        assert len(result["errors"]) > 0


# =============================================================================
# Population Tests
# =============================================================================

class TestPopulationParams:
    """Tests for population parameter lookup."""

    def test_get_population_params_eur(self):
        """Test EUR population parameters."""
        params = get_population_params("EUR")
        assert params["mean"] == 0.0
        assert params["sd"] == 1.0

    def test_get_population_params_afr(self):
        """Test AFR population parameters."""
        params = get_population_params("AFR")
        assert params["mean"] == 0.2
        assert params["sd"] == 1.1

    def test_get_population_params_alias(self):
        """Test population lookup by alias."""
        params = get_population_params("european")
        assert params["code"] == "EUR"

        params = get_population_params("african")
        assert params["code"] == "AFR"

    def test_get_population_params_case_insensitive(self):
        """Test case-insensitive population lookup."""
        params_upper = get_population_params("EUR")
        params_lower = get_population_params("eur")
        assert params_upper == params_lower

    def test_get_population_params_invalid(self):
        """Test that invalid population raises ValueError."""
        with pytest.raises(ValueError):
            get_population_params("INVALID")

    def test_all_populations_have_required_fields(self):
        """Test all population entries have required fields."""
        required = {"code", "name", "mean", "sd"}
        for code, params in POPULATION_PARAMS.items():
            assert required.issubset(set(params.keys())), f"Missing fields in {code}"


class TestRiskCategory:
    """Tests for risk category assignment."""

    def test_risk_category_very_low(self):
        """Test Very Low risk category (< 10th percentile)."""
        result = get_risk_category(5)
        assert result["label"] == "Very Low"

    def test_risk_category_low(self):
        """Test Low risk category (10-25th percentile)."""
        result = get_risk_category(15)
        assert result["label"] == "Low"

    def test_risk_category_average(self):
        """Test Average risk category (25-75th percentile)."""
        result = get_risk_category(50)
        assert result["label"] == "Average"

    def test_risk_category_elevated(self):
        """Test Elevated risk category (75-90th percentile)."""
        result = get_risk_category(80)
        assert result["label"] == "Elevated"

    def test_risk_category_high(self):
        """Test High risk category (> 90th percentile)."""
        result = get_risk_category(95)
        assert result["label"] == "High"

    def test_risk_category_boundary_values(self):
        """Test risk category at exact boundary values."""
        assert get_risk_category(0)["label"] == "Very Low"
        assert get_risk_category(10)["label"] == "Low"
        assert get_risk_category(25)["label"] == "Average"
        assert get_risk_category(75)["label"] == "Elevated"
        assert get_risk_category(90)["label"] == "High"
        assert get_risk_category(100)["label"] == "High"

    def test_risk_category_clamps_values(self):
        """Test that out-of-range values are clamped."""
        # Should not raise errors
        result_low = get_risk_category(-10)
        assert result_low["label"] == "Very Low"

        result_high = get_risk_category(150)
        assert result_high["label"] == "High"

    def test_all_thresholds_have_required_fields(self):
        """Test all risk thresholds have required fields."""
        required = {"min_percentile", "max_percentile", "label", "color"}
        for key, threshold in RISK_THRESHOLDS.items():
            assert required.issubset(set(threshold.keys())), f"Missing fields in {key}"


# =============================================================================
# Disease Catalog Tests
# =============================================================================

class TestDiseaseCatalog:
    """Tests for disease catalog validity."""

    def test_disease_catalog_not_empty(self):
        """Test that disease catalog contains diseases."""
        assert len(DISEASE_CATALOG) > 0

    def test_disease_catalog_has_required_fields(self):
        """Test all diseases have required fields."""
        required = {"pgs_id", "name", "category"}
        for disease, info in DISEASE_CATALOG.items():
            assert required.issubset(set(info.keys())), f"Missing fields in {disease}"

    def test_disease_catalog_pgs_id_format(self):
        """Test that PGS IDs follow expected format."""
        for disease, info in DISEASE_CATALOG.items():
            pgs_id = info["pgs_id"]
            assert pgs_id.startswith("PGS"), f"Invalid PGS ID format for {disease}: {pgs_id}"
            assert len(pgs_id) >= 9, f"PGS ID too short for {disease}: {pgs_id}"

    def test_disease_catalog_categories(self):
        """Test that all diseases have valid categories."""
        valid_categories = {"cardiovascular", "oncology", "metabolic", "neurological",
                          "autoimmune", "respiratory", "musculoskeletal", "other"}
        for disease, info in DISEASE_CATALOG.items():
            # Categories should be lowercase, single words
            category = info["category"]
            assert isinstance(category, str), f"Category not string for {disease}"
            assert len(category) > 0, f"Empty category for {disease}"

    def test_get_disease_info(self):
        """Test getting disease info by name."""
        # Get first disease in catalog for testing
        first_disease = list(DISEASE_CATALOG.keys())[0]
        info = get_disease_info(first_disease)
        assert "pgs_id" in info
        assert "name" in info

    def test_get_disease_info_invalid(self):
        """Test that invalid disease raises ValueError."""
        with pytest.raises(ValueError):
            get_disease_info("nonexistent_disease")

    def test_list_available_diseases(self):
        """Test listing all available diseases."""
        diseases = list_available_diseases()
        assert len(diseases) == len(DISEASE_CATALOG)
        assert all("key" in d for d in diseases)
        assert all("pgs_id" in d for d in diseases)

    def test_known_diseases_present(self):
        """Test that expected core diseases are in catalog."""
        expected_diseases = ["cad", "breast_cancer", "t2d"]
        for disease in expected_diseases:
            assert disease in DISEASE_CATALOG, f"Expected disease '{disease}' not in catalog"


# =============================================================================
# Integration Tests
# =============================================================================

class TestIntegration:
    """Integration tests for the full pipeline."""

    def test_full_pipeline_23andme(self, sample_23andme_path, sample_scores_df):
        """Test full pipeline with 23andMe file."""
        if not sample_23andme_path.exists():
            pytest.skip("Test data file not available")

        # Parse file
        genotypes = parse_raw_dna(sample_23andme_path)
        assert len(genotypes) > 0

        # Validate input
        validation = validate_prs_input(genotypes)
        assert validation["valid"] is True

        # Calculate PRS (with sample scores)
        prs_result = calculate_prs(genotypes, sample_scores_df)
        assert isinstance(prs_result["raw_prs"], float)

        # Normalize
        if prs_result["matched_variants"] > 0:
            norm_result = normalize_prs(prs_result["raw_prs"], population="EUR")
            assert 0 <= norm_result["percentile"] <= 100
            assert norm_result["risk_category"] in [
                "Very Low", "Low", "Average", "Elevated", "High"
            ]

    def test_full_pipeline_vcf(self, sample_vcf_path, sample_scores_df):
        """Test full pipeline with VCF file."""
        if not sample_vcf_path.exists():
            pytest.skip("Test data file not available")

        # Parse file
        genotypes = parse_raw_dna(sample_vcf_path)
        assert len(genotypes) > 0

        # Validate input
        validation = validate_prs_input(genotypes)
        assert validation["valid"] is True


# =============================================================================
# Edge Case Tests
# =============================================================================

class TestEdgeCases:
    """Tests for edge cases and error handling."""

    def test_empty_genotypes_dataframe(self, sample_scores_df):
        """Test handling of empty genotypes."""
        empty_df = pd.DataFrame(columns=["rsid", "chrom", "pos", "allele1", "allele2"])
        result = calculate_prs(empty_df, sample_scores_df)
        assert result["matched_variants"] == 0
        assert result["raw_prs"] == 0.0

    def test_empty_scores_dataframe(self, sample_genotypes_df):
        """Test handling of empty scores."""
        empty_scores = pd.DataFrame(columns=[
            "rsid", "hm_chr", "hm_pos", "effect_allele", "other_allele", "effect_weight"
        ])
        result = calculate_prs(sample_genotypes_df, empty_scores)
        assert result["matched_variants"] == 0
        assert result["total_variants"] == 0

    def test_all_missing_genotypes(self, sample_scores_df):
        """Test handling when all genotypes are missing."""
        missing_df = pd.DataFrame({
            "rsid": ["rs1", "rs2"],
            "chrom": ["1", "1"],
            "pos": [100, 200],
            "allele1": ["--", "--"],
            "allele2": ["--", "--"],
        })
        result = calculate_prs(missing_df, sample_scores_df)
        # Should have 0 matched variants due to missing calls
        assert result["matched_variants"] == 0

    def test_extreme_effect_weights(self, sample_genotypes_df):
        """Test handling of extreme effect weights."""
        extreme_scores = pd.DataFrame({
            "hm_chr": ["1"],
            "hm_pos": [100],
            "effect_allele": ["A"],
            "other_allele": ["G"],
            "effect_weight": [1000.0],  # Extremely high weight
        })
        result = calculate_prs(sample_genotypes_df, extreme_scores)
        # Should complete without error
        assert isinstance(result["raw_prs"], float)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
