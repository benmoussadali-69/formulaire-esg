// app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Submission } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();

    console.log('Donnees reçues:', data);

    if (!data.kyc || !data.esg) {
      return NextResponse.json(
        { success: false, message: 'Donnees manquantes' },
        { status: 400 }
      );
    }

    const submission = new Submission({
      kyc: data.kyc,
      esg: data.esg,
      status: 'completed'
    });

    await submission.save();

    console.log('✅ Enregistre dans MongoDB');

    return NextResponse.json(
      {
        success: true,
        message: 'Donnees enregistrees',
        submissionId: submission._id,
        submittedAt: submission.submittedAt
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