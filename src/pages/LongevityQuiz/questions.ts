import type { QuestionType as Question } from '../CardiacHealthQuiz/questions';

export const questions: Question[] = [
  /* ─────────────────────────────── 1. CREATE YOUR PROFILE ─────────────────────────────── */
  {
    "id": "fullName",
    "text": "What is your full name?",
    "type": "name"
  },

  /* ────────────────────── 2. PROFESSIONAL BACKGROUND ─────────────────────── */
  {
    "id": "professional-title",
    "type": "section-title",
    "text": "Tell Us About Your Practice",
    "subtext": "Understanding your background helps us create the most relevant educational experience."
  },
  {
    "id": "primaryRole",
    "text": "What is your primary professional role?",
    "type": "multi-choice",
    "options": [
      "Physician (MD, DO)",
      "Nurse Practitioner / Physician Assistant",
      "Registered Nurse",
      "Nutritionist / Dietitian",
      "Health / Wellness Coach",
      "Personal Trainer / Fitness Professional",
      "Chiropractor",
      "Researcher / Scientist",
      "Student",
      "Other"
    ]
  },
  {
    "id": "otherRole",
    "text": "Please specify your role:",
    "type": "text",
    "condition": {
      "questionId": "primaryRole",
      "value": "Other"
    }
  },
  {
    "id": "highestEducation",
    "text": "What is your highest relevant academic or professional qualification?",
    "type": "multi-choice",
    "options": [
      "Professional Certification (e.g., CPT, CHC)",
      "Associate's Degree",
      "Bachelor's Degree",
      "Master's Degree",
      "Doctoral Degree (PhD, EdD)",
      "Professional Doctorate (MD, DO, DC, DPT, PharmD)"
    ]
  },
  {
    "id": "medicalLicense",
    "text": "Do you hold an active medical license that allows you to prescribe medication?",
    "type": "multi-choice",
    "options": [
      "Yes",
      "No"
    ]
  },
  {
    "id": "licenseType",
    "text": "What type of license do you hold?",
    "type": "multi-choice",
    "condition": {
      "questionId": "medicalLicense",
      "value": "Yes"
    },
    "options": [
        "Medical Doctor (MD)",
        "Doctor of Osteopathic Medicine (DO)",
        "Nurse Practitioner (NP)",
        "Physician Assistant (PA)",
        "Other"
    ]
  },

  /* ────────────────────────── 3. CLIENTS & PRACTICE ────────────────────────── */
  {
    "id": "clientPractice",
    "text": "Are you currently seeing clients or patients in a professional capacity?",
    "type": "multi-choice",
    "options": [
      "Yes, full-time",
      "Yes, part-time",
      "No, but I plan to in the future",
      "No, I am not client-facing"
    ]
  },
  {
    "id": "practiceFocus",
    "text": "What is the primary focus of your practice or work?",
    "type": "multi-choice",
    "condition": {
      "questionId": "clientPractice",
      "value": ["Yes, full-time", "Yes, part-time"]
    },
    "options": [
      "General Health & Wellness",
      "Weight Management",
      "Sports Performance & Fitness",
      "Chronic Disease Management / Prevention",
      "Hormone Optimization",
      "Executive Health",
      "Other"
    ]
  },
  {
    "id": "clientCount",
    "text": "Approximately how many clients/patients do you work with per month?",
    "type": "multi-choice",
    "condition": {
      "questionId": "clientPractice",
      "value": ["Yes, full-time", "Yes, part-time"]
    },
    "options": [
      "1-10",
      "11-25",
      "26-50",
      "50+"
    ]
  },

  /* ──────────────────────────── 4. COURSE GOALS ──────────────────────────── */
  {
    "id": "goals-title",
    "type": "section-title",
    "text": "What are your goals?",
    "subtext": "Let us know what you hope to gain from this curriculum."
  },
  {
    "id": "longevityKnowledge",
    "text": "How would you rate your current knowledge of longevity science?",
    "type": "slider",
    "min": 1,
    "max": 5,
    "sliderLabels": ["Beginner", "Familiar", "Intermediate", "Advanced", "Expert"]
  },
  {
    "id": "primaryGoal",
    "text": "What is your primary goal for taking this course?",
    "type": "multi-choice",
    "options": [
      "To improve outcomes for my clients/patients",
      "To expand the services my practice offers",
      "For my own personal health and knowledge",
      "To gain a certification or credential (if offered in future)",
      "To stay current with emerging health trends"
    ]
  },

  /* ───────────────────── 5. CREATE YOUR FREE ACCOUNT ───────────────────── */
  {
    "id": "account-title",
    "type": "section-title",
    "text": "Final Step: Create Your Account",
    "subtext": "Save your profile and get immediate access to the full curriculum."
  },
  {
    "id": "email",
    "text": "What email can we use for your account?",
    "type": "email"
  },
  {
    "id": "password",
    "text": "Create a secure password.",
    "type": "password",
    "subtext": "Must be at least 8 characters long."
  }
]; 