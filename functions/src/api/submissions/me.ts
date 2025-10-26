import { MongoClient } from 'mongodb';
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

    const client = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = client.db(dbName);

    // Find submissions for the user using their Firebase UID
    // We will need to ensure new submissions are saved with the Firebase UID.
    const submissions = await db.collection('submissions').find({ userId: firebaseUser.uid }).toArray();

    return res.status(200).json(submissions);
  } catch (err) {
    console.error('Error in /api/submissions/me:', err);
    return res.status(500).send('Server error');
  }
}
