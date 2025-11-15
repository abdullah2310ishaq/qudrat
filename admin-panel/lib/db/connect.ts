import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || 'qidrat';

if (!MONGODB_URI) {
  // In production, log error but don't throw during module load
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️ MONGODB_URI is not defined in environment variables');
  } else {
    throw new Error('Please define MONGODB_URI in .env.local');
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // Check if MONGODB_URI is set before attempting connection
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Please set it in your environment variables.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: DB_NAME,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB Connection Error:', error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;

