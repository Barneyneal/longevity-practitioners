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
    const submissionId = (req.query.submissionId as string) || (req.query.submission_id as string);
    if (!submissionId || typeof submissionId !== 'string') return res.status(400).json({ message: 'submission_id_required' });

    const client = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = client.db(dbName);
    const results = db.collection('results');

    const doc = await results.findOne({ submission_id: submissionId });
    if (!doc) return res.status(404).json({ message: 'result_not_found' });

    return res.status(200).json(doc);
  } catch (e: any) {
    console.error('Error fetching result:', e?.message || e);
    return res.status(500).json({ message: 'server_error' });
  }
}
