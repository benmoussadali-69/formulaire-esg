import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const submitRes = await fetch(new URL('/api/submit', request.url).toString());
    const submitData = await submitRes.json();

    if (!submitData.success || !submitData.data) {
      return NextResponse.json(
        { success: false, message: 'Aucune donnée' },
        { status: 400 }
      );
    }

    let csv = 'Entreprise,Contact,Email,Poste,Date,Score ESG\n';

    submitData.data.forEach((sub: any) => {
      const responses = Object.keys(sub.esg).length;
      const oui = Object.values(sub.esg).filter((v: any) => v === 'Oui').length;
      const score = responses > 0 ? Math.round((oui / responses) * 100) : 0;

      csv += `"${sub.respondent.company_name}","${sub.respondent.contact_first_name} ${sub.respondent.contact_last_name}","${sub.respondent.email}","${sub.respondent.job_title}","${new Date(sub.respondent.submitted_at).toLocaleDateString('fr-FR')}",${score}%\n`;
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="donnees-esg-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Erreur export CSV:', error);

    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const submitRes = await fetch(new URL('/api/submit', request.url).toString());
    const submitData = await submitRes.json();

    if (!submitData.success || !submitData.data) {
      return NextResponse.json(
        { success: false, message: 'Aucune donnée' },
        { status: 400 }
      );
    }

    const exportData = submitData.data.map((sub: any) => ({
      entreprise: sub.respondent.company_name,
      contact: `${sub.respondent.contact_first_name} ${sub.respondent.contact_last_name}`,
      email: sub.respondent.email,
      poste: sub.respondent.job_title,
      date: new Date(sub.respondent.submitted_at).toLocaleDateString('fr-FR'),
      reponses: sub.esg
    }));

    return NextResponse.json(
      {
        success: true,
        data: exportData,
        count: exportData.length,
        exportedAt: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur export JSON:', error);

    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}