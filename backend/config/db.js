// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('<user>') || uri.includes('<password>')) {
    console.error('\n╔══════════════════════════════════════════════════════╗');
    console.error('║  ❌  MONGO_URI is not configured in backend/.env     ║');
    console.error('║                                                      ║');
    console.error('║  1. Open backend/.env                                ║');
    console.error('║  2. Replace the MONGO_URI placeholder with your      ║');
    console.error('║     MongoDB Atlas connection string                  ║');
    console.error('║  3. Restart the server: npm run dev                  ║');
    console.error('╚══════════════════════════════════════════════════════╝\n');
    // Don't crash — server still starts so health endpoint works
    return;
  }

  try {
    mongoose.set('bufferCommands', false); // fail fast instead of buffering
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB connection failed: ${err.message}`);
    console.error('    Check your MONGO_URI in backend/.env and ensure your IP is whitelisted in Atlas.\n');
    // Don't call process.exit — let health endpoint report the state
  }
};

module.exports = connectDB;
