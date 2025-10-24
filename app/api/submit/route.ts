import { NextRequest, NextResponse } from 'next/server';

// Stockage en mémoire comme fallback
let submissions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('Données reçues:', data);

    if (!data.kyc || !data.esg) {
      return NextResponse.json(
        { success: false, message: 'Donnees manquantes' },
        { status: 400 }
      );
    }

    // Essayer MongoDB si disponible
    if (process.env.MONGODB_URI) {
      try {
        const { connectDB, Submission } = await import('@/lib/mongodb');
        await connectDB();

        const submission = new Submission({
          kyc: data.kyc,
          esg: data.esg,
          status: 'completed'
        });

        await submission.save();

        console.log('Enregistre dans MongoDB');

        return NextResponse.json(
          {
            success: true,
            message: 'Donnees enregistrees',
            submissionId: submission._id.toString(),
            submittedAt: submission.submittedAt
          },
          { status: 200 }
        );
      } catch (mongoError) {
        console.warn('MongoDB non disponible, utilise le stockage en memoire:', mongoError);
      }
    }

    // Fallback: stockage en mémoire
    const submission = {
      id: submissions.length + 1,
      _id: submissions.length + 1,
      kyc: data.kyc,
      esg: data.esg,
      submittedAt: new Date().toISOString(),
      status: 'completed'
    };

    submissions.push(submission);

    console.log('Enregistre en memoire. Total:', submissions.length);

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
    // Essayer MongoDB si disponible
    if (process.env.MONGODB_URI) {
      try {
        const { connectDB, Submission } = await import('@/lib/mongodb');
        await connectDB();

        const dbSubmissions = await Submission.find({});

        const allSubmissions = dbSubmissions.map((sub: any) => ({
          ...sub.toObject(),
          respondent: {
            id: sub._id.toString(),
            company_name: sub.kyc.company_name,
            contact_first_name: sub.kyc.contact_first_name,
            contact_last_name: sub.kyc.contact_last_name,
            job_title: sub.kyc.job_title || 'N/A',
            email: sub.kyc.email,
            submitted_at: sub.submittedAt
          }
        }));

        console.log('Lue depuis MongoDB:', allSubmissions.length);

        return NextResponse.json(
          {
            success: true,
            data: allSubmissions,
            count: allSubmissions.length
          },
          { status: 200 }
        );
      } catch (mongoError) {
        console.warn('MongoDB non disponible:', mongoError);
      }
    }

    // Fallback: retourner données en mémoire
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

    console.log('Lue depuis memoire:', allSubmissions.length);

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