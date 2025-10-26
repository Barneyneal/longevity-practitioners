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

    const dbClient = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = dbClient.db(dbName);
    const userProgressCollection = db.collection('userProgress');

    // We need to decide how to store and retrieve progress.
    // Assuming it's stored by Firebase UID.
    const progress = await userProgressCollection.findOne({ userId: userId });

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this user.' });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...progressWithoutId } = progress;
    return res.status(200).json(progressWithoutId);

  } catch (err) {
    const message = (err as any)?.message || 'Unknown error';
    console.error('Error fetching user progress:', message, (err as any)?.stack);
    return res.status(500).json({ message: 'Server error', error: message });
  }
}
