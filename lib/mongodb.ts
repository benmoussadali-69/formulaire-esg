import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI: string = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Schema Submission
const submissionSchema = new mongoose.Schema({
  kyc: {
    company_name: String,
    contact_first_name: String,
    contact_last_name: String,
    job_title: String,
    email: String,
  },
  esg: mongoose.Schema.Types.Mixed,
  status: { type: String, default: 'completed' },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);