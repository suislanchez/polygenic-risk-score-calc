# PRS Website Enhancement Plan

## Overview
Comprehensive upgrade to the Polygenic Risk Score Calculator website with:
- Modern UI/UX improvements
- Pre-test questionnaire for enhanced accuracy
- Research paper content and methodology documentation
- Enhanced results visualization

---

## Parallel Work Streams

### Stream 1: Pre-Test Questionnaire System
**Goal**: Collect clinical/lifestyle data to improve risk accuracy

**Components**:
1. **Multi-step Questionnaire Form**
   - Step 1: Demographics (age, sex, ethnicity confirmation)
   - Step 2: Family History (first-degree relatives with conditions)
   - Step 3: Lifestyle Factors (smoking, alcohol, exercise, diet)
   - Step 4: Medical History (existing conditions, medications)
   - Step 5: Biometrics (height, weight, blood pressure if known)

2. **Risk Modifier Integration**
   - Apply clinical risk multipliers based on questionnaire
   - Family history adjustment (1.5-3x for first-degree relatives)
   - Lifestyle risk factors (smoking, obesity, sedentary)
   - Age/sex-specific baselines

3. **Data Structure**
```javascript
{
  demographics: { age, sex, confirmedAncestry },
  familyHistory: {
    heartDisease: { parent: bool, sibling: bool },
    cancer: { type: string, relation: string },
    diabetes: { parent: bool, sibling: bool },
    // ... per disease category
  },
  lifestyle: {
    smoking: 'never|former|current',
    alcoholUnits: number,
    exerciseMinutes: number,
    dietType: 'mediterranean|western|vegetarian|other'
  },
  medical: {
    conditions: string[],
    medications: string[]
  },
  biometrics: {
    height: number,
    weight: number,
    bmi: number, // calculated
    bloodPressure: { systolic, diastolic }
  }
}
```

---

### Stream 2: UI/UX Enhancement
**Goal**: Modern, professional, research-grade interface

**Components**:
1. **Landing Page Redesign**
   - Hero section with animated DNA helix
   - Trust indicators (PGS Catalog badge, publication references)
   - Process flow visualization (Upload → Analyze → Results)
   - Testimonials/stats section

2. **File Upload Improvements**
   - Animated drop zone with file validation
   - Progress bar during analysis
   - Format auto-detection feedback
   - Sample data option for demo

3. **Visual Design System**
   - Consistent color palette (scientific/medical theme)
   - Typography hierarchy
   - Card-based components
   - Micro-animations and transitions

4. **Responsive Design**
   - Mobile-first approach
   - Tablet optimization
   - Desktop dashboard view

---

### Stream 3: Results Enhancement
**Goal**: Comprehensive, actionable, exportable results

**Components**:
1. **Interactive Visualizations**
   - Radial/polar chart for disease categories
   - Distribution curves showing user position
   - Risk comparison bars (your risk vs population)
   - Trend indicators

2. **Detailed Disease Cards**
   - Expanded view with full explanation
   - Gene/variant information
   - Clinical recommendations (AHA/NHS guidelines)
   - External resource links

3. **Export Options**
   - PDF report (already exists - enhance)
   - CSV data export
   - Share via link (encrypted)
   - Print-optimized view

4. **Comparative Features**
   - Population percentile visualization
   - Ancestry-specific context
   - Combined genetic + questionnaire risk

---

### Stream 4: Research & Educational Content
**Goal**: Academic credibility and user education

**Components**:
1. **Methodology Page**
   - How PRS works (scientific explanation)
   - Variant matching algorithm
   - Population normalization
   - Limitations and caveats

2. **Disease Information Hub**
   - Per-disease pages with:
     - Heritability estimates
     - Key genetic variants
     - Environmental interactions
     - Prevention strategies

3. **Research Paper Section**
   - Citation information
   - Data sources (PGS Catalog, UK Biobank)
   - Validation studies
   - Accuracy metrics by ancestry

4. **FAQ & Help**
   - Common questions
   - Result interpretation guide
   - When to consult a doctor
   - Privacy & data handling

---

## Technical Architecture

### New Files to Create

```
frontend/
├── app/
│   ├── page.js                    # Enhanced landing
│   ├── questionnaire/
│   │   └── page.js                # Multi-step questionnaire
│   ├── results/
│   │   └── page.js                # Enhanced results page
│   ├── methodology/
│   │   └── page.js                # Research methodology
│   ├── diseases/
│   │   ├── page.js                # Disease catalog
│   │   └── [disease]/page.js      # Individual disease pages
│   ├── about/
│   │   └── page.js                # About & research info
│   └── api/
│       ├── compute/route.js       # Existing (enhance)
│       └── questionnaire/route.js # New: process questionnaire
├── components/
│   ├── ui/
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── ProgressBar.js
│   │   ├── RiskGauge.js
│   │   └── Modal.js
│   ├── questionnaire/
│   │   ├── DemographicsStep.js
│   │   ├── FamilyHistoryStep.js
│   │   ├── LifestyleStep.js
│   │   ├── MedicalHistoryStep.js
│   │   └── BiometricsStep.js
│   ├── results/
│   │   ├── RiskChart.js
│   │   ├── DiseaseCard.js
│   │   ├── DistributionCurve.js
│   │   └── ExportPanel.js
│   └── layout/
│       ├── Header.js
│       ├── Footer.js
│       └── Navigation.js
├── lib/
│   ├── riskModifiers.js           # Apply questionnaire to PRS
│   ├── chartConfig.js             # Chart.js configurations
│   └── diseaseData.js             # Disease information catalog
└── styles/
    ├── globals.css                # Enhanced global styles
    └── variables.css              # CSS custom properties
```

### Backend Enhancements

```
src/
├── risk_integration.py            # Combine PRS + questionnaire
├── clinical_modifiers.py          # Evidence-based risk adjustments
└── disease_info.py                # Educational content database
```

---

## Risk Integration Formula

Combined risk calculation incorporating questionnaire data:

```
Combined_Risk = PRS_Percentile × Lifestyle_Modifier × Family_History_Modifier × Age_Sex_Baseline

Where:
- Lifestyle_Modifier = product of individual lifestyle factors
  - Smoking: never=1.0, former=1.2, current=1.8
  - Obesity (BMI>30): 1.3
  - Sedentary (<150min/week exercise): 1.2
  - Heavy alcohol (>14 units/week): 1.3

- Family_History_Modifier:
  - One affected parent: 1.5
  - Two affected parents: 2.5
  - Affected sibling: 1.8

- Age_Sex_Baseline:
  - Disease-specific baseline rates by age/sex from SEER, Framingham, etc.
```

---

## Agent Assignment

| Agent | Stream | Files | Dependencies |
|-------|--------|-------|--------------|
| Agent 1 | Questionnaire | questionnaire/, api/questionnaire/, components/questionnaire/ | None |
| Agent 2 | UI Components | components/ui/, styles/, page.js | None |
| Agent 3 | Results Page | results/, components/results/, lib/chartConfig.js | Agent 1 (partial) |
| Agent 4 | Research Content | methodology/, diseases/, about/, lib/diseaseData.js | None |

**Parallelization Notes**:
- Agents 1, 2, 4 can run fully in parallel
- Agent 3 should start immediately but may need final integration with Agent 1
- All agents share common UI components from Agent 2

---

## Implementation Priority

### Phase 1 (Parallel)
1. Questionnaire form structure (Agent 1)
2. UI component library (Agent 2)
3. Disease information pages (Agent 4)

### Phase 2 (Parallel)
1. Risk modifier integration (Agent 1)
2. Results visualizations (Agent 3)
3. Methodology documentation (Agent 4)

### Phase 3 (Integration)
1. Connect questionnaire → results
2. Final UI polish
3. Testing & validation

---

## Success Metrics

- **Accuracy**: Combined risk closer to clinical risk calculators
- **Engagement**: Time on site, questionnaire completion rate
- **Credibility**: Research paper citations, methodology transparency
- **Usability**: Mobile responsiveness, accessibility score
