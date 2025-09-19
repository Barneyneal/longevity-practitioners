import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

let client: MongoClient | null = null;
async function getClient() {
  if (client) return client;
  if (!uri) throw new Error('MONGODB_URI is not defined');
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined');
    return res.status(500).send('Server configuration error');
  }

  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }

    const dbClient = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = dbClient.db(dbName);
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      createdAt: new Date().toISOString(),
    });

    const userId = result.insertedId.toString();

    const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '1d' });

    return res.status(201).json({
      message: 'User created successfully',
      userId,
      token,
    });

  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).send('Server error');
  }
}
