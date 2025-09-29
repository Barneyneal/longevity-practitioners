import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'longevity-practitioners';

let client: MongoClient | null = null;
async function getClient() {
  if (client) return client;
  if (!uri) throw new Error('MONGODB_URI is not defined');
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const dbClient = await getClient();
    const db = dbClient.db(dbName);
    const resetTokens = db.collection('password_reset_tokens');

    const tokenDoc = await resetTokens.findOne({ token: hashedToken });

    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    if (new Date() > new Date(tokenDoc.expiresAt)) {
      await resetTokens.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const users = db.collection('users');
    await users.updateOne(
      { _id: new ObjectId(tokenDoc.userId) },
      { $set: { password: hashedPassword } }
    );

    // Invalidate the token by deleting it
    await resetTokens.deleteOne({ _id: tokenDoc._id });

    res.status(200).json({ message: 'Password has been reset successfully' });

  } catch (err) {
    console.error('Error in reset-password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
