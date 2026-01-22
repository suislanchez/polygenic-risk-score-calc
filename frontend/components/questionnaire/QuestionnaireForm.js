'use client'

import { useState, useEffect, useCallback } from 'react'

// Color scheme
const COLORS = {
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  secondary: '#0d9488',
  secondaryDark: '#0f766e',
  background: '#f8fafc',
  cardBg: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  success: '#22c55e',
  error: '#ef4444',
}

// Ancestry options
const ANCESTRY_OPTIONS = [
  { value: 'EUR', label: 'European' },
  { value: 'AFR', label: 'African' },
  { value: 'EAS', label: 'East Asian' },
  { value: 'AMR', label: 'Latino/Admixed American' },
  { value: 'SAS', label: 'South Asian' },
]

// Medical conditions for family history
const MEDICAL_CONDITIONS = [
  { id: 'heart_disease', label: 'Heart Disease / Coronary Artery Disease' },
  { id: 'type2_diabetes', label: 'Type 2 Diabetes' },
  { id: 'breast_cancer', label: 'Breast Cancer' },
  { id: 'prostate_cancer', label: 'Prostate Cancer' },
  { id: 'colorectal_cancer', label: 'Colorectal Cancer' },
  { id: 'lung_cancer', label: 'Lung Cancer' },
  { id: 'alzheimers', label: "Alzheimer's Disease" },
  { id: 'parkinsons', label: "Parkinson's Disease" },
  { id: 'stroke', label: 'Stroke' },
  { id: 'hypertension', label: 'High Blood Pressure (Hypertension)' },
  { id: 'atrial_fibrillation', label: 'Atrial Fibrillation' },
  { id: 'asthma', label: 'Asthma' },
  { id: 'rheumatoid_arthritis', label: 'Rheumatoid Arthritis' },
  { id: 'multiple_sclerosis', label: 'Multiple Sclerosis' },
  { id: 'inflammatory_bowel', label: 'Inflammatory Bowel Disease' },
]

// Step configuration
const STEPS = [
  { id: 1, title: 'Demographics', description: 'Basic information about you' },
  { id: 2, title: 'Family History', description: 'Conditions in close relatives' },
  { id: 3, title: 'Lifestyle', description: 'Daily habits and behaviors' },
  { id: 4, title: 'Medical History', description: 'Your health background' },
  { id: 5, title: 'Biometrics', description: 'Physical measurements' },
]

// Styles
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    background: COLORS.cardBg,
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    padding: '32px',
    marginBottom: '24px',
  },
  progressContainer: {
    marginBottom: '32px',
  },
  progressBar: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '8px',
  },
  progressLine: {
    position: 'absolute',
    top: '16px',
    left: '24px',
    right: '24px',
    height: '4px',
    background: COLORS.border,
    zIndex: 0,
  },
  progressFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  stepIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
    flex: 1,
  },
  stepCircle: (isActive, isCompleted) => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    background: isCompleted ? COLORS.secondary : isActive ? COLORS.primary : COLORS.cardBg,
    color: isCompleted || isActive ? COLORS.cardBg : COLORS.textLight,
    border: `2px solid ${isCompleted ? COLORS.secondary : isActive ? COLORS.primary : COLORS.border}`,
    transition: 'all 0.3s ease',
  }),
  stepLabel: (isActive) => ({
    marginTop: '8px',
    fontSize: '12px',
    color: isActive ? COLORS.text : COLORS.textLight,
    fontWeight: isActive ? '600' : '400',
    textAlign: 'center',
  }),
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: '8px',
  },
  description: {
    fontSize: '16px',
    color: COLORS.textLight,
    marginBottom: '32px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: '8px',
  },
  labelOptional: {
    fontWeight: '400',
    color: COLORS.textLight,
    marginLeft: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `2px solid ${COLORS.border}`,
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: COLORS.primary,
    boxShadow: `0 0 0 3px ${COLORS.primary}20`,
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `2px solid ${COLORS.border}`,
    fontSize: '16px',
    outline: 'none',
    background: COLORS.cardBg,
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  radioGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  radioLabel: (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    borderRadius: '8px',
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
    background: isSelected ? `${COLORS.primary}10` : COLORS.cardBg,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: '1 1 calc(50% - 6px)',
    minWidth: '150px',
  }),
  checkboxContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  checkboxLabel: (isChecked) => ({
    display: 'flex',
    alignItems: 'flex-start',
    padding: '16px',
    borderRadius: '8px',
    border: `2px solid ${isChecked ? COLORS.secondary : COLORS.border}`,
    background: isChecked ? `${COLORS.secondary}10` : COLORS.cardBg,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '12px',
    accentColor: COLORS.secondary,
    cursor: 'pointer',
    flexShrink: 0,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '32px',
  },
  button: (variant) => ({
    padding: '14px 32px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    ...(variant === 'primary' ? {
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
      color: COLORS.cardBg,
      boxShadow: `0 4px 14px ${COLORS.primary}40`,
    } : {
      background: COLORS.cardBg,
      color: COLORS.textLight,
      border: `2px solid ${COLORS.border}`,
    }),
  }),
  inputRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  inputHalf: {
    flex: '1 1 calc(50% - 8px)',
    minWidth: '200px',
  },
  familyRelatives: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
    paddingLeft: '32px',
  },
  relativeTag: (isSelected) => ({
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    border: `1px solid ${isSelected ? COLORS.secondary : COLORS.border}`,
    background: isSelected ? `${COLORS.secondary}20` : COLORS.cardBg,
    color: isSelected ? COLORS.secondaryDark : COLORS.textLight,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  textArea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `2px solid ${COLORS.border}`,
    fontSize: '16px',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  skipButton: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    color: COLORS.textLight,
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
  },
  helperText: {
    fontSize: '13px',
    color: COLORS.textLight,
    marginTop: '6px',
  },
  errorText: {
    fontSize: '13px',
    color: COLORS.error,
    marginTop: '6px',
  },
}

// Progress Bar Component
function ProgressBar({ currentStep }) {
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <div style={styles.progressContainer}>
      <div style={styles.progressBar}>
        <div style={styles.progressLine}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        {STEPS.map((step) => (
          <div key={step.id} style={styles.stepIndicator}>
            <div style={styles.stepCircle(currentStep === step.id, currentStep > step.id)}>
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <span style={styles.stepLabel(currentStep === step.id)}>{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 1: Demographics
function DemographicsStep({ data, onChange, errors }) {
  return (
    <div>
      <div style={styles.inputRow}>
        <div style={{ ...styles.formGroup, ...styles.inputHalf }}>
          <label style={styles.label}>Age</label>
          <input
            type="number"
            min="18"
            max="120"
            value={data.age || ''}
            onChange={(e) => onChange('age', e.target.value ? parseInt(e.target.value) : '')}
            style={styles.input}
            placeholder="Enter your age"
          />
          {errors.age && <p style={styles.errorText}>{errors.age}</p>}
        </div>
        <div style={{ ...styles.formGroup, ...styles.inputHalf }}>
          <label style={styles.label}>Biological Sex</label>
          <select
            value={data.biologicalSex || ''}
            onChange={(e) => onChange('biologicalSex', e.target.value)}
            style={styles.select}
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.biologicalSex && <p style={styles.errorText}>{errors.biologicalSex}</p>}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Genetic Ancestry</label>
        <p style={styles.helperText}>
          Select the ancestry that best represents your genetic background. This helps calibrate risk scores.
        </p>
        <div style={{ ...styles.radioGroup, marginTop: '12px' }}>
          {ANCESTRY_OPTIONS.map((option) => (
            <label
              key={option.value}
              style={styles.radioLabel(data.ancestry === option.value)}
            >
              <input
                type="radio"
                name="ancestry"
                value={option.value}
                checked={data.ancestry === option.value}
                onChange={(e) => onChange('ancestry', e.target.value)}
                style={{ marginRight: '10px', accentColor: COLORS.primary }}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.ancestry && <p style={styles.errorText}>{errors.ancestry}</p>}
      </div>
    </div>
  )
}

// Step 2: Family History
function FamilyHistoryStep({ data, onChange }) {
  const familyHistory = data.familyHistory || {}

  const toggleCondition = (conditionId) => {
    const current = familyHistory[conditionId]
    if (current) {
      // Remove condition
      const updated = { ...familyHistory }
      delete updated[conditionId]
      onChange('familyHistory', updated)
    } else {
      // Add condition with default structure
      onChange('familyHistory', {
        ...familyHistory,
        [conditionId]: { mother: false, father: false, sibling: false, grandparent: false },
      })
    }
  }

  const toggleRelative = (conditionId, relative) => {
    const condition = familyHistory[conditionId] || {}
    onChange('familyHistory', {
      ...familyHistory,
      [conditionId]: {
        ...condition,
        [relative]: !condition[relative],
      },
    })
  }

  return (
    <div>
      <p style={{ ...styles.helperText, marginBottom: '20px' }}>
        Select any conditions that your first-degree relatives (parents, siblings) or grandparents have been diagnosed with.
        This information helps provide more accurate risk assessments.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {MEDICAL_CONDITIONS.map((condition) => {
          const isSelected = !!familyHistory[condition.id]
          const relatives = familyHistory[condition.id] || {}

          return (
            <div key={condition.id}>
              <label style={styles.checkboxLabel(isSelected)}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCondition(condition.id)}
                  style={styles.checkbox}
                />
                <span style={{ fontSize: '15px', color: COLORS.text }}>{condition.label}</span>
              </label>

              {isSelected && (
                <div style={styles.familyRelatives}>
                  {['mother', 'father', 'sibling', 'grandparent'].map((relative) => (
                    <button
                      key={relative}
                      type="button"
                      onClick={() => toggleRelative(condition.id, relative)}
                      style={styles.relativeTag(relatives[relative])}
                    >
                      {relative.charAt(0).toUpperCase() + relative.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange('familyHistory', {})}
        style={{ ...styles.skipButton, marginTop: '16px' }}
      >
        No known family history / Skip this section
      </button>
    </div>
  )
}

// Step 3: Lifestyle
function LifestyleStep({ data, onChange }) {
  return (
    <div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Smoking Status</label>
        <div style={styles.radioGroup}>
          {[
            { value: 'never', label: 'Never smoked' },
            { value: 'former', label: 'Former smoker' },
            { value: 'current', label: 'Current smoker' },
          ].map((option) => (
            <label key={option.value} style={styles.radioLabel(data.smokingStatus === option.value)}>
              <input
                type="radio"
                name="smoking"
                value={option.value}
                checked={data.smokingStatus === option.value}
                onChange={(e) => onChange('smokingStatus', e.target.value)}
                style={{ marginRight: '10px', accentColor: COLORS.primary }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Alcohol Consumption
          <span style={styles.labelOptional}>(weekly)</span>
        </label>
        <div style={styles.radioGroup}>
          {[
            { value: 'none', label: 'None' },
            { value: 'light', label: '1-7 drinks' },
            { value: 'moderate', label: '8-14 drinks' },
            { value: 'heavy', label: '15+ drinks' },
          ].map((option) => (
            <label key={option.value} style={styles.radioLabel(data.alcoholConsumption === option.value)}>
              <input
                type="radio"
                name="alcohol"
                value={option.value}
                checked={data.alcoholConsumption === option.value}
                onChange={(e) => onChange('alcoholConsumption', e.target.value)}
                style={{ marginRight: '10px', accentColor: COLORS.primary }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Exercise Frequency</label>
        <div style={styles.radioGroup}>
          {[
            { value: 'veryActive', label: '5+ times/week' },
            { value: 'active', label: '3-4 times/week' },
            { value: 'moderate', label: '1-2 times/week' },
            { value: 'sedentary', label: 'Rarely/never' },
          ].map((option) => (
            <label key={option.value} style={styles.radioLabel(data.exerciseFrequency === option.value)}>
              <input
                type="radio"
                name="exercise"
                value={option.value}
                checked={data.exerciseFrequency === option.value}
                onChange={(e) => onChange('exerciseFrequency', e.target.value)}
                style={{ marginRight: '10px', accentColor: COLORS.primary }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Diet Type</label>
        <select
          value={data.dietType || ''}
          onChange={(e) => onChange('dietType', e.target.value)}
          style={styles.select}
        >
          <option value="">Select your typical diet...</option>
          <option value="mediterranean">Mediterranean (high in fish, olive oil, vegetables)</option>
          <option value="balanced">Balanced (variety of foods, home-cooked meals)</option>
          <option value="standard">Standard Western diet</option>
          <option value="highProcessed">High in processed/fast foods</option>
          <option value="veryHighProcessed">Mostly processed/fast foods</option>
        </select>
      </div>
    </div>
  )
}

// Step 4: Medical History
function MedicalHistoryStep({ data, onChange }) {
  return (
    <div>
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Existing Medical Conditions
          <span style={styles.labelOptional}>(optional)</span>
        </label>
        <p style={styles.helperText}>
          List any conditions you have been diagnosed with (e.g., diabetes, hypertension, high cholesterol)
        </p>
        <textarea
          value={data.existingConditions || ''}
          onChange={(e) => onChange('existingConditions', e.target.value)}
          style={styles.textArea}
          placeholder="Enter conditions, separated by commas..."
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Current Medications
          <span style={styles.labelOptional}>(optional)</span>
        </label>
        <p style={styles.helperText}>
          List any medications you are currently taking
        </p>
        <textarea
          value={data.currentMedications || ''}
          onChange={(e) => onChange('currentMedications', e.target.value)}
          style={styles.textArea}
          placeholder="Enter medications, separated by commas..."
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Previous Surgeries or Major Medical Events
          <span style={styles.labelOptional}>(optional)</span>
        </label>
        <textarea
          value={data.medicalEvents || ''}
          onChange={(e) => onChange('medicalEvents', e.target.value)}
          style={styles.textArea}
          placeholder="Enter any relevant medical history..."
        />
      </div>
    </div>
  )
}

// Step 5: Biometrics
function BiometricsStep({ data, onChange, errors }) {
  return (
    <div>
      <div style={styles.inputRow}>
        <div style={{ ...styles.formGroup, ...styles.inputHalf }}>
          <label style={styles.label}>
            Height
            <span style={styles.labelOptional}>(cm)</span>
          </label>
          <input
            type="number"
            min="100"
            max="250"
            value={data.height || ''}
            onChange={(e) => onChange('height', e.target.value ? parseFloat(e.target.value) : '')}
            style={styles.input}
            placeholder="e.g., 175"
          />
          {errors.height && <p style={styles.errorText}>{errors.height}</p>}
          <p style={styles.helperText}>Enter height in centimeters</p>
        </div>
        <div style={{ ...styles.formGroup, ...styles.inputHalf }}>
          <label style={styles.label}>
            Weight
            <span style={styles.labelOptional}>(kg)</span>
          </label>
          <input
            type="number"
            min="30"
            max="300"
            value={data.weight || ''}
            onChange={(e) => onChange('weight', e.target.value ? parseFloat(e.target.value) : '')}
            style={styles.input}
            placeholder="e.g., 70"
          />
          {errors.weight && <p style={styles.errorText}>{errors.weight}</p>}
          <p style={styles.helperText}>Enter weight in kilograms</p>
        </div>
      </div>

      {data.height && data.weight && (
        <div style={{
          background: `${COLORS.secondary}10`,
          border: `1px solid ${COLORS.secondary}40`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <span style={{ color: COLORS.text, fontWeight: '600' }}>
            Calculated BMI: {(data.weight / Math.pow(data.height / 100, 2)).toFixed(1)}
          </span>
        </div>
      )}

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Blood Pressure
          <span style={styles.labelOptional}>(if known)</span>
        </label>
        <p style={styles.helperText}>Enter your most recent blood pressure reading</p>
        <div style={{ ...styles.inputRow, marginTop: '12px' }}>
          <div style={styles.inputHalf}>
            <input
              type="number"
              min="70"
              max="250"
              value={data.systolicBP || ''}
              onChange={(e) => onChange('systolicBP', e.target.value ? parseInt(e.target.value) : '')}
              style={styles.input}
              placeholder="Systolic (top number)"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', color: COLORS.textLight }}>
            /
          </div>
          <div style={styles.inputHalf}>
            <input
              type="number"
              min="40"
              max="150"
              value={data.diastolicBP || ''}
              onChange={(e) => onChange('diastolicBP', e.target.value ? parseInt(e.target.value) : '')}
              style={styles.input}
              placeholder="Diastolic (bottom number)"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          onChange('height', '')
          onChange('weight', '')
          onChange('systolicBP', '')
          onChange('diastolicBP', '')
        }}
        style={styles.skipButton}
      >
        Skip biometrics
      </button>
    </div>
  )
}

// Main QuestionnaireForm Component
export default function QuestionnaireForm({ onComplete, initialData }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialData || {
    // Demographics
    age: '',
    biologicalSex: '',
    ancestry: 'EUR',
    // Family History
    familyHistory: {},
    // Lifestyle
    smokingStatus: '',
    alcoholConsumption: '',
    exerciseFrequency: '',
    dietType: '',
    // Medical History
    existingConditions: '',
    currentMedications: '',
    medicalEvents: '',
    // Biometrics
    height: '',
    weight: '',
    systolicBP: '',
    diastolicBP: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('prs_questionnaire_data')
    if (saved && !initialData) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed)
      } catch (e) {
        console.error('Failed to parse saved questionnaire data:', e)
      }
    }
  }, [initialData])

  // Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('prs_questionnaire_data', JSON.stringify(formData))
  }, [formData])

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }, [errors])

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.age) {
          newErrors.age = 'Age is required'
        } else if (formData.age < 18 || formData.age > 120) {
          newErrors.age = 'Please enter a valid age (18-120)'
        }
        if (!formData.biologicalSex) {
          newErrors.biologicalSex = 'Biological sex is required'
        }
        if (!formData.ancestry) {
          newErrors.ancestry = 'Please select your ancestry'
        }
        break
      case 5:
        if (formData.height && (formData.height < 100 || formData.height > 250)) {
          newErrors.height = 'Please enter a valid height (100-250 cm)'
        }
        if (formData.weight && (formData.weight < 30 || formData.weight > 300)) {
          newErrors.weight = 'Please enter a valid weight (30-300 kg)'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep((prev) => prev + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Save completion timestamp
    const completedData = {
      ...formData,
      completedAt: new Date().toISOString(),
    }

    localStorage.setItem('prs_questionnaire_data', JSON.stringify(completedData))
    localStorage.setItem('prs_questionnaire_completed', 'true')

    // Callback to parent
    if (onComplete) {
      onComplete(completedData)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DemographicsStep data={formData} onChange={handleChange} errors={errors} />
      case 2:
        return <FamilyHistoryStep data={formData} onChange={handleChange} />
      case 3:
        return <LifestyleStep data={formData} onChange={handleChange} />
      case 4:
        return <MedicalHistoryStep data={formData} onChange={handleChange} />
      case 5:
        return <BiometricsStep data={formData} onChange={handleChange} errors={errors} />
      default:
        return null
    }
  }

  const currentStepData = STEPS[currentStep - 1]

  return (
    <div style={styles.container}>
      <ProgressBar currentStep={currentStep} />

      <div style={styles.card}>
        <h2 style={styles.title}>{currentStepData.title}</h2>
        <p style={styles.description}>{currentStepData.description}</p>

        {renderStep()}

        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            style={{
              ...styles.button('secondary'),
              opacity: currentStep === 1 ? 0.5 : 1,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            style={styles.button('primary')}
          >
            {currentStep === STEPS.length ? (isSubmitting ? 'Submitting...' : 'Complete') : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
