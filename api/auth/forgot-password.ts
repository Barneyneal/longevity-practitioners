import { MongoClient } from 'mongodb';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

const uri = process.env.MONGODB_URI;
const sendgridApiKey = process.env.SENDGRID_SECRET;
const dbName = process.env.MONGODB_DB || 'longevity-practitioners';

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
} else {
  console.warn('SENDGRID_SECRET is not defined. Email sending will be disabled.');
}

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
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const dbClient = await getClient();
    const db = dbClient.db(dbName);
    const users = db.collection('users');
    const resetTokens = db.collection('password_reset_tokens');

    const user = await users.findOne({ email });
    if (!user) {
      // Important: For security, do not reveal that the user does not exist.
      // Pretend to send an email to prevent user enumeration attacks.
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiration = new Date(Date.now() + 3600000); // Token is valid for 1 hour

    await resetTokens.insertOne({
      userId: user._id,
      token: hashedToken,
      expiresAt: expiration,
    });

    const rawAppUrl = process.env.APP_URL || 'http://localhost:3000';
    const appUrl = rawAppUrl.replace(/^"|"$/g, ''); // Remove leading/trailing quotes
    const resetLink = `${appUrl}/reset-password?token=${token}`;
    const msg = {
      to: user.email,
      from: 'info@longevitypractitioners.com', // IMPORTANT: Replace with your verified SendGrid sender
      templateId: 'd-943e4953f10d47818ad10d72bb31203f',
      dynamic_template_data: {
        name: user.firstName || 'User',
        password_link: resetLink,
      },
    };

    if (sendgridApiKey) {
      await sgMail.send(msg);
    } else {
      console.log('SENDGRID_SECRET not found, pretending to send email. Reset link:', resetLink);
    }

    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (err) {
    console.error('Error in forgot-password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
