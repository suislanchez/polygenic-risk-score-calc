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
# LIFESTYLE RISK MODIFIERS
# Based on meta-analyses and clinical guidelines
# ============================================================================

SMOKING_MODIFIERS = {
    # Based on pooled relative risks from meta-analyses
    "never": 1.0,
    "former": 1.2,  # Former smoker (quit >1 year)
    "former_recent": 1.5,  # Quit within last year
    "current_light": 1.6,  # <10 cigarettes/day
    "current": 1.8,  # 10-20 cigarettes/day
    "current_heavy": 2.2,  # >20 cigarettes/day
}

BMI_MODIFIERS = {
    # Based on WHO BMI categories and associated relative risks
    "underweight": 1.1,  # BMI < 18.5
    "normal": 1.0,  # BMI 18.5-24.9
    "overweight": 1.15,  # BMI 25-29.9
    "obese_1": 1.3,  # BMI 30-34.9
    "obese_2": 1.5,  # BMI 35-39.9
    "obese_3": 1.8,  # BMI ≥ 40
}

EXERCISE_MODIFIERS = {
    # Based on physical activity guidelines (150 min moderate/week)
    "very_active": 0.75,  # >300 min/week
    "active": 0.85,  # 150-300 min/week (meets guidelines)
    "moderate": 1.0,  # 75-150 min/week
    "low": 1.15,  # <75 min/week
    "sedentary": 1.3,  # Minimal activity
}

ALCOHOL_MODIFIERS = {
    # Based on UK units per week (1 unit = 8g alcohol)
    "none": 0.95,  # Non-drinker (slight protective for some conditions)
    "light": 1.0,  # 1-7 units/week
    "moderate": 1.1,  # 8-14 units/week
    "heavy": 1.3,  # 15-21 units/week
    "very_heavy": 1.6,  # >21 units/week
}

DIET_MODIFIERS = {
    # Based on dietary pattern studies
    "mediterranean": 0.85,  # Protective
    "dash": 0.88,  # DASH diet
    "balanced": 1.0,  # Standard balanced diet
    "western": 1.15,  # High processed foods
    "poor": 1.25,  # Low vegetables, high processed
}


# ============================================================================
# FAMILY HISTORY MODIFIERS
# Based on first-degree relative risk increases
# ============================================================================

FAMILY_HISTORY_MODIFIERS = {
    # One affected first-degree relative
    "one_parent": 1.5,
    "one_sibling": 1.8,
    # Multiple affected relatives
    "two_parents": 2.5,
    "parent_and_sibling": 2.8,
    "multiple_siblings": 2.2,
    # Early onset (age <55 for men, <65 for women)
    "early_onset_parent": 2.0,
    "early_onset_sibling": 2.5,
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
