// src/lib/assessment.ts
export type SubmittedAnswer =
  | { questionId: string; questionText: string; value: string | number | null }
  | { questionId: string; questionText: string; value: { [k: string]: any } }
  | { questionId: string; questionText: string; value: any[] };

export type AssessmentInput = {
  userId?: string | null;
  quizId?: string | null;
  submissionId?: string | null; // optional; you can still generate one server-side if absent
  submittedAnswers: SubmittedAnswer[];
  createdAt?: string; // ISO
};

export type AssessmentOutput = {
  userId?: string | null;
  quizId?: string | null;
  submissionId?: string | null;
  coreMetrics: {
    chronologicalAge: number;
    biologicalAge: number;
    longevityFactor: number;
    biologicalAgeDifference: number;
    overallDescriptor: string;
  };
  augmentedData: { bmi: number; totalRawScore: number };
  categoryScores: Record<string, { score: number; title: string; descriptor?: string }>;
  scoredAnswers: { question: string; answer: string; score: number }[];
  topImprovementAreas: { question: string; answer: string; score: number }[];
  validation_result?: { is_valid: boolean; answered_count: number; total_questions: number };
};

const LONGEVITY_FACTOR_MULTIPLIER = 0.0015;
const STRESS_SLIDER_MAX_VALUE = 40.0;

const SCORING_MATRIX: Record<string, Record<string, number>> = {
  education: { "Doctoral or professional degree": -2, "Master's degree": -1, "Bachelor's degree": -1, "Associate's or vocational degree": 0, "Secondary school / High school": 1, "Primary school": 2 },
  familyLongevity: { Yes: -3, No: 1, "I'm not sure / They haven't reached that age yet": 0 },
  familyHistory: { Yes: 5, No: -2, "I'm not sure": 0 },
  healthCheckups: { Annually: -5, "Every 2-3 years": 0, "Only when sick": 5, "Rarely or never": 10 },
  oralHygiene: { "Every 6 months": -3, Annually: -1, "Within the last 2 years": 2, "More than 2 years ago or never": 5 },
  smoking: { Daily: 40, Weekly: 15, Occasionally: 5, Never: 0 },
  alcoholConsumption: { "0": 0, "1-3": -2, "4-7": 3, "8-14": 10, "15+": 20 },
  overallDiet: { "Very healthy & balanced": -8, "Mostly healthy": -4, "Average / Inconsistent": 5, "Somewhat unhealthy": 10, "Very unhealthy": 15 },
  plantVariety: { "<10": 8, "10-19": 3, "20-29": -2, "30-39": -5, "40+": -8, "20-40": -2 },
  processedFoodServings: { "0": -10, "1": 5, "2": 15, "3": 25, "4+": 35 },
  waterIntakeCups: { "<4": 4, "4-6": 1, "7-9": -1, "10+": -3 },
  mealWindowConsistency: { "Most days (5+ days/week)": -5, "Some days (2-4 days/week)": -2, "Occasionally (1 day/week)": 0, "Rarely or never": 3 },
  digestiveSymptoms: { "Rarely or never": -3, "A few times a month": 0, "A few times a week": 3, "Most days": 8 },
  exerciseFrequency: { "5+ days": -10, "3-4 days": -6, "1-2 days": 5, "0 days": 15 },
  exerciseIntensity: { "A mix of moderate & vigorous": -5, "Mostly vigorous": -3, "Mostly moderate": -1, "Mostly light": 3, "I don't exercise": 0 },
  strengthTraining: { "2+ times per week": -8, "Once per week": -3, "1-2 times per month": 3, "Rarely or never": 10 },
  sittingHours: { "< 4 hours": -5, "4-6 hours": -2, "7-9 hours": 5, "10+ hours": 10 },
  sitToStand: { "Yes, easily": -8, "Yes, with some effort": -2, "No, I need to use at least one hand/knee": 8, "I cannot do this": 15 },
  gripStrengthSelf: { Easy: -5, Manageable: -1, Difficult: 5, "I usually need help": 10 },
  sleepHours: { "7-8 hours": -10, "9+ hours": -2, "5-6 hours": 10, "< 5 hours": 20 },
  sleepQuality: { "Most mornings": -8, "About half the time": 3, Rarely: 8, Never: 15 },
  sleepConsistency: { "Very consistent (within a 30-min window)": -5, "Somewhat consistent (within a 60-min window)": -2, Inconsistent: 3, "Very irregular": 8 },
  nightAwakenings: { "Never or rarely": -5, "1-2 nights per week": 0, "3-4 nights per week": 5, "Almost every night": 10 },
  // stressLevels is handled specially (numeric)
  stressCoping: { "Very effective": -5, "Somewhat effective": -2, Neutral: 2, "Somewhat ineffective": 5, "Very ineffective": 10 },
  lifeOutlook: { Optimistic: -5, "Mostly optimistic": -3, "Neutral / Realistic": 0, "Mostly pessimistic": 3, Pessimistic: 8 },
  closeRelationships: { "0": 12, "1-2": 5, "3-5": -5, "6+": -8 },
  communityInvolvement: { "Weekly or more": -5, "A few times a month": -2, "A few times a year": 2, "Rarely or never": 5 },
  mindfulnessFrequency: { Daily: -5, "A few times per week": -3, Occasionally: 0, "Rarely or never": 3 },
  sunlightExposure: { "< 15 minutes": 1, "15-30 minutes": -3, "30-60 minutes": -2, "1-2 hours": 0, "2+ hours": 1 },
  natureTime: { Daily: -3, Weekly: -2, Monthly: 0, "Rarely or never": 2 },
  screenTimeNonWork: { "< 1 hour": -3, "1-2 hours": -1, "3-4 hours": 3, "5+ hours": 5 },
};

const CATEGORY_MAP: Record<string, string> = {
  education: "demographicsAndBody",
  familyLongevity: "healthAndPreventiveCare",
  familyHistory: "healthAndPreventiveCare",
  healthCheckups: "healthAndPreventiveCare",
  oralHygiene: "healthAndPreventiveCare",
  smoking: "healthAndPreventiveCare",
  alcoholConsumption: "healthAndPreventiveCare",
  overallDiet: "nutritionAndGutHealth",
  plantVariety: "nutritionAndGutHealth",
  processedFoodServings: "nutritionAndGutHealth",
  waterIntakeCups: "nutritionAndGutHealth",
  mealWindowConsistency: "nutritionAndGutHealth",
  digestiveSymptoms: "nutritionAndGutHealth",
  exerciseFrequency: "movementAndActivity",
  exerciseIntensity: "movementAndActivity",
  strengthTraining: "movementAndActivity",
  sittingHours: "movementAndActivity",
  sitToStand: "movementAndActivity",
  gripStrengthSelf: "movementAndActivity",
  sleepHours: "sleepAndRecovery",
  sleepQuality: "sleepAndRecovery",
  sleepConsistency: "sleepAndRecovery",
  nightAwakenings: "sleepAndRecovery",
  stressLevels: "mindsetAndSocial",
  stressCoping: "mindsetAndSocial",
  lifeOutlook: "mindsetAndSocial",
  closeRelationships: "mindsetAndSocial",
  communityInvolvement: "mindsetAndSocial",
  mindfulnessFrequency: "mindsetAndSocial",
  sunlightExposure: "environmentAndLifestyle",
  natureTime: "environmentAndLifestyle",
  screenTimeNonWork: "environmentAndLifestyle",
};

function isEmptyValue(v: any): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "number") return false;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") {
    const keys = Object.keys(v);
    if (!keys.length) return true;
    return keys.every((k) => {
      const val = v[k];
      return val == null || (typeof val === "string" && val.trim() === "");
    });
  }
  return false;
}

export function validateSubmission(input: AssessmentInput): { is_valid: boolean; answered_count: number; total_questions: number } {
  const answers = Array.isArray(input.submittedAnswers) ? input.submittedAnswers : [];
  const total = answers.length;
  let answered = 0;
  for (const a of answers) {
    if (!a || typeof a !== "object") continue;
    if (!isEmptyValue((a as any).value)) answered++;
  }
  const required_ratio = 2 / 3;
  const is_valid = total > 0 && answered / total >= required_ratio;
  return { is_valid, answered_count: answered, total_questions: total };
}

function parseDateOnly(iso?: string | null): Date {
  try {
    if (!iso) return new Date();
    const dateOnly = String(iso).split("T")[0];
    return new Date(dateOnly + "T00:00:00Z");
  } catch {
    return new Date();
  }
}

function calculateChronologicalAge(dob?: string | null, createdAt?: string | null): number {
  if (!dob) return 0;
  try {
    const today = parseDateOnly(createdAt || new Date().toISOString());
    const birth = parseDateOnly(dob);
    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    const m = today.getUTCMonth() - birth.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) age--;
    return age;
  } catch {
    return 0;
  }
}

function calculateBMI(answersMap: Record<string, any>): number {
  try {
    const height = answersMap["height"];
    const weight = answersMap["weight"];
    if (!height || typeof height !== "object") return 0;
    const ft = parseInt(String(height.ft ?? "0"), 10);
    const inches = parseInt(String(height.in ?? "0"), 10);
    const totalInches = ft * 12 + inches;
    if (totalInches <= 0) return 0;
    const weightLbs = parseFloat(String(weight ?? "0"));
    if (weightLbs <= 0) return 0;
    const meters = totalInches * 0.0254;
    const kg = weightLbs * 0.453592;
    return kg / (meters * meters);
  } catch {
    return 0;
  }
}

function bmiScore(bmi: number): number {
  if (bmi <= 0) return 5;
  if (bmi < 18.5) return 5;
  if (bmi <= 22.9) return -10;
  if (bmi <= 24.9) return -5;
  if (bmi <= 29.9) return 10;
  if (bmi <= 34.9) return 20;
  return 30; // >= 35
}

function qualitativeDescriptor(score: number): string {
  if (score <= -5) return "Excellent";
  if (score <= 0) return "Good";
  if (score <= 5) return "Average";
  if (score <= 15) return "Needs Improvement";
  return "High Priority";
}

function finalDescriptor(diff: number): string {
  if (diff < -8) return "Exceptional";
  if (diff < -4) return "Excellent";
  if (diff < 0) return "Good";
  if (diff <= 4) return "Average";
  if (diff <= 8) return "Needs Improvement";
  return "High Priority";
}

export function runScoring(input: AssessmentInput): AssessmentOutput {
  const rawAnswers = Array.isArray(input.submittedAnswers) ? input.submittedAnswers : [];
  const answers = rawAnswers.map((a) => ({
    questionId: a.questionId,
    questionText: a.questionText,
    value: a.value,
  }));

  const answersMap: Record<string, any> = {};
  const answersById: Record<string, any> = {};
  const questionTextMap: Record<string, string> = {};
  for (const it of answers) {
    if (!it) continue;
    answersMap[it.questionId] = it.value;
    answersById[it.questionId] = it;
    questionTextMap[it.questionId] = (it.questionText as string) || it.questionId;
  }

  const chronologicalAge = calculateChronologicalAge(answersMap["birthdate"], input.createdAt);
  const bmi = calculateBMI(answersMap);
  const bmi_sc = bmiScore(bmi);

  let totalRaw = bmi_sc;
  const individualScores: Record<string, number> = { bmi: bmi_sc };

  const categoryScores: AssessmentOutput["categoryScores"] = {
    demographicsAndBody: { score: bmi_sc, title: "Body Composition" },
    healthAndPreventiveCare: { score: 0, title: "Health & Preventive Care" },
    nutritionAndGutHealth: { score: 0, title: "Nutrition & Gut Health" },
    movementAndActivity: { score: 0, title: "Movement & Activity" },
    sleepAndRecovery: { score: 0, title: "Sleep & Recovery" },
    mindsetAndSocial: { score: 0, title: "Mindset & Social Well-being" },
    environmentAndLifestyle: { score: 0, title: "Environment & Lifestyle" },
  };

  for (const it of answers) {
    const qid = it.questionId;
    const val = it.value;
    if (qid === "stressLevels") {
      let score = 0;
      try {
        const numeric = Math.max(1, Math.min(5, Math.ceil(Number(val || 0) / STRESS_SLIDER_MAX_VALUE)));
        score = (SCORING_MATRIX[qid] as any)?.[String(numeric)] ?? 0;
      } catch {
        score = 0;
      }
      individualScores[qid] = score;
      const cat = CATEGORY_MAP[qid];
      if (cat) {
        categoryScores[cat].score += score;
        totalRaw += score;
      }
    } else if (SCORING_MATRIX[qid]) {
      const score = (SCORING_MATRIX[qid] as any)?.[String(val)] ?? 0;
      individualScores[qid] = score;
      const cat = CATEGORY_MAP[qid];
      if (cat) {
        categoryScores[cat].score += score;
        totalRaw += score;
      }
    }
  }

  for (const key of Object.keys(categoryScores)) {
    categoryScores[key].descriptor = qualitativeDescriptor(categoryScores[key].score);
  }

  const longevityFactor = 1 + totalRaw * LONGEVITY_FACTOR_MULTIPLIER;
  const biologicalAge = chronologicalAge * longevityFactor;
  const diff = biologicalAge - chronologicalAge;

  const scoredAnswers: { question: string; answer: string; score: number }[] = [];
  let bmiInserted = false;
  for (const it of answers) {
    const qid = it.questionId;
    const val = it.value as any;
    if (qid === "height" && !bmiInserted) {
      scoredAnswers.push({ question: "Calculated Body Mass Index", answer: `${bmi.toFixed(1)} (Calculated)`, score: bmi_sc });
      bmiInserted = true;
    }
    let answerStr = "";
    if (qid === "height" && val && typeof val === "object") answerStr = `${val.ft ?? "0"} ft ${val.in ?? "0"} in`;
    else if (qid === "weight") answerStr = `${val} lbs`;
    else answerStr = String(val);
    scoredAnswers.push({ question: questionTextMap[qid], answer: answerStr, score: individualScores[qid] ?? 0 });
  }

  const unhealthy = Object.entries(individualScores)
    .filter(([, sc]) => sc > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topImprovementAreas = unhealthy.map(([qid, sc]) => {
    if (qid === "bmi") {
      return { question: "Calculated Body Mass Index", answer: `${bmi.toFixed(1)}`, score: sc };
    }
    const orig = answersById[qid] || {};
    const rawVal = orig.value;
    let aText = "";
    if (qid === "height" && rawVal && typeof rawVal === "object") aText = `${rawVal.ft ?? "0"} ft ${rawVal.in ?? "0"} in`;
    else if (qid === "weight") aText = `${rawVal} lbs`;
    else aText = String(rawVal ?? "");
    return { question: questionTextMap[qid], answer: aText, score: sc };
  });

  return {
    userId: input.userId ?? null,
    quizId: input.quizId ?? null,
    submissionId: input.submissionId ?? null,
    coreMetrics: {
      chronologicalAge: Math.round(chronologicalAge * 10) / 10,
      biologicalAge: Math.round(biologicalAge * 10) / 10,
      longevityFactor: Math.round(longevityFactor * 1000) / 1000,
      biologicalAgeDifference: Math.round(diff * 10) / 10,
      overallDescriptor: finalDescriptor(diff),
    },
    augmentedData: { bmi: Number(bmi.toFixed(1)), totalRawScore: totalRaw },
    categoryScores,
    scoredAnswers,
    topImprovementAreas,
  };
}