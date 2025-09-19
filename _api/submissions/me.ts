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
  email: string;
  iat: number;
  exp: number;
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

    const token = authHeader.substring(7);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    if (!decodedToken.userId) {
      return res.status(401).send('Unauthorized');
    }

    const dbClient = await getClient();
    const db = dbClient.db('ld-quiz');
    const submissions = db.collection('submissions');

    const userSubmissions = await submissions.aggregate([
      { $match: { userId: decodedToken.userId } },
      {
        $lookup: {
          from: 'results',
          let: { submissionIdStr: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [ { $toString: '$submissionId' }, '$$submissionIdStr' ]
                }
              }
            }
          ],
          as: 'result'
        }
      },
      {
        $unwind: {
          path: '$result',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: { submittedAt: -1 } }
    ]).toArray();

    return res.status(200).json(userSubmissions);
  } catch (err) {
    console.error('Error in /api/submissions/me:', err);
    return res.status(500).send('Server error');
  }
}
