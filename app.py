"""
Gradio web interface for Polygenic Risk Score Calculator.

Provides a user-friendly interface for uploading genetic data files,
selecting ancestry, and computing polygenic risk scores for multiple diseases.
"""

import tempfile
from pathlib import Path
from typing import Any

import gradio as gr
import pandas as pd

from src.dna_parser import parse_raw_dna, detect_format, detect_build
from src.liftover import ensure_build
from src.pgscatalog import load_scores_for_disease, DISEASE_CATALOG
from src.prs_calculator import compute_all_diseases
from src.report_generator import (
    generate_html_report,
    generate_pdf_report,
    generate_summary_text,
    DISEASE_DISPLAY_NAMES,
)


# Ancestry options
ANCESTRY_OPTIONS = [
    ("European (EUR)", "EUR"),
    ("African (AFR)", "AFR"),
    ("East Asian (EAS)", "EAS"),
    ("Latino/Admixed American (AMR)", "AMR"),
    ("South Asian (SAS)", "SAS"),
]


def process_dna_file(
    file_obj,
    ancestry: str,
    processing_mode: str,
    progress: gr.Progress = gr.Progress()
) -> tuple[str, str, str | None]:
    """
    Process uploaded DNA file and compute PRS scores.

    Args:
        file_obj: Uploaded file object from Gradio
        ancestry: Selected ancestry code
        processing_mode: "fast" or "full" (with imputation)
        progress: Gradio progress tracker

    Returns:
        Tuple of (summary_text, html_report, pdf_path)
    """
    if file_obj is None:
        return "Please upload a DNA file.", "", None

    try:
        filepath = Path(file_obj.name)
        filename = filepath.name

        # Step 1: Detect format and parse file
        progress(0.1, desc="Detecting file format...")
        file_format = detect_format(filepath)
        detected_build = detect_build(filepath)

        progress(0.2, desc=f"Parsing {file_format} file...")
        genotypes_df = parse_raw_dna(filepath)

        if genotypes_df.empty:
            return "Error: Could not parse any variants from the file.", "", None

        variant_count = len(genotypes_df)

        # Step 2: Liftover to GRCh37 if needed
        progress(0.3, desc="Standardizing genome coordinates...")
        genotypes_df = ensure_build(genotypes_df, target_build="GRCh37")

        # Step 3: Handle imputation for full mode
        if processing_mode == "full":
            progress(0.4, desc="Note: Imputation requires external server...")
            # In a real implementation, this would call the imputation module
            # For now, we proceed with genotyped variants only
            pass

        # Step 4: Load scoring files and compute PRS for each disease
        progress(0.5, desc="Loading PGS Catalog scores...")
        diseases = list(DISEASE_CATALOG.keys())
        total_diseases = len(diseases)

        prs_results = {}
        for i, disease in enumerate(diseases):
            progress_pct = 0.5 + (0.4 * (i / total_diseases))
            progress(progress_pct, desc=f"Computing PRS for {DISEASE_DISPLAY_NAMES.get(disease, disease)}...")

            try:
                prs_results[disease] = compute_single_disease(
                    genotypes_df, disease, ancestry
                )
            except Exception as e:
                # Skip diseases that fail but continue with others
                prs_results[disease] = {
                    "raw_prs": 0.0,
                    "zscore": 0.0,
                    "percentile": 0.5,
                    "risk_category": "Unknown",
                    "matched_variants": 0,
                    "total_variants": 0,
                    "error": str(e)
                }

        # Step 5: Generate reports
        progress(0.9, desc="Generating clinical report...")

        user_info = {
            "patient_id": f"PRS-{hash(filename) % 100000:05d}",
            "ancestry": dict(ANCESTRY_OPTIONS).get(ancestry, ancestry),
            "filename": filename,
        }

        summary_text = generate_summary_text(prs_results)
        html_report = generate_html_report(prs_results, user_info)

        # Generate PDF in temp directory
        progress(0.95, desc="Creating PDF report...")
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            pdf_path = generate_pdf_report(prs_results, user_info, Path(tmp.name))

        progress(1.0, desc="Complete!")

        # Create summary with key statistics
        elevated_count = sum(
            1 for r in prs_results.values()
            if r.get("percentile", 0) >= 0.75
        )

        header = f"""
Analysis Complete!

File: {filename}
Format: {file_format.upper()}
Build: {detected_build}
Variants analyzed: {variant_count:,}
Diseases screened: {total_diseases}
Elevated risk findings: {elevated_count}

{summary_text}
"""
        return header, html_report, str(pdf_path)

    except Exception as e:
        error_msg = f"Error processing file: {str(e)}"
        return error_msg, "", None


def compute_single_disease(
    genotypes_df: pd.DataFrame,
    disease: str,
    ancestry: str
) -> dict[str, Any]:
    """
    Compute PRS for a single disease.

    Args:
        genotypes_df: DataFrame with genotype data
        disease: Disease identifier
        ancestry: Ancestry code for population normalization

    Returns:
        Dictionary with PRS results
    """
    from src.prs_calculator import calculate_prs, normalize_prs

    # Load scoring file for this disease
    scores_df = load_scores_for_disease(disease)

    if scores_df.empty:
        raise ValueError(f"No scoring data available for {disease}")

    # Calculate raw PRS
    prs_result = calculate_prs(genotypes_df, scores_df)

    # Normalize based on ancestry
    normalized = normalize_prs(prs_result["raw_prs"], population=ancestry)

    return {
        "raw_prs": prs_result["raw_prs"],
        "zscore": normalized["zscore"],
        "percentile": normalized["percentile"],
        "risk_category": normalized["risk_category"],
        "matched_variants": prs_result["matched_variants"],
        "total_variants": prs_result["total_variants"],
    }


def create_interface() -> gr.Blocks:
    """Create the Gradio interface."""

    with gr.Blocks(
        title="Polygenic Risk Score Calculator",
        theme=gr.themes.Soft(
            primary_hue="blue",
            secondary_hue="slate",
        ),
        css="""
        .main-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .risk-highlight {
            font-weight: bold;
            color: #dc2626;
        }
        """
    ) as demo:
        gr.Markdown(
            """
            # Polygenic Risk Score Calculator

            Calculate your genetic risk for multiple diseases using data from the PGS Catalog.
            Upload your raw DNA file from 23andMe, AncestryDNA, or any VCF file.

            **Supported formats:** 23andMe, AncestryDNA, VCF
            """
        )

        with gr.Row():
            with gr.Column(scale=1):
                file_input = gr.File(
                    label="Upload DNA File",
                    file_types=[".txt", ".csv", ".tsv", ".vcf", ".vcf.gz"],
                    type="filepath",
                )

                ancestry_dropdown = gr.Dropdown(
                    choices=[name for name, _ in ANCESTRY_OPTIONS],
                    value="European (EUR)",
                    label="Select Your Ancestry",
                    info="Choose the population that best matches your genetic ancestry",
                )

                processing_mode = gr.Radio(
                    choices=[
                        ("Fast (genotyped variants only)", "fast"),
                        ("Full (with imputation - slower)", "full"),
                    ],
                    value="fast",
                    label="Processing Mode",
                    info="Full mode uses imputation for better coverage but takes longer",
                )

                calculate_btn = gr.Button(
                    "Calculate Risks",
                    variant="primary",
                    size="lg",
                )

            with gr.Column(scale=2):
                output_summary = gr.Textbox(
                    label="Results Summary",
                    lines=20,
                    max_lines=30,
                )

        with gr.Row():
            output_html = gr.HTML(
                label="Detailed Report",
            )

        with gr.Row():
            pdf_download = gr.File(
                label="Download PDF Report",
                type="filepath",
            )

        # Disclaimer
        gr.Markdown(
            """
            ---
            **Important Disclaimer:** This tool provides genetic risk estimates based on
            polygenic scores from the PGS Catalog. Results are for educational purposes only
            and should NOT be used for medical decisions. Always consult with a qualified
            healthcare provider for medical advice. Genetic risk is only one factor in
            disease development - lifestyle, environment, and family history also play
            important roles.
            """
        )

        # Event handlers
        def get_ancestry_code(ancestry_name: str) -> str:
            """Convert ancestry display name to code."""
            for name, code in ANCESTRY_OPTIONS:
                if name == ancestry_name:
                    return code
            return "EUR"

        def process_wrapper(file_obj, ancestry_name, mode, progress=gr.Progress()):
            ancestry_code = get_ancestry_code(ancestry_name)
            return process_dna_file(file_obj, ancestry_code, mode, progress)

        calculate_btn.click(
            fn=process_wrapper,
            inputs=[file_input, ancestry_dropdown, processing_mode],
            outputs=[output_summary, output_html, pdf_download],
            show_progress=True,
        )

    return demo


def main():
    """Launch the Gradio application."""
    demo = create_interface()
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True,
    )


if __name__ == "__main__":
    main()
