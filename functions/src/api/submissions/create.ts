import { MongoClient, ObjectId } from 'mongodb';
// import { runScoring, validateSubmission, type AssessmentInput } from '../lib/assessment.js';
// import { runCardiacScoring, type LongevityAssessmentOutput } from '../lib/cardiacAssessment.js';
import { Request, Response } from 'express';

let client: MongoClient | null = null;
async function getClient() {
  if (client) return client;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req: Request, res: Response) {
  try {
    const firebaseUser = (req as any).user;
    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).send('Unauthorized');
    }

    const { quizId, submittedAnswers } = req.body || {};

    if (!quizId || !Array.isArray(submittedAnswers)) {
      return res.status(400).send('quizId and submittedAnswers are required');
    }

    const dbClient = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = dbClient.db(dbName);
    const submissions = db.collection('submissions');

    const effectiveUserId = firebaseUser.uid;
    const createdAtIso = new Date().toISOString();
    
    // The scoring logic is complex and commented out in the original file.
    // We will preserve this behavior and focus on the data insertion part.
    const augmented: any = null;

    const newId = new ObjectId();
    const baseDoc: any = {
      _id: newId,
      userId: effectiveUserId, // Use Firebase UID
      quizId,
      submittedAt: createdAtIso,
    };

    if (augmented) {
      const submissionData: any = {};
      // This block is unreachable as `augmented` is null.
      // Preserving for reference.
      baseDoc.submissionData = submissionData;
    } else {
      baseDoc.submissionData = { submittedAnswers };
    }

    const result = await submissions.insertOne(baseDoc);
    return res.status(201).json({ submissionId: (result.insertedId ?? newId).toString() });
  } catch (err) {
    const message = (err as any)?.message || 'Unknown error';
    const stack = (err as any)?.stack || '';
    console.error('Error creating submission:', message, stack);
    return res.status(500).json({ message: 'server_error', error: message });
  }
}
