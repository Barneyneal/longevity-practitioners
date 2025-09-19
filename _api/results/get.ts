import { MongoClient, ObjectId } from 'mongodb';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI as string;

let client: MongoClient | null = null;
async function getClient() {
  if (client) return client;
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  try {
    const submissionId = (req.query.submissionId as string) || (req.query.submission_id as string);
    if (!submissionId) return res.status(400).json({ message: 'submissionId is required' });

    const dbClient = await getClient();
    const db = dbClient.db('ld-quiz');
    const results = db.collection('results');

    const doc = await results.findOne({ submission_id: submissionId });
    if (!doc) return res.status(404).json({ message: 'result_not_found' });

    return res.status(200).json(doc);
  } catch (e: any) {
    console.error('Error fetching result:', e?.message || e);
    return res.status(500).json({ message: 'server_error' });
  }
}


