import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Test MongoDB...');
    console.log('MONGODB_URI defini?', !!process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        message: 'MONGODB_URI non defini dans les variables d\'environnement',
        mongoUri: 'ABSENT'
      }, { status: 400 });
    }

    const { connectDB, Submission } = await import('@/lib/mongodb');

    console.log('📡 Connexion à MongoDB...');
    await connectDB();
    console.log('✅ Connecte!');

    // Compter les soumissions
    const count = await Submission.countDocuments();
    console.log('📊 Nombre de soumissions:', count);

    // Récupérer les dernières
    const recent = await Submission.find({}).sort({ submittedAt: -1 }).limit(1);

    return NextResponse.json({
      success: true,
      message: 'Connexion MongoDB OK',
      totalSubmissions: count,
      latestSubmission: recent[0] || null,
      mongoUri: process.env.MONGODB_URI?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);

    return NextResponse.json({
      success: false,
      message: 'Erreur connexion MongoDB',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      mongoUri: process.env.MONGODB_URI ? 'DEFINI' : 'ABSENT'
    }, { status: 500 });
  }
}