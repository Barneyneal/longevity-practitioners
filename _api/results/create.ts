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

    if (!submissionId || !content) {
      return res.status(400).send('submissionId and content are required');
    }

    const dbClient = await getClient();
    const db = dbClient.db('ld-quiz');
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
