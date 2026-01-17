"""
Unified DNA parser for consumer genetic test formats.

Supports:
- 23andMe raw data files
- AncestryDNA raw data files
- VCF (Variant Call Format) files
"""

import re
import gzip
from pathlib import Path
from typing import Optional

import pandas as pd


# Known SNP positions for build detection heuristics
# These are well-characterized SNPs with known positions in each build
BUILD_DETECTION_SNPS = {
    # rsid: {GRCh37: (chrom, pos), GRCh38: (chrom, pos)}
    "rs7412": {"GRCh37": ("19", 45412079), "GRCh38": ("19", 44908822)},
    "rs429358": {"GRCh37": ("19", 45411941), "GRCh38": ("19", 44908684)},
    "rs1801133": {"GRCh37": ("1", 11856378), "GRCh38": ("1", 11796321)},
    "rs12913832": {"GRCh37": ("15", 28365618), "GRCh38": ("15", 28120472)},
    "rs1426654": {"GRCh37": ("15", 48426484), "GRCh38": ("15", 48134287)},
}


def _open_file(filepath: Path):
    """Open a file, handling gzip compression if present."""
    filepath = Path(filepath)
    if filepath.suffix == ".gz" or str(filepath).endswith(".gz"):
        return gzip.open(filepath, "rt", encoding="utf-8", errors="replace")
    return open(filepath, "r", encoding="utf-8", errors="replace")


def detect_format(filepath: Path) -> str:
    """
    Detect the format of a genetic data file.

    Args:
        filepath: Path to the genetic data file

    Returns:
        One of: "23andme", "ancestrydna", "vcf"

    Raises:
        ValueError: If format cannot be determined
    """
    filepath = Path(filepath)

    # Check file extension first
    name_lower = filepath.name.lower()
    if name_lower.endswith(".vcf") or name_lower.endswith(".vcf.gz"):
        return "vcf"

    with _open_file(filepath) as f:
        # Read first 50 lines to detect format
        header_lines = []
        data_lines = []

        for i, line in enumerate(f):
            if i >= 100:
                break
            line = line.strip()
            if not line:
                continue
            if line.startswith("#"):
                header_lines.append(line)
            else:
                data_lines.append(line)
                if len(data_lines) >= 10:
                    break

    # Check for VCF format
    for line in header_lines:
        if line.startswith("##fileformat=VCF"):
            return "vcf"

    # Check for 23andMe format
    for line in header_lines:
        if "23andMe" in line or "23andme" in line.lower():
            return "23andme"

    # Check for AncestryDNA format
    for line in header_lines:
        if "AncestryDNA" in line or "ancestrydna" in line.lower():
            return "ancestrydna"

    # Try to detect from data structure
    if data_lines:
        first_data = data_lines[0].split("\t")
        if len(first_data) == 0:
            first_data = data_lines[0].split(",")

        # 23andMe format: rsid, chromosome, position, genotype
        # AncestryDNA format: rsid, chromosome, position, allele1, allele2
        if len(first_data) == 4:
            # Could be 23andMe (rsid, chr, pos, genotype)
            if first_data[0].startswith("rs") or first_data[0].startswith("i"):
                return "23andme"
        elif len(first_data) == 5:
            # Could be AncestryDNA (rsid, chr, pos, allele1, allele2)
            if first_data[0].startswith("rs") or first_data[0].startswith("i"):
                return "ancestrydna"

    # Default fallback - try 23andMe parser
    return "23andme"


def detect_build(filepath: Path) -> str:
    """
    Detect the genome build (GRCh37/GRCh38) of a genetic data file.

    Uses header hints if available, otherwise uses position heuristics
    based on well-known SNPs.

    Args:
        filepath: Path to the genetic data file

    Returns:
        Either "GRCh37" or "GRCh38"
    """
    filepath = Path(filepath)

    with _open_file(filepath) as f:
        header_lines = []
        data_lines = []

        for i, line in enumerate(f):
            if i >= 5000:  # Read enough to find detection SNPs
                break
            line = line.strip()
            if not line:
                continue
            if line.startswith("#"):
                header_lines.append(line)
            else:
                data_lines.append(line)

    # Check headers for build information
    for line in header_lines:
        line_lower = line.lower()
        if "grch38" in line_lower or "hg38" in line_lower or "build 38" in line_lower:
            return "GRCh38"
        if "grch37" in line_lower or "hg19" in line_lower or "build 37" in line_lower:
            return "GRCh37"
        # VCF reference genome header
        if "##reference" in line_lower:
            if "38" in line:
                return "GRCh38"
            if "37" in line or "19" in line:
                return "GRCh37"

    # Use position heuristics
    grch37_matches = 0
    grch38_matches = 0

    for line in data_lines:
        parts = line.split("\t")
        if len(parts) < 3:
            parts = line.split(",")
        if len(parts) < 3:
            continue

        rsid = parts[0].strip()
        if rsid in BUILD_DETECTION_SNPS:
            try:
                chrom = str(parts[1]).strip().replace("chr", "")
                pos = int(parts[2])

                expected = BUILD_DETECTION_SNPS[rsid]
                if expected["GRCh37"][0] == chrom and expected["GRCh37"][1] == pos:
                    grch37_matches += 1
                elif expected["GRCh38"][0] == chrom and expected["GRCh38"][1] == pos:
                    grch38_matches += 1
            except (ValueError, IndexError):
                continue

    if grch38_matches > grch37_matches:
        return "GRCh38"

    # Default to GRCh37 (most common for consumer tests)
    return "GRCh37"


def parse_23andme(filepath: Path) -> pd.DataFrame:
    """
    Parse a 23andMe raw data file.

    Format: Tab-separated with columns:
    rsid, chromosome, position, genotype

    Args:
        filepath: Path to the 23andMe file

    Returns:
        DataFrame with columns: rsid, chrom, pos, allele1, allele2, genotype, build
    """
    filepath = Path(filepath)
    build = detect_build(filepath)

    rows = []
    with _open_file(filepath) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            parts = line.split("\t")
            if len(parts) < 4:
                continue

            rsid = parts[0].strip()
            chrom = parts[1].strip().replace("chr", "")
            try:
                pos = int(parts[2])
            except ValueError:
                continue
            genotype = parts[3].strip().upper()

            # Handle missing/no-call data
            if genotype in ("--", "-", "00", "NN", ""):
                continue

            # Parse genotype into alleles
            if len(genotype) == 1:
                # Haploid (MT, Y, or X in males)
                allele1 = genotype
                allele2 = genotype
            elif len(genotype) == 2:
                allele1 = genotype[0]
                allele2 = genotype[1]
            else:
                # Indels or complex variants
                allele1 = genotype
                allele2 = genotype

            rows.append({
                "rsid": rsid,
                "chrom": chrom,
                "pos": pos,
                "allele1": allele1,
                "allele2": allele2,
                "genotype": genotype,
                "build": build
            })

    df = pd.DataFrame(rows)
    if len(df) == 0:
        return pd.DataFrame(columns=["rsid", "chrom", "pos", "allele1", "allele2", "genotype", "build"])

    return df


def parse_ancestrydna(filepath: Path) -> pd.DataFrame:
    """
    Parse an AncestryDNA raw data file.

    Format: Tab-separated with columns:
    rsid, chromosome, position, allele1, allele2

    Args:
        filepath: Path to the AncestryDNA file

    Returns:
        DataFrame with columns: rsid, chrom, pos, allele1, allele2, genotype, build
    """
    filepath = Path(filepath)
    build = detect_build(filepath)

    rows = []
    header_found = False

    with _open_file(filepath) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            parts = line.split("\t")
            if len(parts) < 4:
                parts = line.split(",")
            if len(parts) < 4:
                continue

            # Skip header row
            if parts[0].lower() in ("rsid", "rs", "snp", "marker"):
                header_found = True
                continue

            rsid = parts[0].strip()
            chrom = parts[1].strip().replace("chr", "")

            try:
                pos = int(parts[2])
            except ValueError:
                continue

            # AncestryDNA has separate allele columns
            if len(parts) >= 5:
                allele1 = parts[3].strip().upper()
                allele2 = parts[4].strip().upper()
            else:
                # Fallback: treat as genotype
                genotype = parts[3].strip().upper()
                if len(genotype) >= 2:
                    allele1 = genotype[0]
                    allele2 = genotype[1]
                else:
                    allele1 = genotype
                    allele2 = genotype

            # Handle missing/no-call data
            if allele1 in ("-", "0", "N", "") or allele2 in ("-", "0", "N", ""):
                continue

            genotype = allele1 + allele2

            rows.append({
                "rsid": rsid,
                "chrom": chrom,
                "pos": pos,
                "allele1": allele1,
                "allele2": allele2,
                "genotype": genotype,
                "build": build
            })

    df = pd.DataFrame(rows)
    if len(df) == 0:
        return pd.DataFrame(columns=["rsid", "chrom", "pos", "allele1", "allele2", "genotype", "build"])

    return df


def parse_vcf(filepath: Path) -> pd.DataFrame:
    """
    Parse a VCF (Variant Call Format) file.

    Extracts genotype (GT field) for the first sample.

    Args:
        filepath: Path to the VCF file

    Returns:
        DataFrame with columns: rsid, chrom, pos, allele1, allele2, genotype, build
    """
    filepath = Path(filepath)
    build = detect_build(filepath)

    rows = []

    with _open_file(filepath) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("##"):
                continue
            if line.startswith("#CHROM"):
                # Header line - skip
                continue

            parts = line.split("\t")
            if len(parts) < 10:
                continue

            chrom = parts[0].replace("chr", "")
            try:
                pos = int(parts[1])
            except ValueError:
                continue

            rsid = parts[2]
            if rsid == ".":
                # Generate a pseudo-ID for variants without rsID
                rsid = f"chr{chrom}:{pos}"

            ref = parts[3].upper()
            alt = parts[4].upper()

            # Handle multi-allelic sites (take first alt allele)
            if "," in alt:
                alt = alt.split(",")[0]

            # Get FORMAT field and first sample
            format_field = parts[8]
            sample_data = parts[9]

            format_keys = format_field.split(":")
            sample_values = sample_data.split(":")

            # Find GT (genotype) index
            try:
                gt_idx = format_keys.index("GT")
                gt = sample_values[gt_idx]
            except (ValueError, IndexError):
                continue

            # Parse genotype (0/0, 0/1, 1/1, 0|1, etc.)
            gt_clean = gt.replace("|", "/")
            alleles = gt_clean.split("/")

            if len(alleles) < 2:
                # Haploid
                alleles = [alleles[0], alleles[0]]

            # Handle missing genotype
            if "." in alleles:
                continue

            try:
                allele_options = [ref] + alt.split(",")
                allele1 = allele_options[int(alleles[0])]
                allele2 = allele_options[int(alleles[1])]
            except (ValueError, IndexError):
                continue

            genotype = allele1 + allele2

            rows.append({
                "rsid": rsid,
                "chrom": chrom,
                "pos": pos,
                "allele1": allele1,
                "allele2": allele2,
                "genotype": genotype,
                "build": build
            })

    df = pd.DataFrame(rows)
    if len(df) == 0:
        return pd.DataFrame(columns=["rsid", "chrom", "pos", "allele1", "allele2", "genotype", "build"])

    return df


def parse_raw_dna(filepath: Path) -> pd.DataFrame:
    """
    Parse a raw DNA file, automatically detecting format.

    Main entry point for DNA parsing. Supports:
    - 23andMe raw data files
    - AncestryDNA raw data files
    - VCF files

    Args:
        filepath: Path to the genetic data file

    Returns:
        DataFrame with columns: rsid, chrom, pos, allele1, allele2, genotype, build

    Raises:
        ValueError: If file format cannot be detected or parsed
        FileNotFoundError: If file does not exist
    """
    filepath = Path(filepath)

    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filepath}")

    file_format = detect_format(filepath)

    if file_format == "23andme":
        df = parse_23andme(filepath)
    elif file_format == "ancestrydna":
        df = parse_ancestrydna(filepath)
    elif file_format == "vcf":
        df = parse_vcf(filepath)
    else:
        raise ValueError(f"Unknown file format: {file_format}")

    # Clean up chromosome names
    df["chrom"] = df["chrom"].astype(str).str.replace("chr", "", regex=False)

    # Filter out non-standard chromosomes if needed (keep MT, X, Y)
    valid_chroms = [str(i) for i in range(1, 23)] + ["X", "Y", "MT", "M"]
    df = df[df["chrom"].isin(valid_chroms)]

    # Normalize mitochondrial chromosome name
    df.loc[df["chrom"] == "M", "chrom"] = "MT"

    # Deduplicate by rsid (keep first occurrence)
    df = df.drop_duplicates(subset=["rsid"], keep="first")

    # Reset index
    df = df.reset_index(drop=True)

    return df


def get_genotype_summary(df: pd.DataFrame) -> dict:
    """
    Get a summary of parsed genotype data.

    Args:
        df: DataFrame from parse_raw_dna()

    Returns:
        Dict with summary statistics
    """
    summary = {
        "total_variants": len(df),
        "build": df["build"].iloc[0] if len(df) > 0 else None,
        "chromosomes": {},
        "variant_types": {
            "snps": 0,
            "indels": 0
        }
    }

    # Count variants per chromosome
    if len(df) > 0:
        chrom_counts = df["chrom"].value_counts().to_dict()
        summary["chromosomes"] = {str(k): int(v) for k, v in chrom_counts.items()}

        # Count SNPs vs indels
        for _, row in df.iterrows():
            if len(row["allele1"]) == 1 and len(row["allele2"]) == 1:
                summary["variant_types"]["snps"] += 1
            else:
                summary["variant_types"]["indels"] += 1

    return summary
