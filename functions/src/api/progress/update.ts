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

    const userId = firebaseUser.uid;
    const progressData = req.body;

    if (!progressData || typeof progressData !== 'object' || !progressData.lastKnownLocation) {
        return res.status(400).send('Bad Request: progress data is missing or malformed.');
    }

    const dbClient = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = dbClient.db(dbName);
    const userProgressCollection = db.collection('userProgress');

    const result = await userProgressCollection.updateOne(
      { userId: userId }, // Use Firebase UID
      {
        $set: {
          ...progressData,
          userId: userId, // Ensure Firebase UID is stored
          lastActiveAt: new Date(),
        },
      },
      { upsert: true }
    );

    return res.status(200).json({ success: true, result });
  } catch (err) {
    const message = (err as any)?.message || 'Unknown error';
    console.error('Error updating user progress:', message, (err as any)?.stack);
    return res.status(500).json({ message: 'Server error', error: message });
  }
}
