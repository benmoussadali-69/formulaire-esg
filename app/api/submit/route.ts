// app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Submission } from '../../../lib/mongodb'; // ← chemin relatif

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    if (!data.kyc || !data.esg) {
      return NextResponse.json({ success: false, message: 'Données manquantes' }, { status: 400 });
    }

    const submission = new Submission({
      kyc: data.kyc,
      esg: data.esg,
      status: 'completed'
    });

    await submission.save();

    return NextResponse.json({
      success: true,
      message: 'Données enregistrées',
      submissionId: submission._id.toString(),
      submittedAt: submission.submittedAt
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Ajoutez aussi la fonction GET si vous l'utilisez pour le dashboard
export async function GET() {
  try {
    await connectDB();
    const submissions = await Submission.find({});
    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}