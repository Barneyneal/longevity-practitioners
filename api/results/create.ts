import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

let client: MongoClient | null = null;
async function getClient() {
  if (client) return client;
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { submissionId, content, quizId, userId } = req.body;

    if (!submissionId) {
      return res.status(400).json({ message: 'submissionId_missing' });
    }

    const client = await getClient();
    const dbName = process.env.MONGODB_DB || 'longevity-practitioners';
    const db = client.db(dbName);
    const results = db.collection('results');

    const resultData = {
      submissionId: new ObjectId(submissionId),
      quizId: quizId,
      userId: userId,
      content: content,
      updatedAt: new Date().toISOString(),
    };

    const result = await results.updateOne(
      { submissionId: new ObjectId(submissionId) },
      { $set: resultData },
      { upsert: true }
    );

    res.status(201).json({ message: 'Result saved successfully', result });
    
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}
