"""
Modal serverless deployment for Polygenic Risk Score Calculator.

Provides a scalable, pay-per-use deployment for PRS computation.
"""

import tempfile
from pathlib import Path
from typing import Any

import modal

# Create Modal app
app = modal.App("polygenic-risk-score-calc")

# Define container image with dependencies and copy local code
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "pandas>=2.0",
        "numpy>=1.24",
        "scipy>=1.11",
        "requests>=2.31",
        "weasyprint>=60.0",
        "pyliftover>=0.4",
        "fastapi>=0.100.0",
    )
    .add_local_dir(
        local_path=Path(__file__).parent / "src",
        remote_path="/root/src",
    )
    .add_local_dir(
        local_path=Path(__file__).parent / "data",
        remote_path="/root/data",
    )
)


@app.function(
    image=image,
    timeout=600,  # 10 minute timeout for processing
    memory=2048,  # 2GB memory
)
def compute_prs(
    file_content: bytes,
    filename: str,
    ancestry: str,
) -> dict[str, Any]:
    """
    Compute Polygenic Risk Scores for uploaded DNA file.

    Args:
        file_content: Raw bytes of the uploaded DNA file
        filename: Original filename
        ancestry: Ancestry code (EUR, AFR, EAS, AMR, SAS)

    Returns:
        Dictionary with PRS results and metadata
    """
    import sys
    sys.path.insert(0, "/root")

    # Write file content to temp file
    with tempfile.NamedTemporaryFile(
        suffix=Path(filename).suffix,
        delete=False
    ) as tmp:
        tmp.write(file_content)
        filepath = Path(tmp.name)

    try:
        # Import modules (inside function for Modal)
        from src.dna_parser import parse_raw_dna, detect_format, detect_build
        from src.liftover import ensure_build
        from src.pgscatalog import load_scores_for_disease, DISEASE_CATALOG
        from src.prs_calculator import calculate_prs, normalize_prs

        # Parse DNA file
        file_format = detect_format(filepath)
        detected_build = detect_build(filepath)
        genotypes_df = parse_raw_dna(filepath)

        if genotypes_df.empty:
            raise ValueError("Could not parse any variants from file")

        # Ensure correct build
        genotypes_df = ensure_build(genotypes_df, target_build="GRCh37")

        # Compute PRS for all diseases
        prs_results = {}
        for disease in DISEASE_CATALOG.keys():
            try:
                scores_df = load_scores_for_disease(disease)
                if scores_df.empty:
                    continue

                prs_result = calculate_prs(genotypes_df, scores_df)
                normalized = normalize_prs(prs_result["raw_prs"], population=ancestry)

                prs_results[disease] = {
                    "raw_prs": prs_result["raw_prs"],
                    "zscore": normalized["zscore"],
                    "percentile": normalized["percentile"],
                    "risk_category": normalized["risk_category"],
                    "matched_variants": prs_result["matched_variants"],
                    "total_variants": prs_result["total_variants"],
                }
            except Exception:
                continue

        return {
            "status": "success",
            "prs_results": prs_results,
            "metadata": {
                "filename": filename,
                "format": file_format,
                "build": detected_build,
                "ancestry": ancestry,
                "variant_count": len(genotypes_df),
                "diseases_computed": len(prs_results),
            }
        }

    finally:
        # Cleanup temp file
        filepath.unlink(missing_ok=True)


@app.function(
    image=image,
    timeout=120,
    
)
def generate_report_pdf(
    prs_results: dict[str, Any],
    user_info: dict[str, Any],
) -> bytes:
    """
    Generate PDF report from PRS results.

    Args:
        prs_results: Dictionary with disease PRS results
        user_info: User information for report

    Returns:
        PDF file content as bytes
    """
    import sys
    sys.path.insert(0, "/root")
    from src.report_generator import generate_pdf_report

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        pdf_path = Path(tmp.name)

    try:
        generate_pdf_report(prs_results, user_info, pdf_path)

        with open(pdf_path, "rb") as f:
            return f.read()
    finally:
        pdf_path.unlink(missing_ok=True)


@app.function(
    image=image,
    timeout=900,  # 15 minutes for full workflow
    
)
def process_full(
    file_content: bytes,
    filename: str,
    ancestry: str,
) -> dict[str, Any]:
    """
    Full workflow: compute PRS and generate PDF.

    Args:
        file_content: Raw DNA file bytes
        filename: Original filename
        ancestry: Ancestry code

    Returns:
        Dictionary with PDF bytes if successful, error otherwise
    """
    # Compute PRS
    prs_result = compute_prs.remote(
        file_content=file_content,
        filename=filename,
        ancestry=ancestry,
    )

    if prs_result["status"] != "success":
        return {
            "status": "error",
            "message": "PRS computation failed",
        }

    # Generate PDF report
    user_info = {
        "patient_id": f"PRS-{hash(filename) % 100000:05d}",
        "ancestry": ancestry,
        "filename": filename,
    }

    pdf_bytes = generate_report_pdf.remote(
        prs_results=prs_result["prs_results"],
        user_info=user_info,
    )

    return {
        "status": "success",
        "pdf_content": pdf_bytes,
        "metadata": prs_result["metadata"],
    }


# Web endpoint for HTTP access from Vercel/frontend
@app.function(
    image=image,
    timeout=600,
    memory=2048,
    
)
@modal.fastapi_endpoint(method="POST")
def compute_prs_web(request: dict) -> dict:
    """
    HTTP endpoint for PRS computation.

    Expects JSON body with:
    - file_content: base64 encoded file content
    - filename: original filename
    - ancestry: ancestry code (EUR, AFR, EAS, AMR, SAS)
    """
    import base64

    try:
        file_content = base64.b64decode(request.get("file_content", ""))
        filename = request.get("filename", "upload.txt")
        ancestry = request.get("ancestry", "EUR")

        result = compute_prs.local(
            file_content=file_content,
            filename=filename,
            ancestry=ancestry,
        )
        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}


# Local entrypoint for testing
@app.local_entrypoint()
def main():
    """Test the Modal app locally."""
    print("Polygenic Risk Score Calculator - Modal App")
    print("=" * 50)
    print()
    print("Available functions:")
    print("  - compute_prs: Compute PRS from DNA file")
    print("  - generate_report_pdf: Generate PDF report")
    print("  - process_full: Full workflow (PRS + PDF)")
    print("  - compute_prs_web: HTTP endpoint for web access")
    print()
    print("Deploy with: modal deploy modal_app.py")
    print("Serve locally with: modal serve modal_app.py")
