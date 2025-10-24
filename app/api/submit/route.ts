import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Stockage en mémoire
let submissions: any[] = [];
let initialized = false;

async function initializeSubmissions() {
  if (initialized) return;
  
  try {
    const dataFile = path.join(process.cwd(), 'data', 'submissions.json');
    const content = await fs.readFile(dataFile, 'utf-8');
    submissions = JSON.parse(content);
    initialized = true;
    console.log('✅ Fichier JSON charge:', submissions.length, 'formulaires');
  } catch {
    submissions = [];
    initialized = true;
    console.log('⚠️ Fichier JSON vide (premier demarrage)');
  }
}

async function saveToJSON() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const dataFile = path.join(dataDir, 'submissions.json');
    
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(submissions, null, 2));
    console.log('✅ Sauvegarde JSON OK');
  } catch (error) {
    console.error('❌ Erreur sauvegarde JSON:', error);
  }
}

async function saveToMongoDB(submission: any) {
  if (!process.env.MONGODB_URI) {
    console.log('⚠️ MONGODB_URI non defini - MongoDB ignore');
    return false;
  }

  try {
    const { connectDB, Submission } = await import('@/lib/mongodb');
    
    console.log('🔄 Connexion MongoDB...');
    await connectDB();
    
    const mongoSubmission = new Submission({
      kyc: submission.kyc,
      esg: submission.esg,
      status: 'completed'
    });
    
    await mongoSubmission.save();
    console.log('✅ Sauvegarde MongoDB OK - ID:', mongoSubmission._id.toString());
    return true;
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error instanceof Error ? error.message : error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeSubmissions();

    const data = await request.json();

    if (!data.kyc || !data.esg) {
      return NextResponse.json(
        { success: false, message: 'Donnees manquantes' },
        { status: 400 }
      );
    }

    const submission = {
      id: submissions.length + 1,
      kyc: data.kyc,
      esg: data.esg,
      submittedAt: new Date().toISOString(),
      status: 'completed',
      mongoSaved: false,
      mongoId: null
    };

    // Sauvegarder dans JSON d'abord (rapide)
    submissions.push(submission);
    await saveToJSON();

    // Sauvegarder dans MongoDB (en arrière-plan)
    saveToMongoDB(submission).then(success => {
      if (success) {
        submission.mongoSaved = true;
        saveToJSON().catch(console.error);
        console.log('✅ MongoDB synchronise avec JSON');
      }
    }).catch(console.error);

    console.log('📊 Soumission #' + submission.id + ' enregistree');

    return NextResponse.json(
      {
        success: true,
        message: 'Donnees enregistrees',
        submissionId: submission.id,
        submittedAt: submission.submittedAt,
        savedIn: ['JSON', process.env.MONGODB_URI ? 'MongoDB (en arriere-plan)' : 'JSON seulement']
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur POST:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeSubmissions();

    const allSubmissions = submissions.map((sub: any) => ({
      ...sub,
      respondent: {
        id: sub.id,
        company_name: sub.kyc.company_name,
        contact_first_name: sub.kyc.contact_first_name,
        contact_last_name: sub.kyc.contact_last_name,
        job_title: sub.kyc.job_title || 'N/A',
        email: sub.kyc.email,
        submitted_at: sub.submittedAt
      }
    }));

    console.log('📊 Dashboard - Chargement:', allSubmissions.length, 'formulaires');

    return NextResponse.json(
      {
        success: true,
        data: allSubmissions,
        count: allSubmissions.length,
        source: 'JSON local'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur GET:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur',
        data: []
      },
      { status: 500 }
    );
  }
}