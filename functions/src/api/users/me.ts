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
    // The user object is attached by the authenticate middleware
    const firebaseUser = (req as any).user;
    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(401).send('Unauthorized: No user credentials');
    }

    const client = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = client.db(dbName);
    const users = db.collection('users');

    // Fetch user by Firebase UID. Note: You might need to adjust your database schema
    // to store the Firebase UID instead of or in addition to the Mongo ObjectId.
    // For now, we'll assume the user can be found by email.
    const user = await users.findOne({ email: firebaseUser.email });

    if (!user) {
      return res.status(404).send('User not found in database');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user as any;
    return res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}
