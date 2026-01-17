"""
Modal serverless deployment for Polygenic Risk Score Calculator.

Provides a scalable, pay-per-use deployment with Stripe payment integration.
Users pay $29 per test, with PDF report delivered after payment confirmation.
"""

import os
import tempfile
from pathlib import Path
from typing import Any

import modal

# Create Modal app
app = modal.App("polygenic-risk-score-calc")

# Define container image with dependencies
image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "pandas>=2.0",
    "numpy>=1.24",
    "scipy>=1.11",
    "requests>=2.31",
    "weasyprint>=60.0",
    "stripe>=7.0",
    "pyliftover>=0.4",
)

# Secrets for Stripe
stripe_secret = modal.Secret.from_name("stripe-secret")


@app.function(
    image=image,
    timeout=600,  # 10 minute timeout for processing
    memory=2048,  # 2GB memory
    secrets=[stripe_secret],
)
def compute_prs(
    file_content: bytes,
    filename: str,
    ancestry: str,
    user_email: str,
) -> dict[str, Any]:
    """
    Compute Polygenic Risk Scores for uploaded DNA file.

    Args:
        file_content: Raw bytes of the uploaded DNA file
        filename: Original filename
        ancestry: Ancestry code (EUR, AFR, EAS, AMR, SAS)
        user_email: User's email for delivery

    Returns:
        Dictionary with PRS results and metadata
    """
    import pandas as pd

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
        from src.report_generator import DISEASE_DISPLAY_NAMES

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
    secrets=[stripe_secret],
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
    timeout=60,
    secrets=[stripe_secret],
)
def create_checkout_session(
    job_id: str,
    user_email: str,
    success_url: str,
    cancel_url: str,
) -> dict[str, str]:
    """
    Create Stripe checkout session for PRS test payment.

    Args:
        job_id: Unique identifier for the PRS computation job
        user_email: Customer email
        success_url: URL to redirect after successful payment
        cancel_url: URL to redirect if payment is cancelled

    Returns:
        Dictionary with checkout session URL
    """
    import stripe

    stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

    # Price: $29.00 for PRS test
    PRICE_CENTS = 2900

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Polygenic Risk Score Analysis",
                        "description": "Comprehensive genetic risk assessment for 10 diseases",
                    },
                    "unit_amount": PRICE_CENTS,
                },
                "quantity": 1,
            }
        ],
        mode="payment",
        success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=cancel_url,
        customer_email=user_email,
        metadata={
            "job_id": job_id,
        },
    )

    return {
        "checkout_url": session.url,
        "session_id": session.id,
    }


@app.function(
    image=image,
    timeout=60,
    secrets=[stripe_secret],
)
def verify_payment(session_id: str) -> dict[str, Any]:
    """
    Verify Stripe payment was successful.

    Args:
        session_id: Stripe checkout session ID

    Returns:
        Dictionary with payment status and job_id if successful
    """
    import stripe

    stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

    session = stripe.checkout.Session.retrieve(session_id)

    if session.payment_status == "paid":
        return {
            "status": "paid",
            "job_id": session.metadata.get("job_id"),
            "customer_email": session.customer_email,
        }
    else:
        return {
            "status": session.payment_status,
            "job_id": None,
        }


@app.function(
    image=image,
    timeout=30,
    secrets=[stripe_secret],
)
def handle_webhook(payload: bytes, sig_header: str) -> dict[str, Any]:
    """
    Handle Stripe webhook for payment events.

    Args:
        payload: Raw webhook payload
        sig_header: Stripe signature header

    Returns:
        Dictionary with processing status
    """
    import stripe

    stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        return {"status": "error", "message": "Invalid payload"}
    except stripe.error.SignatureVerificationError:
        return {"status": "error", "message": "Invalid signature"}

    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        job_id = session.get("metadata", {}).get("job_id")

        if job_id and session["payment_status"] == "paid":
            return {
                "status": "success",
                "event_type": "payment_completed",
                "job_id": job_id,
                "customer_email": session.get("customer_email"),
            }

    return {"status": "received", "event_type": event["type"]}


# Web endpoint for the full workflow
@app.function(
    image=image,
    timeout=900,  # 15 minutes for full workflow
    secrets=[stripe_secret],
)
def process_and_deliver(
    file_content: bytes,
    filename: str,
    ancestry: str,
    user_email: str,
    payment_session_id: str,
) -> dict[str, Any]:
    """
    Full workflow: verify payment, compute PRS, generate and return PDF.

    This is called after successful payment to deliver the report.

    Args:
        file_content: Raw DNA file bytes
        filename: Original filename
        ancestry: Ancestry code
        user_email: User email
        payment_session_id: Stripe session ID for payment verification

    Returns:
        Dictionary with PDF bytes if successful, error otherwise
    """
    # Verify payment first
    payment_status = verify_payment.remote(payment_session_id)

    if payment_status["status"] != "paid":
        return {
            "status": "error",
            "message": "Payment not verified",
        }

    # Compute PRS
    prs_result = compute_prs.remote(
        file_content=file_content,
        filename=filename,
        ancestry=ancestry,
        user_email=user_email,
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
    print("  - create_checkout_session: Create Stripe checkout")
    print("  - verify_payment: Verify payment status")
    print("  - handle_webhook: Handle Stripe webhooks")
    print("  - process_and_deliver: Full paid workflow")
    print()
    print("Deploy with: modal deploy modal_app.py")
    print("Serve locally with: modal serve modal_app.py")
