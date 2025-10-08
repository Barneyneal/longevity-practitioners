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
  if (req.method !== 'GET') {
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

    const dbClient = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = dbClient.db(dbName);
    const userProgressCollection = db.collection('userProgress');

    const progress = await userProgressCollection.findOne({ userId: new ObjectId(userId) });

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

