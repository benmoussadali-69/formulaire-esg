import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Aucun ID fourni' },
        { status: 400 }
      );
    }

    // Récupérer les données
    const submitRes = await fetch(new URL('/api/submit', request.url).toString());
    const submitData = await submitRes.json();

    if (!submitData.success || !submitData.data) {
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la récupération des données' },
        { status: 500 }
      );
    }

    // Filtrer les données sélectionnées
    const selectedData = submitData.data.filter((sub: any) => ids.includes(sub.respondent.id));

    return NextResponse.json(
      {
        success: true,
        data: selectedData,
        count: selectedData.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur export:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de l\'export',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}