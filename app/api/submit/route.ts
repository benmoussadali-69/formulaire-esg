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
  } catch {
    submissions = [];
    initialized = true;
  }
}

async function saveSubmissions() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const dataFile = path.join(dataDir, 'submissions.json');
    
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(submissions, null, 2));
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
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
      status: 'completed'
    };

    submissions.push(submission);

    // Sauvegarder de manière asynchrone (ne pas bloquer la réponse)
    saveSubmissions().catch(console.error);

    // Essayer MongoDB en arrière-plan si disponible
    if (process.env.MONGODB_URI) {
      import('@/lib/mongodb')
        .then(({ connectDB, Submission }) => {
          connectDB().then(() => {
            const mongoSubmission = new Submission({
              kyc: data.kyc,
              esg: data.esg,
              status: 'completed'
            });
            return mongoSubmission.save();
          }).catch(console.error);
        })
        .catch(console.error);
    }

    console.log('✅ Enregistre. Total:', submissions.length);

    return NextResponse.json(
      {
        success: true,
        message: 'Donnees enregistrees',
        submissionId: submission.id,
        submittedAt: submission.submittedAt
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur:', error);

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

    console.log('Reponse:', allSubmissions.length);

    return NextResponse.json(
      {
        success: true,
        data: allSubmissions,
        count: allSubmissions.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur GET:', error);

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