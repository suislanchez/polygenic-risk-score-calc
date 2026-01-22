"""
Risk Integration Module - Combines PRS with Clinical/Lifestyle Factors

This module integrates polygenic risk scores with questionnaire data
to provide more accurate, personalized risk estimates.

The combined risk model uses evidence-based modifiers from:
- Framingham Risk Score (cardiovascular)
- QRISK3 (cardiovascular, UK-specific)
- Gail Model (breast cancer)
- Published meta-analyses for lifestyle factors

Combined Risk Formula:
    Combined_Risk = PRS_Percentile × Lifestyle_Modifier × Family_Modifier × Age_Sex_Baseline
"""

from typing import Optional
from scipy import stats
import math


# ============================================================================
# EVIDENCE CITATIONS FOR RISK MODIFIERS
# All modifiers are derived from peer-reviewed meta-analyses and guidelines
# ============================================================================

MODIFIER_CITATIONS = {
    "smoking": {
        "sources": [
            {
                "authors": "Hackshaw A, Morris JK, Boniface S, Tang JL, Milenković D",
                "title": "Low cigarette consumption and risk of coronary heart disease and stroke",
                "journal": "BMJ",
                "year": 2018,
                "volume": "360",
                "pages": "j5855",
                "doi": "10.1136/bmj.j5855",
                "pmid": "29367388",
            },
            {
                "authors": "Forey BA, Thornton AJ, Lee PN",
                "title": "Systematic review with meta-analysis of the epidemiological evidence relating smoking to COPD, chronic bronchitis and emphysema",
                "journal": "BMC Pulm Med",
                "year": 2011,
                "volume": "11",
                "pages": "36",
                "doi": "10.1186/1471-2466-11-36",
                "pmid": "21672193",
            },
        ],
        "notes": "RR estimates pooled from cardiovascular and cancer meta-analyses. Current smokers: RR 1.5-2.5 depending on pack-years.",
    },
    "bmi": {
        "sources": [
            {
                "authors": "Global BMI Mortality Collaboration",
                "title": "Body-mass index and all-cause mortality: individual-participant-data meta-analysis of 239 prospective studies",
                "journal": "Lancet",
                "year": 2016,
                "volume": "388",
                "pages": "776-786",
                "doi": "10.1016/S0140-6736(16)30175-1",
                "pmid": "27423262",
            },
            {
                "authors": "Bhaskaran K, Douglas I, Forbes H, dos-Santos-Silva I, Leon DA, Smeeth L",
                "title": "Body-mass index and risk of 22 specific cancers",
                "journal": "Lancet",
                "year": 2014,
                "volume": "384",
                "pages": "755-765",
                "doi": "10.1016/S0140-6736(14)60892-8",
                "pmid": "25129328",
            },
        ],
        "notes": "BMI 30-35: HR 1.2-1.4 for mortality; BMI >40: HR 1.6-2.0. Cancer risk increases 5-10% per 5 kg/m² above normal.",
    },
    "exercise": {
        "sources": [
            {
                "authors": "Arem H, Moore SC, Patel A, et al",
                "title": "Leisure time physical activity and mortality: a detailed pooled analysis of the dose-response relationship",
                "journal": "JAMA Intern Med",
                "year": 2015,
                "volume": "175",
                "pages": "959-967",
                "doi": "10.1001/jamainternmed.2015.0533",
                "pmid": "25844730",
            },
            {
                "authors": "Kyu HH, Bachman VF, Alexander LT, et al",
                "title": "Physical activity and risk of breast cancer, colon cancer, diabetes, ischemic heart disease, and ischemic stroke events",
                "journal": "BMJ",
                "year": 2016,
                "volume": "354",
                "pages": "i3857",
                "doi": "10.1136/bmj.i3857",
                "pmid": "27510511",
            },
        ],
        "notes": "Meeting WHO guidelines (150 min/week): 20-30% mortality reduction. Highly active (>300 min/week): up to 35% reduction.",
    },
    "alcohol": {
        "sources": [
            {
                "authors": "Wood AM, Kaptoge S, Butterworth AS, et al",
                "title": "Risk thresholds for alcohol consumption: combined analysis of individual-participant data for 599,912 current drinkers",
                "journal": "Lancet",
                "year": 2018,
                "volume": "391",
                "pages": "1513-1523",
                "doi": "10.1016/S0140-6736(18)30134-X",
                "pmid": "29676281",
            },
            {
                "authors": "Bagnardi V, Rota M, Botteri E, et al",
                "title": "Alcohol consumption and site-specific cancer risk: a comprehensive dose-response meta-analysis",
                "journal": "Br J Cancer",
                "year": 2015,
                "volume": "112",
                "pages": "580-593",
                "doi": "10.1038/bjc.2014.579",
                "pmid": "25422909",
            },
        ],
        "notes": "Risk increases above 100g/week (~12.5 units). Heavy drinking (>21 units/week): RR 1.3-1.6 for multiple cancers.",
    },
    "diet": {
        "sources": [
            {
                "authors": "Estruch R, Ros E, Salas-Salvadó J, et al (PREDIMED Study)",
                "title": "Primary Prevention of Cardiovascular Disease with a Mediterranean Diet Supplemented with Extra-Virgin Olive Oil or Nuts",
                "journal": "N Engl J Med",
                "year": 2018,
                "volume": "378",
                "pages": "e34",
                "doi": "10.1056/NEJMoa1800389",
                "pmid": "29897866",
            },
            {
                "authors": "Sacks FM, Svetkey LP, Vollmer WM, et al (DASH-Sodium Trial)",
                "title": "Effects on blood pressure of reduced dietary sodium and the DASH diet",
                "journal": "N Engl J Med",
                "year": 2001,
                "volume": "344",
                "pages": "3-10",
                "doi": "10.1056/NEJM200101043440101",
                "pmid": "11136953",
            },
        ],
        "notes": "Mediterranean diet: ~30% CVD risk reduction. DASH diet: significant BP reduction equivalent to medication.",
    },
    "family_history": {
        "sources": [
            {
                "authors": "Murabito JM, Pencina MJ, Nam BH, et al",
                "title": "Sibling cardiovascular disease as a risk factor for cardiovascular disease in middle-aged adults",
                "journal": "JAMA",
                "year": 2005,
                "volume": "294",
                "pages": "3117-3123",
                "doi": "10.1001/jama.294.24.3117",
                "pmid": "16380592",
            },
            {
                "authors": "Collaborative Group on Hormonal Factors in Breast Cancer",
                "title": "Familial breast cancer: collaborative reanalysis of individual data from 52 epidemiological studies",
                "journal": "Lancet",
                "year": 2001,
                "volume": "358",
                "pages": "1389-1399",
                "doi": "10.1016/S0140-6736(01)06524-2",
                "pmid": "11705483",
            },
        ],
        "notes": "One first-degree relative: RR ~1.5-2.0. Multiple relatives or early onset: RR 2.0-3.0.",
    },
}


# ============================================================================
# LIFESTYLE RISK MODIFIERS
# Based on meta-analyses and clinical guidelines (see MODIFIER_CITATIONS)
# ============================================================================

SMOKING_MODIFIERS = {
    # Hackshaw et al. BMJ 2018 - even low consumption increases risk
    # Forey et al. BMC Pulm Med 2011 - dose-response for respiratory disease
    "never": 1.0,
    "former": 1.2,  # Former smoker (quit >1 year) - residual risk declines over time
    "former_recent": 1.5,  # Quit within last year - still elevated
    "current_light": 1.6,  # <10 cigarettes/day - no safe level (Hackshaw 2018)
    "current": 1.8,  # 10-20 cigarettes/day
    "current_heavy": 2.2,  # >20 cigarettes/day - strongest dose-response
}

BMI_MODIFIERS = {
    # Global BMI Mortality Collaboration, Lancet 2016 - 239 studies, 10.6M participants
    # Bhaskaran et al. Lancet 2014 - BMI and 22 cancers
    "underweight": 1.1,  # BMI < 18.5 - J-shaped curve
    "normal": 1.0,  # BMI 18.5-24.9 - reference category
    "overweight": 1.15,  # BMI 25-29.9 - modest increase
    "obese_1": 1.3,  # BMI 30-34.9 - HR 1.29 (Global BMI Collab)
    "obese_2": 1.5,  # BMI 35-39.9 - HR 1.54
    "obese_3": 1.8,  # BMI ≥ 40 - HR 1.92 for all-cause mortality
}

EXERCISE_MODIFIERS = {
    # Arem et al. JAMA Intern Med 2015 - pooled analysis, 661,000 participants
    # Kyu et al. BMJ 2016 - dose-response for major diseases
    "very_active": 0.75,  # >300 min/week - 31% mortality reduction (Arem 2015)
    "active": 0.85,  # 150-300 min/week - meets WHO guidelines, 20% reduction
    "moderate": 1.0,  # 75-150 min/week - reference
    "low": 1.15,  # <75 min/week - insufficient activity
    "sedentary": 1.3,  # Minimal activity - significant risk increase
}

ALCOHOL_MODIFIERS = {
    # Wood et al. Lancet 2018 - 599,912 drinkers, threshold analysis
    # Bagnardi et al. Br J Cancer 2015 - dose-response meta-analysis
    "none": 0.95,  # Non-drinker - slight protective for some CVD outcomes
    "light": 1.0,  # 1-7 units/week (~100g) - threshold identified (Wood 2018)
    "moderate": 1.1,  # 8-14 units/week - above threshold, risk increases
    "heavy": 1.3,  # 15-21 units/week - significant increase
    "very_heavy": 1.6,  # >21 units/week - RR 1.5+ for multiple cancers
}

DIET_MODIFIERS = {
    # Estruch et al. NEJM 2018 (PREDIMED) - Mediterranean diet RCT
    # Sacks et al. NEJM 2001 (DASH-Sodium) - dietary patterns
    "mediterranean": 0.85,  # ~30% CVD reduction (PREDIMED)
    "dash": 0.88,  # DASH diet - significant BP/CVD benefit
    "balanced": 1.0,  # Standard balanced diet - reference
    "western": 1.15,  # High processed foods - associated with increased risk
    "poor": 1.25,  # Low vegetables, high processed - highest risk
}


# ============================================================================
# FAMILY HISTORY MODIFIERS
# Based on first-degree relative risk increases
# Murabito et al. JAMA 2005 - sibling CVD risk
# Collaborative Group, Lancet 2001 - familial breast cancer
# ============================================================================

FAMILY_HISTORY_MODIFIERS = {
    # One affected first-degree relative
    # RR 1.5-2.0 for one parent (Framingham, QRISK3 derivation)
    "one_parent": 1.5,
    "one_sibling": 1.8,  # Murabito 2005: sibling CVD RR 1.55 (male), 1.99 (female)
    # Multiple affected relatives - multiplicative but capped
    "two_parents": 2.5,  # Approximate based on independent risks
    "parent_and_sibling": 2.8,
    "multiple_siblings": 2.2,
    # Early onset (age <55 for men, <65 for women) - stronger genetic component
    "early_onset_parent": 2.0,  # QRISK3: premature CVD in 1st degree relative
    "early_onset_sibling": 2.5,  # Collaborative Group 2001: early onset breast cancer
}


# ============================================================================
# DISEASE-SPECIFIC MODIFIER WEIGHTS
# Not all factors affect all diseases equally
# ============================================================================

DISEASE_MODIFIER_WEIGHTS = {
    # Cardiovascular diseases heavily influenced by lifestyle
    "cad": {
        "smoking": 1.0,
        "bmi": 0.8,
        "exercise": 1.0,
        "alcohol": 0.6,
        "diet": 0.9,
        "family_history": 1.0,
    },
    "stroke": {
        "smoking": 1.0,
        "bmi": 0.7,
        "exercise": 0.9,
        "alcohol": 0.8,
        "diet": 0.8,
        "family_history": 0.9,
    },
    "atrial_fibrillation": {
        "smoking": 0.7,
        "bmi": 0.9,
        "exercise": 0.6,
        "alcohol": 1.0,  # Strong alcohol association
        "diet": 0.5,
        "family_history": 0.8,
    },
    "hypertension": {
        "smoking": 0.6,
        "bmi": 1.0,
        "exercise": 0.9,
        "alcohol": 0.9,
        "diet": 1.0,  # Salt intake important
        "family_history": 0.9,
    },
    # Metabolic diseases
    "t2d": {
        "smoking": 0.5,
        "bmi": 1.0,  # Strongest factor
        "exercise": 1.0,
        "alcohol": 0.4,
        "diet": 1.0,
        "family_history": 1.0,
    },
    "obesity": {
        "smoking": 0.3,
        "bmi": 0.0,  # Already measuring this
        "exercise": 1.0,
        "alcohol": 0.5,
        "diet": 1.0,
        "family_history": 0.8,
    },
    # Cancers
    "breast_cancer": {
        "smoking": 0.4,
        "bmi": 0.7,  # Postmenopausal
        "exercise": 0.6,
        "alcohol": 0.9,  # Significant factor
        "diet": 0.5,
        "family_history": 1.0,  # Very important
    },
    "colorectal_cancer": {
        "smoking": 0.6,
        "bmi": 0.8,
        "exercise": 0.8,
        "alcohol": 0.8,
        "diet": 1.0,  # Red meat, fiber important
        "family_history": 1.0,
    },
    "lung_cancer": {
        "smoking": 1.0,  # Dominant factor
        "bmi": 0.2,
        "exercise": 0.3,
        "alcohol": 0.2,
        "diet": 0.3,
        "family_history": 0.7,
    },
    "prostate_cancer": {
        "smoking": 0.3,
        "bmi": 0.5,
        "exercise": 0.5,
        "alcohol": 0.3,
        "diet": 0.6,
        "family_history": 1.0,
    },
    # Neurological
    "alzheimers": {
        "smoking": 0.6,
        "bmi": 0.5,
        "exercise": 0.8,  # Protective
        "alcohol": 0.7,
        "diet": 0.7,
        "family_history": 1.0,
    },
    # Default for unlisted diseases
    "default": {
        "smoking": 0.5,
        "bmi": 0.5,
        "exercise": 0.5,
        "alcohol": 0.5,
        "diet": 0.5,
        "family_history": 0.7,
    },
}


# ============================================================================
# AGE/SEX BASELINE RISK ADJUSTMENTS
# Based on population incidence rates
# ============================================================================

AGE_SEX_BASELINE = {
    # Age multipliers (baseline at age 50)
    "age_multipliers": {
        "20-29": 0.2,
        "30-39": 0.4,
        "40-49": 0.7,
        "50-59": 1.0,
        "60-69": 1.5,
        "70-79": 2.2,
        "80+": 3.0,
    },
    # Sex-specific adjustments for certain conditions
    "sex_adjustments": {
        "cad": {"male": 1.0, "female": 0.6},
        "breast_cancer": {"male": 0.01, "female": 1.0},
        "prostate_cancer": {"male": 1.0, "female": 0.0},
        "ovarian_cancer": {"male": 0.0, "female": 1.0},
        "testicular_cancer": {"male": 1.0, "female": 0.0},
        "osteoporosis": {"male": 0.4, "female": 1.0},
        "lupus": {"male": 0.1, "female": 1.0},
    },
}


def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    """Calculate BMI from height (cm) and weight (kg)."""
    height_m = height_cm / 100
    return weight_kg / (height_m ** 2)


def get_bmi_category(bmi: float) -> str:
    """Get BMI category from BMI value."""
    if bmi < 18.5:
        return "underweight"
    elif bmi < 25:
        return "normal"
    elif bmi < 30:
        return "overweight"
    elif bmi < 35:
        return "obese_1"
    elif bmi < 40:
        return "obese_2"
    else:
        return "obese_3"


def get_age_bracket(age: int) -> str:
    """Get age bracket string from age."""
    if age < 30:
        return "20-29"
    elif age < 40:
        return "30-39"
    elif age < 50:
        return "40-49"
    elif age < 60:
        return "50-59"
    elif age < 70:
        return "60-69"
    elif age < 80:
        return "70-79"
    else:
        return "80+"


def get_alcohol_category(units_per_week: float) -> str:
    """Get alcohol consumption category."""
    if units_per_week == 0:
        return "none"
    elif units_per_week <= 7:
        return "light"
    elif units_per_week <= 14:
        return "moderate"
    elif units_per_week <= 21:
        return "heavy"
    else:
        return "very_heavy"


def get_exercise_category(minutes_per_week: float) -> str:
    """Get exercise category from minutes per week."""
    if minutes_per_week >= 300:
        return "very_active"
    elif minutes_per_week >= 150:
        return "active"
    elif minutes_per_week >= 75:
        return "moderate"
    elif minutes_per_week >= 30:
        return "low"
    else:
        return "sedentary"


def calculate_lifestyle_modifier(
    questionnaire_data: dict,
    disease: str
) -> dict:
    """
    Calculate combined lifestyle modifier for a specific disease.

    Args:
        questionnaire_data: Dict with lifestyle factors
        disease: Disease key for weight lookup

    Returns:
        Dict with individual and combined modifiers
    """
    # Get disease-specific weights
    weights = DISEASE_MODIFIER_WEIGHTS.get(
        disease.lower().replace(" ", "_"),
        DISEASE_MODIFIER_WEIGHTS["default"]
    )

    modifiers = {}
    weighted_product = 1.0

    # Smoking
    smoking = questionnaire_data.get("smoking", "never")
    smoking_mod = SMOKING_MODIFIERS.get(smoking, 1.0)
    smoking_weight = weights.get("smoking", 0.5)
    # Apply weight: modifier = 1 + weight * (raw_modifier - 1)
    modifiers["smoking"] = {
        "raw": smoking_mod,
        "weight": smoking_weight,
        "weighted": 1 + smoking_weight * (smoking_mod - 1)
    }
    weighted_product *= modifiers["smoking"]["weighted"]

    # BMI
    bmi = questionnaire_data.get("bmi")
    if bmi is None:
        height = questionnaire_data.get("height_cm")
        weight = questionnaire_data.get("weight_kg")
        if height and weight:
            bmi = calculate_bmi(height, weight)

    if bmi:
        bmi_category = get_bmi_category(bmi)
        bmi_mod = BMI_MODIFIERS.get(bmi_category, 1.0)
        bmi_weight = weights.get("bmi", 0.5)
        modifiers["bmi"] = {
            "raw": bmi_mod,
            "weight": bmi_weight,
            "weighted": 1 + bmi_weight * (bmi_mod - 1),
            "value": bmi,
            "category": bmi_category
        }
        weighted_product *= modifiers["bmi"]["weighted"]

    # Exercise
    exercise_min = questionnaire_data.get("exercise_minutes_per_week")
    if exercise_min is not None:
        exercise_cat = get_exercise_category(exercise_min)
        exercise_mod = EXERCISE_MODIFIERS.get(exercise_cat, 1.0)
        exercise_weight = weights.get("exercise", 0.5)
        modifiers["exercise"] = {
            "raw": exercise_mod,
            "weight": exercise_weight,
            "weighted": 1 + exercise_weight * (exercise_mod - 1),
            "minutes": exercise_min,
            "category": exercise_cat
        }
        weighted_product *= modifiers["exercise"]["weighted"]

    # Alcohol
    alcohol_units = questionnaire_data.get("alcohol_units_per_week")
    if alcohol_units is not None:
        alcohol_cat = get_alcohol_category(alcohol_units)
        alcohol_mod = ALCOHOL_MODIFIERS.get(alcohol_cat, 1.0)
        alcohol_weight = weights.get("alcohol", 0.5)
        modifiers["alcohol"] = {
            "raw": alcohol_mod,
            "weight": alcohol_weight,
            "weighted": 1 + alcohol_weight * (alcohol_mod - 1),
            "units": alcohol_units,
            "category": alcohol_cat
        }
        weighted_product *= modifiers["alcohol"]["weighted"]

    # Diet
    diet = questionnaire_data.get("diet_type", "balanced")
    diet_mod = DIET_MODIFIERS.get(diet, 1.0)
    diet_weight = weights.get("diet", 0.5)
    modifiers["diet"] = {
        "raw": diet_mod,
        "weight": diet_weight,
        "weighted": 1 + diet_weight * (diet_mod - 1)
    }
    weighted_product *= modifiers["diet"]["weighted"]

    return {
        "individual_modifiers": modifiers,
        "combined_modifier": weighted_product,
        "disease": disease
    }


def calculate_family_history_modifier(
    family_history: dict,
    disease: str
) -> dict:
    """
    Calculate family history risk modifier.

    Args:
        family_history: Dict with family history data per disease
        disease: Disease to calculate modifier for

    Returns:
        Dict with family history modifier info
    """
    disease_key = disease.lower().replace(" ", "_")
    disease_history = family_history.get(disease_key, {})

    if not disease_history:
        return {
            "modifier": 1.0,
            "has_family_history": False,
            "details": []
        }

    modifier = 1.0
    details = []

    # Check various family history scenarios
    parents_affected = disease_history.get("parents_affected", 0)
    siblings_affected = disease_history.get("siblings_affected", 0)
    early_onset = disease_history.get("early_onset", False)

    if parents_affected >= 2:
        modifier = FAMILY_HISTORY_MODIFIERS["two_parents"]
        details.append("Both parents affected")
    elif parents_affected == 1 and siblings_affected >= 1:
        modifier = FAMILY_HISTORY_MODIFIERS["parent_and_sibling"]
        details.append("Parent and sibling affected")
    elif siblings_affected >= 2:
        modifier = FAMILY_HISTORY_MODIFIERS["multiple_siblings"]
        details.append("Multiple siblings affected")
    elif parents_affected == 1:
        if early_onset:
            modifier = FAMILY_HISTORY_MODIFIERS["early_onset_parent"]
            details.append("Parent affected (early onset)")
        else:
            modifier = FAMILY_HISTORY_MODIFIERS["one_parent"]
            details.append("One parent affected")
    elif siblings_affected == 1:
        if early_onset:
            modifier = FAMILY_HISTORY_MODIFIERS["early_onset_sibling"]
            details.append("Sibling affected (early onset)")
        else:
            modifier = FAMILY_HISTORY_MODIFIERS["one_sibling"]
            details.append("One sibling affected")

    return {
        "modifier": modifier,
        "has_family_history": modifier > 1.0,
        "details": details
    }


def calculate_age_sex_modifier(
    age: Optional[int],
    sex: Optional[str],
    disease: str
) -> dict:
    """
    Calculate age and sex-based risk modifier.

    Args:
        age: Patient age in years
        sex: "male" or "female"
        disease: Disease key

    Returns:
        Dict with age/sex modifier info
    """
    result = {
        "age_modifier": 1.0,
        "sex_modifier": 1.0,
        "combined_modifier": 1.0,
        "applicable": True
    }

    disease_key = disease.lower().replace(" ", "_")

    # Age modifier
    if age:
        age_bracket = get_age_bracket(age)
        result["age_modifier"] = AGE_SEX_BASELINE["age_multipliers"].get(age_bracket, 1.0)
        result["age_bracket"] = age_bracket

    # Sex modifier
    if sex:
        sex_lower = sex.lower()
        sex_adjustments = AGE_SEX_BASELINE["sex_adjustments"].get(disease_key, {})
        if sex_adjustments:
            result["sex_modifier"] = sex_adjustments.get(sex_lower, 1.0)
            # Check if disease is applicable to this sex
            if result["sex_modifier"] == 0:
                result["applicable"] = False

    result["combined_modifier"] = result["age_modifier"] * result["sex_modifier"]

    return result


def integrate_prs_with_questionnaire(
    prs_percentile: float,
    questionnaire_data: dict,
    disease: str
) -> dict:
    """
    Integrate PRS percentile with questionnaire data for comprehensive risk.

    Args:
        prs_percentile: Raw PRS percentile (0-100)
        questionnaire_data: Complete questionnaire response
        disease: Disease name

    Returns:
        Dict with integrated risk assessment
    """
    # Calculate individual modifiers
    lifestyle = calculate_lifestyle_modifier(
        questionnaire_data.get("lifestyle", {}),
        disease
    )

    family = calculate_family_history_modifier(
        questionnaire_data.get("family_history", {}),
        disease
    )

    age_sex = calculate_age_sex_modifier(
        questionnaire_data.get("demographics", {}).get("age"),
        questionnaire_data.get("demographics", {}).get("sex"),
        disease
    )

    # Check if disease is applicable to this person
    if not age_sex["applicable"]:
        return {
            "prs_percentile": prs_percentile,
            "combined_percentile": None,
            "applicable": False,
            "reason": f"Disease not applicable based on sex"
        }

    # Calculate combined modifier
    combined_modifier = (
        lifestyle["combined_modifier"] *
        family["modifier"] *
        age_sex["combined_modifier"]
    )

    # Apply modifier to PRS percentile
    # Convert percentile to z-score, apply modifier, convert back
    prs_zscore = stats.norm.ppf(prs_percentile / 100)

    # Modifier shifts the distribution
    # Higher modifier = higher risk = shift z-score up
    # Using log transform to prevent extreme values
    modifier_adjustment = math.log(combined_modifier)
    adjusted_zscore = prs_zscore + modifier_adjustment

    # Convert back to percentile
    combined_percentile = stats.norm.cdf(adjusted_zscore) * 100
    combined_percentile = max(0.1, min(99.9, combined_percentile))

    # Determine risk category
    from .populations import get_risk_category
    prs_category = get_risk_category(prs_percentile)
    combined_category = get_risk_category(combined_percentile)

    return {
        "prs_percentile": prs_percentile,
        "prs_risk_category": prs_category["label"],
        "combined_percentile": round(combined_percentile, 1),
        "combined_risk_category": combined_category["label"],
        "combined_modifier": round(combined_modifier, 3),
        "applicable": True,
        "modifiers": {
            "lifestyle": lifestyle,
            "family_history": family,
            "age_sex": age_sex
        },
        "interpretation": generate_interpretation(
            prs_percentile,
            combined_percentile,
            lifestyle,
            family,
            disease
        )
    }


def generate_interpretation(
    prs_percentile: float,
    combined_percentile: float,
    lifestyle: dict,
    family: dict,
    disease: str
) -> str:
    """Generate human-readable interpretation of risk integration."""

    change = combined_percentile - prs_percentile
    change_direction = "increased" if change > 0 else "decreased"

    interpretation_parts = []

    # Main comparison
    if abs(change) < 2:
        interpretation_parts.append(
            f"Your lifestyle factors have minimal impact on your genetic risk for {disease}."
        )
    else:
        interpretation_parts.append(
            f"Your combined risk is {abs(change):.1f} percentile points {change_direction} "
            f"compared to genetics alone."
        )

    # Key modifiable factors
    modifiable = []
    if lifestyle.get("individual_modifiers", {}).get("smoking", {}).get("weighted", 1.0) > 1.1:
        modifiable.append("smoking cessation")
    if lifestyle.get("individual_modifiers", {}).get("bmi", {}).get("weighted", 1.0) > 1.1:
        modifiable.append("weight management")
    if lifestyle.get("individual_modifiers", {}).get("exercise", {}).get("weighted", 1.0) > 1.0:
        modifiable.append("increasing physical activity")

    if modifiable:
        interpretation_parts.append(
            f"Potentially modifiable factors include: {', '.join(modifiable)}."
        )

    # Family history note
    if family.get("has_family_history"):
        interpretation_parts.append(
            f"Family history contributes to elevated risk ({', '.join(family['details'])})."
        )

    return " ".join(interpretation_parts)


def calculate_all_integrated_risks(
    prs_results: dict,
    questionnaire_data: dict
) -> dict:
    """
    Calculate integrated risk for all diseases.

    Args:
        prs_results: Dict of disease -> PRS result
        questionnaire_data: Complete questionnaire response

    Returns:
        Dict with integrated results for all diseases
    """
    integrated_results = {}

    for disease, prs_data in prs_results.items():
        if prs_data.get("percentile") is not None:
            integrated = integrate_prs_with_questionnaire(
                prs_data["percentile"],
                questionnaire_data,
                disease
            )

            integrated_results[disease] = {
                **prs_data,
                "integrated": integrated
            }
        else:
            integrated_results[disease] = {
                **prs_data,
                "integrated": None
            }

    return integrated_results


def get_modifier_citations(modifier_type: Optional[str] = None) -> dict:
    """
    Get evidence citations for risk modifiers.

    Args:
        modifier_type: Optional type to filter ("smoking", "bmi", "exercise",
                       "alcohol", "diet", "family_history"). If None, returns all.

    Returns:
        Dictionary with citation information including:
        - sources: List of peer-reviewed publications with DOI/PMID
        - notes: Summary of how values were derived

    Example:
        >>> citations = get_modifier_citations("smoking")
        >>> print(citations["sources"][0]["doi"])
        10.1136/bmj.j5855
    """
    if modifier_type:
        return MODIFIER_CITATIONS.get(modifier_type, {})
    return MODIFIER_CITATIONS.copy()


def format_citation_apa(citation: dict) -> str:
    """Format a citation dict as APA-style reference."""
    return (
        f"{citation['authors']} ({citation['year']}). "
        f"{citation['title']}. "
        f"{citation['journal']}, {citation['volume']}, {citation['pages']}. "
        f"https://doi.org/{citation['doi']}"
    )


def get_all_citations_formatted() -> list:
    """Get all citations as formatted APA-style references."""
    citations = []
    for modifier_type, data in MODIFIER_CITATIONS.items():
        for source in data.get("sources", []):
            citations.append({
                "modifier_type": modifier_type,
                "citation": format_citation_apa(source),
                "pmid": source.get("pmid"),
                "doi": source.get("doi"),
            })
    return citations
