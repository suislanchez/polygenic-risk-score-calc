/**
 * Risk Modifiers Library
 *
 * This module provides functions to calculate lifestyle and environmental
 * risk modifiers that can be combined with polygenic risk scores for
 * enhanced risk assessment accuracy.
 */

// Smoking status modifiers
export const SMOKING_MODIFIERS = {
  never: 1.0,
  former: 1.2,
  current: 1.8,
};

// BMI category modifiers
export const BMI_MODIFIERS = {
  underweight: 1.05,  // BMI < 18.5
  normal: 1.0,        // BMI 18.5-24.9
  overweight: 1.15,   // BMI 25-29.9
  obese: 1.3,         // BMI 30-34.9
  severelyObese: 1.5, // BMI >= 35
};

// Family history modifiers (per condition)
export const FAMILY_HISTORY_MODIFIERS = {
  oneParent: 1.5,
  twoParents: 2.5,
  sibling: 1.8,
  grandparent: 1.2,
  multiple: 2.8, // Multiple first-degree relatives
};

// Exercise frequency modifiers
export const EXERCISE_MODIFIERS = {
  veryActive: 0.8,    // 5+ times per week
  active: 0.85,       // 3-4 times per week
  moderate: 1.0,      // 1-2 times per week
  sedentary: 1.2,     // Less than once per week
};

// Diet type modifiers
export const DIET_MODIFIERS = {
  mediterranean: 0.85,
  balanced: 0.95,
  standard: 1.0,
  highProcessed: 1.15,
  veryHighProcessed: 1.25,
};

// Alcohol consumption modifiers
export const ALCOHOL_MODIFIERS = {
  none: 0.95,
  light: 1.0,      // 1-7 drinks per week
  moderate: 1.1,   // 8-14 drinks per week
  heavy: 1.3,      // 15+ drinks per week
};

// Age-related risk adjustments
export const AGE_MODIFIERS = {
  under30: 0.8,
  thirties: 0.9,
  forties: 1.0,
  fifties: 1.15,
  sixties: 1.3,
  seventyPlus: 1.5,
};

// Blood pressure modifiers
export const BLOOD_PRESSURE_MODIFIERS = {
  normal: 1.0,           // < 120/80
  elevated: 1.1,         // 120-129/<80
  highStage1: 1.2,       // 130-139/80-89
  highStage2: 1.4,       // >= 140/90
  hypertensiveCrisis: 1.6, // > 180/120
};

/**
 * Calculate BMI from height (cm) and weight (kg)
 */
export function calculateBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Get BMI category from BMI value
 */
export function getBMICategory(bmi) {
  if (!bmi) return 'normal';
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obese';
  return 'severelyObese';
}

/**
 * Get age modifier category
 */
export function getAgeCategory(age) {
  if (!age) return 'forties';
  if (age < 30) return 'under30';
  if (age < 40) return 'thirties';
  if (age < 50) return 'forties';
  if (age < 60) return 'fifties';
  if (age < 70) return 'sixties';
  return 'seventyPlus';
}

/**
 * Get blood pressure category
 */
export function getBloodPressureCategory(systolic, diastolic) {
  if (!systolic || !diastolic) return 'normal';

  if (systolic > 180 || diastolic > 120) return 'hypertensiveCrisis';
  if (systolic >= 140 || diastolic >= 90) return 'highStage2';
  if (systolic >= 130 || diastolic >= 80) return 'highStage1';
  if (systolic >= 120 && diastolic < 80) return 'elevated';
  return 'normal';
}

/**
 * Calculate family history modifier for a specific condition
 */
export function calculateFamilyHistoryModifier(familyHistory, condition) {
  if (!familyHistory || !familyHistory[condition]) {
    return 1.0;
  }

  const relatives = familyHistory[condition];
  let modifier = 1.0;

  // Count affected relatives
  const parentCount = (relatives.mother ? 1 : 0) + (relatives.father ? 1 : 0);
  const siblingAffected = relatives.sibling || false;
  const grandparentAffected = relatives.grandparent || false;

  // Apply modifiers (taking the highest applicable)
  if (parentCount === 2) {
    modifier = Math.max(modifier, FAMILY_HISTORY_MODIFIERS.twoParents);
  } else if (parentCount === 1) {
    modifier = Math.max(modifier, FAMILY_HISTORY_MODIFIERS.oneParent);
  }

  if (siblingAffected) {
    modifier = Math.max(modifier, FAMILY_HISTORY_MODIFIERS.sibling);
  }

  if (grandparentAffected && modifier === 1.0) {
    modifier = FAMILY_HISTORY_MODIFIERS.grandparent;
  }

  // If multiple first-degree relatives, use combined modifier
  if (parentCount > 0 && siblingAffected) {
    modifier = FAMILY_HISTORY_MODIFIERS.multiple;
  }

  return modifier;
}

/**
 * Calculate combined lifestyle modifier from questionnaire data
 */
export function calculateLifestyleModifier(questionnaireData) {
  if (!questionnaireData) {
    return 1.0;
  }

  const modifiers = [];

  // Smoking
  if (questionnaireData.smokingStatus) {
    modifiers.push(SMOKING_MODIFIERS[questionnaireData.smokingStatus] || 1.0);
  }

  // BMI
  if (questionnaireData.height && questionnaireData.weight) {
    const bmi = calculateBMI(questionnaireData.height, questionnaireData.weight);
    const bmiCategory = getBMICategory(bmi);
    modifiers.push(BMI_MODIFIERS[bmiCategory] || 1.0);
  }

  // Exercise
  if (questionnaireData.exerciseFrequency) {
    modifiers.push(EXERCISE_MODIFIERS[questionnaireData.exerciseFrequency] || 1.0);
  }

  // Diet
  if (questionnaireData.dietType) {
    modifiers.push(DIET_MODIFIERS[questionnaireData.dietType] || 1.0);
  }

  // Alcohol
  if (questionnaireData.alcoholConsumption) {
    modifiers.push(ALCOHOL_MODIFIERS[questionnaireData.alcoholConsumption] || 1.0);
  }

  // Age
  if (questionnaireData.age) {
    modifiers.push(AGE_MODIFIERS[getAgeCategory(questionnaireData.age)] || 1.0);
  }

  // Blood pressure
  if (questionnaireData.systolicBP && questionnaireData.diastolicBP) {
    const bpCategory = getBloodPressureCategory(
      questionnaireData.systolicBP,
      questionnaireData.diastolicBP
    );
    modifiers.push(BLOOD_PRESSURE_MODIFIERS[bpCategory] || 1.0);
  }

  // Combine modifiers using geometric mean for balanced effect
  if (modifiers.length === 0) {
    return 1.0;
  }

  const product = modifiers.reduce((acc, mod) => acc * mod, 1);
  return Math.pow(product, 1 / modifiers.length);
}

/**
 * Calculate disease-specific combined risk score
 * Combines PRS percentile with lifestyle and family history modifiers
 */
export function calculateCombinedRisk(prsPercentile, questionnaireData, disease) {
  // Base modifier from lifestyle factors
  const lifestyleModifier = calculateLifestyleModifier(questionnaireData);

  // Family history modifier for this specific disease
  const familyModifier = questionnaireData?.familyHistory
    ? calculateFamilyHistoryModifier(questionnaireData.familyHistory, disease)
    : 1.0;

  // Combine modifiers (weighted average: lifestyle 60%, family 40%)
  const combinedModifier = (lifestyleModifier * 0.6) + (familyModifier * 0.4);

  // Apply modifier to percentile with bounds
  let adjustedPercentile = prsPercentile * combinedModifier;

  // Cap at reasonable bounds
  adjustedPercentile = Math.max(1, Math.min(99, adjustedPercentile));

  return {
    originalPercentile: prsPercentile,
    adjustedPercentile: Math.round(adjustedPercentile * 10) / 10,
    lifestyleModifier: Math.round(lifestyleModifier * 100) / 100,
    familyModifier: Math.round(familyModifier * 100) / 100,
    combinedModifier: Math.round(combinedModifier * 100) / 100,
  };
}

/**
 * Get risk category from adjusted percentile
 */
export function getRiskCategory(percentile) {
  if (percentile <= 20) return 'Very Low';
  if (percentile <= 40) return 'Low';
  if (percentile <= 60) return 'Average';
  if (percentile <= 80) return 'Elevated';
  return 'High';
}

/**
 * Generate risk summary with recommendations
 */
export function generateRiskSummary(questionnaireData) {
  const summary = {
    positiveFactors: [],
    riskFactors: [],
    recommendations: [],
  };

  // Analyze smoking
  if (questionnaireData.smokingStatus === 'never') {
    summary.positiveFactors.push('Non-smoker');
  } else if (questionnaireData.smokingStatus === 'current') {
    summary.riskFactors.push('Current smoker');
    summary.recommendations.push('Consider smoking cessation programs');
  } else if (questionnaireData.smokingStatus === 'former') {
    summary.positiveFactors.push('Quit smoking');
  }

  // Analyze BMI
  if (questionnaireData.height && questionnaireData.weight) {
    const bmi = calculateBMI(questionnaireData.height, questionnaireData.weight);
    const category = getBMICategory(bmi);

    if (category === 'normal') {
      summary.positiveFactors.push('Healthy weight');
    } else if (category === 'overweight' || category === 'obese' || category === 'severelyObese') {
      summary.riskFactors.push('Elevated BMI');
      summary.recommendations.push('Maintain a balanced diet and regular exercise');
    }
  }

  // Analyze exercise
  if (questionnaireData.exerciseFrequency === 'active' || questionnaireData.exerciseFrequency === 'veryActive') {
    summary.positiveFactors.push('Active lifestyle');
  } else if (questionnaireData.exerciseFrequency === 'sedentary') {
    summary.riskFactors.push('Sedentary lifestyle');
    summary.recommendations.push('Aim for at least 150 minutes of moderate exercise per week');
  }

  // Analyze diet
  if (questionnaireData.dietType === 'mediterranean' || questionnaireData.dietType === 'balanced') {
    summary.positiveFactors.push('Healthy diet');
  } else if (questionnaireData.dietType === 'highProcessed' || questionnaireData.dietType === 'veryHighProcessed') {
    summary.riskFactors.push('High processed food intake');
    summary.recommendations.push('Increase consumption of fruits, vegetables, and whole grains');
  }

  // Analyze alcohol
  if (questionnaireData.alcoholConsumption === 'none' || questionnaireData.alcoholConsumption === 'light') {
    summary.positiveFactors.push('Moderate or no alcohol consumption');
  } else if (questionnaireData.alcoholConsumption === 'heavy') {
    summary.riskFactors.push('Heavy alcohol consumption');
    summary.recommendations.push('Consider reducing alcohol intake');
  }

  // Analyze blood pressure
  if (questionnaireData.systolicBP && questionnaireData.diastolicBP) {
    const bpCategory = getBloodPressureCategory(
      questionnaireData.systolicBP,
      questionnaireData.diastolicBP
    );

    if (bpCategory === 'normal') {
      summary.positiveFactors.push('Normal blood pressure');
    } else if (bpCategory !== 'normal' && bpCategory !== 'elevated') {
      summary.riskFactors.push('Elevated blood pressure');
      summary.recommendations.push('Monitor blood pressure regularly and consult your doctor');
    }
  }

  return summary;
}

export default {
  calculateBMI,
  getBMICategory,
  getAgeCategory,
  getBloodPressureCategory,
  calculateFamilyHistoryModifier,
  calculateLifestyleModifier,
  calculateCombinedRisk,
  getRiskCategory,
  generateRiskSummary,
  SMOKING_MODIFIERS,
  BMI_MODIFIERS,
  FAMILY_HISTORY_MODIFIERS,
  EXERCISE_MODIFIERS,
  DIET_MODIFIERS,
  ALCOHOL_MODIFIERS,
  AGE_MODIFIERS,
  BLOOD_PRESSURE_MODIFIERS,
};
