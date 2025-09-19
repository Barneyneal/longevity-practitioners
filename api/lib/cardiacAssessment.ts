// src/lib/cardiacAssessment.ts

// @ts-nocheck
// Prerequisite: Assuming the types from the original assessment.ts are available
// For clarity, they are re-declared here.
export type SubmittedAnswer =
  | { questionId: string; questionText: string; value: string | number | null }
  | { questionId: string; questionText: string; value: { [k: string]: any } }
  | { questionId: string; questionText: string; value: any[] };

export type AssessmentInput = {
  userId?: string | null;
  quizId?: string | null;
  submissionId?: string | null;
  submittedAnswers: SubmittedAnswer[];
  createdAt?: string; // ISO
};

// Assuming AssessmentOutput from the Longevity quiz is imported or defined
export type LongevityAssessmentOutput = {
  coreMetrics: {
    chronologicalAge: number;
    // ... other metrics
  };
  augmentedData: {
    bmi: number;
    // ... other data
  };
  submittedAnswers: SubmittedAnswer[]; // Pass original answers through
  // ... other properties
};


// 1. DEFINE THE NEW OUTPUT TYPE FOR THE CARDIAC ASSESSMENT
export type CardiacAssessmentOutput = {
  userId?: string | null;
  quizId?: string | null;
  submissionId?: string | null;
  augmentedData: { bmi: number; chronologicalAge: number | null; totalPenaltyScore: number };
  coreMetrics: {
    cardiacRiskScore: number; // The final 0-100% risk score
    riskDescriptor: string; // e.g., 'Low Risk', 'Borderline', 'High Risk'
  };
  categoryScores: Record<string, { score: number; title: string; descriptor?: string }>;
  scoredAnswers: { question: string; answer: string; penalty: number }[];
  topImprovementAreas: { question: string; answer: string; penalty: number }[];
};


// --- Helper functions copied from assessment.ts for robustness ---
function parseDateOnly(iso?: string | null): Date | null {
  try {
    if (!iso) return null;
    const dateOnly = String(iso).split('T')[0];
    const d = new Date(dateOnly + 'T00:00:00Z');
    if (isNaN(d.getTime())) return null; // Invalid date check
    return d;
  } catch {
    return null;
  }
}

function calculateChronologicalAge(dob?: string | null, createdAt?: string | null): number | null {
  if (!dob) return null;
  try {
    const today = new Date((createdAt || new Date().toISOString()).split('T')[0] + 'T00:00:00Z');
    const birth = parseDateOnly(dob);

    if (!birth) return null;

    if (birth.getTime() >= today.getTime()) return null;

    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    const m = today.getUTCMonth() - birth.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) age--;
    return age;
  } catch {
    return null;
  }
}

function calculateBMI(answersMap: Record<string, any>): number {
  try {
    const height = answersMap['height'];
    const weight = answersMap['weight'];
    if (!height || typeof height !== 'object') return 0;
    const ft = parseInt(String((height as any).ft ?? '0'), 10);
    const inches = parseInt(String((height as any).in ?? '0'), 10);
    const totalInches = ft * 12 + inches;
    if (totalInches <= 0) return 0;
    const weightLbs = parseFloat(String(weight ?? '0'));
    if (weightLbs <= 0) return 0;
    const meters = totalInches * 0.0254;
    const kg = weightLbs * 0.453592;
    return kg / (meters * meters);
  } catch {
    return 0;
  }
}


// 2. DEFINE THE CARDIAC SCORING MATRIX
// Penalties are subtracted from a base score of 100. Higher penalty = worse for health.
const CARDIAC_SCORING_MATRIX: Record<string, Record<string, number>> = {
  // Section 1: History & Symptoms (High weight)
  'dx-cardiac-history': {
    'High blood pressure': 5,
    'High cholesterol': 4,
    'Coronary artery disease': 15,
    'Prior heart attack': 20,
    'Angina (chest pain from heart)': 12,
    'Atrial fibrillation': 10,
    'Heart failure': 20,
    'Stroke or TIA (mini-stroke)': 15,
    'Chronic kidney disease': 8,
    'Diabetes or prediabetes': 8,
    'None of the above': 0,
  },
  'symptoms-chest-pain': { 'No': 0, 'Once or twice': 5, 'Weekly': 10, 'Most days': 15 },
  'symptoms-exertional-eases': { 'No': 0, 'Once or twice': 6, 'Weekly': 12, 'Most days': 18 },
  'symptoms-dyspnea': { 'Never': 0, 'Sometimes': 3, 'Often': 7, 'Always': 12 },
  'symptoms-functional-decline': { 'No': 0, 'Slight decline': 4, 'Clear decline': 8 },
  'symptoms-orthopnea': { 'No': 0, 'Sometimes': 5, 'Often': 10 },
  'symptoms-palpitations': { 'Never': 0, 'Once or twice': 2, 'Weekly': 5, 'Most days': 8 },
  'symptoms-syncope': { 'No': 0, 'Yes, once': 8, 'Yes, more than once': 15 },
  'symptoms-edema': { 'Never': 0, 'Occasionally': 3, 'Most days': 7 },

  // Section 2: Blood Pressure
  'bp-home-average': {
    'I don’t know': 5,
    '< 110 / < 70': -2, // Bonus
    '110-119 / 70-79': 0,
    '120-129 / 70-79': 3,
    '130-139 / 80-89': 8,
    '140-159 / 90-99': 15,
    '≥ 160 / ≥ 100': 25,
  },
  'bp-monitor-frequency': { 'Daily': -1, 'Few times/week': 0, 'Weekly': 2, 'Rarely': 4, 'Never': 5 },
  'bp-orthostatic': { 'Never': 0, 'Sometimes': 2, 'Often': 4 },
  'bp-salt-sensitivity': { 'No / not sure': 0, 'Occasionally': 2, 'Often': 4 },

  // Section 3: Labs
  'labs-ldl-band': { 'I don’t know': 3, '< 70 mg/dL': -2, '70-99 mg/dL': 0, '100-129 mg/dL': 4, '130-159 mg/dL': 8, '160-189 mg/dL': 12, '≥ 190 mg/dL': 18 },
  'labs-hdl-band': { 'I don’t know': 2, '< 40 mg/dL': 8, '40-59 mg/dL': 2, '≥ 60 mg/dL': -3 },
  'labs-trig-band': { 'I don’t know': 2, '< 100 mg/dL': -1, '100-149 mg/dL': 0, '150-199 mg/dL': 4, '200-499 mg/dL': 7, '≥ 500 mg/dL': 12 },
  'labs-a1c-band': { 'I don’t know': 3, '< 5.7%': 0, '5.7-6.4% (prediabetes)': 5, '≥ 6.5% (diabetes)': 10 },
  'labs-general-lipids': { 'Yes': 5, 'No': 0, 'Not sure': 2 },
  'labs-general-glucose': { 'No': 0, 'Prediabetes': 5, 'Diabetes': 10, 'Not sure': 2 },

  // Section 4: Lifestyle
  'diet-sodium': { 'Rarely': 0, '1-3 times per week': 2, '4-6 times per week': 4, 'Daily': 6 },
  'diet-processed-meat': { '0': 0, '1-2': 3, '3-4': 5, '5+': 8 },
  'diet-fried-fast': { 'Rarely': 0, '1-3 times per week': 2, '4-6 times per week': 5, 'Daily': 8 },
  'diet-plant-diversity': { '< 10': 5, '10-20': 2, '21-30': -1, '> 30': -3 },
  'diet-pattern': { 'Yes, consistently': -4, 'Sometimes': 1, 'Not really': 4, 'Not sure': 2 },
  'sleep-apnea-risk': { 'No': 0, 'Possible (one or more apply)': 5, 'Diagnosed sleep apnea': 8 },
  'sleep-apnea-treatment': { 'Not diagnosed': 0, 'Yes, consistent use': 0, 'Inconsistent use': 4, 'Not using': 8 }, // Penalty only if diagnosed and not treating
  'sleep-short-duration': { '0--1': 0, '2--3': 2, '4--5': 5, '6--7': 8 },
  'sleep-maintenance': { '0--1': 0, '2--3': 2, '4--5': 4, '6--7': 6 },

  // Section 5: Fitness
  'rhr-band': { 'I don’t know': 2, '< 55': -3, '55-64': -1, '65-74': 2, '75-84': 5, '≥ 85': 8 },
  'hrr-self': { 'Unsure': 2, '≥ 25 bpm drop': -3, '15-24 bpm drop': 0, '5-14 bpm drop': 4, '< 5 bpm drop': 8 },
  'cardio-minutes': { '< 60 min': 10, '1-2 hours': 5, '3-4 hours': -2, '≥ 5 hours': -5 },
  'sedentary-hours': { '< 4 hours': -2, '4-7 hours': 0, '8-10 hours': 4, '> 10 hours': 7 },
  'fitness-self-rated': { 'Below average': 5, 'Average': 0, 'Above average': -3 },
  
  // Section 6: Meds
  'meds-adherence': { 'Never': 0, 'Rarely': 2, 'Sometimes': 5, 'Often': 8, 'Not on prescriptions': 0 },
  'care-engagement': { 'Always': -1, 'Most of the time': 0, 'Some of the time': 3, 'Not at all': 5 },

  // Section 7 & 8: Environment & Digital
  'family-premature-ascvd': { 'Yes': 10, 'No': 0, 'Not sure': 3 },
  'secondhand-smoke': { 'No': 0, 'Occasionally': 2, 'Frequently': 5 },
  'occupational-exposure': { 'No': 0, 'Occasionally': 1, 'Frequently': 3 },
  'wearable-use': { 'No': 1, 'Yes -- no alerts': 0, 'Yes -- irregular rhythm alert': 5, 'Yes -- high resting HR alert': 3 },

  // Section 9: Psychosocial
  'stress-control': { 'Never': 0, 'Some days': 2, 'Most days': 4, 'Nearly every day': 7 },
  'stress-recovery-time': { 'Within hours': 0, 'Within a day': 3, 'More than a day': 6 },
  'social-support': { 'Strongly agree': -2, 'Agree': 0, 'Disagree': 4, 'Strongly disagree': 7 },
  'perceived-health-change': { 'Much worse': 15, 'Worse': 8, 'Same': 0, 'Better': -2, 'Much better': -4 },
};


// 3. DEFINE THE CARDIAC CATEGORY MAP
const CARDIAC_CATEGORY_MAP: Record<string, string> = {
  'dx-cardiac-history': 'historyAndSymptoms',
  'symptoms-chest-pain': 'historyAndSymptoms',
  'symptoms-exertional-eases': 'historyAndSymptoms',
  'symptoms-dyspnea': 'historyAndSymptoms',
  'symptoms-functional-decline': 'historyAndSymptoms',
  'symptoms-orthopnea': 'historyAndSymptoms',
  'symptoms-palpitations': 'historyAndSymptoms',
  'symptoms-syncope': 'historyAndSymptoms',
  'symptoms-edema': 'historyAndSymptoms',
  'bp-home-average': 'bloodPressure',
  'bp-monitor-frequency': 'bloodPressure',
  'bp-orthostatic': 'bloodPressure',
  'bp-salt-sensitivity': 'bloodPressure',
  'labs-ldl-band': 'labMetrics',
  'labs-hdl-band': 'labMetrics',
  'labs-trig-band': 'labMetrics',
  'labs-a1c-band': 'labMetrics',
  'labs-general-lipids': 'labMetrics',
  'labs-general-glucose': 'labMetrics',
  'diet-sodium': 'lifestyle',
  'diet-processed-meat': 'lifestyle',
  'diet-fried-fast': 'lifestyle',
  'diet-plant-diversity': 'lifestyle',
  'diet-pattern': 'lifestyle',
  'sleep-apnea-risk': 'lifestyle',
  'sleep-apnea-treatment': 'lifestyle',
  'sleep-short-duration': 'lifestyle',
  'sleep-maintenance': 'lifestyle',
  'rhr-band': 'fitness',
  'hrr-self': 'fitness',
  'cardio-minutes': 'fitness',
  'sedentary-hours': 'fitness',
  'fitness-self-rated': 'fitness',
  'meds-adherence': 'medsAndCare',
  'care-engagement': 'medsAndCare',
  'family-premature-ascvd': 'familyAndEnvironment',
  'secondhand-smoke': 'familyAndEnvironment',
  'occupational-exposure': 'familyAndEnvironment',
  'wearable-use': 'familyAndEnvironment',
  'stress-control': 'psychosocial',
  'stress-recovery-time': 'psychosocial',
  'social-support': 'psychosocial',
  'perceived-health-change': 'psychosocial',
  // Items from Longevity Quiz
  'smoking': 'lifestyle',
  'alcoholConsumption': 'lifestyle',
  'bmi': 'biometrics',
  'familyHistory': 'familyAndEnvironment',
  'overallDiet': 'lifestyle',
};

// Helper function for descriptive text
function getRiskDescriptor(riskScore: number): string {
  if (riskScore < 20) return 'Low Risk';
  if (riskScore < 40) return 'Borderline Risk';
  if (riskScore < 60) return 'Moderate Risk';
  if (riskScore < 80) return 'High Risk';
  return 'Very High Risk';
}

function getCategoryDescriptor(penalty: number): string {
    if (penalty <= 0) return "Excellent";
    if (penalty <= 5) return "Good";
    if (penalty <= 10) return "Fair";
    if (penalty <= 20) return "Needs Improvement";
    return "High Priority";
}


// 4. THE MAIN SCORING FUNCTION
export function runCardiacScoring(
  cardiacInput: AssessmentInput,
  longevityData: LongevityAssessmentOutput
): CardiacAssessmentOutput {

  const cardiacAnswers = cardiacInput.submittedAnswers;
  const longevityAnswers = longevityData?.submittedAnswers || [];

  // Create a unified map of all answers for easy lookup
  const allAnswersMap: Record<string, any> = {};
  const allQuestionTextMap: Record<string, string> = {};
  
  // Create a map of just longevity answers to pass to helper functions
  const longevityAnswersMap: Record<string, any> = {};
  for (const ans of longevityAnswers) {
    if (ans) {
      longevityAnswersMap[ans.questionId] = ans.value;
    }
  }

  [...longevityAnswers, ...cardiacAnswers].forEach(ans => {
    if (ans) {
      allAnswersMap[ans.questionId] = ans.value;
      allQuestionTextMap[ans.questionId] = ans.questionText || ans.questionId;
    }
  });

  let totalPenalty = 0;
  const individualPenalties: Record<string, number> = {};

  const categoryScores: CardiacAssessmentOutput['categoryScores'] = {
    historyAndSymptoms: { score: 0, title: "Symptoms & History" },
    bloodPressure: { score: 0, title: "Blood Pressure" },
    labMetrics: { score: 0, title: "Key Lab Metrics" },
    lifestyle: { score: 0, title: "Lifestyle Factors" },
    fitness: { score: 0, title: "Fitness & Activity" },
    medsAndCare: { score: 0, title: "Medication & Care" },
    familyAndEnvironment: { score: 0, title: "Family & Environment" },
    psychosocial: { score: 0, title: "Psychosocial Health" },
    biometrics: { score: 0, title: "Core Biometrics" },
  };

  // --- Scoring Logic ---

  // A. Score Cardiac Quiz Answers
  cardiacAnswers.forEach(ans => {
    const qid = ans.questionId;
    const val = ans.value;
    
    if (CARDIAC_SCORING_MATRIX[qid]) {
      let penalty = 0;
      // Handle multi-select questions (like dx-cardiac-history)
      if (Array.isArray(val)) {
        val.forEach(item => {
          penalty += (CARDIAC_SCORING_MATRIX[qid] as any)?.[item] ?? 0;
        });
      } else {
        penalty = (CARDIAC_SCORING_MATRIX[qid] as any)?.[String(val)] ?? 0;
      }

      // Special logic for sleep apnea treatment
      if (qid === 'sleep-apnea-treatment' && allAnswersMap['sleep-apnea-risk'] !== 'Diagnosed sleep apnea') {
        penalty = 0; // No penalty if not diagnosed
      }

      individualPenalties[qid] = penalty;
      const category = CARDIAC_CATEGORY_MAP[qid];
      if (category) {
        categoryScores[category].score += penalty;
      }
      totalPenalty += penalty;
    }
  });

  // B. Score relevant Longevity Quiz answers
  // Smoking
  const smokingAns = allAnswersMap['smoking'];
  const smokingPenalty = ({ Daily: 20, Weekly: 10, Occasionally: 4, Never: 0 })[smokingAns as string] || 0;
  individualPenalties['smoking'] = smokingPenalty;
  categoryScores.lifestyle.score += smokingPenalty;
  totalPenalty += smokingPenalty;

  // Alcohol
  const alcoholAns = allAnswersMap['alcoholConsumption'];
  const alcoholPenalty = ({ "0": 0, "1-3": 0, "4-7": 2, "8-14": 5, "15+": 10 })[alcoholAns as string] || 0;
  individualPenalties['alcoholConsumption'] = alcoholPenalty;
  categoryScores.lifestyle.score += alcoholPenalty;
  totalPenalty += alcoholPenalty;
  
  // D. Score additional Longevity Quiz answers
  // Family History
  const familyHistoryAns = allAnswersMap['familyHistory'];
  const familyHistoryPenalty = ({ Yes: 5, No: -2, "I'm not sure": 0 })[familyHistoryAns as string] || 0;
  individualPenalties['familyHistory'] = familyHistoryPenalty;
  if (!categoryScores.familyAndEnvironment) categoryScores.familyAndEnvironment = { score: 0, title: "Family & Environment" };
  categoryScores.familyAndEnvironment.score += familyHistoryPenalty;
  totalPenalty += familyHistoryPenalty;

  // Overall Diet
  const overallDietAns = allAnswersMap['overallDiet'];
  const overallDietPenalty = ({ "Very healthy & balanced": -2, "Mostly healthy": -1, "Average / Inconsistent": 2, "Somewhat unhealthy": 4, "Very unhealthy": 6 })[overallDietAns as string] || 0;
  individualPenalties['overallDiet'] = overallDietPenalty;
  categoryScores.lifestyle.score += overallDietPenalty;
  totalPenalty += overallDietPenalty;


  // C. Score Biometrics and Demographics from Longevity Data
  let chronologicalAge: number | null = longevityData?.coreMetrics?.chronologicalAge ?? null;
  if (chronologicalAge == null) {
    chronologicalAge = calculateChronologicalAge(longevityAnswersMap["birthdate"], cardiacInput.createdAt);
  }

  let bmi = longevityData?.augmentedData?.bmi ?? 0;
  if (!bmi) {
    bmi = calculateBMI(longevityAnswersMap);
  }

  // BMI Penalty
  let bmiPenalty = 0;
  if (bmi > 0) {
    if (bmi < 18.5) bmiPenalty = 3;
    else if (bmi >= 25 && bmi < 30) bmiPenalty = 4;
    else if (bmi >= 30 && bmi < 35) bmiPenalty = 8;
    else if (bmi >= 35) bmiPenalty = 12;
  }
  individualPenalties['bmi'] = bmiPenalty;
  categoryScores.biometrics.score += bmiPenalty;
  totalPenalty += bmiPenalty;

  // Age Penalty (starts accelerating after 40)
  // If age is unknown, apply a neutral penalty of 5 points (equivalent to age 50)
  const agePenalty = chronologicalAge != null ? Math.max(0, (chronologicalAge - 40) * 0.5) : 5;
  individualPenalties['age'] = agePenalty;
  categoryScores.biometrics.score += agePenalty;
  totalPenalty += agePenalty;

  // --- Final Calculations ---
  
  // Normalize penalties in categories to be positive for descriptor
  for (const key in categoryScores) {
      categoryScores[key].descriptor = getCategoryDescriptor(categoryScores[key].score);
  }

  // Use a logistic function to map the raw penalty score to a 0-100% risk score
  const k = 0.04; // Controls the steepness of the curve
  const x0 = 55; // The penalty score that corresponds to a 50% risk
  const riskScore = 100 / (1 + Math.exp(-k * (totalPenalty - x0)));

  const finalRiskScore = Math.round(riskScore);
  const riskDescriptor = getRiskDescriptor(finalRiskScore);

  // Compile scored answers for detailed feedback
  const scoredAnswers: CardiacAssessmentOutput['scoredAnswers'] = [];
  Object.keys(individualPenalties).forEach(qid => {
    let answerText = String(allAnswersMap[qid] || 'N/A');
    if (qid === 'bmi') answerText = bmi.toFixed(1);
    if (qid === 'age') answerText = chronologicalAge != null ? String(Math.round(chronologicalAge)) : 'Unknown';
    
    scoredAnswers.push({
      question: allQuestionTextMap[qid] || qid,
      answer: answerText,
      penalty: individualPenalties[qid]
    });
  });

  // Identify top areas for improvement
  const topImprovementAreas = Object.entries(individualPenalties)
    .filter(([, penalty]) => penalty > 0) // Only show risk factors
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([qid, penalty]) => {
      let answerText = String(allAnswersMap[qid] || 'N/A');
      if (qid === 'bmi') answerText = bmi.toFixed(1);
      if (qid === 'age') answerText = chronologicalAge != null ? String(Math.round(chronologicalAge)) : 'Unknown';
      return {
        question: allQuestionTextMap[qid] || qid,
        answer: answerText,
        penalty: penalty
      };
    });

  return {
    userId: cardiacInput.userId ?? null,
    quizId: cardiacInput.quizId ?? null,
    submissionId: cardiacInput.submissionId ?? null,
    augmentedData: {
      bmi: Number(bmi.toFixed(1)),
      chronologicalAge: chronologicalAge != null ? Math.round(chronologicalAge * 10) / 10 : null,
      totalPenaltyScore: Math.round(totalPenalty),
    },
    coreMetrics: {
      cardiacRiskScore: finalRiskScore,
      riskDescriptor: riskDescriptor,
    },
    categoryScores,
    scoredAnswers,
    topImprovementAreas,
  };
}
