import { MongoClient, ObjectId } from 'mongodb';
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
    
    const { submissionId, content, quizId } = req.body;

    if (!submissionId) {
      return res.status(400).json({ message: 'submissionId_missing' });
    }

    const client = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = client.db(dbName);
    const results = db.collection('results');

    const resultData = {
      submissionId: new ObjectId(submissionId),
      quizId: quizId,
      userId: firebaseUser.uid, // Use Firebase UID
      content: content,
      updatedAt: new Date().toISOString(),
    };

    const result = await results.updateOne(
      { submissionId: new ObjectId(submissionId) },
      { $set: resultData },
      { upsert: true }
    );

    res.status(201).json({ message: 'Result saved successfully', result });
    return; // Add return statement to ensure all code paths return a value
    
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}
