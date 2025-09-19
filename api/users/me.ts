import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwt.verify(token, jwtSecret) as DecodedToken;
    } catch (error) {
      return res.status(401).send('Unauthorized');
    }

    const client = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = client.db(dbName);
    const users = db.collection('users');

    const user = await users.findOne({ _id: new ObjectId(decodedToken.userId) });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user as any;
    return res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}


