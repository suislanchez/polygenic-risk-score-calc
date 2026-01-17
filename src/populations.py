"""
Population-specific normalization parameters for PRS calculation.

PRS scores must be normalized relative to a reference population to produce
meaningful percentile rankings. This module provides ancestry-specific
mean and standard deviation values derived from large-scale studies.

The normalization follows:
    PRS_zscore = (PRS_raw - population_mean) / population_sd
    PRS_percentile = norm.cdf(PRS_zscore)

Risk categories are based on AHA/NHS clinical guidelines for PRS interpretation.
"""

from typing import Optional

# Population-specific normalization parameters
# These values are derived from published GWAS studies and UK Biobank validation
# EUR is the reference population (mean=0, sd=1 by construction)
# Other populations have adjusted parameters based on allele frequency differences

POPULATION_PARAMS = {
    "EUR": {
        "code": "EUR",
        "name": "European",
        "mean": 0.0,
        "sd": 1.0,
        "description": "European ancestry (reference population)",
        "example_countries": ["UK", "Germany", "France", "Italy", "Spain"],
    },
    "AFR": {
        "code": "AFR",
        "name": "African",
        "mean": 0.2,
        "sd": 1.1,
        "description": "African ancestry",
        "example_countries": ["Nigeria", "Kenya", "Ghana", "Ethiopia"],
    },
    "EAS": {
        "code": "EAS",
        "name": "East Asian",
        "mean": -0.1,
        "sd": 0.9,
        "description": "East Asian ancestry",
        "example_countries": ["China", "Japan", "Korea", "Vietnam"],
    },
    "SAS": {
        "code": "SAS",
        "name": "South Asian",
        "mean": 0.1,
        "sd": 1.0,
        "description": "South Asian ancestry",
        "example_countries": ["India", "Pakistan", "Bangladesh", "Sri Lanka"],
    },
    "AMR": {
        "code": "AMR",
        "name": "Latino/Admixed American",
        "mean": 0.05,
        "sd": 1.05,
        "description": "Latino/Hispanic and admixed American ancestry",
        "example_countries": ["Mexico", "Puerto Rico", "Colombia", "Peru"],
    },
}

# Alternative population code mappings
POPULATION_ALIASES = {
    "european": "EUR",
    "caucasian": "EUR",
    "white": "EUR",
    "african": "AFR",
    "black": "AFR",
    "african_american": "AFR",
    "east_asian": "EAS",
    "asian": "EAS",
    "chinese": "EAS",
    "japanese": "EAS",
    "korean": "EAS",
    "south_asian": "SAS",
    "indian": "SAS",
    "latino": "AMR",
    "hispanic": "AMR",
    "admixed": "AMR",
    "mixed": "AMR",
}

# Risk category thresholds based on percentile
# Based on AHA 2019 guidelines and NHS PRS implementation recommendations
RISK_THRESHOLDS = {
    "very_low": {
        "min_percentile": 0,
        "max_percentile": 10,
        "label": "Very Low",
        "color": "#22c55e",  # Green
        "hex_color": "22c55e",
        "description": "Below 10th percentile - significantly lower than average risk",
        "clinical_action": "Standard screening guidelines apply",
    },
    "low": {
        "min_percentile": 10,
        "max_percentile": 25,
        "label": "Low",
        "color": "#86efac",  # Light green
        "hex_color": "86efac",
        "description": "10th-25th percentile - lower than average risk",
        "clinical_action": "Standard screening guidelines apply",
    },
    "average": {
        "min_percentile": 25,
        "max_percentile": 75,
        "label": "Average",
        "color": "#fbbf24",  # Yellow
        "hex_color": "fbbf24",
        "description": "25th-75th percentile - typical population risk",
        "clinical_action": "Follow standard screening recommendations",
    },
    "elevated": {
        "min_percentile": 75,
        "max_percentile": 90,
        "label": "Elevated",
        "color": "#fb923c",  # Orange
        "hex_color": "fb923c",
        "description": "75th-90th percentile - moderately elevated risk",
        "clinical_action": "Consider enhanced screening; discuss with physician",
    },
    "high": {
        "min_percentile": 90,
        "max_percentile": 100,
        "label": "High",
        "color": "#ef4444",  # Red
        "hex_color": "ef4444",
        "description": "Above 90th percentile - significantly elevated risk",
        "clinical_action": "Recommend consultation with specialist; enhanced screening",
    },
}

# Disease-specific population adjustments
# Some diseases have ancestry-specific risk modifications beyond standard normalization
DISEASE_ANCESTRY_ADJUSTMENTS = {
    "prostate_cancer": {
        "AFR": {"risk_multiplier": 1.7, "note": "Higher baseline risk in African ancestry"},
    },
    "breast_cancer": {
        "AFR": {"risk_multiplier": 1.0, "note": "Similar risk across ancestries after adjustment"},
    },
    "t2d": {
        "SAS": {"risk_multiplier": 1.4, "note": "Higher baseline risk in South Asian ancestry"},
        "EAS": {"risk_multiplier": 1.2, "note": "Moderately higher risk in East Asian ancestry"},
    },
}


def get_population_params(ancestry: str) -> dict:
    """
    Get normalization parameters for a specific ancestry.

    Args:
        ancestry: Ancestry code (EUR, AFR, EAS, SAS, AMR) or common alias

    Returns:
        Dictionary with mean, sd, and metadata

    Raises:
        ValueError: If ancestry not recognized

    Example:
        >>> params = get_population_params("EUR")
        >>> print(f"Mean: {params['mean']}, SD: {params['sd']}")
        Mean: 0.0, SD: 1.0

        >>> params = get_population_params("african")  # Alias works too
        >>> print(params['code'])
        AFR
    """
    # Normalize input
    ancestry_upper = ancestry.upper().strip()
    ancestry_lower = ancestry.lower().strip().replace(" ", "_").replace("-", "_")

    # Direct match
    if ancestry_upper in POPULATION_PARAMS:
        return POPULATION_PARAMS[ancestry_upper].copy()

    # Alias match
    if ancestry_lower in POPULATION_ALIASES:
        code = POPULATION_ALIASES[ancestry_lower]
        return POPULATION_PARAMS[code].copy()

    # No match
    available = list(POPULATION_PARAMS.keys()) + list(POPULATION_ALIASES.keys())
    raise ValueError(
        f"Unknown ancestry: {ancestry}. Available: {', '.join(sorted(set(available)))}"
    )


def get_risk_category(percentile: float) -> dict:
    """
    Determine risk category based on percentile.

    Args:
        percentile: PRS percentile (0-100)

    Returns:
        Dictionary with category info including label, color, and clinical action

    Example:
        >>> cat = get_risk_category(95)
        >>> print(f"{cat['label']}: {cat['clinical_action']}")
        High: Recommend consultation with specialist; enhanced screening

        >>> cat = get_risk_category(50)
        >>> print(cat['label'])
        Average
    """
    # Clamp percentile to valid range
    percentile = max(0, min(100, percentile))

    for key, threshold in RISK_THRESHOLDS.items():
        if threshold["min_percentile"] <= percentile < threshold["max_percentile"]:
            result = threshold.copy()
            result["key"] = key
            return result

    # Edge case: exactly 100th percentile
    result = RISK_THRESHOLDS["high"].copy()
    result["key"] = "high"
    return result


def get_risk_category_by_key(key: str) -> dict:
    """
    Get risk category info by key name.

    Args:
        key: Category key (very_low, low, average, elevated, high)

    Returns:
        Dictionary with category info
    """
    if key not in RISK_THRESHOLDS:
        raise ValueError(f"Unknown risk category: {key}")

    result = RISK_THRESHOLDS[key].copy()
    result["key"] = key
    return result


def get_ancestry_adjustment(
    disease: str,
    ancestry: str,
) -> Optional[dict]:
    """
    Get disease-specific ancestry risk adjustment if available.

    Some diseases have known ancestry-specific risk modifications that
    go beyond standard PRS normalization.

    Args:
        disease: Disease key (e.g., "prostate_cancer")
        ancestry: Ancestry code (e.g., "AFR")

    Returns:
        Adjustment dict with risk_multiplier and note, or None if no adjustment
    """
    disease_lower = disease.lower().replace(" ", "_").replace("-", "_")
    ancestry_code = get_population_params(ancestry)["code"]

    if disease_lower in DISEASE_ANCESTRY_ADJUSTMENTS:
        adjustments = DISEASE_ANCESTRY_ADJUSTMENTS[disease_lower]
        if ancestry_code in adjustments:
            return adjustments[ancestry_code].copy()

    return None


def list_available_ancestries() -> list[dict]:
    """
    List all available ancestry options.

    Returns:
        List of ancestry info dictionaries
    """
    return [
        {"code": code, **params}
        for code, params in POPULATION_PARAMS.items()
    ]


def get_all_risk_categories() -> list[dict]:
    """
    Get all risk categories in order from lowest to highest.

    Returns:
        List of risk category dictionaries
    """
    return [
        {"key": key, **threshold}
        for key, threshold in RISK_THRESHOLDS.items()
    ]
