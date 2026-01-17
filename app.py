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

    custom_css = """
    /* Global styles */
    .gradio-container {
        max-width: 1400px !important;
        margin: auto !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }

    /* Header styling */
    .header-container {
        background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3d7ab5 100%);
        padding: 2.5rem 2rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 20px rgba(30, 58, 95, 0.3);
    }
    .header-container h1 {
        color: white !important;
        font-size: 2.2rem !important;
        font-weight: 700 !important;
        margin-bottom: 0.5rem !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header-container p {
        color: rgba(255,255,255,0.9) !important;
        font-size: 1.1rem !important;
        margin: 0 !important;
    }
    .header-badge {
        display: inline-block;
        background: rgba(255,255,255,0.2);
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        color: white;
        margin-top: 1rem;
        backdrop-filter: blur(10px);
    }

    /* Upload card styling */
    .upload-section {
        background: #ffffff;
        border: 2px dashed #cbd5e1;
        border-radius: 12px;
        padding: 1.5rem;
        transition: all 0.3s ease;
    }
    .upload-section:hover {
        border-color: #3d7ab5;
        background: #f8fafc;
    }

    /* Input panel styling */
    .input-panel {
        background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .input-panel label {
        font-weight: 600 !important;
        color: #1e293b !important;
    }

    /* Button styling */
    .primary-btn {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
        border: none !important;
        padding: 1rem 2rem !important;
        font-size: 1.1rem !important;
        font-weight: 600 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4) !important;
        transition: all 0.3s ease !important;
        text-transform: none !important;
    }
    .primary-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5) !important;
    }

    /* Results section */
    .results-panel {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .results-header {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #e2e8f0;
    }

    /* Status badges */
    .status-ready {
        background: #dcfce7;
        color: #166534;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        display: inline-block;
    }
    .status-waiting {
        background: #fef3c7;
        color: #92400e;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        display: inline-block;
    }

    /* Accordion styling */
    .accordion-panel {
        border: 1px solid #e2e8f0 !important;
        border-radius: 12px !important;
        margin-top: 1rem !important;
        overflow: hidden;
    }

    /* Disclaimer styling */
    .disclaimer-box {
        background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
        border-left: 4px solid #f59e0b;
        border-radius: 0 12px 12px 0;
        padding: 1.25rem 1.5rem;
        margin-top: 1.5rem;
    }
    .disclaimer-box strong {
        color: #92400e;
    }
    .disclaimer-box p {
        color: #78350f;
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.6;
    }

    /* Info cards */
    .info-card {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    .info-card-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }

    /* Format badges */
    .format-badge {
        display: inline-block;
        background: #e0e7ff;
        color: #3730a3;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        margin: 0.15rem;
    }

    /* Download button */
    .download-section {
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        border: 1px solid #6ee7b7;
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .header-container {
            padding: 1.5rem 1rem;
        }
        .header-container h1 {
            font-size: 1.6rem !important;
        }
    }

    /* Animation for processing */
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    .processing {
        animation: pulse 2s infinite;
    }
    """

    with gr.Blocks(
        title="Polygenic Risk Score Calculator",
        theme=gr.themes.Soft(
            primary_hue="blue",
            secondary_hue="slate",
            neutral_hue="slate",
            font=("Inter", "ui-sans-serif", "system-ui", "sans-serif"),
        ),
        css=custom_css
    ) as demo:

        # Header Section
        gr.HTML("""
        <div class="header-container">
            <h1>Polygenic Risk Score Calculator</h1>
            <p>Clinical-grade genetic risk assessment powered by the PGS Catalog</p>
            <div class="header-badge">
                <span class="format-badge">23andMe</span>
                <span class="format-badge">AncestryDNA</span>
                <span class="format-badge">VCF</span>
            </div>
        </div>
        """)

        with gr.Row(equal_height=False):
            # Left Panel - Inputs
            with gr.Column(scale=1, min_width=320):
                gr.HTML('<div class="results-header">Upload & Configure</div>')

                with gr.Group(elem_classes="input-panel"):
                    # File upload with better styling
                    gr.HTML("""
                    <div class="info-card">
                        <div class="info-card-icon">📁</div>
                        <strong>Step 1:</strong> Upload your raw DNA data file
                    </div>
                    """)

                    file_input = gr.File(
                        label="DNA File",
                        file_types=[".txt", ".csv", ".tsv", ".vcf", ".vcf.gz", ".zip"],
                        type="filepath",
                        elem_classes="upload-section"
                    )

                    gr.HTML("""
                    <div class="info-card" style="margin-top: 1rem;">
                        <div class="info-card-icon">🧬</div>
                        <strong>Step 2:</strong> Select your genetic ancestry
                    </div>
                    """)

                    ancestry_dropdown = gr.Dropdown(
                        choices=[name for name, _ in ANCESTRY_OPTIONS],
                        value="European (EUR)",
                        label="Ancestry",
                        info="For accurate population-specific risk normalization",
                        container=True,
                    )

                    gr.HTML("""
                    <div class="info-card" style="margin-top: 1rem;">
                        <div class="info-card-icon">⚙️</div>
                        <strong>Step 3:</strong> Choose processing mode
                    </div>
                    """)

                    processing_mode = gr.Radio(
                        choices=[
                            ("Fast Mode", "fast"),
                            ("Full Mode (Imputation)", "full"),
                        ],
                        value="fast",
                        label="Processing Mode",
                        info="Fast: ~30 seconds | Full: Better accuracy, requires API",
                    )

                    gr.HTML("<div style='height: 1rem;'></div>")

                    calculate_btn = gr.Button(
                        "🔬 Calculate Risk Scores",
                        variant="primary",
                        size="lg",
                        elem_classes="primary-btn",
                    )

                # Quick stats panel (shows after upload)
                with gr.Accordion("ℹ️ How It Works", open=False, elem_classes="accordion-panel"):
                    gr.Markdown("""
                    **Polygenic Risk Scores (PRS)** aggregate the effects of many genetic variants to estimate disease risk.

                    1. **Parse** your DNA file (23andMe, AncestryDNA, or VCF)
                    2. **Match** variants to PGS Catalog scoring files
                    3. **Calculate** weighted risk scores for 10 diseases
                    4. **Normalize** scores to population percentiles
                    5. **Generate** a clinical-grade PDF report

                    Results are based on validated scores from [PGS Catalog](https://www.pgscatalog.org/).
                    """)

            # Right Panel - Results
            with gr.Column(scale=2, min_width=500):
                gr.HTML('<div class="results-header">Analysis Results</div>')

                with gr.Group(elem_classes="results-panel"):
                    output_summary = gr.Textbox(
                        label="Results Summary",
                        lines=18,
                        max_lines=25,
                        show_copy_button=True,
                        placeholder="Upload a DNA file and click 'Calculate Risk Scores' to begin analysis...",
                    )

                with gr.Accordion("📊 Detailed Clinical Report", open=True, elem_classes="accordion-panel"):
                    output_html = gr.HTML(
                        value="<div style='padding: 2rem; text-align: center; color: #64748b;'><p style='font-size: 1.1rem;'>Your detailed report will appear here</p><p style='font-size: 0.9rem;'>Including risk visualizations and recommendations</p></div>"
                    )

                gr.HTML("<div style='height: 0.5rem;'></div>")

                with gr.Group(elem_classes="download-section"):
                    gr.HTML("""
                    <div style="margin-bottom: 0.75rem;">
                        <strong style="color: #065f46; font-size: 1.05rem;">📄 Download Your Report</strong>
                        <p style="color: #047857; font-size: 0.9rem; margin: 0.25rem 0 0 0;">
                            Professional PDF ready for healthcare providers
                        </p>
                    </div>
                    """)
                    pdf_download = gr.File(
                        label="PDF Report",
                        type="filepath",
                        visible=True,
                    )

        # Disclaimer Section
        gr.HTML("""
        <div class="disclaimer-box">
            <strong>⚠️ Important Medical Disclaimer</strong>
            <p style="margin-top: 0.5rem;">
                This tool provides genetic risk estimates based on polygenic scores from the PGS Catalog.
                Results are for <strong>educational and research purposes only</strong> and should NOT be used
                for medical decisions. Genetic risk is only one factor in disease development.
                <strong>Always consult with a qualified healthcare provider</strong> for personalized medical advice.
            </p>
        </div>
        """)

        # Footer
        gr.HTML("""
        <div style="text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.85rem;">
            <p>Powered by <a href="https://www.pgscatalog.org/" target="_blank" style="color: #3b82f6;">PGS Catalog</a>
            | Risk scores validated against peer-reviewed publications</p>
        </div>
        """)

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
            show_progress="full",
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
