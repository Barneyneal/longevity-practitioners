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
    | 'email'
    | 'password';
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

export const questions: QuestionType[] = [
  
  /* ─────────────────────────────── 1. CORE DEMOGRAPHICS ─────────────────────────────── */
    {
    id: 'birthdate',
    text: 'What is your date of birth?',
    type: 'date',
    subtext: 'This helps us calculate your chronological age for comparison.',
  },
  {
    id: 'gender',
    text: 'What is your gender?',
    type: 'multi-choice',
    options: ['Male', 'Female', 'Non-binary / Other', 'Prefer not to say'],
  },
  {
    id: 'ethnicity',
    text: 'Which ethnic group best describes you?',
    type: 'multi-choice',
    options: [
      'African / African-American',
      'Asian (East / Southeast)',
      'Asian (South)',
      'Caucasian / White',
      'Hispanic or Latino',
      'Middle Eastern / North African',
      'Native American / First Nations',
      'Pacific Islander',
      'Mixed',
      'Other',
      'Prefer not to say',
    ],
  },
  {
    id: 'education',
    text: 'What is the highest level of education you have completed?',
    type: 'multi-choice',
    options: [
      'Primary school',
      'Secondary school / High school',
      "Associate's or vocational degree",
      "Bachelor's degree",
      "Master's degree",
      'Doctoral or professional degree',
    ],
  },
  {
    id: 'height',
    text: 'What is your height?',
    type: 'height',
    subtext: 'Provide in feet and inches or cm for accuracy.',
  },
  {
    id: 'weight',
    text: 'What is your current body-weight?',
    type: 'slider',
    min: 70,
    max: 400,
    subtext: 'lbs',
  },

  /* ────────────────── 2. HEALTH & PREVENTIVE CARE ──────────────────── */
  {
    id: 'health-title',
    type: 'section-title',
    text: 'Biological Aging vs. Chronological Aging a new perspective on what it means to be old.',
    subtext: 'Longevity medicine represents an emerging healthcare discipline focused on early detection and personalized preventive approaches, powered by deep biomarkers of aging that could revolutionize how we approach health throughout the lifespan.',
    citation: 'Bischof, Evelyne et al., The Lancet Healthy Longevity, 2021',
  },
  {
    id: 'familyLongevity',
    text: 'Have any of your direct parents or grandparents lived beyond the age of 90?',
    type: 'multi-choice',
    options: [
      'Yes',
      'No',
      "I'm not sure",
    ],
  },
  {
    id: 'familyHistory',
    text: 'Do you have a family history of any major chronic illnesses (e.g., heart disease, cancer, dementia)?',
    type: 'multi-choice',
    options: ['Yes', 'No', "I'm not sure"],
  },
  {
    id: 'familyHistoryDetails',
    text: 'If yes, please specify the conditions.',
    type: 'text',
    condition: {
      questionId: 'familyHistory',
      value: 'Yes',
    },
  },
  {
    id: 'healthCheckups',
    text: 'How frequently do you undergo general health check-ups with a doctor?',
    type: 'multi-choice',
    options: [
      'Annually',
      'Every 2-3 years',
      'Only when sick',
      'Rarely or never',
    ],
  },
  {
    id: 'oralHygiene',
    text: 'How often do you visit a dentist for a check-up and cleaning?',
    type: 'multi-choice',
    options: [
      'Every 6 months',
      'Annually',
      'Within the last 2 years',
      'More than 2 years ago or never',
    ],
  },
  {
    id: 'smoking',
    text: 'Do you currently smoke or use nicotine products (including vaping)?',
    type: 'multi-choice',
    options: ['Daily', 'Weekly', 'Occasionally', 'Never'],
  },
  {
    id: 'alcoholConsumption',
    text: 'On average, how many alcoholic drinks do you consume per week?',
    type: 'multi-choice',
    options: ['0', '1-3', '4-7', '8-14', '15+'],
  },

  /* ────────────────── 3. NUTRITION & GUT HEALTH ──────────────────── */
  {
    id: 'nutrition-title',
    type: 'section-title',
    text: 'Your diet directly impacts inflammation, your microbiome, and cellular aging.',
    subtext:
      'Higher fiber intake from fruits and vegetables, combined with reduced processed foods, protects the aging gut and promotes beneficial metabolites, shown to reduce inflammation and extend life.',
    citation: 'Wilmanski, Tomasz et al., Nature, 2021'
  },
  {
    id: 'overallDiet',
    text: 'How would you describe the overall quality of your diet?',
    type: 'multi-choice',
    options: [
      'Very healthy & balanced',
      'Mostly healthy',
      'Average / Inconsistent',
      'Somewhat unhealthy',
      'Very unhealthy',
    ],
  },
  {
    id: 'plantVariety',
    text: 'How many different types of plant foods (fruits, vegetables, grains, legumes, nuts, seeds) do you eat in a typical week?',
    type: 'multi-choice',
    options: ['<10', '10-19', '20-40', '40+'],
  },
  {
    id: 'processedFoodServings',
    text: 'How many servings of ultra-processed foods (e.g., fast food, packaged snacks) do you consume per day?',
    type: 'multi-choice',
    options: ['0', '1', '2', '3', '4+'],
  },
  {
    id: 'waterIntakeCups',
    text: 'How many cups (8 oz / 250 ml) of plain water do you drink per day, excluding other beverages?',
    type: 'multi-choice',
    options: ['<4', '4-6', '7-9', '10+'],
  },
  {
    id: 'mealWindowConsistency',
    text: 'How often do you consume all your daily calories within an 8-10 hour window?',
    type: 'multi-choice',
    options: [
      'Most days (5+ days/week)',
      'Some days (2-4 days/week)',
      'Occasionally (1 day/week)',
      'Rarely or never',
    ],
  },
  {
    id: 'digestiveSymptoms',
    text: 'How often do you experience digestive discomfort like bloating, gas, or irregularity?',
    type: 'multi-choice',
    options: [
      'Rarely or never',
      'A few times a month',
      'A few times a week',
      'Most days',
    ],
  },

  /* ────────────────── 4. MOVEMENT & PHYSICAL ACTIVITY ──────────────────── */
  {
    id: 'activity-title',
    type: 'section-title',
    text: 'Consistent activity is crucial for metabolic health, muscle maintenance, and brain function.',
    subtext:
      'Physical activity not only strengthens heart and lung function but also protects cellular structures like telomeres, potentially slowing biological aging and adding years of healthy living.',
    citation: 'Shmerling, MD et al., Harvard Health, 2024',
  },
  {
    id: 'exerciseFrequency',
    text: 'How many days per week do you engage in at least 30 minutes of moderate-to-vigorous exercise?',
    type: 'multi-choice',
    options: ['0 days', '1-2 days', '3-4 days', '5+ days'],
  },
  {
    id: 'exerciseIntensity',
    text: 'What best describes your typical exercise?',
    type: 'multi-choice',
    options: [
      'Mostly light (e.g., walking)',
      'Mostly moderate (e.g., brisk walk, cycling)',
      'Mostly vigorous (e.g., running, HIIT)',
      'A mix of moderate & vigorous',
      "I don't exercise",
    ],
  },
  {
    id: 'strengthTraining',
    text: 'How often do you perform strength or resistance training (e.g., lifting weights, bodyweight exercises)?',
    type: 'multi-choice',
    options: [
      '2+ times per week',
      'Once per week',
      '1-2 times per month',
      'Rarely or never',
    ],
  },
  {
    id: 'sittingHours',
    text: 'Excluding sleep, how many hours do you spend sitting on an average day?',
    type: 'multi-choice',
    options: ['< 4 hours', '4-6 hours', '7-9 hours', '10+ hours'],
  },
  {
    id: 'sitToStand',
    text: 'Can you rise from sitting on the floor to standing without using your hands, arms, or knees for support?',
    type: 'multi-choice',
    options: [
      'Yes, easily',
      'Yes, with some effort',
      'No, I need to use at least one hand/knee',
      'I cannot do this',
    ],
  },
  {
    id: 'gripStrengthSelf',
    text: 'How would you rate your ability to open a new, tightly sealed jar?',
    type: 'multi-choice',
    options: ['Easy', 'Manageable', 'Difficult', 'I usually need help'],
  },

  /* ─────────────────────────────── 5. SLEEP & RECOVERY ────────────────────────────── */
  {
    id: 'sleep-title',
    type: 'section-title',
    text: 'Quality sleep is fundamental for cellular repair, hormone regulation, and cognitive health.',
    subtext:
      'Regular good sleep, defined as at least seven hours without insomnia, reduces mortality risk by 18% and is one of eight key habits that could add over 20 years to life.',
    citation: 'Welsh, Sleep Foundation, 2023',
  },
  {
    id: 'sleepHours',
    text: 'On a typical night, how many hours of sleep do you get?',
    type: 'multi-choice',
    options: ['< 5 hours', '5-6 hours', '7-8 hours', '9+ hours'],
  },
  {
    id: 'sleepQuality',
    text: 'How often do you wake up feeling refreshed and rested?',
    type: 'multi-choice',
    options: ['Most mornings', 'About half the time', 'Rarely', 'Never'],
  },
  {
    id: 'sleepConsistency',
    text: 'How consistent are your bedtime and wake-up times, including on weekends?',
    type: 'multi-choice',
    options: [
      'Very consistent (within a 30-min window)',
      'Somewhat consistent (within a 60-min window)',
      'Inconsistent',
      'Very irregular',
    ],
  },
  {
    id: 'nightAwakenings',
    text: 'How often do you wake up during the night and find it difficult to fall back asleep?',
    type: 'multi-choice',
    options: [
      'Never or rarely',
      '1-2 nights per week',
      '3-4 nights per week',
      'Almost every night',
    ],
  },

  /* ────────────────── 6. MINDSET, STRESS & SOCIAL WELL-BEING ──────────────────── */
  {
    id: 'psychosocial-title',
    type: 'section-title',
    text: 'Your emotional health and social connections are powerful levers for healthy aging.',
    subtext:
      'Reducing stress through practices like meditation can lower cortisol levels that drive brain changes and dementia risks, potentially enhancing cognitive function and overall lifespan in older adults.',
    citation: 'National Institute on Aging, 2022',
  },
  {
    id: 'stressLevels',
    text: 'How would you rate your average stress level over the past month?',
    type: 'slider',
    min: 1,
    max: 5,
    subtext: '',
    sliderLabels: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
  },
  {
    id: 'stressCoping',
    text: 'How effective do you feel your strategies are for managing stress?',
    type: 'multi-choice',
    options: [
      'Very effective',
      'Somewhat effective',
      'Neutral',
      'Somewhat ineffective',
      'Very ineffective',
    ],
  },
  {
    id: 'lifeOutlook',
    text: 'Which of the following best describes your general outlook on life?',
    type: 'multi-choice',
    options: [
      'Optimistic',
      'Mostly optimistic',
      'Neutral / Realistic',
      'Mostly pessimistic',
      'Pessimistic',
    ],
  },
  {
    id: 'closeRelationships',
    text: 'How many close friends or family members do you feel you can confide in and rely on?',
    type: 'multi-choice',
    options: ['0', '1-2', '3-5', '6+'],
  },
  {
    id: 'communityInvolvement',
    text: 'How often do you participate in community activities (e.g., clubs, volunteering, religious gatherings)?',
    type: 'multi-choice',
    options: [
      'Weekly or more',
      'A few times a month',
      'A few times a year',
      'Rarely or never',
    ],
  },
  {
    id: 'mindfulnessFrequency',
    text: 'How often do you engage in mindfulness practices like meditation, breathwork, or yoga?',
    type: 'multi-choice',
    options: [
      'Daily',
      'A few times per week',
      'Occasionally',
      'Rarely or never',
    ],
  },

  /* ───────────────────────── 7. ENVIRONMENT & LIFESTYLE ────────────────────────── */
  {
    id: 'environment-title',
    type: 'section-title',
    text: 'Your daily surroundings and routines also play a role in the aging process.',
    subtext:
      'Living in Blue Zones, where environments foster plant-based diets and community support, results in 10 times higher centenarian rates, intentional lifestyle can replicate these longevity benefits.',
    citation: 'Buettner, D., & Skemp, S. (2016). American journal of lifestyle medicine.',
  },
  {
    id: 'sunlightExposure',
    text: 'On average, how much time do you spend outdoors in natural sunlight each day?',
    type: 'multi-choice',
    options: [
      '< 30 minutes',
      '30-60 minutes',
      '1-2 hours',
      '2+ hours',
    ],
  },
  {
    id: 'natureTime',
    text: 'How often do you spend time in natural green spaces like parks, forests, or gardens?',
    type: 'multi-choice',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely or never'],
  },
  {
    id: 'screenTimeNonWork',
    text: 'Outside of work, what is your average daily screen time on devices like phones, computers, or TV?',
    type: 'multi-choice',
    options: ['< 1 hour', '1-2 hours', '3-4 hours', '5+ hours'],
  },
  {
    id: 'longevityKnowledge',
    text: 'How interested are you in learning about and improving your healthspan?',
    type: 'multi-choice',
    options: [
      'Extremely interested',
      'Very interested',
      'Somewhat interested',
      'Not at all interested',
    ],
  },

  /* ─────────────────────────────── 8. WRAP-UP ────────────────────────── */
  {
    id: 'wrap-title',
    type: 'section-title',
    text: 'Your biological age estimate and personalized insights are being generated.',
    subtext:
      'Using patterns drawn from millions of health profiles and decades of longevity research, powered by The Longevity AI. Your data is entirely anonymized before analysis and your data remains private, secure, and used solely to help guide your healthspan journey.',
  },
  {
    id: 'name',
    text: 'before you go, what is your name?',
    type: 'name',
  },
  {
    id: 'email',
    text: 'and what email can we send your results to?',
    type: 'email',
  },
  {
    id: 'password',
    text: 'Please create a password to save your results.',
    type: 'password',
  },
]; 