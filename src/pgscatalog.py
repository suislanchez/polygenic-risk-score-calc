"""
PGSCatalog API client and scoring file parser.

Downloads and parses validated Polygenic Risk Score files from PGSCatalog
(https://www.pgscatalog.org/). Supports harmonized scoring files for both
GRCh37 and GRCh38 genome builds.
"""

import gzip
import logging
from pathlib import Path
from typing import Optional

import pandas as pd
import requests

logger = logging.getLogger(__name__)

# PGSCatalog API endpoints
PGSCATALOG_API_BASE = "https://www.pgscatalog.org/rest"
PGSCATALOG_FTP_BASE = "https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores"

# Cache directory for downloaded scoring files
CACHE_DIR = Path(__file__).parent.parent / "data" / "cache"

# Disease catalog: maps disease names to PGS IDs
# These are high-quality, validated scores from PGSCatalog
# Expanded to 50 diseases across multiple categories
DISEASE_CATALOG = {
    # =====================
    # CARDIOVASCULAR (8)
    # =====================
    "cad": {
        "pgs_id": "PGS000018",
        "name": "Coronary Artery Disease",
        "category": "cardiovascular",
    },
    "afib": {
        "pgs_id": "PGS000016",
        "name": "Atrial Fibrillation",
        "category": "cardiovascular",
    },
    "stroke": {
        "pgs_id": "PGS000039",
        "name": "Stroke",
        "category": "cardiovascular",
    },
    "hypertension": {
        "pgs_id": "PGS000012",
        "name": "Hypertension",
        "category": "cardiovascular",
    },
    "heart_failure": {
        "pgs_id": "PGS000115",
        "name": "Heart Failure",
        "category": "cardiovascular",
    },
    "venous_thromboembolism": {
        "pgs_id": "PGS000043",
        "name": "Venous Thromboembolism",
        "category": "cardiovascular",
    },
    "aortic_aneurysm": {
        "pgs_id": "PGS000081",
        "name": "Aortic Aneurysm",
        "category": "cardiovascular",
    },
    "peripheral_artery_disease": {
        "pgs_id": "PGS000117",
        "name": "Peripheral Artery Disease",
        "category": "cardiovascular",
    },
    # =====================
    # ONCOLOGY (12)
    # =====================
    "breast_cancer": {
        "pgs_id": "PGS000004",
        "name": "Breast Cancer",
        "category": "oncology",
    },
    "prostate_cancer": {
        "pgs_id": "PGS000662",
        "name": "Prostate Cancer",
        "category": "oncology",
    },
    "colorectal_cancer": {
        "pgs_id": "PGS000055",
        "name": "Colorectal Cancer",
        "category": "oncology",
    },
    "lung_cancer": {
        "pgs_id": "PGS000070",
        "name": "Lung Cancer",
        "category": "oncology",
    },
    "pancreatic_cancer": {
        "pgs_id": "PGS000058",
        "name": "Pancreatic Cancer",
        "category": "oncology",
    },
    "ovarian_cancer": {
        "pgs_id": "PGS000054",
        "name": "Ovarian Cancer",
        "category": "oncology",
    },
    "melanoma": {
        "pgs_id": "PGS000066",
        "name": "Melanoma",
        "category": "oncology",
    },
    "bladder_cancer": {
        "pgs_id": "PGS000068",
        "name": "Bladder Cancer",
        "category": "oncology",
    },
    "kidney_cancer": {
        "pgs_id": "PGS000074",
        "name": "Kidney Cancer",
        "category": "oncology",
    },
    "thyroid_cancer": {
        "pgs_id": "PGS000082",
        "name": "Thyroid Cancer",
        "category": "oncology",
    },
    "endometrial_cancer": {
        "pgs_id": "PGS000061",
        "name": "Endometrial Cancer",
        "category": "oncology",
    },
    "testicular_cancer": {
        "pgs_id": "PGS000078",
        "name": "Testicular Cancer",
        "category": "oncology",
    },
    # =====================
    # METABOLIC (6)
    # =====================
    "t2d": {
        "pgs_id": "PGS000014",
        "name": "Type 2 Diabetes",
        "category": "metabolic",
    },
    "t1d": {
        "pgs_id": "PGS000021",
        "name": "Type 1 Diabetes",
        "category": "metabolic",
    },
    "obesity": {
        "pgs_id": "PGS000027",
        "name": "Obesity (BMI)",
        "category": "metabolic",
    },
    "gout": {
        "pgs_id": "PGS000048",
        "name": "Gout",
        "category": "metabolic",
    },
    "nafld": {
        "pgs_id": "PGS000113",
        "name": "Non-Alcoholic Fatty Liver Disease",
        "category": "metabolic",
    },
    "hyperlipidemia": {
        "pgs_id": "PGS000688",
        "name": "Hyperlipidemia",
        "category": "metabolic",
    },
    # =====================
    # NEUROLOGICAL (6)
    # =====================
    "alzheimers": {
        "pgs_id": "PGS000334",
        "name": "Alzheimer's Disease",
        "category": "neurological",
    },
    "parkinsons": {
        "pgs_id": "PGS000089",
        "name": "Parkinson's Disease",
        "category": "neurological",
    },
    "migraine": {
        "pgs_id": "PGS000040",
        "name": "Migraine",
        "category": "neurological",
    },
    "epilepsy": {
        "pgs_id": "PGS000086",
        "name": "Epilepsy",
        "category": "neurological",
    },
    "als": {
        "pgs_id": "PGS000093",
        "name": "Amyotrophic Lateral Sclerosis",
        "category": "neurological",
    },
    "restless_legs": {
        "pgs_id": "PGS000088",
        "name": "Restless Legs Syndrome",
        "category": "neurological",
    },
    # =====================
    # PSYCHIATRIC (7)
    # =====================
    "depression": {
        "pgs_id": "PGS000297",
        "name": "Major Depression",
        "category": "psychiatric",
    },
    "bipolar_disorder": {
        "pgs_id": "PGS000049",
        "name": "Bipolar Disorder",
        "category": "psychiatric",
    },
    "schizophrenia": {
        "pgs_id": "PGS000052",
        "name": "Schizophrenia",
        "category": "psychiatric",
    },
    "adhd": {
        "pgs_id": "PGS000091",
        "name": "ADHD",
        "category": "psychiatric",
    },
    "anxiety": {
        "pgs_id": "PGS000099",
        "name": "Anxiety Disorder",
        "category": "psychiatric",
    },
    "ptsd": {
        "pgs_id": "PGS000100",
        "name": "PTSD",
        "category": "psychiatric",
    },
    "insomnia": {
        "pgs_id": "PGS000108",
        "name": "Insomnia",
        "category": "psychiatric",
    },
    # =====================
    # AUTOIMMUNE (7)
    # =====================
    "rheumatoid_arthritis": {
        "pgs_id": "PGS000024",
        "name": "Rheumatoid Arthritis",
        "category": "autoimmune",
    },
    "crohns_disease": {
        "pgs_id": "PGS000025",
        "name": "Crohn's Disease",
        "category": "autoimmune",
    },
    "ulcerative_colitis": {
        "pgs_id": "PGS000026",
        "name": "Ulcerative Colitis",
        "category": "autoimmune",
    },
    "multiple_sclerosis": {
        "pgs_id": "PGS000028",
        "name": "Multiple Sclerosis",
        "category": "autoimmune",
    },
    "lupus": {
        "pgs_id": "PGS000030",
        "name": "Systemic Lupus Erythematosus",
        "category": "autoimmune",
    },
    "celiac_disease": {
        "pgs_id": "PGS000035",
        "name": "Celiac Disease",
        "category": "autoimmune",
    },
    "psoriasis": {
        "pgs_id": "PGS000036",
        "name": "Psoriasis",
        "category": "autoimmune",
    },
    # =====================
    # RESPIRATORY (2)
    # =====================
    "asthma": {
        "pgs_id": "PGS000019",
        "name": "Asthma",
        "category": "respiratory",
    },
    "copd": {
        "pgs_id": "PGS000116",
        "name": "COPD",
        "category": "respiratory",
    },
    # =====================
    # OPHTHALMOLOGIC (2)
    # =====================
    "glaucoma": {
        "pgs_id": "PGS000042",
        "name": "Glaucoma",
        "category": "ophthalmologic",
    },
    "macular_degeneration": {
        "pgs_id": "PGS000056",
        "name": "Age-Related Macular Degeneration",
        "category": "ophthalmologic",
    },
    # =====================
    # MUSCULOSKELETAL (2)
    # =====================
    "osteoporosis": {
        "pgs_id": "PGS000045",
        "name": "Osteoporosis",
        "category": "musculoskeletal",
    },
    "osteoarthritis": {
        "pgs_id": "PGS000107",
        "name": "Osteoarthritis",
        "category": "musculoskeletal",
    },
    # =====================
    # DERMATOLOGIC (2)
    # =====================
    "eczema": {
        "pgs_id": "PGS000037",
        "name": "Atopic Dermatitis / Eczema",
        "category": "dermatologic",
    },
    "vitiligo": {
        "pgs_id": "PGS000034",
        "name": "Vitiligo",
        "category": "dermatologic",
    },
    # =====================
    # RENAL (2)
    # =====================
    "chronic_kidney_disease": {
        "pgs_id": "PGS000110",
        "name": "Chronic Kidney Disease",
        "category": "renal",
    },
    "kidney_stones": {
        "pgs_id": "PGS000112",
        "name": "Kidney Stones",
        "category": "renal",
    },
    # =====================
    # ENDOCRINE (2)
    # =====================
    "hypothyroidism": {
        "pgs_id": "PGS000095",
        "name": "Hypothyroidism",
        "category": "endocrine",
    },
    "hyperthyroidism": {
        "pgs_id": "PGS000096",
        "name": "Hyperthyroidism",
        "category": "endocrine",
    },
}


def get_score_metadata(pgs_id: str) -> dict:
    """
    Fetch score metadata from PGSCatalog REST API.

    Args:
        pgs_id: PGS Catalog score ID (e.g., "PGS000018")

    Returns:
        Dictionary containing score metadata including:
        - id: PGS ID
        - name: Score name
        - trait_reported: Trait description
        - variants_number: Number of variants in score
        - ftp_scoring_file: URL to scoring file

    Raises:
        requests.HTTPError: If API request fails
    """
    url = f"{PGSCATALOG_API_BASE}/score/{pgs_id}"

    logger.info(f"Fetching metadata for {pgs_id}")
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    data = response.json()

    return {
        "id": data.get("id"),
        "name": data.get("name"),
        "trait_reported": data.get("trait_reported"),
        "trait_efo": [t.get("id") for t in data.get("trait_efo", [])],
        "variants_number": data.get("variants_number"),
        "publication": data.get("publication", {}).get("id"),
        "ftp_scoring_file": data.get("ftp_scoring_file"),
        "ftp_harmonized_scoring_files": data.get("ftp_harmonized_scoring_files", {}),
    }


def _get_harmonized_file_url(pgs_id: str, build: str = "GRCh37") -> str:
    """
    Construct URL for harmonized scoring file.

    Args:
        pgs_id: PGS Catalog score ID
        build: Genome build ("GRCh37" or "GRCh38")

    Returns:
        URL to harmonized scoring file
    """
    # Harmonized files follow this pattern:
    # https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/PGS000018/ScoringFiles/Harmonized/
    # PGS000018_hmPOS_GRCh37.txt.gz

    return (
        f"{PGSCATALOG_FTP_BASE}/{pgs_id}/ScoringFiles/Harmonized/"
        f"{pgs_id}_hmPOS_{build}.txt.gz"
    )


def download_scoring_file(
    pgs_id: str,
    build: str = "GRCh37",
    force: bool = False,
) -> Path:
    """
    Download harmonized scoring file from PGSCatalog.

    Files are cached locally to avoid repeated downloads.

    Args:
        pgs_id: PGS Catalog score ID (e.g., "PGS000018")
        build: Genome build ("GRCh37" or "GRCh38")
        force: If True, re-download even if cached

    Returns:
        Path to downloaded (and decompressed) scoring file

    Raises:
        requests.HTTPError: If download fails
        ValueError: If invalid build specified
    """
    if build not in ("GRCh37", "GRCh38"):
        raise ValueError(f"Invalid build: {build}. Must be 'GRCh37' or 'GRCh38'")

    # Ensure cache directory exists
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Local file path (decompressed)
    local_path = CACHE_DIR / f"{pgs_id}_{build}.txt"

    # Return cached file if exists
    if local_path.exists() and not force:
        logger.info(f"Using cached file: {local_path}")
        return local_path

    # Download file
    url = _get_harmonized_file_url(pgs_id, build)
    logger.info(f"Downloading {pgs_id} ({build}) from {url}")

    response = requests.get(url, timeout=120, stream=True)
    response.raise_for_status()

    # Decompress and save
    compressed_path = CACHE_DIR / f"{pgs_id}_{build}.txt.gz"

    with open(compressed_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

    # Decompress
    with gzip.open(compressed_path, "rt") as f_in:
        with open(local_path, "w") as f_out:
            f_out.write(f_in.read())

    # Remove compressed file
    compressed_path.unlink()

    logger.info(f"Downloaded and cached: {local_path}")
    return local_path


def parse_scoring_file(filepath: Path) -> pd.DataFrame:
    """
    Parse a PGSCatalog harmonized scoring file.

    Harmonized files have a header section (lines starting with #)
    followed by tab-separated variant data.

    Args:
        filepath: Path to scoring file

    Returns:
        DataFrame with columns:
        - rsid: dbSNP rsID (may be None for some variants)
        - chr_name: Chromosome
        - chr_position: Position (1-based)
        - effect_allele: Effect allele
        - other_allele: Other/reference allele
        - effect_weight: Effect weight (beta or log-OR)
        - hm_chr: Harmonized chromosome
        - hm_pos: Harmonized position
    """
    # Read file and skip header lines
    header_lines = []
    data_start = 0

    with open(filepath, "r") as f:
        for i, line in enumerate(f):
            if line.startswith("#"):
                header_lines.append(line.strip())
                data_start = i + 1
            else:
                break

    # Parse header metadata
    metadata = {}
    for line in header_lines:
        if "=" in line:
            key, value = line.lstrip("#").split("=", 1)
            metadata[key.strip()] = value.strip()

    # Read data
    df = pd.read_csv(
        filepath,
        sep="\t",
        skiprows=data_start,
        low_memory=False,
    )

    # Standardize column names (handle variations in PGS files)
    column_mapping = {
        "rsID": "rsid",
        "chr_name": "chr_name",
        "chr_position": "chr_position",
        "effect_allele": "effect_allele",
        "other_allele": "other_allele",
        "reference_allele": "other_allele",
        "effect_weight": "effect_weight",
        "hm_chr": "hm_chr",
        "hm_pos": "hm_pos",
        "hm_inferOtherAllele": "hm_infer_other_allele",
    }

    df = df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns})

    # Use harmonized coordinates if available
    if "hm_chr" in df.columns and "hm_pos" in df.columns:
        # Fill missing harmonized values with original
        if "chr_name" in df.columns:
            df["hm_chr"] = df["hm_chr"].fillna(df["chr_name"])
        if "chr_position" in df.columns:
            df["hm_pos"] = df["hm_pos"].fillna(df["chr_position"])

    # Ensure effect_weight is numeric
    df["effect_weight"] = pd.to_numeric(df["effect_weight"], errors="coerce")

    # Drop rows with missing essential data
    essential_cols = ["effect_allele", "effect_weight"]
    df = df.dropna(subset=essential_cols)

    # Add metadata as attributes
    df.attrs["pgs_metadata"] = metadata

    logger.info(f"Parsed {len(df)} variants from {filepath}")

    return df


def load_scores_for_disease(
    disease: str,
    build: str = "GRCh37",
    force_download: bool = False,
) -> pd.DataFrame:
    """
    Load PRS scoring file for a specific disease.

    This is the main entry point for loading disease-specific scores.
    It handles the mapping from disease name to PGS ID, downloading,
    and parsing.

    Args:
        disease: Disease name (e.g., "breast_cancer", "cad", "t2d")
        build: Genome build ("GRCh37" or "GRCh38")
        force_download: If True, re-download even if cached

    Returns:
        DataFrame with scoring weights ready for PRS calculation

    Raises:
        ValueError: If disease not in catalog

    Example:
        >>> scores = load_scores_for_disease("breast_cancer")
        >>> print(f"Loaded {len(scores)} variants")
        Loaded 313 variants
    """
    disease_lower = disease.lower().replace(" ", "_").replace("-", "_")

    if disease_lower not in DISEASE_CATALOG:
        available = ", ".join(DISEASE_CATALOG.keys())
        raise ValueError(
            f"Unknown disease: {disease}. Available: {available}"
        )

    disease_info = DISEASE_CATALOG[disease_lower]
    pgs_id = disease_info["pgs_id"]

    logger.info(f"Loading scores for {disease_info['name']} ({pgs_id})")

    # Download if needed
    filepath = download_scoring_file(pgs_id, build=build, force=force_download)

    # Parse file
    df = parse_scoring_file(filepath)

    # Add disease metadata
    df.attrs["disease"] = disease_info["name"]
    df.attrs["disease_key"] = disease_lower
    df.attrs["pgs_id"] = pgs_id
    df.attrs["category"] = disease_info["category"]

    return df


def get_all_disease_scores(
    build: str = "GRCh37",
    diseases: Optional[list] = None,
) -> dict[str, pd.DataFrame]:
    """
    Load scoring files for multiple diseases.

    Args:
        build: Genome build ("GRCh37" or "GRCh38")
        diseases: List of disease names, or None for all

    Returns:
        Dictionary mapping disease names to scoring DataFrames
    """
    if diseases is None:
        diseases = list(DISEASE_CATALOG.keys())

    scores = {}
    for disease in diseases:
        try:
            scores[disease] = load_scores_for_disease(disease, build=build)
        except Exception as e:
            logger.error(f"Failed to load scores for {disease}: {e}")
            continue

    return scores


def get_disease_info(disease: str) -> dict:
    """
    Get metadata for a disease from the catalog.

    Args:
        disease: Disease name

    Returns:
        Dictionary with disease metadata
    """
    disease_lower = disease.lower().replace(" ", "_").replace("-", "_")

    if disease_lower not in DISEASE_CATALOG:
        raise ValueError(f"Unknown disease: {disease}")

    return DISEASE_CATALOG[disease_lower].copy()


def list_available_diseases() -> list[dict]:
    """
    List all available diseases in the catalog.

    Returns:
        List of disease info dictionaries
    """
    return [
        {"key": k, **v}
        for k, v in DISEASE_CATALOG.items()
    ]
