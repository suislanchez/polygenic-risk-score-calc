"""
NHS-grade clinical report generation for Polygenic Risk Scores.

Generates professional HTML and PDF reports with risk visualizations,
clinical disclaimers, and actionable recommendations.
"""

import hashlib
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from weasyprint import HTML, CSS


# Disease categories for grouping in reports
DISEASE_CATEGORIES = {
    "cardiovascular": {
        "name": "Cardiovascular",
        "icon": "heart",
        "color": "#dc2626",
        "diseases": ["cad", "afib", "stroke", "hypertension"]
    },
    "oncology": {
        "name": "Oncology",
        "icon": "ribbon",
        "color": "#7c3aed",
        "diseases": ["breast_cancer", "prostate_cancer", "colorectal_cancer", "colorectal"]
    },
    "metabolic": {
        "name": "Metabolic & Endocrine",
        "icon": "metabolism",
        "color": "#0891b2",
        "diseases": ["t2d", "obesity", "gout"]
    },
    "neurological": {
        "name": "Neurological & Mental Health",
        "icon": "brain",
        "color": "#059669",
        "diseases": ["alzheimers", "depression", "bipolar_disorder", "schizophrenia", "migraine"]
    },
    "autoimmune": {
        "name": "Autoimmune & Inflammatory",
        "icon": "shield",
        "color": "#d97706",
        "diseases": ["rheumatoid_arthritis", "crohns_disease", "ulcerative_colitis",
                    "multiple_sclerosis", "lupus", "celiac_disease", "psoriasis"]
    },
    "other": {
        "name": "Other Conditions",
        "icon": "health",
        "color": "#6b7280",
        "diseases": ["asthma", "glaucoma", "osteoporosis"]
    }
}

# Risk level explanations for patients
RISK_EXPLANATIONS = {
    "Very Low": {
        "summary": "Your genetic risk is significantly below average",
        "meaning": "Your genetic profile suggests you have a lower than typical predisposition for this condition compared to others of your ancestry. This is a favorable finding.",
        "action": "Continue standard preventive care and healthy lifestyle habits.",
        "icon": "check-circle"
    },
    "Low": {
        "summary": "Your genetic risk is below average",
        "meaning": "Your genetic predisposition for this condition is lower than most people of similar ancestry. While this is positive, other factors still influence risk.",
        "action": "Maintain healthy habits and follow standard screening guidelines.",
        "icon": "check"
    },
    "Average": {
        "summary": "Your genetic risk is typical for your population",
        "meaning": "Your genetic risk is similar to most people of your ancestry. This means genetics neither significantly increases nor decreases your risk.",
        "action": "Follow age-appropriate screening and prevention guidelines.",
        "icon": "minus"
    },
    "Elevated": {
        "summary": "Your genetic risk is above average",
        "meaning": "Your genetic profile indicates a moderately increased predisposition for this condition. This does not mean you will develop the condition, but proactive monitoring may be beneficial.",
        "action": "Discuss enhanced screening options with your healthcare provider.",
        "icon": "alert-triangle"
    },
    "High": {
        "summary": "Your genetic risk is significantly above average",
        "meaning": "Your genetic predisposition for this condition is higher than 90% of people of similar ancestry. Early intervention and enhanced monitoring are strongly recommended.",
        "action": "Consult with a specialist to discuss personalized prevention strategies.",
        "icon": "alert-circle"
    }
}


def generate_report_id() -> str:
    """Generate a unique report ID."""
    unique_id = uuid.uuid4().hex[:8].upper()
    return f"PRS-{unique_id}"


def generate_verification_code(report_id: str, patient_id: str) -> str:
    """Generate a verification code for the report."""
    data = f"{report_id}:{patient_id}:{datetime.now().strftime('%Y%m%d')}"
    return hashlib.sha256(data.encode()).hexdigest()[:12].upper()


# Clinical recommendations based on AHA/NHS guidelines
DISEASE_RECOMMENDATIONS = {
    "CAD": {
        "Very Low": [
            "Continue heart-healthy lifestyle habits",
            "Regular physical activity (150 min/week moderate exercise)",
            "Annual wellness checkup with lipid panel"
        ],
        "Low": [
            "Maintain healthy diet low in saturated fats",
            "Monitor blood pressure regularly",
            "Annual lipid panel screening"
        ],
        "Average": [
            "Consider Mediterranean or DASH diet",
            "Aim for 150+ minutes moderate exercise weekly",
            "Annual cardiovascular risk assessment",
            "Discuss statin therapy if other risk factors present"
        ],
        "Elevated": [
            "Schedule cardiovascular risk consultation",
            "Consider coronary calcium scoring (CAC scan)",
            "Strict blood pressure and cholesterol management",
            "Discuss aspirin therapy with physician",
            "Biannual lipid monitoring"
        ],
        "High": [
            "Urgent cardiology consultation recommended",
            "Comprehensive cardiovascular workup advised",
            "Aggressive risk factor modification",
            "Consider advanced imaging (stress test, angiography)",
            "Discuss preventive medications with specialist"
        ]
    },
    "breast_cancer": {
        "Very Low": [
            "Continue standard screening per age guidelines",
            "Monthly self-breast exams"
        ],
        "Low": [
            "Follow standard mammogram schedule",
            "Maintain healthy weight and limit alcohol"
        ],
        "Average": [
            "Annual mammogram starting at age 40",
            "Discuss family history with provider",
            "Consider risk-reducing lifestyle modifications"
        ],
        "Elevated": [
            "Discuss enhanced screening (MRI) with provider",
            "Consider genetic counseling for BRCA testing",
            "Annual clinical breast exam",
            "Biannual mammography starting earlier if appropriate"
        ],
        "High": [
            "Genetic counseling strongly recommended",
            "Discuss enhanced surveillance protocol",
            "Consider annual breast MRI in addition to mammogram",
            "Discuss risk-reducing strategies with oncologist"
        ]
    },
    "t2d": {
        "Very Low": [
            "Maintain healthy weight and active lifestyle",
            "Annual fasting glucose screening"
        ],
        "Low": [
            "Balanced diet with limited refined sugars",
            "Regular physical activity",
            "Monitor weight trends"
        ],
        "Average": [
            "Annual HbA1c and fasting glucose testing",
            "Consider prediabetes screening",
            "Diet counseling if BMI elevated"
        ],
        "Elevated": [
            "Biannual HbA1c monitoring",
            "Consider diabetes prevention program",
            "Weight management intervention if needed",
            "Discuss metformin if prediabetic"
        ],
        "High": [
            "Quarterly glucose monitoring recommended",
            "Intensive lifestyle intervention program",
            "Endocrinology consultation",
            "Consider preventive medication (metformin)"
        ]
    },
    "prostate_cancer": {
        "Very Low": [
            "Discuss PSA screening preferences with provider",
            "Annual wellness exam"
        ],
        "Low": [
            "Consider baseline PSA at age 50 (or 45 if family history)",
            "Standard screening per shared decision-making"
        ],
        "Average": [
            "PSA screening starting at age 50",
            "Discuss screening interval with provider",
            "Report any urinary symptoms promptly"
        ],
        "Elevated": [
            "Consider PSA screening starting at age 45",
            "Annual PSA monitoring",
            "Discuss prostate health with urologist"
        ],
        "High": [
            "Early PSA screening (age 40-45) recommended",
            "Urology consultation advised",
            "Consider enhanced monitoring protocol",
            "Discuss potential for MRI-based screening"
        ]
    },
    "alzheimers": {
        "Very Low": [
            "Maintain cognitive engagement activities",
            "Regular cardiovascular exercise"
        ],
        "Low": [
            "Continue brain-healthy lifestyle",
            "Social engagement and mental stimulation",
            "Quality sleep habits"
        ],
        "Average": [
            "Cognitive health optimization",
            "Cardiovascular risk factor management",
            "Consider baseline cognitive assessment at 65+"
        ],
        "Elevated": [
            "Discuss cognitive screening with provider",
            "Aggressive cardiovascular risk management",
            "Consider brain-healthy diet (MIND diet)",
            "Discuss genetic counseling if family history"
        ],
        "High": [
            "Neurologist consultation recommended",
            "Baseline cognitive testing advised",
            "Discuss research trial opportunities",
            "Comprehensive brain health planning"
        ]
    },
    "colorectal": {
        "Very Low": [
            "Standard colonoscopy at age 45",
            "Maintain fiber-rich diet"
        ],
        "Low": [
            "Follow standard screening guidelines",
            "High-fiber, low red meat diet"
        ],
        "Average": [
            "Colonoscopy at age 45, then every 10 years",
            "Limit processed meats",
            "Maintain healthy weight"
        ],
        "Elevated": [
            "Consider earlier screening (age 40)",
            "More frequent colonoscopy (every 5-7 years)",
            "Discuss family history with gastroenterologist"
        ],
        "High": [
            "Gastroenterology consultation recommended",
            "Enhanced surveillance colonoscopy",
            "Consider genetic syndrome testing",
            "Annual stool-based testing between colonoscopies"
        ]
    },
    "afib": {
        "Very Low": [
            "Annual pulse check at wellness visits",
            "Heart-healthy lifestyle"
        ],
        "Low": [
            "Monitor for irregular heartbeat symptoms",
            "Limit excessive alcohol and caffeine"
        ],
        "Average": [
            "Annual ECG consideration at wellness visits",
            "Report palpitations to provider",
            "Blood pressure management"
        ],
        "Elevated": [
            "Consider periodic ECG monitoring",
            "Discuss wearable heart monitors",
            "Strict blood pressure control",
            "Cardiology consultation if symptoms"
        ],
        "High": [
            "Cardiology evaluation recommended",
            "Consider continuous rhythm monitoring",
            "Discuss stroke prevention strategies",
            "Aggressive risk factor modification"
        ]
    },
    "stroke": {
        "Very Low": [
            "Maintain healthy blood pressure",
            "No smoking, limit alcohol"
        ],
        "Low": [
            "Annual blood pressure monitoring",
            "Heart-healthy diet"
        ],
        "Average": [
            "Regular blood pressure checks",
            "Consider carotid screening if risk factors",
            "Know stroke warning signs (FAST)"
        ],
        "Elevated": [
            "Aggressive blood pressure management",
            "Consider carotid ultrasound screening",
            "Discuss aspirin therapy",
            "Neurology consultation if symptoms"
        ],
        "High": [
            "Urgent stroke risk evaluation recommended",
            "Comprehensive vascular imaging",
            "Aggressive antiplatelet/statin therapy discussion",
            "Know nearest stroke center"
        ]
    },
    "obesity": {
        "Very Low": [
            "Maintain current healthy weight practices",
            "Regular physical activity"
        ],
        "Low": [
            "Monitor weight trends annually",
            "Balanced nutrition"
        ],
        "Average": [
            "Annual BMI monitoring",
            "Nutritional counseling if needed",
            "Regular exercise routine"
        ],
        "Elevated": [
            "Consider structured weight management program",
            "Endocrinology consultation if struggling",
            "Screen for metabolic complications"
        ],
        "High": [
            "Obesity medicine consultation recommended",
            "Discuss medical weight management options",
            "Comprehensive metabolic panel",
            "Consider bariatric surgery evaluation if BMI qualifies"
        ]
    },
    "depression": {
        "Very Low": [
            "Maintain social connections",
            "Regular exercise and sleep hygiene"
        ],
        "Low": [
            "Mental wellness practices",
            "Stress management techniques"
        ],
        "Average": [
            "Monitor mood patterns",
            "Consider therapy/counseling for prevention",
            "Maintain support network"
        ],
        "Elevated": [
            "Discuss mental health screening with provider",
            "Consider preventive therapy",
            "Develop stress management plan"
        ],
        "High": [
            "Mental health evaluation recommended",
            "Discuss prophylactic interventions",
            "Develop comprehensive mental health plan",
            "Consider psychiatry consultation"
        ]
    }
}

# Display names for diseases
DISEASE_DISPLAY_NAMES = {
    # Original 10 diseases
    "cad": "Coronary Artery Disease",
    "CAD": "Coronary Artery Disease",
    "breast_cancer": "Breast Cancer",
    "t2d": "Type 2 Diabetes",
    "prostate_cancer": "Prostate Cancer",
    "alzheimers": "Alzheimer's Disease",
    "colorectal": "Colorectal Cancer",
    "colorectal_cancer": "Colorectal Cancer",
    "afib": "Atrial Fibrillation",
    "stroke": "Stroke",
    "obesity": "Obesity",
    "depression": "Major Depression",
    # Extended diseases
    "hypertension": "Hypertension",
    "asthma": "Asthma",
    "rheumatoid_arthritis": "Rheumatoid Arthritis",
    "crohns_disease": "Crohn's Disease",
    "ulcerative_colitis": "Ulcerative Colitis",
    "multiple_sclerosis": "Multiple Sclerosis",
    "lupus": "Systemic Lupus Erythematosus",
    "celiac_disease": "Celiac Disease",
    "psoriasis": "Psoriasis",
    "migraine": "Migraine",
    "glaucoma": "Glaucoma",
    "osteoporosis": "Osteoporosis",
    "gout": "Gout",
    "bipolar_disorder": "Bipolar Disorder",
    "schizophrenia": "Schizophrenia",
}


def get_disease_category(disease: str) -> tuple[str, dict]:
    """Get the category for a disease."""
    disease_lower = disease.lower()
    for cat_key, cat_info in DISEASE_CATEGORIES.items():
        if disease_lower in cat_info["diseases"]:
            return cat_key, cat_info
    return "other", DISEASE_CATEGORIES["other"]


def group_diseases_by_category(prs_results: dict) -> dict:
    """Group PRS results by disease category."""
    grouped = {}
    for disease, data in prs_results.items():
        cat_key, cat_info = get_disease_category(disease)
        if cat_key not in grouped:
            grouped[cat_key] = {
                "info": cat_info,
                "diseases": []
            }
        grouped[cat_key]["diseases"].append((disease, data))

    # Sort diseases within each category by percentile
    for cat_key in grouped:
        grouped[cat_key]["diseases"].sort(
            key=lambda x: x[1].get("percentile", 0),
            reverse=True
        )

    return grouped


def get_risk_color(percentile: float) -> str:
    """Get color for risk visualization based on percentile."""
    if percentile < 0.25:
        return "#22c55e"  # Green
    elif percentile < 0.75:
        return "#eab308"  # Yellow
    elif percentile < 0.90:
        return "#f97316"  # Orange
    else:
        return "#ef4444"  # Red


def get_risk_background(percentile: float) -> str:
    """Get background color for risk cells."""
    if percentile < 0.25:
        return "#dcfce7"  # Light green
    elif percentile < 0.75:
        return "#fef9c3"  # Light yellow
    elif percentile < 0.90:
        return "#ffedd5"  # Light orange
    else:
        return "#fee2e2"  # Light red


def get_recommendations(disease: str, risk_category: str) -> list[str]:
    """
    Return actionable lifestyle/screening recommendations per AHA/NHS guidelines.

    Args:
        disease: Disease identifier (e.g., 'CAD', 'breast_cancer')
        risk_category: Risk level ('Very Low', 'Low', 'Average', 'Elevated', 'High')

    Returns:
        List of recommendation strings
    """
    disease_recs = DISEASE_RECOMMENDATIONS.get(disease, {})
    return disease_recs.get(risk_category, [
        "Discuss your results with your healthcare provider",
        "Maintain a healthy lifestyle with regular exercise and balanced diet"
    ])


def generate_html_report(prs_results: dict[str, Any], user_info: dict[str, Any]) -> str:
    """
    Generate NHS-grade clinical HTML report for PRS results.

    Args:
        prs_results: Dictionary with disease names as keys, each containing:
            - raw_prs: float
            - zscore: float
            - percentile: float (0-1)
            - risk_category: str
            - matched_variants: int
            - total_variants: int
        user_info: Dictionary containing:
            - patient_id: str (optional)
            - ancestry: str
            - filename: str (optional)

    Returns:
        Complete HTML report as string
    """
    # Generate report metadata
    report_id = generate_report_id()
    report_datetime = datetime.now()
    report_date = report_datetime.strftime("%B %d, %Y")
    report_time = report_datetime.strftime("%H:%M:%S")
    report_timestamp = report_datetime.strftime("%Y-%m-%d %H:%M:%S UTC")

    patient_id = user_info.get("patient_id", "Anonymous")
    ancestry = user_info.get("ancestry", "Not specified")
    filename = user_info.get("filename", "Not specified")

    verification_code = generate_verification_code(report_id, patient_id)

    # Sort results by percentile (highest risk first)
    sorted_diseases = sorted(
        prs_results.items(),
        key=lambda x: x[1].get("percentile", 0),
        reverse=True
    )

    # Count risk categories for summary
    risk_counts = {"High": 0, "Elevated": 0, "Average": 0, "Low": 0, "Very Low": 0}
    for disease, data in sorted_diseases:
        category = data.get("risk_category", "Average")
        if category in risk_counts:
            risk_counts[category] += 1

    # Get top 3 elevated risks
    top_risks = [
        (disease, data) for disease, data in sorted_diseases
        if data.get("percentile", 0) >= 0.75
    ][:3]

    # Build risk summary badges
    risk_summary_badges = ""
    if risk_counts["High"] > 0:
        risk_summary_badges += f'<span class="risk-badge high">{risk_counts["High"]} High</span>'
    if risk_counts["Elevated"] > 0:
        risk_summary_badges += f'<span class="risk-badge elevated">{risk_counts["Elevated"]} Elevated</span>'
    if risk_counts["Average"] > 0:
        risk_summary_badges += f'<span class="risk-badge average">{risk_counts["Average"]} Average</span>'
    low_count = risk_counts["Low"] + risk_counts["Very Low"]
    if low_count > 0:
        risk_summary_badges += f'<span class="risk-badge low">{low_count} Low</span>'

    # Build executive summary with top 3 risks
    exec_summary_content = ""
    if top_risks:
        for disease, data in top_risks:
            display_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
            percentile = data.get("percentile", 0) * 100
            category = data.get("risk_category", "Unknown")
            explanation = RISK_EXPLANATIONS.get(category, {})

            exec_summary_content += f"""
            <div class="top-risk-card">
                <div class="top-risk-header">
                    <span class="top-risk-name">{display_name}</span>
                    <span class="top-risk-percentile">{percentile:.0f}th percentile</span>
                </div>
                <div class="risk-spectrum">
                    <div class="spectrum-gradient"></div>
                    <div class="spectrum-marker" style="left: {percentile}%;"></div>
                    <div class="spectrum-labels">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                </div>
                <div class="risk-explanation">
                    <strong>{explanation.get('summary', category)}</strong>
                    <p>{explanation.get('meaning', '')}</p>
                </div>
            </div>
            """
        exec_summary_class = "warning" if risk_counts["High"] > 0 else "caution"
    else:
        exec_summary_content = """
        <div class="positive-summary">
            <div class="positive-icon">&#10003;</div>
            <div class="positive-text">
                <strong>No Significantly Elevated Genetic Risks Identified</strong>
                <p>Your genetic profile does not show significantly elevated risk (above 75th percentile)
                for any of the conditions analyzed. Continue following standard preventive care guidelines.</p>
            </div>
        </div>
        """
        exec_summary_class = "success"

    # Build grouped disease sections
    grouped = group_diseases_by_category(prs_results)
    category_sections = ""

    for cat_key in ["cardiovascular", "oncology", "metabolic", "neurological", "autoimmune", "other"]:
        if cat_key not in grouped:
            continue

        cat_data = grouped[cat_key]
        cat_info = cat_data["info"]
        diseases = cat_data["diseases"]

        disease_rows = ""
        for disease, data in diseases:
            display_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
            percentile = data.get("percentile", 0)
            percentile_pct = percentile * 100
            category = data.get("risk_category", "Unknown")
            zscore = data.get("zscore", 0)
            matched = data.get("matched_variants", 0)
            total = data.get("total_variants", 0)
            coverage = (matched / total * 100) if total > 0 else 0

            color = get_risk_color(percentile)
            bg_color = get_risk_background(percentile)

            disease_rows += f"""
            <tr>
                <td class="disease-name">{display_name}</td>
                <td class="spectrum-cell">
                    <div class="mini-spectrum">
                        <div class="mini-spectrum-bg"></div>
                        <div class="mini-spectrum-marker" style="left: {percentile_pct}%;"></div>
                    </div>
                    <span class="percentile-value">{percentile_pct:.0f}%</span>
                </td>
                <td><span class="category-badge" style="background-color: {bg_color}; color: {color};">{category}</span></td>
                <td class="numeric">{zscore:+.2f}</td>
                <td class="coverage">{matched:,} / {total:,}</td>
            </tr>
            """

        category_sections += f"""
        <div class="category-section">
            <div class="category-header" style="border-left-color: {cat_info['color']};">
                <h3>{cat_info['name']}</h3>
            </div>
            <table class="disease-table">
                <thead>
                    <tr>
                        <th>Condition</th>
                        <th>Risk Spectrum</th>
                        <th>Category</th>
                        <th>Z-Score</th>
                        <th>Variants</th>
                    </tr>
                </thead>
                <tbody>
                    {disease_rows}
                </tbody>
            </table>
        </div>
        """

    # Build recommendations section
    recommendations_html = ""
    for disease, data in top_risks:
        display_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
        category = data.get("risk_category", "Average")
        recs = get_recommendations(disease, category)
        percentile = data.get("percentile", 0) * 100
        color = get_risk_color(data.get("percentile", 0))

        recs_list = "".join([f"<li>{rec}</li>" for rec in recs])
        recommendations_html += f"""
        <div class="recommendation-card" style="border-top-color: {color};">
            <div class="rec-header">
                <span class="rec-disease">{display_name}</span>
                <span class="rec-percentile" style="color: {color};">{percentile:.0f}th percentile</span>
            </div>
            <ul class="rec-list">{recs_list}</ul>
        </div>
        """

    if not recommendations_html:
        recommendations_html = """
        <div class="recommendation-card general">
            <div class="rec-header">
                <span class="rec-disease">General Wellness Recommendations</span>
            </div>
            <ul class="rec-list">
                <li>Continue regular preventive care visits with your healthcare provider</li>
                <li>Maintain a balanced diet rich in fruits, vegetables, and whole grains</li>
                <li>Aim for at least 150 minutes of moderate physical activity weekly</li>
                <li>Follow age-appropriate health screening guidelines</li>
                <li>Discuss your family history with your healthcare provider</li>
            </ul>
        </div>
        """

    # Build what this means section
    what_this_means = """
    <div class="explanation-grid">
        <div class="explanation-card very-low">
            <div class="exp-header"><span class="exp-dot"></span>Very Low (0-10%)</div>
            <p>Your genetic predisposition is significantly below average. Continue standard preventive care.</p>
        </div>
        <div class="explanation-card low">
            <div class="exp-header"><span class="exp-dot"></span>Low (10-25%)</div>
            <p>Lower than typical genetic risk. Maintain healthy lifestyle habits.</p>
        </div>
        <div class="explanation-card average">
            <div class="exp-header"><span class="exp-dot"></span>Average (25-75%)</div>
            <p>Typical genetic risk for your population. Follow standard screening guidelines.</p>
        </div>
        <div class="explanation-card elevated">
            <div class="exp-header"><span class="exp-dot"></span>Elevated (75-90%)</div>
            <p>Moderately increased genetic risk. Consider discussing enhanced screening with your provider.</p>
        </div>
        <div class="explanation-card high">
            <div class="exp-header"><span class="exp-dot"></span>High (90-100%)</div>
            <p>Significantly elevated genetic risk. Specialist consultation recommended.</p>
        </div>
    </div>
    """

    html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Polygenic Risk Score Report - {report_id}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root {{
            --primary: #1e40af;
            --primary-light: #3b82f6;
            --success: #059669;
            --warning: #d97706;
            --danger: #dc2626;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-500: #6b7280;
            --gray-700: #374151;
            --gray-900: #111827;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--gray-900);
            background: var(--gray-50);
            font-size: 14px;
        }}

        .container {{
            max-width: 900px;
            margin: 0 auto;
            padding: 30px 20px;
        }}

        /* Header */
        .report-header {{
            background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1e40af 100%);
            color: white;
            padding: 40px;
            border-radius: 16px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
        }}

        .report-header::before {{
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
        }}

        .header-content {{
            position: relative;
            z-index: 1;
        }}

        .header-top {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }}

        .logo-section {{
            display: flex;
            align-items: center;
            gap: 15px;
        }}

        .logo {{
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
            backdrop-filter: blur(10px);
        }}

        .report-title {{
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 4px;
        }}

        .report-subtitle {{
            font-size: 14px;
            opacity: 0.9;
        }}

        .qr-placeholder {{
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.15);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            text-align: center;
            backdrop-filter: blur(10px);
        }}

        .qr-placeholder .qr-grid {{
            width: 50px;
            height: 50px;
            background: repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.3) 0px,
                rgba(255,255,255,0.3) 5px,
                transparent 5px,
                transparent 10px
            ),
            repeating-linear-gradient(
                90deg,
                rgba(255,255,255,0.3) 0px,
                rgba(255,255,255,0.3) 5px,
                transparent 5px,
                transparent 10px
            );
            border-radius: 4px;
            margin-bottom: 4px;
        }}

        .header-meta {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
        }}

        .meta-item {{
            text-align: center;
        }}

        .meta-label {{
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.8;
            margin-bottom: 4px;
        }}

        .meta-value {{
            font-size: 14px;
            font-weight: 600;
        }}

        /* Risk Summary Badges */
        .risk-summary {{
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 25px;
        }}

        .risk-badge {{
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
        }}

        .risk-badge.high {{
            background: #fee2e2;
            color: #991b1b;
        }}

        .risk-badge.elevated {{
            background: #ffedd5;
            color: #9a3412;
        }}

        .risk-badge.average {{
            background: #fef9c3;
            color: #854d0e;
        }}

        .risk-badge.low {{
            background: #dcfce7;
            color: #166534;
        }}

        /* Executive Summary */
        .executive-summary {{
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}

        .executive-summary.warning {{
            border-left: 4px solid var(--danger);
        }}

        .executive-summary.caution {{
            border-left: 4px solid var(--warning);
        }}

        .executive-summary.success {{
            border-left: 4px solid var(--success);
        }}

        .exec-title {{
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
            color: var(--gray-900);
        }}

        .top-risk-card {{
            background: var(--gray-50);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
        }}

        .top-risk-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }}

        .top-risk-name {{
            font-weight: 600;
            font-size: 16px;
        }}

        .top-risk-percentile {{
            font-weight: 700;
            color: var(--danger);
        }}

        /* Risk Spectrum */
        .risk-spectrum {{
            position: relative;
            margin-bottom: 15px;
        }}

        .spectrum-gradient {{
            height: 12px;
            border-radius: 6px;
            background: linear-gradient(to right,
                #22c55e 0%,
                #22c55e 10%,
                #86efac 10%,
                #86efac 25%,
                #fbbf24 25%,
                #fbbf24 75%,
                #fb923c 75%,
                #fb923c 90%,
                #ef4444 90%,
                #ef4444 100%
            );
        }}

        .spectrum-marker {{
            position: absolute;
            top: -4px;
            width: 20px;
            height: 20px;
            background: white;
            border: 3px solid var(--gray-900);
            border-radius: 50%;
            transform: translateX(-50%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }}

        .spectrum-labels {{
            display: flex;
            justify-content: space-between;
            margin-top: 6px;
            font-size: 10px;
            color: var(--gray-500);
        }}

        .risk-explanation {{
            background: white;
            padding: 12px;
            border-radius: 6px;
            font-size: 13px;
        }}

        .risk-explanation strong {{
            display: block;
            margin-bottom: 4px;
            color: var(--gray-900);
        }}

        .risk-explanation p {{
            color: var(--gray-500);
            margin: 0;
        }}

        .positive-summary {{
            display: flex;
            align-items: flex-start;
            gap: 20px;
        }}

        .positive-icon {{
            width: 50px;
            height: 50px;
            background: #dcfce7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: var(--success);
            flex-shrink: 0;
        }}

        .positive-text strong {{
            display: block;
            font-size: 16px;
            margin-bottom: 8px;
        }}

        .positive-text p {{
            color: var(--gray-500);
            margin: 0;
        }}

        /* Section styling */
        .section {{
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}

        .section-title {{
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--gray-200);
            color: var(--gray-900);
        }}

        /* Category Sections */
        .category-section {{
            margin-bottom: 25px;
        }}

        .category-header {{
            padding: 12px 15px;
            background: var(--gray-50);
            border-left: 4px solid;
            border-radius: 0 8px 8px 0;
            margin-bottom: 12px;
        }}

        .category-header h3 {{
            font-size: 15px;
            font-weight: 600;
            color: var(--gray-700);
            margin: 0;
        }}

        /* Disease Table */
        .disease-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }}

        .disease-table th {{
            text-align: left;
            padding: 10px 12px;
            font-weight: 600;
            color: var(--gray-500);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--gray-200);
        }}

        .disease-table td {{
            padding: 12px;
            border-bottom: 1px solid var(--gray-100);
            vertical-align: middle;
        }}

        .disease-table tr:last-child td {{
            border-bottom: none;
        }}

        .disease-name {{
            font-weight: 500;
        }}

        .spectrum-cell {{
            min-width: 140px;
        }}

        .mini-spectrum {{
            position: relative;
            height: 8px;
            border-radius: 4px;
            margin-bottom: 4px;
        }}

        .mini-spectrum-bg {{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 4px;
            background: linear-gradient(to right,
                #22c55e 0%, #86efac 25%, #fbbf24 50%, #fb923c 75%, #ef4444 100%
            );
        }}

        .mini-spectrum-marker {{
            position: absolute;
            top: -2px;
            width: 12px;
            height: 12px;
            background: white;
            border: 2px solid var(--gray-900);
            border-radius: 50%;
            transform: translateX(-50%);
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }}

        .percentile-value {{
            font-size: 11px;
            color: var(--gray-500);
        }}

        .category-badge {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }}

        .numeric {{
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 12px;
        }}

        .coverage {{
            font-size: 11px;
            color: var(--gray-500);
        }}

        /* Explanation Grid */
        .explanation-grid {{
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
        }}

        .explanation-card {{
            padding: 15px;
            border-radius: 8px;
            font-size: 11px;
        }}

        .explanation-card.very-low {{
            background: #dcfce7;
        }}

        .explanation-card.low {{
            background: #ecfdf5;
        }}

        .explanation-card.average {{
            background: #fef9c3;
        }}

        .explanation-card.elevated {{
            background: #ffedd5;
        }}

        .explanation-card.high {{
            background: #fee2e2;
        }}

        .exp-header {{
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 12px;
        }}

        .exp-dot {{
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }}

        .very-low .exp-dot {{ background: #22c55e; }}
        .low .exp-dot {{ background: #86efac; }}
        .average .exp-dot {{ background: #fbbf24; }}
        .elevated .exp-dot {{ background: #fb923c; }}
        .high .exp-dot {{ background: #ef4444; }}

        .explanation-card p {{
            color: var(--gray-700);
            margin: 0;
            line-height: 1.4;
        }}

        /* Recommendations */
        .recommendations-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }}

        .recommendation-card {{
            background: var(--gray-50);
            border-radius: 10px;
            padding: 20px;
            border-top: 4px solid var(--gray-300);
        }}

        .recommendation-card.general {{
            border-top-color: var(--primary);
        }}

        .rec-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }}

        .rec-disease {{
            font-weight: 600;
            font-size: 15px;
        }}

        .rec-percentile {{
            font-weight: 700;
            font-size: 13px;
        }}

        .rec-list {{
            margin: 0;
            padding-left: 20px;
        }}

        .rec-list li {{
            margin-bottom: 8px;
            color: var(--gray-700);
            line-height: 1.5;
        }}

        /* Disclaimer */
        .disclaimer {{
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 25px;
            margin-top: 25px;
        }}

        .disclaimer-header {{
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
        }}

        .disclaimer-icon {{
            width: 24px;
            height: 24px;
            background: var(--danger);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 14px;
        }}

        .disclaimer-title {{
            font-size: 16px;
            font-weight: 700;
            color: #991b1b;
        }}

        .disclaimer p {{
            color: #7f1d1d;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
        }}

        /* Footer */
        .report-footer {{
            text-align: center;
            padding: 30px 20px;
            color: var(--gray-500);
            font-size: 11px;
            border-top: 1px solid var(--gray-200);
            margin-top: 30px;
        }}

        .footer-verification {{
            background: var(--gray-100);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 6px;
            font-family: 'SF Mono', Monaco, monospace;
            margin-bottom: 12px;
        }}

        .footer-links {{
            margin-top: 12px;
        }}

        /* Print Styles */
        @media print {{
            body {{
                background: white;
                font-size: 11pt;
            }}

            .container {{
                padding: 0;
                max-width: 100%;
            }}

            .section, .executive-summary {{
                box-shadow: none;
                border: 1px solid var(--gray-200);
                page-break-inside: avoid;
            }}

            .report-header {{
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }}

            .category-section {{
                page-break-inside: avoid;
            }}

            .explanation-grid {{
                grid-template-columns: repeat(5, 1fr);
            }}
        }}

        @page {{
            size: A4;
            margin: 1.5cm;
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="report-header">
            <div class="header-content">
                <div class="header-top">
                    <div class="logo-section">
                        <div class="logo">PRS</div>
                        <div>
                            <div class="report-title">Polygenic Risk Score Report</div>
                            <div class="report-subtitle">Clinical Genetic Risk Assessment</div>
                        </div>
                    </div>
                    <div class="qr-placeholder">
                        <div class="qr-grid"></div>
                        <span>Scan to verify</span>
                    </div>
                </div>
                <div class="header-meta">
                    <div class="meta-item">
                        <div class="meta-label">Report ID</div>
                        <div class="meta-value">{report_id}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Generated</div>
                        <div class="meta-value">{report_date}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Patient ID</div>
                        <div class="meta-value">{patient_id}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Ancestry</div>
                        <div class="meta-value">{ancestry}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Risk Summary Badges -->
        <div class="risk-summary">
            {risk_summary_badges}
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary {exec_summary_class}">
            <div class="exec-title">Executive Summary - Priority Findings</div>
            {exec_summary_content}
        </div>

        <!-- What This Means Section -->
        <div class="section">
            <div class="section-title">Understanding Your Risk Categories</div>
            {what_this_means}
        </div>

        <!-- Complete Results by Category -->
        <div class="section">
            <div class="section-title">Complete Risk Assessment by Category</div>
            {category_sections}
        </div>

        <!-- Recommendations -->
        <div class="section">
            <div class="section-title">Personalized Clinical Recommendations</div>
            <div class="recommendations-grid">
                {recommendations_html}
            </div>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer">
            <div class="disclaimer-header">
                <div class="disclaimer-icon">!</div>
                <div class="disclaimer-title">Important Clinical Disclaimer</div>
            </div>
            <p>
                <strong>This report is NOT a medical diagnosis.</strong> Polygenic risk scores indicate
                genetic predisposition based on current scientific knowledge and do not account for
                lifestyle factors, family history, environmental influences, or gene-environment interactions.
                These results should be interpreted by a qualified healthcare provider in the context of your
                complete medical history. Do not make medical decisions based solely on this report.
                Always consult with your physician before starting any screening program or making changes
                to your healthcare plan. Genetic risk is only one component of overall disease risk.
            </p>
        </div>

        <!-- Footer -->
        <div class="report-footer">
            <div class="footer-verification">
                Verification Code: {verification_code}
            </div>
            <p>Generated: {report_timestamp} | Source: {filename}</p>
            <p class="footer-links">
                Based on validated scores from <strong>PGS Catalog</strong> (www.pgscatalog.org)<br>
                Population normalization: {ancestry}
            </p>
        </div>
    </div>
</body>
</html>
"""
    return html


def generate_pdf_report(
    prs_results: dict[str, Any],
    user_info: dict[str, Any],
    output_path: Path
) -> Path:
    """
    Generate a professional PDF report from PRS results.

    Uses WeasyPrint to convert HTML to PDF with proper formatting.

    Args:
        prs_results: Dictionary with disease names as keys and results as values
        user_info: Dictionary with patient_id, ancestry, filename
        output_path: Path where PDF should be saved

    Returns:
        Path to the generated PDF file
    """
    html_content = generate_html_report(prs_results, user_info)

    # Additional CSS for PDF optimization
    pdf_css = CSS(string="""
        @page {
            size: A4;
            margin: 1.5cm 2cm;

            @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 9pt;
                color: #6b7280;
            }

            @bottom-right {
                content: "Confidential Medical Report";
                font-size: 8pt;
                color: #9ca3af;
            }
        }

        @page :first {
            @bottom-center {
                content: none;
            }
            @bottom-right {
                content: none;
            }
        }

        body {
            font-size: 10pt;
        }

        .container {
            padding: 0;
        }

        .section, .executive-summary {
            box-shadow: none;
            border: 1px solid #e5e7eb;
            page-break-inside: avoid;
            margin-bottom: 20px;
        }

        .category-section {
            page-break-inside: avoid;
        }

        .disease-table {
            page-break-inside: auto;
        }

        .disease-table tr {
            page-break-inside: avoid;
        }

        .recommendation-card {
            page-break-inside: avoid;
        }

        .disclaimer {
            page-break-inside: avoid;
        }

        .explanation-grid {
            page-break-inside: avoid;
        }

        .report-header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .spectrum-gradient, .mini-spectrum-bg {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .risk-badge, .category-badge, .exp-dot {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* Ensure gradient backgrounds print correctly */
        .explanation-card {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    """)

    # Ensure output directory exists
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Generate PDF
    html = HTML(string=html_content)
    html.write_pdf(output_path, stylesheets=[pdf_css])

    return output_path


def generate_summary_text(prs_results: dict[str, Any]) -> str:
    """
    Generate a plain text summary of PRS results for display.

    Args:
        prs_results: Dictionary with disease results

    Returns:
        Formatted text summary
    """
    lines = ["=" * 50, "POLYGENIC RISK SCORE SUMMARY", "=" * 50, ""]

    sorted_diseases = sorted(
        prs_results.items(),
        key=lambda x: x[1].get("percentile", 0),
        reverse=True
    )

    for disease, data in sorted_diseases:
        display_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
        percentile = data.get("percentile", 0) * 100
        category = data.get("risk_category", "Unknown")

        # Create simple text bar
        bar_length = int(percentile / 5)
        bar = "#" * bar_length + "-" * (20 - bar_length)

        lines.append(f"{display_name:.<30} [{bar}] {percentile:5.1f}% ({category})")

    lines.append("")
    lines.append("=" * 50)

    return "\n".join(lines)
