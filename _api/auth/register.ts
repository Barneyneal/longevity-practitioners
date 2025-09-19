console.log('API endpoint "register.ts" is being initialized.');

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

let client: MongoClient | null = null;
async function getClient() {
  console.log('Inside getClient: Checking for existing client...');
  if (client) {
    console.log('Existing client found. Returning it.');
    return client;
  }
  console.log('No existing client. Creating a new one...');
  client = new MongoClient(uri as string);
  console.log('Connecting to the database...');
  await client.connect();
  console.log('Database connection successful.');
  return client;
}

export default async function handler(req: any, res: any) {
  console.log('--- REGISTER HANDLER START ---');
  const uri = process.env.MONGODB_URI;
  const jwtSecret = process.env.JWT_SECRET;

  if (!uri || !jwtSecret) {
    console.error('Missing MONGODB_URI or JWT_SECRET');
    return res.status(500).send('Server configuration error');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    console.log('Register handler invoked.');
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }

    console.log('Attempting to get database client...');
    const dbClient = await getClient();
    console.log('Database client received.');
    const db = dbClient.db('ld-quiz');
    const users = db.collection('users');

    console.log(`Checking if user ${email} exists...`);
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      createdAt: new Date().toISOString(),
    };

    const result = await users.insertOne(newUser as any);
    const userId = result.insertedId;

    const token = jwt.sign({ userId: userId.toString(), email }, jwtSecret, { expiresIn: '1d' });

    return res.status(201).json({ message: 'User created successfully', userId, token });
  } catch (err) {
    console.error('--- REGISTER HANDLER ERROR ---');
    console.error(err);
    if (err instanceof Error) {
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
    }
    return res.status(500).send('Server error');
  } finally {
    console.log('--- REGISTER HANDLER END ---');
  }
}
