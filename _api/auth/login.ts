import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

let client: MongoClient | null = null;
async function getClient() {
  if (client) return client;
  client = new MongoClient(uri as string);
  await client.connect();
  return client;
}

export default async function handler(req: any, res: any) {
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }

    const dbClient = await getClient();
    const db = dbClient.db('ld-quiz');
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).send('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, String(user.password));
    if (!isPasswordValid) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, jwtSecret, { expiresIn: '1d' });

    return res.status(200).json({ token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).send('Server error');
  }
}
