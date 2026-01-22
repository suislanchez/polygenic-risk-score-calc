/**
 * Chart configurations and utility functions for PRS visualizations
 * Uses inline SVG for charts - no external dependencies
 */

// Risk level color mappings
export const RISK_COLORS = {
  'Very Low': '#22c55e',
  'Low': '#86efac',
  'Average': '#fbbf24',
  'Elevated': '#fb923c',
  'High': '#ef4444',
};

export const RISK_BG_COLORS = {
  'Very Low': '#dcfce7',
  'Low': '#d1fae5',
  'Average': '#fef3c7',
  'Elevated': '#ffedd5',
  'High': '#fee2e2',
};

export const RISK_TEXT_COLORS = {
  'Very Low': '#15803d',
  'Low': '#16a34a',
  'Average': '#d97706',
  'Elevated': '#ea580c',
  'High': '#dc2626',
};

// Category color palette
export const CATEGORY_COLORS = {
  Cardiovascular: '#ef4444',
  Oncology: '#8b5cf6',
  Metabolic: '#f59e0b',
  Neurological: '#3b82f6',
  Autoimmune: '#10b981',
  Respiratory: '#06b6d4',
  Musculoskeletal: '#ec4899',
  Gastrointestinal: '#84cc16',
  Other: '#6b7280',
};

// Disease categories mapping
export const DISEASE_CATEGORIES = {
  // Cardiovascular
  coronary_artery_disease: 'Cardiovascular',
  heart_failure: 'Cardiovascular',
  atrial_fibrillation: 'Cardiovascular',
  hypertension: 'Cardiovascular',
  stroke: 'Cardiovascular',
  peripheral_artery_disease: 'Cardiovascular',
  aortic_aneurysm: 'Cardiovascular',
  venous_thromboembolism: 'Cardiovascular',

  // Oncology
  breast_cancer: 'Oncology',
  prostate_cancer: 'Oncology',
  colorectal_cancer: 'Oncology',
  lung_cancer: 'Oncology',
  melanoma: 'Oncology',
  pancreatic_cancer: 'Oncology',
  ovarian_cancer: 'Oncology',
  bladder_cancer: 'Oncology',
  thyroid_cancer: 'Oncology',
  kidney_cancer: 'Oncology',
  endometrial_cancer: 'Oncology',
  gastric_cancer: 'Oncology',
  esophageal_cancer: 'Oncology',
  liver_cancer: 'Oncology',
  testicular_cancer: 'Oncology',
  leukemia: 'Oncology',
  lymphoma: 'Oncology',
  multiple_myeloma: 'Oncology',
  glioma: 'Oncology',

  // Metabolic
  type_2_diabetes: 'Metabolic',
  type_1_diabetes: 'Metabolic',
  obesity: 'Metabolic',
  hyperlipidemia: 'Metabolic',
  metabolic_syndrome: 'Metabolic',
  gout: 'Metabolic',

  // Neurological
  alzheimers_disease: 'Neurological',
  parkinsons_disease: 'Neurological',
  multiple_sclerosis: 'Neurological',
  epilepsy: 'Neurological',
  migraine: 'Neurological',
  als: 'Neurological',
  schizophrenia: 'Neurological',
  bipolar_disorder: 'Neurological',
  major_depression: 'Neurological',
  anxiety_disorders: 'Neurological',
  adhd: 'Neurological',
  autism_spectrum: 'Neurological',

  // Autoimmune
  rheumatoid_arthritis: 'Autoimmune',
  lupus: 'Autoimmune',
  celiac_disease: 'Autoimmune',
  psoriasis: 'Autoimmune',
  vitiligo: 'Autoimmune',
  graves_disease: 'Autoimmune',
  hashimotos_thyroiditis: 'Autoimmune',
  sjogrens_syndrome: 'Autoimmune',
  ankylosing_spondylitis: 'Autoimmune',

  // Respiratory
  asthma: 'Respiratory',
  copd: 'Respiratory',
  pulmonary_fibrosis: 'Respiratory',
  sleep_apnea: 'Respiratory',

  // Musculoskeletal
  osteoporosis: 'Musculoskeletal',
  osteoarthritis: 'Musculoskeletal',

  // Gastrointestinal
  crohns_disease: 'Gastrointestinal',
  ulcerative_colitis: 'Gastrointestinal',
  ibs: 'Gastrointestinal',
  gallstones: 'Gastrointestinal',

  // Other
  age_related_macular_degeneration: 'Other',
  glaucoma: 'Other',
  chronic_kidney_disease: 'Other',
  endometriosis: 'Other',
};

/**
 * Get risk category from percentile
 */
export function getRiskCategory(percentile) {
  if (percentile <= 20) return 'Very Low';
  if (percentile <= 40) return 'Low';
  if (percentile <= 60) return 'Average';
  if (percentile <= 80) return 'Elevated';
  return 'High';
}

/**
 * Get color for a percentile value
 */
export function getPercentileColor(percentile) {
  const category = getRiskCategory(percentile);
  return RISK_COLORS[category];
}

/**
 * Get gradient stop positions for risk visualization
 */
export function getRiskGradientStops() {
  return [
    { offset: '0%', color: RISK_COLORS['Very Low'] },
    { offset: '25%', color: RISK_COLORS['Low'] },
    { offset: '50%', color: RISK_COLORS['Average'] },
    { offset: '75%', color: RISK_COLORS['Elevated'] },
    { offset: '100%', color: RISK_COLORS['High'] },
  ];
}

/**
 * Get disease category
 */
export function getDiseaseCategory(disease) {
  const normalized = disease.toLowerCase().replace(/\s+/g, '_');
  return DISEASE_CATEGORIES[normalized] || 'Other';
}

/**
 * Get category color
 */
export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
}

/**
 * Calculate normal distribution PDF
 */
export function normalPDF(x, mean = 0, stdDev = 1) {
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return coefficient * Math.exp(exponent);
}

/**
 * Generate points for a normal distribution curve
 */
export function generateDistributionPoints(
  width,
  height,
  mean = 50,
  stdDev = 16.67,
  padding = 20
) {
  const points = [];
  const numPoints = 100;
  const xMin = 0;
  const xMax = 100;

  // Find max Y for scaling
  const maxY = normalPDF(mean, mean, stdDev);

  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + (xMax - xMin) * (i / numPoints);
    const y = normalPDF(x, mean, stdDev);

    const svgX = padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
    const svgY = height - padding - (y / maxY) * (height - 2 * padding);

    points.push({ x: svgX, y: svgY, percentile: x });
  }

  return points;
}

/**
 * Generate SVG path from points
 */
export function pointsToPath(points) {
  if (points.length === 0) return '';

  return points.reduce((path, point, i) => {
    return path + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '');
}

/**
 * Generate area path (closed path for filling)
 */
export function pointsToAreaPath(points, baseY) {
  if (points.length === 0) return '';

  const linePath = pointsToPath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${baseY} L ${firstPoint.x} ${baseY} Z`;
}

/**
 * Distribution curve configuration
 */
export const distributionConfig = {
  width: 400,
  height: 200,
  padding: 30,
  lineColor: '#3b82f6',
  fillColor: 'rgba(59, 130, 246, 0.1)',
  markerColor: '#ef4444',
  gridColor: '#e2e8f0',
  axisColor: '#94a3b8',
};

/**
 * Polar chart configuration
 */
export const polarConfig = {
  size: 300,
  levels: 5,
  labelOffset: 25,
  centerX: 150,
  centerY: 150,
  maxRadius: 100,
  gridColor: '#e2e8f0',
  fillOpacity: 0.3,
  strokeWidth: 2,
};

/**
 * Risk bar configuration
 */
export const riskBarConfig = {
  height: 10,
  borderRadius: 5,
  markerSize: 20,
  markerBorderWidth: 3,
};

/**
 * Format disease name for display
 */
export function formatDiseaseName(disease) {
  return disease
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Calculate aggregate statistics from results
 */
export function calculateStatistics(results) {
  if (!results || Object.keys(results).length === 0) {
    return null;
  }

  const values = Object.values(results);
  const percentiles = values.map(v => v.percentile);

  const highRisk = values.filter(v => v.risk_category === 'High').length;
  const elevatedRisk = values.filter(v => v.risk_category === 'Elevated').length;
  const averagePercentile = percentiles.reduce((a, b) => a + b, 0) / percentiles.length;

  // Category breakdown
  const categoryStats = {};
  Object.entries(results).forEach(([disease, data]) => {
    const category = getDiseaseCategory(disease);
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, totalPercentile: 0, diseases: [] };
    }
    categoryStats[category].count++;
    categoryStats[category].totalPercentile += data.percentile;
    categoryStats[category].diseases.push({ name: disease, ...data });
  });

  // Calculate average per category
  Object.keys(categoryStats).forEach(cat => {
    categoryStats[cat].averagePercentile =
      categoryStats[cat].totalPercentile / categoryStats[cat].count;
  });

  return {
    totalDiseases: values.length,
    highRiskCount: highRisk,
    elevatedRiskCount: elevatedRisk,
    averagePercentile,
    categoryStats,
  };
}

/**
 * Generate CSV content from results
 */
export function generateCSV(results, metadata) {
  const headers = [
    'Disease',
    'Category',
    'Percentile',
    'Risk Category',
    'Matched Variants',
    'Total Variants',
    'Z-Score',
  ];

  const rows = Object.entries(results).map(([disease, data]) => [
    formatDiseaseName(disease),
    getDiseaseCategory(disease),
    data.percentile.toFixed(2),
    data.risk_category,
    data.matched_variants,
    data.total_variants,
    data.z_score?.toFixed(4) || 'N/A',
  ]);

  const csvContent = [
    `# PRS Calculator Results`,
    `# Generated: ${new Date().toISOString()}`,
    `# Ancestry: ${metadata?.ancestry || 'Unknown'}`,
    `# Total Variants in File: ${metadata?.variant_count || 'Unknown'}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Disease recommendations based on risk category
 */
export const DISEASE_RECOMMENDATIONS = {
  high: [
    'Consult with a healthcare provider about this elevated genetic risk',
    'Discuss appropriate screening schedules with your doctor',
    'Consider lifestyle modifications that may reduce risk',
    'Ask about preventive measures specific to this condition',
  ],
  elevated: [
    'Be aware of this moderately elevated genetic risk',
    'Follow standard screening recommendations',
    'Maintain healthy lifestyle habits',
    'Discuss with your doctor during routine visits',
  ],
  average: [
    'Your genetic risk is in the typical range',
    'Continue following standard health guidelines',
    'Maintain a healthy lifestyle',
  ],
  low: [
    'Your genetic risk is below average',
    'Continue healthy habits to maintain this advantage',
    'Follow standard screening guidelines',
  ],
};

/**
 * Get recommendations based on risk category
 */
export function getRecommendations(riskCategory) {
  if (riskCategory === 'High') return DISEASE_RECOMMENDATIONS.high;
  if (riskCategory === 'Elevated') return DISEASE_RECOMMENDATIONS.elevated;
  if (riskCategory === 'Average') return DISEASE_RECOMMENDATIONS.average;
  return DISEASE_RECOMMENDATIONS.low;
}
