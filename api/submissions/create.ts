import { MongoClient, ObjectId } from 'mongodb';
import { runScoring, validateSubmission, type AssessmentInput } from '../lib/assessment.js';
import { runCardiacScoring, type LongevityAssessmentOutput } from '../lib/cardiacAssessment.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI as string;

let client: MongoClient | null = null;
async function getClient() {
  if (client) return client;
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { userId, quizId, submittedAnswers, contact } = req.body || {};

    if (!quizId || !Array.isArray(submittedAnswers)) {
      return res.status(400).send('quizId and submittedAnswers are required');
    }

    const dbClient = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = dbClient.db(dbName);
    const users = db.collection('users');
    const submissions = db.collection('submissions');

    let effectiveUserId: string | null = userId || null;

    // Optional: upsert user by email if userId missing but we have contact
    if (!effectiveUserId && contact?.email) {
      const existing = await users.findOne({ email: contact.email });
      if (existing?._id) {
        effectiveUserId = existing._id.toString();
      } else {
        const insert = await users.insertOne({
          email: contact.email,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          createdAt: new Date().toISOString(),
        } as any);
        effectiveUserId = insert.insertedId.toString();
      }
    }

    const createdAtIso = new Date().toISOString();

    // Compute assessment fields
    let augmented: any = null;
    /*
    if (quizId === 'longevity') {
      try {
        const assessmentInput: AssessmentInput = {
          userId: effectiveUserId,
          quizId,
          submissionId: null,
          submittedAnswers,
          createdAt: createdAtIso,
        };
        const validation = validateSubmission(assessmentInput);
        if (!validation.is_valid) {
          return res.status(422).json({ message: 'Not enough questions answered', validation });
        }
        augmented = runScoring(assessmentInput);
        augmented.validation_result = validation;
      } catch (scoringErr) {
        console.error('Error during longevity scoring:', scoringErr);
        return res.status(500).json({ message: 'scoring_failed', code: 'LONGEVITY_SCORING_ERROR' });
      }
    } else if (quizId === 'cardiac_health') {
      // Pull the latest longevity submission to enrich scoring; support old and new schemas
      let longevityData: LongevityAssessmentOutput | null = null;
      try {
        const latestLongevity = await submissions
          .find({ userId: effectiveUserId, quizId: 'longevity' })
          .sort({ submittedAt: -1 })
          .limit(1)
          .toArray();
        if (latestLongevity && latestLongevity[0]) {
          const doc: any = latestLongevity[0];
          const sd = doc.submissionData || {};
          longevityData = {
            coreMetrics: sd.coreMetrics || doc.coreMetrics || { chronologicalAge: 0 },
            augmentedData: sd.augmentedData || doc.augmentedData || { bmi: 0 },
            submittedAnswers: sd.submittedAnswers || doc.submittedAnswers || [],
          } as LongevityAssessmentOutput;
        }
      } catch (e) {
        console.error('Error loading longevity context for cardiac scoring:', e);
      }

      try {
        const cardiacInput: AssessmentInput = {
          userId: effectiveUserId,
          quizId,
          submissionId: null,
          submittedAnswers,
          createdAt: createdAtIso,
        };
        const safeLongevityData =
          longevityData || ({ coreMetrics: { chronologicalAge: 0 }, augmentedData: { bmi: 0 }, submittedAnswers: [] } as LongevityAssessmentOutput);
        const cardiac = runCardiacScoring(cardiacInput, safeLongevityData);
        augmented = cardiac;
      } catch (scoringErr) {
        console.error('Error during cardiac scoring:', scoringErr);
        return res.status(500).json({ message: 'scoring_failed', code: 'CARDIAC_SCORING_ERROR' });
      }
    }
    */

    const newId = new ObjectId();
    const baseDoc: any = {
      _id: newId,
      userId: effectiveUserId,
      quizId,
      submittedAt: createdAtIso,
    };

    // Build submissionData by picking only needed keys and nesting submittedAnswers
    if (augmented) {
      const submissionData: any = {};
      if (augmented.coreMetrics) submissionData.coreMetrics = augmented.coreMetrics;
      if (augmented.augmentedData) submissionData.augmentedData = augmented.augmentedData;
      if (augmented.categoryScores) submissionData.categoryScores = augmented.categoryScores;
      if (augmented.scoredAnswers) submissionData.scoredAnswers = augmented.scoredAnswers;
      if (augmented.topImprovementAreas) submissionData.topImprovementAreas = augmented.topImprovementAreas;
      if (augmented.validation_result) submissionData.validation_result = augmented.validation_result;
      submissionData.submittedAnswers = submittedAnswers;
      baseDoc.submissionData = submissionData;
    } else {
      // If no augmented output (edge case), still persist answers in submissionData
      baseDoc.submissionData = { submittedAnswers };
    }

    // Insert without storing a duplicated submissionId field
    const result = await submissions.insertOne(baseDoc);
    return res.status(201).json({ submissionId: (result.insertedId ?? newId).toString() });
  } catch (err) {
    const message = (err as any)?.message || 'Unknown error';
    const stack = (err as any)?.stack || '';
    console.error('Error creating submission:', message, stack);
    return res.status(500).json({ message: 'server_error', error: message });
  }
}


