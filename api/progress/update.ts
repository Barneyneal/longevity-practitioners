import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI as string;
const jwtSecret = process.env.JWT_SECRET as string;

let client: MongoClient | null = null;
async function getClient() {
  if (client) return client;
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

interface DecodedToken {
  userId: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Unauthorized: No token provided');
    }

    const token = authHeader.split(' ')[1];
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwt.verify(token, jwtSecret) as DecodedToken;
    } catch (error) {
      return res.status(401).send('Unauthorized: Invalid token');
    }

    const { userId } = decodedToken;
    const progressData = req.body;

    if (!progressData || typeof progressData !== 'object' || !progressData.lastKnownLocation) {
        return res.status(400).send('Bad Request: progress data is missing or malformed.');
    }

    const dbClient = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = dbClient.db(dbName);
    const userProgressCollection = db.collection('userProgress');

    const result = await userProgressCollection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          ...progressData,
          userId: new ObjectId(userId),
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

