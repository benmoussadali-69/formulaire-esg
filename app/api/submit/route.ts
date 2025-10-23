import { NextRequest, NextResponse } from 'next/server';

// Stockage en mémoire pour les soumissions
let submissions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('✅ Données reçues du formulaire:', data);

    if (!data.kyc || !data.esg) {
      return NextResponse.json(
        { success: false, message: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Créer l'enregistrement
    const submission = {
      id: submissions.length + 1,
      kyc: data.kyc,
      esg: data.esg,
      submittedAt: new Date().toISOString(),
      status: 'completed'
    };

    submissions.push(submission);

    console.log('✅ Total soumissions:', submissions.length);
    console.log('✅ Soumissions stockées:', submissions);

    return NextResponse.json(
      {
        success: true,
        message: 'Données enregistrées avec succès',
        submissionId: submission.id,
        submittedAt: submission.submittedAt,
        totalSubmissions: submissions.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la soumission:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors du traitement des données',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/submit - Retourner les soumissions');
    console.log('📊 Nombre de soumissions:', submissions.length);
    console.log('📊 Contenu:', submissions);

    const allSubmissions = submissions.map(sub => ({
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

    console.log('📊 Retour:', allSubmissions);

    return NextResponse.json(
      {
        success: true,
        data: allSubmissions,
        count: allSubmissions.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la lecture:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la lecture des données',
        data: []
      },
      { status: 500 }
    );
  }
}