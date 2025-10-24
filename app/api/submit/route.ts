import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'submissions.json');

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
}

async function readSubmissions() {
  try {
    await ensureDataFile();
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Erreur lecture:', error);
    return [];
  }
}

async function writeSubmissions(data: any[]) {
  try {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erreur ecriture:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('Donnees reçues:', data);

    if (!data.kyc || !data.esg) {
      return NextResponse.json(
        { success: false, message: 'Donnees manquantes' },
        { status: 400 }
      );
    }

    const submissions = await readSubmissions();

    const submission = {
      id: submissions.length + 1,
      kyc: data.kyc,
      esg: data.esg,
      submittedAt: new Date().toISOString(),
      status: 'completed'
    };

    submissions.push(submission);
    await writeSubmissions(submissions);

    console.log('✅ Enregistre. Total:', submissions.length);

    return NextResponse.json(
      {
        success: true,
        message: 'Donnees enregistrees',
        submissionId: submission.id,
        submittedAt: submission.submittedAt,
        totalSubmissions: submissions.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Lecture des soumissions...');

    const submissions = await readSubmissions();

    console.log('Total soumissions:', submissions.length);

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

    return NextResponse.json(
      {
        success: true,
        data: allSubmissions,
        count: allSubmissions.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lecture:', error);

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