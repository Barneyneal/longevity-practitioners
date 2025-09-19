export type QuestionType = {
  id: string;
  type:
  | 'multiple-choice'
  | 'text'
  | 'section-title'
  | 'title'
  | 'privacy'
  | 'date'
  | 'multi-choice'
  | 'height'
  | 'slider'
  | 'name'
  | 'email';
  text: string;
  subtext?: string;
  citation?: string;
  options?: any[];
  condition?: {
  questionId: string;
  value: any;
  };
  min?: number;
  max?: number;
  sliderLabels?: string[];
  };
  
  export const questions: QuestionType[] = 
  [
  /* ───────────────────── 1. CARDIAC HISTORY & SYMPTOMS ───────────────────── */
  
    {
     "id": "cardiac-symptoms-title",
      "type": "section-title",
      "text": "Are You Missing the Signs? The Threat of the 'Silent' Heart Attack.",
      "subtext": "About 1 in 5 heart attacks are 'silent'. The damage is done, but the person is not aware of it, often mistaking symptoms for less serious issues like indigestion or muscle pain.",
      "citation": "The Lancet, 2016; TCTMD, 2015"
    },
    {
      "id": "dx-cardiac-history",
      "type": "multi-choice",
      "text": "Have you ever been told you have any of the following?",
      "subtext": "Select all that apply.",
      "options": [
        "High blood pressure",
        "High cholesterol",
        "Coronary artery disease",
        "Prior heart attack",
        "Angina (chest pain from heart)",
        "Atrial fibrillation",
        "Heart failure",
        "Stroke or TIA (mini-stroke)",
        "Chronic kidney disease",
        "Diabetes or prediabetes",
        "None of the above"
      ]
    },
    {
      "id": "symptoms-chest-pain",
      "type": "multi-choice",
      "text": "In the past month, have you had chest discomfort with activity or stress?",
      "options": ["No", "Once or twice", "Weekly", "Most days"]
    },
    {
      "id": "symptoms-chest-pain-context",
      "type": "multi-choice",
      "text": "When does chest discomfort typically occur?",
      "options": ["At rest", "With exertion", "With emotional stress", "After meals"],
      "condition": { "questionId": "symptoms-chest-pain", "value": ["Once or twice", "Weekly", "Most days"] }
    },
    {
      "id": "symptoms-exertional-eases",
      "type": "multi-choice",
      "text": "In the past month, have you had chest tightness/pressure with exertion that eases with rest?",
      "options": ["No", "Once or twice", "Weekly", "Most days"]
    },
    {
      "id": "symptoms-dyspnea",
      "type": "multi-choice",
      "text": "Do you get short of breath climbing one flight of stairs at a normal pace?",
      "options": ["Never", "Sometimes", "Often", "Always"]
    },
    {
      "id": "symptoms-functional-decline",
      "type": "multi-choice",
      "text": "Have you noticed a decline in your walking speed or distance over the last 6–12 months?",
      "options": ["No", "Slight decline", "Clear decline"]
    },
    {
      "id": "symptoms-orthopnea",
      "type": "multi-choice",
      "text": "Do you get short of breath when lying flat that improves when you sit up?",
      "options": ["No", "Sometimes", "Often"]
    },
    {
      "id": "symptoms-palpitations",
      "type": "multi-choice",
      "text": "In the past month, how often have you felt heart palpitations (racing, fluttering, skipping)?",
      "options": ["Never", "Once or twice", "Weekly", "Most days"]
    },
    {
      "id": "symptoms-syncope",
      "type": "multi-choice",
      "text": "In the past 12 months, have you had sudden dizziness or fainting, not due to dehydration or heat?",
      "options": ["No", "Yes, once", "Yes, more than once"]
    },
    {
      "id": "symptoms-edema",
      "type": "multi-choice",
      "text": "Have you noticed ankle or leg swelling by the end of the day?",
      "options": ["Never", "Occasionally", "Most days"]
  },
  
  /* ───────────────────── 2. BLOOD PRESSURE & MONITORING ───────────────────── */
  {
      "id": "bp-title",
      "type": "section-title",
      "text": "The 'Silent Killer': A Small Drop in BP Makes a Huge Difference.",
      "subtext": "Just a 10 mmHg reduction in systolic blood pressure can lower your risk of major cardiovascular events by 20%, stroke by 27%, and heart failure by 28%.",
      "citation": "The Lancet, 2016; TCTMD, 2015"
    },
    {
      "id": "bp-home-average",
      "type": "multi-choice",
      "text": "Do you know your typical blood pressure range? (Systolic/Diastolic mmHg)",
      "options": [
        "I don’t know",
        "< 110 / < 70",
        "110-119 / 70-79",
        "120-129 / 70-79",
        "130-139 / 80-89",
        "140-159 / 90-99",
        "≥ 160 / ≥ 100"
      ]
    },
    {
      "id": "bp-home-device",
      "type": "multi-choice",
      "text": "Do you own a home blood pressure monitor?",
      "options": ["Yes", "No"]
    },
    {
      "id": "bp-monitor-frequency",
      "type": "multi-choice",
      "text": "How often do you check blood pressure at home?",
      "options": ["Daily", "Few times/week", "Weekly", "Rarely", "Never"],
      "condition": { "questionId": "bp-home-device", "value": "Yes" }
    },
    {
      "id": "bp-measure-time",
      "type": "multi-choice",
      "text": "When do you typically measure your home BP?",
      "options": ["Morning", "Evening", "Both", "Not measuring at home"],
      "condition": { "questionId": "bp-home-device", "value": "Yes" }
    },
    {
      "id": "bp-orthostatic",
      "type": "multi-choice",
      "text": "Do you feel dizzy or lightheaded when standing up quickly?",
      "options": ["Never", "Sometimes", "Often"]
    },
    {
      "id": "bp-salt-sensitivity",
      "type": "multi-choice",
      "text": "After salty meals, do you notice headaches, puffiness, or higher BP readings (if you track)?",
      "options": ["No / not sure", "Occasionally", "Often"]
    },
  
    /* ───────────────────── 3. LIPIDS, GLUCOSE & LAB AWARENESS (CONDITIONAL) ───────────────────── */
    {
      "id": "labs-title",
      "type": "section-title",
      "text": "What Your Blood Knows: The Hidden Risks in Your Lab Results",
      "subtext": "An estimated 97.6 million American adults - more than 1 in 3 - have prediabetes, and the vast majority don't know it, making lab awareness a critical tool for prevention.",
      "citation": "CDC, 2024; American Diabetes Association, 2023"
    },
    {
      "id": "labs-availability",
      "type": "multi-choice",
      "text": "Have you had blood tests for cholesterol or blood sugar in the last 12 months?",
      "options": ["Yes, and I have results", "Yes, but I don’t recall results", "No / Not sure"]
    },
    {
      "id": "labs-lipid-awareness",
      "type": "multi-choice",
      "text": "When were your lipids (cholesterol) last checked?",
      "options": ["Within 6 months", "6-12 months ago", "1-3 years ago", "3+ years ago", "Never / Not sure"],
      "condition": { "questionId": "labs-availability", "value": ["Yes, and I have results", "Yes, but I don’t recall results"] }
    },
  
    /* Numeric bands only if user has results */
    {
      "id": "labs-ldl-band",
      "type": "multi-choice",
      "text": "If known, what is your most recent LDL-C (bad cholesterol) range?",
      "options": ["I don’t know", "< 70 mg/dL", "70-99 mg/dL", "100-129 mg/dL", "130-159 mg/dL", "160-189 mg/dL", "≥ 190 mg/dL"],
      "condition": { "questionId": "labs-availability", "value": "Yes, and I have results" }
    },
    {
      "id": "labs-hdl-band",
      "type": "multi-choice",
      "text": "If known, what is your HDL-C (good cholesterol) range?",
      "options": ["I don’t know", "< 40 mg/dL", "40-59 mg/dL", "≥ 60 mg/dL"],
      "condition": { "questionId": "labs-availability", "value": "Yes, and I have results" }
    },
    {
      "id": "labs-trig-band",
      "type": "multi-choice",
      "text": "If known, what are your triglycerides?",
      "options": ["I don’t know", "< 100 mg/dL", "100-149 mg/dL", "150-199 mg/dL", "200-499 mg/dL", "≥ 500 mg/dL"],
      "condition": { "questionId": "labs-availability", "value": "Yes, and I have results" }
    },
    {
      "id": "labs-a1c-band",
      "type": "multi-choice",
      "text": "If known, what is your most recent A1c (3-month glucose average)?",
      "options": ["I don’t know", "< 5.7%", "5.7-6.4% (prediabetes)", "≥ 6.5% (diabetes)"],
      "condition": { "questionId": "labs-availability", "value": "Yes, and I have results" }
    },
    {
      "id": "labs-fpg-band",
      "type": "multi-choice",
      "text": "If known, what is your fasting glucose?",
      "options": ["I don’t know", "< 100 mg/dL", "100-125 mg/dL", "≥ 126 mg/dL"],
      "condition": { "questionId": "labs-availability", "value": "Yes, and I have results" }
    },
  
    /* Simple, non-numeric alternatives if no labs remembered/available */
    {
      "id": "labs-general-lipids",
      "type": "multi-choice",
      "text": "Have you ever been told your cholesterol is high?",
      "options": ["Yes", "No", "Not sure"],
      "condition": { "questionId": "labs-availability", "value": ["Yes, but I don’t recall results", "No / Not sure"] }
    },
    {
      "id": "labs-general-glucose",
      "type": "multi-choice",
      "text": "Have you ever been told you have prediabetes or diabetes?",
      "options": ["No", "Prediabetes", "Diabetes", "Not sure"],
      "condition": { "questionId": "labs-availability", "value": ["Yes, but I don’t recall results", "No / Not sure"] }
  },
  
  /* ───────────────────── 4. LIFESTYLE DETAILS (CARDIO-RELEVANT) ───────────────────── */
  {
      "id": "lifestyle-title",
      "type": "section-title",
      "text": "Your Plate and Your Pillow: The Daily Habits That Define Heart Health",
      "subtext": "Eating 30 or more different types of plant foods per week is linked to a more diverse and healthy gut microbiome, which plays a crucial role in supporting cardiovascular wellness.",
      "citation": "American Gut Project"
    },
    {
      "id": "diet-sodium",
      "type": "multi-choice",
      "text": "How often do you add salt at the table or choose obviously salty foods (e.g., chips, cured meats, takeout)?",
      "options": ["Rarely", "1-3 times per week", "4-6 times per week", "Daily"]
    },
    {
      "id": "diet-processed-meat",
      "type": "multi-choice",
      "text": "How many meals per week include processed meats (bacon, sausage, deli, ham)?",
      "options": ["0", "1-2", "3-4", "5+"]
    },
    {
      "id": "diet-fried-fast",
      "type": "multi-choice",
      "text": "How often do you eat deep-fried or fast foods?",
      "options": ["Rarely", "1-3 times per week", "4-6 times per week", "Daily"]
    },
    {
      "id": "diet-plant-diversity",
      "type": "multi-choice",
      "text": "How many different plant foods did you eat last week? (Count fruits, vegetables, legumes, whole grains, nuts, seeds.)",
      "options": ["< 10", "10-20", "21-30", "> 30"]
    },
    {
      "id": "diet-added-sugar",
      "type": "multi-choice",
      "text": "How often do you consume sugary drinks or desserts?",
      "options": ["Rarely", "1-3 times per week", "4-6 times per week", "Daily or more"]
    },
    {
      "id": "diet-pattern",
      "type": "multi-choice",
      "text": "Do you generally follow a heart-healthy pattern (e.g., DASH or Mediterranean)?",
      "options": ["Yes, consistently", "Sometimes", "Not really", "Not sure"]
    },
    {
      "id": "sleep-apnea-risk",
      "type": "multi-choice",
      "text": "Do you snore loudly, stop breathing during sleep (observed), or feel very sleepy during the day?",
      "options": ["No", "Possible (one or more apply)", "Diagnosed sleep apnea"]
    },
    {
      "id": "sleep-apnea-treatment",
      "type": "multi-choice",
      "text": "If diagnosed with sleep apnea, are you using CPAP or another therapy regularly?",
      "options": ["Not diagnosed", "Yes, consistent use", "Inconsistent use", "Not using"],
      "condition": { "questionId": "sleep-apnea-risk", "value": "Diagnosed sleep apnea" }
    },
    {
      "id": "sleep-short-duration",
      "type": "multi-choice",
      "text": "On how many nights per week do you sleep less than 7 hours?",
      "options": ["0–1", "2–3", "4–5", "6–7"]
    },
    {
      "id": "sleep-maintenance",
      "type": "multi-choice",
      "text": "How many nights per week do you wake and have trouble going back to sleep?",
      "options": ["0–1", "2–3", "4–5", "6–7"]
  },
  
  /* ───────────────────── 5. ACTIVITY & CARDIORESPIRATORY FITNESS ───────────────────── */
  {
      "id": "fitness-title",
      "type": "section-title",
      "text": "Fitness as a Vital Sign: More Predictive of Longevity Than Smoking",
      "subtext": "Low cardiorespiratory fitness is a greater risk factor for death than high blood pressure or high cholesterol, with an impact on longevity second only to smoking.",
      "citation": "European Society of Cardiology, 2016"
    },
    {
      "id": "rhr-band",
      "type": "multi-choice",
      "text": "If you know your resting heart rate (beats per minute), which range best fits?",
      "options": ["I don’t know", "< 55", "55-64", "65-74", "75-84", "≥ 85"]
    },
    {
      "id": "hrr-self",
      "type": "multi-choice",
      "text": "After moderate exercise, how quickly does your heart rate return toward normal within 1 minute?",
      "options": ["Unsure", "≥ 25 bpm drop", "15-24 bpm drop", "5-14 bpm drop", "< 5 bpm drop"]
    },
    {
      "id": "cardio-minutes",
      "type": "multi-choice",
      "text": "How many minutes of moderate-to-vigorous cardio do you get per week?",
      "options": ["< 60 min", "1-2 hours", "3-4 hours", "≥ 5 hours"]
    },
    {
      "id": "sedentary-hours",
      "type": "multi-choice",
      "text": "On a typical day, how many total hours do you spend sitting (not counting sleep)?",
      "options": ["< 4 hours", "4-7 hours", "8-10 hours", "> 10 hours"]
    },
    {
      "id": "fitness-self-rated",
      "type": "multi-choice",
      "text": "How is your fitness compared to peers of the same age?",
      "options": ["Below average", "Average", "Above average"]
  },
  
  /* ───────────────────── 6. MEDICATIONS & SUPPLEMENTS ───────────────────── */
  {
      "id": "meds-title",
      "type": "section-title",
      "text": "The Lifesaving Power of Consistency in Your Health Regimen",
      "subtext": "Non-adherence to cardiovascular medications is a major risk factor for poor outcomes; patients who don't fill their prescriptions after a heart attack have an 80% increased odds of death within the first year.",
      "citation": "Circulation, 2010; European Heart Journal, 2014"
    },
    {
      "id": "meds-current",
      "type": "multi-choice",
      "text": "Are you currently taking any of the following?",
      "subtext": "Select all that apply.",
      "options": [
        "Blood pressure medication",
        "Statin or other cholesterol medication",
        "Diabetes medication (e.g., metformin)",
        "GLP-1 agonist (e.g., semaglutide)",
        "Anticoagulant / antiplatelet (e.g., warfarin, DOAC, aspirin)",
        "Thyroid medication",
        "None of the above",
        "Prefer not to say"
      ]
    },
    {
      "id": "meds-adherence",
      "type": "multi-choice",
      "text": "How often do you miss medication doses in a typical week?",
      "options": ["Never", "Rarely", "Sometimes", "Often", "Not on prescriptions"]
    },
    {
      "id": "care-engagement",
      "type": "multi-choice",
      "text": "When your clinician gives health advice, how often do you act on it within a week?",
      "options": ["Always", "Most of the time", "Some of the time", "Not at all"]
    },
  
    /* ───────────────────── 7. FAMILY, ENVIRONMENT & DIGITAL ───────────────────── */
    {
      "id": "family-env-title",
      "type": "section-title",
      "text": "Beyond Your Control? How Genes and Environment Shape Your Heart",
      "subtext": "Your environment has a direct impact: living near a major roadway is associated with an increased risk of adverse cardiovascular outcomes and all-cause mortality, especially for those with existing heart conditions.",
      "citation": "American Heart Association, 2018; EPA, 2024"
    },
    {
      "id": "family-premature-ascvd",
      "type": "multi-choice",
      "text": "Any first-degree relative with premature cardiovascular disease (men < 55, women < 65)?",
      "options": ["Yes", "No", "Not sure"]
    },
    {
      "id": "secondhand-smoke",
      "type": "multi-choice",
      "text": "Are you regularly exposed to secondhand smoke?",
      "options": ["No", "Occasionally", "Frequently"]
    },
    {
      "id": "air-quality-perception",
      "type": "multi-choice",
      "text": "How would you rate the air quality where you live or work?",
      "options": ["Good", "Mixed", "Poor", "Not sure"]
    },
    {
      "id": "occupational-exposure",
      "type": "multi-choice",
      "text": "Are you regularly exposed at home or work to dust, fumes, or industrial chemicals?",
      "options": ["No", "Occasionally", "Frequently"]
    },

    /* ───────────────────── 8. DIGITAL MONITORING & TRENDS ───────────────────── */
    {
      "id": "digital-title",
      "type": "section-title",
      "text": "The Pulse on Your Wrist: Using Tech to Track Your Ticker",
      "subtext": "Modern wearables can detect conditions like atrial fibrillation with high sensitivity and specificity, and in large-scale studies, have demonstrated a positive predictive value of 84% for identifying previously undiagnosed cases.",
      "citation": "Apple Heart Study; PMC, 2022"
    },
    {
      "id": "wearable-use",
      "type": "multi-choice",
      "text": "Do you use a wearable to track heart rate or rhythm?",
      "options": ["No", "Yes — no alerts", "Yes — irregular rhythm alert", "Yes — high resting HR alert"]
    },
    {
      "id": "wearable-activity-trends",
      "type": "multi-choice",
      "text": "Do you review weekly steps or active minutes and adjust your activity?",
      "options": ["Yes, most weeks", "Sometimes", "Rarely/never"]
    },
  
    /* ───────────────────── 9. PSYCHOSOCIAL & PERCEIVED HEALTH ───────────────────── */
    {
      "id": "psychosocial-title",
      "type": "section-title",
      "text": "The Mind-Heart Connection: Why Stress and Social Ties Matter",
      "subtext": "The health risks of loneliness are profound, associated with a 29% increased risk of heart attack and a 32% greater risk of stroke - a mortality impact similar to smoking up to 15 cigarettes a day.",
      "citation": "U.S. Surgeon General, 2023; American Heart Association, 2022"
    },
    {
      "id": "stress-control",
      "type": "multi-choice",
      "text": "Past 2 weeks: how often did you feel unable to control important things in your life?",
      "options": ["Never", "Some days", "Most days", "Nearly every day"]
    },
    {
      "id": "stress-recovery-time",
      "type": "multi-choice",
      "text": "When stressed, how quickly do you feel back to your usual baseline?",
      "options": ["Within hours", "Within a day", "More than a day"]
    },
    {
      "id": "social-support",
      "type": "multi-choice",
      "text": "I have people I can rely on for practical help and emotional support.",
      "options": ["Strongly agree", "Agree", "Disagree", "Strongly disagree"]
    },
    {
      "id": "perceived-health-change",
      "type": "multi-choice",
      "text": "Compared to 12 months ago, your overall health is…",
      "options": ["Much worse", "Worse", "Same", "Better", "Much better"]
    },
  ];