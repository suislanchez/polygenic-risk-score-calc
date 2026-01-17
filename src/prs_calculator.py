"""
Core Polygenic Risk Score (PRS) computation engine with ancestry adjustment.

Algorithm:
    PRS_raw = Σ(dosage[i] × effect_weight[i])
    PRS_zscore = (PRS_raw - pop_mean) / pop_sd
    PRS_percentile = scipy.stats.norm.cdf(PRS_zscore)
"""

import pandas as pd
import numpy as np
from scipy import stats
from typing import Optional

from .populations import get_population_params, get_risk_category
from .pgscatalog import load_scores_for_disease, DISEASE_CATALOG


COMPLEMENT = {"A": "T", "T": "A", "C": "G", "G": "C"}


def get_complement(allele: str) -> str:
    """Get the complement of an allele for strand flip detection."""
    return "".join(COMPLEMENT.get(b, b) for b in allele.upper())


def is_strand_flip(allele1: str, allele2: str) -> bool:
    """Check if two alleles are strand flips of each other."""
    return allele1.upper() == get_complement(allele2.upper())


def match_variants(genotypes_df: pd.DataFrame, scores_df: pd.DataFrame) -> pd.DataFrame:
    """
    Match genotyped variants to scoring file variants.

    Matching strategy:
    1. Primary: Match by chr:pos (most reliable for harmonized PGS files)
    2. Fallback: Match by rsid if available
    3. Handle strand flips by checking complements

    Args:
        genotypes_df: DataFrame with columns [rsid, chrom, pos, allele1, allele2, genotype]
        scores_df: DataFrame with columns [hm_chr, hm_pos, effect_allele,
                                           other_allele, effect_weight]

    Returns:
        DataFrame with matched variants including dosage calculations
    """
    # Normalize column names and types
    geno = genotypes_df.copy()
    scores = scores_df.copy()

    # Create chr:pos keys for matching (primary method for harmonized PGS files)
    geno["chr_pos"] = geno["chrom"].astype(str) + ":" + geno["pos"].astype(str)

    # Use harmonized coordinates if available, fall back to original
    if "hm_chr" in scores.columns and "hm_pos" in scores.columns:
        scores["chr_pos"] = scores["hm_chr"].astype(str) + ":" + scores["hm_pos"].astype(str)
    else:
        scores["chr_pos"] = scores["chr_name"].astype(str) + ":" + scores["chr_position"].astype(str)

    # Match by chr:pos (primary - works for harmonized files without rsIDs)
    matched = pd.merge(
        geno,
        scores,
        on="chr_pos",
        how="inner",
        suffixes=("_geno", "_score")
    )

    if len(matched) == 0:
        return pd.DataFrame()

    # Align effect alleles and calculate dosage
    matched["dosage"] = matched.apply(
        lambda row: compute_dosage(
            row["allele1"],
            row["allele2"],
            row["effect_allele"],
            row["other_allele"]
        ),
        axis=1
    )

    # Filter out variants where allele alignment failed
    matched = matched[matched["dosage"].notna()].copy()

    return matched


def compute_dosage(
    allele1: str,
    allele2: str,
    effect_allele: str,
    other_allele: str
) -> Optional[float]:
    """
    Compute effect allele dosage (0, 1, or 2) from genotype.

    Handles:
    - Direct allele matching
    - Strand flips (A/T -> T/A complement)
    - Missing data

    Args:
        allele1: First allele from genotype
        allele2: Second allele from genotype
        effect_allele: Effect allele from scoring file
        other_allele: Other/reference allele from scoring file

    Returns:
        Dosage (0.0, 1.0, or 2.0) or None if alleles don't match
    """
    if pd.isna(allele1) or pd.isna(allele2):
        return None

    a1 = str(allele1).upper()
    a2 = str(allele2).upper()
    eff = str(effect_allele).upper()
    oth = str(other_allele).upper()

    # Skip missing genotypes
    if a1 in ["-", "--", "0", ""] or a2 in ["-", "--", "0", ""]:
        return None

    genotype_alleles = {a1, a2}
    scoring_alleles = {eff, oth}

    # Direct match
    if genotype_alleles == scoring_alleles or genotype_alleles <= scoring_alleles:
        count = (1 if a1 == eff else 0) + (1 if a2 == eff else 0)
        return float(count)

    # Check for strand flip
    eff_comp = get_complement(eff)
    oth_comp = get_complement(oth)
    scoring_alleles_comp = {eff_comp, oth_comp}

    if genotype_alleles == scoring_alleles_comp or genotype_alleles <= scoring_alleles_comp:
        count = (1 if a1 == eff_comp else 0) + (1 if a2 == eff_comp else 0)
        return float(count)

    # Alleles don't match - variant may be multiallelic or have errors
    return None


def calculate_prs(genotypes_df: pd.DataFrame, scores_df: pd.DataFrame) -> dict:
    """
    Calculate raw Polygenic Risk Score from matched genotypes and weights.

    Args:
        genotypes_df: Parsed genotype DataFrame
        scores_df: Scoring file DataFrame with effect weights

    Returns:
        dict with:
            - matched_variants: Number of variants successfully matched
            - total_variants: Total variants in scoring file
            - match_rate: Percentage of variants matched
            - raw_prs: Raw PRS sum
            - matched_df: DataFrame of matched variants (for QC)
    """
    matched = match_variants(genotypes_df, scores_df)

    total_variants = len(scores_df)
    matched_variants = len(matched)

    if matched_variants == 0:
        return {
            "matched_variants": 0,
            "total_variants": total_variants,
            "match_rate": 0.0,
            "raw_prs": 0.0,
            "matched_df": pd.DataFrame()
        }

    # Calculate PRS: sum of dosage × effect_weight
    matched["weighted_dosage"] = matched["dosage"] * matched["effect_weight"]
    raw_prs = matched["weighted_dosage"].sum()

    return {
        "matched_variants": matched_variants,
        "total_variants": total_variants,
        "match_rate": matched_variants / total_variants * 100,
        "raw_prs": raw_prs,
        "matched_df": matched
    }


def normalize_prs(raw_prs: float, population: str = "EUR") -> dict:
    """
    Convert raw PRS to z-score and percentile using population-specific parameters.

    Args:
        raw_prs: Raw PRS sum from calculate_prs
        population: Ancestry code (EUR, AFR, EAS, AMR, SAS)

    Returns:
        dict with:
            - zscore: Population-normalized z-score
            - percentile: Population percentile (0-100)
            - risk_category: Clinical risk category
    """
    params = get_population_params(population)

    # Z-score normalization
    zscore = (raw_prs - params["mean"]) / params["sd"]

    # Convert to percentile using standard normal CDF
    percentile = stats.norm.cdf(zscore) * 100

    # Get risk category (returns dict, extract label)
    risk_info = get_risk_category(percentile)
    risk_category = risk_info["label"] if isinstance(risk_info, dict) else risk_info

    return {
        "zscore": zscore,
        "percentile": percentile,
        "risk_category": risk_category
    }


def compute_single_disease(
    genotypes_df: pd.DataFrame,
    disease: str,
    population: str = "EUR"
) -> dict:
    """
    Compute PRS for a single disease.

    Args:
        genotypes_df: Parsed genotype DataFrame
        disease: Disease name (must be in DISEASE_CATALOG)
        population: Ancestry code

    Returns:
        Complete PRS results dict
    """
    # Load scoring file for disease
    scores_df = load_scores_for_disease(disease)

    if scores_df is None or len(scores_df) == 0:
        return {
            "disease": disease,
            "error": f"Could not load scoring file for {disease}",
            "matched_variants": 0,
            "total_variants": 0,
            "match_rate": 0.0,
            "raw_prs": 0.0,
            "zscore": None,
            "percentile": None,
            "risk_category": "Unknown"
        }

    # Calculate raw PRS
    prs_result = calculate_prs(genotypes_df, scores_df)

    # Normalize
    if prs_result["matched_variants"] > 0:
        norm_result = normalize_prs(prs_result["raw_prs"], population)
    else:
        norm_result = {
            "zscore": None,
            "percentile": None,
            "risk_category": "Insufficient Data"
        }

    return {
        "disease": disease,
        "pgs_id": DISEASE_CATALOG.get(disease.lower()),
        "matched_variants": prs_result["matched_variants"],
        "total_variants": prs_result["total_variants"],
        "match_rate": prs_result["match_rate"],
        "raw_prs": prs_result["raw_prs"],
        "zscore": norm_result["zscore"],
        "percentile": norm_result["percentile"],
        "risk_category": norm_result["risk_category"]
    }


def compute_all_diseases(
    genotypes_df: pd.DataFrame,
    diseases: Optional[list] = None,
    population: str = "EUR"
) -> dict:
    """
    Compute PRS for multiple diseases.

    Args:
        genotypes_df: Parsed genotype DataFrame
        diseases: List of disease names. If None, computes all available diseases.
        population: Ancestry code (EUR, AFR, EAS, AMR, SAS)

    Returns:
        dict with:
            - population: Ancestry used for normalization
            - results: dict of disease -> PRS results
            - summary: Quick overview of top risks
    """
    if diseases is None:
        diseases = list(DISEASE_CATALOG.keys())

    results = {}
    for disease in diseases:
        results[disease] = compute_single_disease(genotypes_df, disease, population)

    # Generate summary of elevated risks
    elevated_risks = []
    for disease, result in results.items():
        if result.get("percentile") is not None and result["percentile"] >= 75:
            elevated_risks.append({
                "disease": disease,
                "percentile": result["percentile"],
                "risk_category": result["risk_category"]
            })

    # Sort by percentile descending
    elevated_risks.sort(key=lambda x: x["percentile"], reverse=True)

    return {
        "population": population,
        "results": results,
        "elevated_risks": elevated_risks[:5],  # Top 5
        "total_diseases_analyzed": len(results),
        "diseases_with_data": sum(1 for r in results.values() if r.get("percentile") is not None)
    }


def validate_prs_input(genotypes_df: pd.DataFrame) -> dict:
    """
    Validate genotype DataFrame has required columns and reasonable data.

    Returns:
        dict with validation status and any warnings
    """
    required_columns = {"rsid", "chrom", "pos", "allele1", "allele2"}

    warnings = []
    errors = []

    # Check columns
    missing_cols = required_columns - set(genotypes_df.columns)
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}")

    if errors:
        return {"valid": False, "errors": errors, "warnings": warnings}

    # Check data quality
    total_variants = len(genotypes_df)

    # Check for missing genotypes
    missing_genotypes = genotypes_df["allele1"].isna() | genotypes_df["allele2"].isna()
    missing_count = missing_genotypes.sum()
    if missing_count > 0:
        warnings.append(f"{missing_count} variants ({missing_count/total_variants*100:.1f}%) have missing genotypes")

    # Check for valid chromosomes
    valid_chroms = set(str(i) for i in range(1, 23)) | {"X", "Y", "MT", "M"}
    chrom_values = set(genotypes_df["chrom"].astype(str).str.upper())
    invalid_chroms = chrom_values - valid_chroms
    if invalid_chroms:
        warnings.append(f"Unusual chromosome values found: {invalid_chroms}")

    return {
        "valid": True,
        "total_variants": total_variants,
        "warnings": warnings,
        "errors": []
    }
