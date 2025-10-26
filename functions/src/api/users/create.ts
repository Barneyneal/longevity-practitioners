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
    const { uid, email, firstName, lastName } = req.body;

    if (!uid || !email) {
      return res.status(400).send('uid and email are required');
    }

    const client = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = client.db(dbName);
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      // If user already exists, maybe just update the firebase_uid
      await users.updateOne({ email }, { $set: { firebase_uid: uid } });
      return res.status(200).json(existingUser);
    }
    
    const result = await users.insertOne({
      firebase_uid: uid,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      createdAt: new Date().toISOString(),
    });
    
    const newUser = await users.findOne({ _id: result.insertedId });

    res.status(201).json(newUser);
    return;

  } catch (err) {
    console.error('Error creating user in DB:', err);
    return res.status(500).send('Server error');
  }
}
