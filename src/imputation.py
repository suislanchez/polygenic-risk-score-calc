"""
Michigan Imputation Server integration for enhanced variant coverage.

Imputation can increase variant coverage from ~600K (DTC arrays) to ~40M variants,
dramatically improving PRS accuracy from ~2% to ~98% of scoring file variants.

API Documentation: https://imputationserver.sph.umich.edu/api/v2
"""

import os
import gzip
import time
import json
from pathlib import Path
from typing import Optional

import pandas as pd
import numpy as np
import requests

MICHIGAN_API_BASE = "https://imputationserver.sph.umich.edu/api/v2"
CACHE_DIR = Path("data/cache/imputation")


def ensure_cache_dir():
    """Ensure imputation cache directory exists."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def prepare_vcf_for_imputation(
    genotypes_df: pd.DataFrame,
    output_dir: Path,
    sample_id: str = "SAMPLE"
) -> list[Path]:
    """
    Convert genotype DataFrame to VCF files split by chromosome for imputation.

    Michigan Imputation Server requires:
    - VCF format 4.2+
    - Split by chromosome
    - Sorted by position
    - Only biallelic SNPs

    Args:
        genotypes_df: DataFrame with columns [rsid, chrom, pos, allele1, allele2]
        output_dir: Directory to write VCF files
        sample_id: Sample identifier for VCF header

    Returns:
        List of paths to chromosome VCF files
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    df = genotypes_df.copy()

    # QC: Filter to autosomal chromosomes (1-22) for imputation
    df["chrom_num"] = pd.to_numeric(df["chrom"], errors="coerce")
    df = df[df["chrom_num"].between(1, 22)].copy()

    # QC: Remove missing genotypes
    df = df[df["allele1"].notna() & df["allele2"].notna()]
    df = df[~df["allele1"].isin(["-", "--", "0", ""])]
    df = df[~df["allele2"].isin(["-", "--", "0", ""])]

    # QC: Keep only SNPs (single nucleotide)
    df = df[df["allele1"].str.len() == 1]
    df = df[df["allele2"].str.len() == 1]

    # Sort by chromosome and position
    df = df.sort_values(["chrom_num", "pos"])

    vcf_files = []

    # VCF header template
    header = """##fileformat=VCFv4.2
##source=PRSCalculator
##INFO=<ID=.,Number=.,Type=String,Description=".">
##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t{sample}
""".format(sample=sample_id)

    # Write VCF per chromosome
    for chrom in sorted(df["chrom_num"].unique()):
        chrom_df = df[df["chrom_num"] == chrom].copy()

        if len(chrom_df) == 0:
            continue

        vcf_path = output_dir / f"chr{int(chrom)}.vcf.gz"

        with gzip.open(vcf_path, "wt") as f:
            f.write(header)

            for _, row in chrom_df.iterrows():
                # Determine REF/ALT and genotype
                # Assume first allele is reference for simplicity
                # In production, would look up from reference genome
                ref = row["allele1"]
                alt = row["allele2"] if row["allele2"] != row["allele1"] else "."

                # Convert to VCF genotype format
                if row["allele1"] == row["allele2"]:
                    gt = "0/0" if alt == "." else "1/1"
                else:
                    gt = "0/1"

                line = f"{int(row['chrom_num'])}\t{int(row['pos'])}\t{row['rsid']}\t{ref}\t{alt}\t.\tPASS\t.\tGT\t{gt}\n"
                f.write(line)

        vcf_files.append(vcf_path)

    return vcf_files


def submit_imputation_job(
    vcf_files: list[Path],
    reference_panel: str = "1000g-phase-3-v5",
    build: str = "GRCh37",
    population: str = "eur",
    api_token: Optional[str] = None
) -> str:
    """
    Submit imputation job to Michigan Imputation Server.

    Args:
        vcf_files: List of chromosome VCF files
        reference_panel: Reference panel (1000g-phase-3-v5, hrc-r1.1, etc.)
        build: Genome build (GRCh37 or GRCh38)
        population: Population for QC (eur, afr, asn, amr, sas, mixed)
        api_token: Michigan Imputation Server API token

    Returns:
        Job ID for tracking
    """
    if api_token is None:
        api_token = os.environ.get("MICHIGAN_API_TOKEN")

    if not api_token:
        raise ValueError(
            "Michigan Imputation Server API token required. "
            "Set MICHIGAN_API_TOKEN environment variable or pass api_token parameter. "
            "Register at https://imputationserver.sph.umich.edu"
        )

    headers = {
        "X-Auth-Token": api_token
    }

    # Map build to server format
    build_map = {
        "GRCh37": "hg19",
        "GRCh38": "hg38",
        "hg19": "hg19",
        "hg38": "hg38"
    }
    server_build = build_map.get(build, "hg19")

    # Prepare form data
    data = {
        "refpanel": reference_panel,
        "population": population,
        "build": server_build,
        "r2Filter": "0",  # Keep all variants
        "phasing": "eagle",
        "mode": "imputation"
    }

    # Upload files
    files = []
    for vcf_path in vcf_files:
        files.append(
            ("files", (vcf_path.name, open(vcf_path, "rb"), "application/gzip"))
        )

    try:
        response = requests.post(
            f"{MICHIGAN_API_BASE}/jobs/submit/minimac4",
            headers=headers,
            data=data,
            files=files,
            timeout=300
        )
        response.raise_for_status()

        result = response.json()

        if result.get("success"):
            job_id = result.get("id")
            return job_id
        else:
            raise RuntimeError(f"Job submission failed: {result.get('message')}")

    finally:
        # Close file handles
        for _, (_, fh, _) in files:
            fh.close()


def check_job_status(job_id: str, api_token: Optional[str] = None) -> dict:
    """
    Check status of imputation job.

    Args:
        job_id: Job ID from submit_imputation_job
        api_token: Michigan Imputation Server API token

    Returns:
        dict with job status information:
            - state: Job state (waiting, running, success, failed, canceled)
            - progress: Completion percentage
            - steps: List of job steps with status
    """
    if api_token is None:
        api_token = os.environ.get("MICHIGAN_API_TOKEN")

    if not api_token:
        raise ValueError("Michigan API token required")

    headers = {
        "X-Auth-Token": api_token
    }

    response = requests.get(
        f"{MICHIGAN_API_BASE}/jobs/{job_id}/status",
        headers=headers,
        timeout=30
    )
    response.raise_for_status()

    return response.json()


def wait_for_job(
    job_id: str,
    api_token: Optional[str] = None,
    poll_interval: int = 60,
    max_wait: int = 7200
) -> dict:
    """
    Wait for imputation job to complete.

    Args:
        job_id: Job ID from submit_imputation_job
        api_token: Michigan Imputation Server API token
        poll_interval: Seconds between status checks
        max_wait: Maximum seconds to wait

    Returns:
        Final job status dict
    """
    start_time = time.time()

    while True:
        status = check_job_status(job_id, api_token)
        state = status.get("state", "unknown")

        if state in ["success", "failed", "canceled"]:
            return status

        elapsed = time.time() - start_time
        if elapsed > max_wait:
            raise TimeoutError(f"Job {job_id} did not complete within {max_wait} seconds")

        time.sleep(poll_interval)


def download_imputed_results(
    job_id: str,
    output_dir: Path,
    api_token: Optional[str] = None
) -> list[Path]:
    """
    Download imputed VCF files from completed job.

    Args:
        job_id: Job ID from submit_imputation_job
        output_dir: Directory to save downloaded files
        api_token: Michigan Imputation Server API token

    Returns:
        List of paths to downloaded imputed VCF files
    """
    if api_token is None:
        api_token = os.environ.get("MICHIGAN_API_TOKEN")

    if not api_token:
        raise ValueError("Michigan API token required")

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    headers = {
        "X-Auth-Token": api_token
    }

    # Get job details to find output files
    response = requests.get(
        f"{MICHIGAN_API_BASE}/jobs/{job_id}",
        headers=headers,
        timeout=30
    )
    response.raise_for_status()
    job_info = response.json()

    downloaded_files = []

    # Download each output file
    for output_file in job_info.get("outputParams", []):
        if output_file.get("type") == "local-folder":
            file_id = output_file.get("id")
            filename = output_file.get("name", f"{file_id}.vcf.gz")

            # Download file
            file_response = requests.get(
                f"{MICHIGAN_API_BASE}/jobs/{job_id}/results/{file_id}",
                headers=headers,
                stream=True,
                timeout=600
            )
            file_response.raise_for_status()

            output_path = output_dir / filename
            with open(output_path, "wb") as f:
                for chunk in file_response.iter_content(chunk_size=8192):
                    f.write(chunk)

            downloaded_files.append(output_path)

    return downloaded_files


def parse_imputed_vcf(vcf_path: Path) -> pd.DataFrame:
    """
    Parse imputed VCF file, extracting dosage information.

    Michigan Imputation Server outputs include:
    - DS (Dosage): Expected allele count [0.0, 2.0]
    - GP (Genotype Probabilities): P(0/0), P(0/1), P(1/1)
    - R2 (Imputation quality): Info score

    Args:
        vcf_path: Path to imputed VCF file

    Returns:
        DataFrame with columns:
            - rsid: Variant ID
            - chrom: Chromosome
            - pos: Position
            - ref: Reference allele
            - alt: Alternate allele
            - dosage: Imputed dosage (0.0-2.0)
            - r2: Imputation quality score
            - imputed: Boolean, True if variant was imputed
    """
    variants = []

    open_func = gzip.open if str(vcf_path).endswith(".gz") else open

    with open_func(vcf_path, "rt") as f:
        for line in f:
            # Skip header lines
            if line.startswith("#"):
                continue

            fields = line.strip().split("\t")
            if len(fields) < 10:
                continue

            chrom = fields[0]
            pos = int(fields[1])
            rsid = fields[2]
            ref = fields[3]
            alt = fields[4]
            info = fields[7]
            format_field = fields[8]
            sample_data = fields[9]

            # Parse INFO field for R2
            info_dict = {}
            for item in info.split(";"):
                if "=" in item:
                    key, value = item.split("=", 1)
                    info_dict[key] = value

            r2 = float(info_dict.get("R2", info_dict.get("INFO", "1.0")))

            # Determine if variant was imputed or genotyped
            imputed = info_dict.get("IMPUTED", "FALSE").upper() == "TRUE"
            if "TYPED" in info:
                imputed = False

            # Parse FORMAT field to find DS index
            format_keys = format_field.split(":")
            sample_values = sample_data.split(":")

            # Get dosage (DS field) or calculate from GT
            dosage = None
            if "DS" in format_keys:
                ds_idx = format_keys.index("DS")
                if ds_idx < len(sample_values):
                    try:
                        dosage = float(sample_values[ds_idx])
                    except ValueError:
                        pass

            # Fallback to GT if DS not available
            if dosage is None and "GT" in format_keys:
                gt_idx = format_keys.index("GT")
                if gt_idx < len(sample_values):
                    gt = sample_values[gt_idx]
                    # Convert GT to dosage
                    gt = gt.replace("|", "/")
                    alleles = gt.split("/")
                    try:
                        dosage = sum(int(a) for a in alleles if a != ".")
                    except ValueError:
                        dosage = None

            if dosage is not None:
                variants.append({
                    "rsid": rsid,
                    "chrom": chrom,
                    "pos": pos,
                    "ref": ref,
                    "alt": alt,
                    "dosage": dosage,
                    "r2": r2,
                    "imputed": imputed
                })

    return pd.DataFrame(variants)


def merge_with_genotyped(
    imputed_df: pd.DataFrame,
    genotyped_df: pd.DataFrame,
    r2_threshold: float = 0.3
) -> pd.DataFrame:
    """
    Merge imputed variants with directly genotyped variants.

    Strategy:
    - Prefer genotyped variants over imputed
    - Filter imputed variants by R2 quality threshold
    - Combine for maximum variant coverage

    Args:
        imputed_df: DataFrame from parse_imputed_vcf
        genotyped_df: Original genotype DataFrame
        r2_threshold: Minimum R2 for imputed variants (default 0.3)

    Returns:
        Merged DataFrame with both genotyped and high-quality imputed variants
    """
    # Mark genotyped variants
    geno = genotyped_df.copy()
    geno["imputed"] = False
    geno["r2"] = 1.0  # Perfect quality for genotyped

    # Convert genotype to dosage for genotyped variants
    # This requires knowing the effect allele, which happens during PRS calculation
    # For now, just keep the alleles
    if "dosage" not in geno.columns:
        geno["dosage"] = np.nan

    # Filter imputed variants by quality
    imp = imputed_df[imputed_df["r2"] >= r2_threshold].copy()

    # Remove imputed variants that overlap with genotyped
    geno_positions = set(zip(geno["chrom"].astype(str), geno["pos"].astype(int)))
    imp["chr_pos"] = list(zip(imp["chrom"].astype(str), imp["pos"].astype(int)))
    imp = imp[~imp["chr_pos"].isin(geno_positions)]
    imp = imp.drop(columns=["chr_pos"])

    # Standardize column names
    geno_cols = {"rsid", "chrom", "pos", "allele1", "allele2", "dosage", "r2", "imputed"}
    imp_cols = {"rsid", "chrom", "pos", "ref", "alt", "dosage", "r2", "imputed"}

    # Rename imputed columns to match genotyped
    imp = imp.rename(columns={"ref": "allele1", "alt": "allele2"})

    # Combine
    merged = pd.concat([geno, imp], ignore_index=True)

    return merged


def estimate_imputation_benefit(genotypes_df: pd.DataFrame, scores_df: pd.DataFrame) -> dict:
    """
    Estimate potential benefit of imputation for a given scoring file.

    Typical DTC arrays have ~600K-700K variants.
    PGS scoring files may have 1K-2M variants.
    Imputation can increase overlap significantly.

    Args:
        genotypes_df: Current genotype DataFrame
        scores_df: Target scoring file DataFrame

    Returns:
        dict with coverage statistics and recommendations
    """
    # Current overlap
    geno_rsids = set(genotypes_df["rsid"].str.lower())
    score_rsids = set(scores_df["rsid"].str.lower())

    current_overlap = len(geno_rsids & score_rsids)
    total_score_variants = len(score_rsids)
    current_coverage = current_overlap / total_score_variants * 100 if total_score_variants > 0 else 0

    # Estimate post-imputation coverage
    # Typical imputation increases variant count by ~50-60x
    # Coverage typically increases to 70-95% depending on scoring file
    estimated_post_imputation = min(95, current_coverage * 3)  # Rough estimate

    return {
        "current_genotyped_variants": len(geno_rsids),
        "scoring_file_variants": total_score_variants,
        "current_matched_variants": current_overlap,
        "current_coverage_percent": current_coverage,
        "estimated_post_imputation_coverage": estimated_post_imputation,
        "imputation_recommended": current_coverage < 50,
        "note": "Imputation typically increases coverage 2-10x for DTC array data"
    }
