"""
Coordinate conversion between genome builds using pyliftover.

Supports conversion between GRCh37 (hg19) and GRCh38 (hg38).
"""

import os
from pathlib import Path
from typing import Optional, Tuple

import pandas as pd

try:
    from pyliftover import LiftOver
except ImportError:
    LiftOver = None

# Cache directory for chain files
CACHE_DIR = Path(__file__).parent.parent / "data" / "cache"

# UCSC chain file URLs
CHAIN_FILE_URLS = {
    ("GRCh37", "GRCh38"): "https://hgdownload.cse.ucsc.edu/goldenpath/hg19/liftOver/hg19ToHg38.over.chain.gz",
    ("GRCh38", "GRCh37"): "https://hgdownload.cse.ucsc.edu/goldenpath/hg38/liftOver/hg38ToHg19.over.chain.gz",
}

# Mapping between build names
BUILD_ALIASES = {
    "GRCh37": "hg19",
    "GRCh38": "hg38",
    "hg19": "GRCh37",
    "hg38": "GRCh38",
}

# Cache for LiftOver objects
_liftover_cache: dict = {}


def _normalize_build(build: str) -> str:
    """Normalize build name to GRCh format."""
    build = build.strip()
    if build in ("hg19", "b37", "build37"):
        return "GRCh37"
    if build in ("hg38", "b38", "build38"):
        return "GRCh38"
    return build


def get_chain_file(from_build: str, to_build: str) -> Path:
    """
    Get the chain file for coordinate conversion, downloading if needed.

    Args:
        from_build: Source build (GRCh37 or GRCh38)
        to_build: Target build (GRCh37 or GRCh38)

    Returns:
        Path to the chain file

    Raises:
        ValueError: If conversion is not supported
        RuntimeError: If download fails
    """
    from_build = _normalize_build(from_build)
    to_build = _normalize_build(to_build)

    if from_build == to_build:
        raise ValueError("Source and target builds are the same")

    key = (from_build, to_build)
    if key not in CHAIN_FILE_URLS:
        raise ValueError(f"Unsupported conversion: {from_build} -> {to_build}")

    # Ensure cache directory exists
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Chain file path
    chain_filename = f"{BUILD_ALIASES.get(from_build, from_build)}To{BUILD_ALIASES.get(to_build, to_build).capitalize()}.over.chain.gz"
    chain_path = CACHE_DIR / chain_filename

    # Download if not cached
    if not chain_path.exists():
        import requests

        url = CHAIN_FILE_URLS[key]
        print(f"Downloading chain file from {url}...")

        try:
            response = requests.get(url, stream=True, timeout=60)
            response.raise_for_status()

            with open(chain_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            print(f"Chain file saved to {chain_path}")
        except Exception as e:
            # Clean up partial download
            if chain_path.exists():
                chain_path.unlink()
            raise RuntimeError(f"Failed to download chain file: {e}")

    return chain_path


def _get_liftover(from_build: str, to_build: str) -> "LiftOver":
    """Get or create a LiftOver object for the given conversion."""
    if LiftOver is None:
        raise ImportError("pyliftover is required for coordinate conversion. Install with: pip install pyliftover")

    from_build = _normalize_build(from_build)
    to_build = _normalize_build(to_build)

    key = (from_build, to_build)

    if key not in _liftover_cache:
        chain_path = get_chain_file(from_build, to_build)
        _liftover_cache[key] = LiftOver(str(chain_path))

    return _liftover_cache[key]


def liftover_position(
    chrom: str,
    pos: int,
    from_build: str,
    to_build: str
) -> Optional[Tuple[str, int]]:
    """
    Convert a single genomic position between builds.

    Args:
        chrom: Chromosome (e.g., "1", "X", "MT")
        pos: 1-based genomic position
        from_build: Source build (GRCh37 or GRCh38)
        to_build: Target build (GRCh37 or GRCh38)

    Returns:
        Tuple of (new_chrom, new_pos) or None if position cannot be mapped
    """
    from_build = _normalize_build(from_build)
    to_build = _normalize_build(to_build)

    if from_build == to_build:
        return (chrom, pos)

    lo = _get_liftover(from_build, to_build)

    # Normalize chromosome name for UCSC format
    chrom_ucsc = chrom
    if not chrom_ucsc.startswith("chr"):
        chrom_ucsc = f"chr{chrom}"

    # Handle mitochondrial chromosome
    if chrom_ucsc in ("chrMT", "chrM"):
        chrom_ucsc = "chrM"

    # pyliftover uses 0-based coordinates
    pos_0based = pos - 1

    try:
        result = lo.convert_coordinate(chrom_ucsc, pos_0based)
    except Exception:
        return None

    if not result:
        return None

    # Take the first (best) mapping
    new_chrom, new_pos, strand, score = result[0]

    # Convert back to 1-based coordinates
    new_pos = new_pos + 1

    # Remove chr prefix for consistency
    new_chrom = new_chrom.replace("chr", "")
    if new_chrom == "M":
        new_chrom = "MT"

    return (new_chrom, new_pos)


def liftover_dataframe(
    df: pd.DataFrame,
    target_build: str,
    source_build_col: str = "build",
    chrom_col: str = "chrom",
    pos_col: str = "pos"
) -> pd.DataFrame:
    """
    Add lifted coordinates to a DataFrame.

    Adds new columns with lifted positions without modifying original coordinates.

    Args:
        df: DataFrame with genomic positions
        target_build: Target build (GRCh37 or GRCh38)
        source_build_col: Column containing source build information
        chrom_col: Column containing chromosome
        pos_col: Column containing position

    Returns:
        DataFrame with additional columns: lifted_chrom, lifted_pos, lift_success
    """
    target_build = _normalize_build(target_build)

    # Copy to avoid modifying original
    df = df.copy()

    # Initialize new columns
    df["lifted_chrom"] = None
    df["lifted_pos"] = None
    df["lift_success"] = False

    # Get source build
    if source_build_col in df.columns:
        source_builds = df[source_build_col].unique()
        if len(source_builds) > 1:
            raise ValueError("DataFrame contains multiple source builds. Process each separately.")
        source_build = _normalize_build(str(source_builds[0]))
    else:
        raise ValueError(f"Source build column '{source_build_col}' not found in DataFrame")

    # If already in target build, copy coordinates
    if source_build == target_build:
        df["lifted_chrom"] = df[chrom_col]
        df["lifted_pos"] = df[pos_col]
        df["lift_success"] = True
        return df

    # Perform liftover
    print(f"Lifting {len(df)} variants from {source_build} to {target_build}...")

    success_count = 0
    for idx, row in df.iterrows():
        chrom = str(row[chrom_col])
        pos = int(row[pos_col])

        result = liftover_position(chrom, pos, source_build, target_build)

        if result is not None:
            df.at[idx, "lifted_chrom"] = result[0]
            df.at[idx, "lifted_pos"] = result[1]
            df.at[idx, "lift_success"] = True
            success_count += 1

    print(f"Successfully lifted {success_count}/{len(df)} variants ({100*success_count/len(df):.1f}%)")

    return df


def ensure_build(
    df: pd.DataFrame,
    target_build: str,
    source_build_col: str = "build",
    chrom_col: str = "chrom",
    pos_col: str = "pos"
) -> pd.DataFrame:
    """
    Ensure DataFrame coordinates are in the target build.

    Converts coordinates if needed and updates the position columns in place.
    Removes variants that cannot be mapped.

    Args:
        df: DataFrame with genomic positions
        target_build: Target build (GRCh37 or GRCh38)
        source_build_col: Column containing source build information
        chrom_col: Column containing chromosome
        pos_col: Column containing position

    Returns:
        DataFrame with coordinates converted to target build
    """
    target_build = _normalize_build(target_build)

    # Get source build
    if source_build_col in df.columns and len(df) > 0:
        source_build = _normalize_build(str(df[source_build_col].iloc[0]))
    else:
        # Assume GRCh37 if not specified
        source_build = "GRCh37"

    # If already in target build, return as-is
    if source_build == target_build:
        return df.copy()

    # Perform liftover
    df_lifted = liftover_dataframe(
        df,
        target_build,
        source_build_col=source_build_col,
        chrom_col=chrom_col,
        pos_col=pos_col
    )

    # Filter to successful lifts only
    df_result = df_lifted[df_lifted["lift_success"]].copy()

    # Update coordinates
    df_result[chrom_col] = df_result["lifted_chrom"]
    df_result[pos_col] = df_result["lifted_pos"].astype(int)
    df_result[source_build_col] = target_build

    # Drop temporary columns
    df_result = df_result.drop(columns=["lifted_chrom", "lifted_pos", "lift_success"])

    # Reset index
    df_result = df_result.reset_index(drop=True)

    unmapped = len(df) - len(df_result)
    if unmapped > 0:
        print(f"Removed {unmapped} variants that could not be mapped to {target_build}")

    return df_result


def batch_liftover(
    positions: list[Tuple[str, int]],
    from_build: str,
    to_build: str
) -> list[Optional[Tuple[str, int]]]:
    """
    Convert multiple positions efficiently.

    Args:
        positions: List of (chrom, pos) tuples
        from_build: Source build
        to_build: Target build

    Returns:
        List of (new_chrom, new_pos) tuples or None for unmapped positions
    """
    from_build = _normalize_build(from_build)
    to_build = _normalize_build(to_build)

    if from_build == to_build:
        return list(positions)

    results = []
    for chrom, pos in positions:
        result = liftover_position(chrom, pos, from_build, to_build)
        results.append(result)

    return results


def get_liftover_stats(df_original: pd.DataFrame, df_lifted: pd.DataFrame) -> dict:
    """
    Get statistics about a liftover operation.

    Args:
        df_original: Original DataFrame before liftover
        df_lifted: DataFrame after liftover (with lift_success column)

    Returns:
        Dict with liftover statistics
    """
    total = len(df_original)
    if "lift_success" in df_lifted.columns:
        success = df_lifted["lift_success"].sum()
    else:
        success = len(df_lifted)

    return {
        "total_variants": total,
        "successfully_lifted": int(success),
        "failed_to_lift": total - int(success),
        "success_rate": success / total if total > 0 else 0.0
    }
