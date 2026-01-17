"""
NHS-grade clinical report generation for Polygenic Risk Scores.

Generates professional HTML and PDF reports with risk visualizations,
clinical disclaimers, and actionable recommendations.
"""

from datetime import datetime
from pathlib import Path
from typing import Any

from weasyprint import HTML, CSS


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
    "CAD": "Coronary Artery Disease",
    "breast_cancer": "Breast Cancer",
    "t2d": "Type 2 Diabetes",
    "prostate_cancer": "Prostate Cancer",
    "alzheimers": "Alzheimer's Disease",
    "colorectal": "Colorectal Cancer",
    "afib": "Atrial Fibrillation",
    "stroke": "Stroke",
    "obesity": "Obesity",
    "depression": "Major Depression"
}


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
    report_date = datetime.now().strftime("%B %d, %Y")
    patient_id = user_info.get("patient_id", "Anonymous")
    ancestry = user_info.get("ancestry", "Not specified")
    filename = user_info.get("filename", "Not specified")

    # Sort results by percentile (highest risk first)
    sorted_diseases = sorted(
        prs_results.items(),
        key=lambda x: x[1].get("percentile", 0),
        reverse=True
    )

    # Get top 5 elevated risks (above 75th percentile)
    elevated_risks = [
        (disease, data) for disease, data in sorted_diseases
        if data.get("percentile", 0) >= 0.75
    ][:5]

    # Build executive summary section
    if elevated_risks:
        summary_items = ""
        for disease, data in elevated_risks:
            display_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
            percentile = data.get("percentile", 0) * 100
            category = data.get("risk_category", "Unknown")
            color = get_risk_color(data.get("percentile", 0))
            summary_items += f"""
            <div class="summary-item">
                <div class="summary-disease">{display_name}</div>
                <div class="summary-bar-container">
                    <div class="summary-bar" style="width: {percentile}%; background-color: {color};"></div>
                </div>
                <div class="summary-percentile" style="color: {color};">{percentile:.0f}th percentile - {category}</div>
            </div>
            """
        executive_summary = f"""
        <div class="executive-summary warning">
            <h2>Executive Summary - Elevated Risk Areas</h2>
            <p>Based on your genetic profile, the following conditions show elevated genetic risk:</p>
            {summary_items}
        </div>
        """
    else:
        executive_summary = """
        <div class="executive-summary success">
            <h2>Executive Summary</h2>
            <p>Based on your genetic profile, no conditions show significantly elevated genetic risk (above 75th percentile).
            This is a positive finding, though standard preventive care recommendations still apply.</p>
        </div>
        """

    # Build full results table
    table_rows = ""
    for disease, data in sorted_diseases:
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

        table_rows += f"""
        <tr>
            <td class="disease-name">{display_name}</td>
            <td class="percentile-cell" style="background-color: {bg_color};">
                <div class="percentile-bar-container">
                    <div class="percentile-bar" style="width: {percentile_pct}%; background-color: {color};"></div>
                </div>
                <span class="percentile-text">{percentile_pct:.1f}%</span>
            </td>
            <td style="background-color: {bg_color}; color: {color}; font-weight: 600;">{category}</td>
            <td>{zscore:.2f}</td>
            <td>{matched:,} / {total:,} ({coverage:.1f}%)</td>
        </tr>
        """

    # Build recommendations section
    recommendations_html = ""
    for disease, data in elevated_risks[:3]:  # Top 3 elevated risks
        display_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
        category = data.get("risk_category", "Average")
        recs = get_recommendations(disease, category)

        recs_list = "".join([f"<li>{rec}</li>" for rec in recs])
        recommendations_html += f"""
        <div class="recommendation-card">
            <h4>{display_name}</h4>
            <ul>{recs_list}</ul>
        </div>
        """

    if not recommendations_html:
        recommendations_html = """
        <div class="recommendation-card">
            <h4>General Wellness</h4>
            <ul>
                <li>Continue regular preventive care visits</li>
                <li>Maintain healthy diet and regular exercise</li>
                <li>Follow age-appropriate screening guidelines</li>
                <li>Discuss family history with your healthcare provider</li>
            </ul>
        </div>
        """

    html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Polygenic Risk Score Report</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
        }}

        .container {{
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }}

        .header {{
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            border-radius: 12px;
            margin-bottom: 30px;
        }}

        .header h1 {{
            font-size: 28px;
            margin-bottom: 10px;
        }}

        .header .subtitle {{
            font-size: 16px;
            opacity: 0.9;
        }}

        .logo-placeholder {{
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
        }}

        .patient-info {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }}

        .info-item {{
            padding: 10px;
        }}

        .info-label {{
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        .info-value {{
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
        }}

        .executive-summary {{
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
        }}

        .executive-summary.warning {{
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
        }}

        .executive-summary.success {{
            background: #d1fae5;
            border-left: 4px solid #10b981;
        }}

        .executive-summary h2 {{
            margin-bottom: 15px;
            font-size: 20px;
        }}

        .summary-item {{
            margin: 15px 0;
        }}

        .summary-disease {{
            font-weight: 600;
            margin-bottom: 5px;
        }}

        .summary-bar-container {{
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 5px;
        }}

        .summary-bar {{
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }}

        .summary-percentile {{
            font-size: 14px;
            font-weight: 600;
        }}

        .section {{
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}

        .section h2 {{
            font-size: 20px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }}

        th {{
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
        }}

        td {{
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }}

        .disease-name {{
            font-weight: 600;
        }}

        .percentile-cell {{
            min-width: 150px;
        }}

        .percentile-bar-container {{
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 4px;
        }}

        .percentile-bar {{
            height: 100%;
            border-radius: 3px;
        }}

        .percentile-text {{
            font-size: 12px;
            color: #6b7280;
        }}

        .recommendations {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }}

        .recommendation-card {{
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }}

        .recommendation-card h4 {{
            margin-bottom: 12px;
            color: #1e40af;
        }}

        .recommendation-card ul {{
            margin-left: 20px;
        }}

        .recommendation-card li {{
            margin-bottom: 8px;
            color: #4b5563;
        }}

        .disclaimer {{
            background: #fee2e2;
            border: 1px solid #fca5a5;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }}

        .disclaimer h3 {{
            color: #dc2626;
            margin-bottom: 10px;
        }}

        .disclaimer p {{
            font-size: 14px;
            color: #7f1d1d;
        }}

        .footer {{
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
        }}

        .legend {{
            display: flex;
            gap: 20px;
            margin-top: 20px;
            flex-wrap: wrap;
        }}

        .legend-item {{
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
        }}

        .legend-color {{
            width: 16px;
            height: 16px;
            border-radius: 4px;
        }}

        @media print {{
            body {{
                background: white;
            }}
            .container {{
                padding: 0;
            }}
            .section {{
                box-shadow: none;
                border: 1px solid #e5e7eb;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-placeholder">PRS</div>
            <h1>Polygenic Risk Score Report</h1>
            <p class="subtitle">Clinical Genetic Risk Assessment</p>
        </div>

        <div class="patient-info">
            <div class="info-item">
                <div class="info-label">Report Date</div>
                <div class="info-value">{report_date}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Patient ID</div>
                <div class="info-value">{patient_id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Ancestry</div>
                <div class="info-value">{ancestry}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Source File</div>
                <div class="info-value">{filename}</div>
            </div>
        </div>

        {executive_summary}

        <div class="section">
            <h2>Complete Risk Assessment</h2>
            <table>
                <thead>
                    <tr>
                        <th>Condition</th>
                        <th>Percentile</th>
                        <th>Risk Category</th>
                        <th>Z-Score</th>
                        <th>Variant Coverage</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: #22c55e;"></div>
                    <span>Low Risk (&lt;25%)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #eab308;"></div>
                    <span>Average (25-75%)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #f97316;"></div>
                    <span>Elevated (75-90%)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #ef4444;"></div>
                    <span>High Risk (&gt;90%)</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Clinical Recommendations</h2>
            <div class="recommendations">
                {recommendations_html}
            </div>
        </div>

        <div class="disclaimer">
            <h3>Important Clinical Disclaimer</h3>
            <p>
                <strong>This report is NOT a medical diagnosis.</strong> Polygenic risk scores indicate
                genetic predisposition and do not account for lifestyle factors, family history, or
                environmental influences. These results should be interpreted by a qualified healthcare
                provider in the context of your complete medical history. Do not make medical decisions
                based solely on this report. Always consult with your physician before starting any
                screening program or making changes to your healthcare plan.
            </p>
        </div>

        <div class="footer">
            <p>Generated by Polygenic Risk Score Calculator | {report_date}</p>
            <p>Based on PGS Catalog scores | Population normalization: {ancestry}</p>
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
            margin: 2cm;
        }

        body {
            font-size: 11pt;
        }

        .section {
            page-break-inside: avoid;
        }

        table {
            page-break-inside: auto;
        }

        tr {
            page-break-inside: avoid;
        }

        .disclaimer {
            page-break-inside: avoid;
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
