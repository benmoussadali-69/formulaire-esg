// lib/mongodb.ts
import mongoose from 'mongoose';

// Vérification stricte : on s'assure que MONGODB_URI est une chaîne
const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('La variable MONGODB_URI est manquante dans .env.local');
  }
  return uri;
};

const MONGODB_URI = getMongoUri();

declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log('✅ Connecté à MongoDB Atlas');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw new Error(`Échec de la connexion à MongoDB : ${error instanceof Error ? error.message : 'erreur inconnue'}`);
  }
}

// Schéma de données
const submissionSchema = new mongoose.Schema({
  kyc: {
    company_name: String,
    contact_first_name: String,
    contact_last_name: String,
    job_title: String,
    email: String
  },
  esg: mongoose.Schema.Types.Mixed,
  submittedAt: { type: Date, default: Date.now },
  status: String
});

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);