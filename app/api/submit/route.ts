// app/api/submit/route.ts
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

interface KycData {
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  job_title?: string;
  email?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kyc, esg } = body;

    const dbPath = path.resolve(process.cwd(), 'database', 'esg_kyc.db');
    const db = new Database(dbPath);

    // Insérer le répondant
    const stmtRespondent = db.prepare(`
      INSERT INTO respondents (company_name, contact_first_name, contact_last_name, job_title, email)
      VALUES (?, ?, ?, ?, ?)
    `);
    const respondentId = stmtRespondent.run(
      kyc.company_name,
      kyc.contact_first_name,
      kyc.contact_last_name,
      kyc.job_title || null,
      kyc.email || null
    ).lastInsertRowid as number;

    // Insérer les réponses ESG
    const stmtResponse = db.prepare(`
      INSERT INTO responses (respondent_id, question_id, response_text)
      VALUES (?, ?, ?)
    `);

    for (const [questionId, responseText] of Object.entries(esg)) {
      stmtResponse.run(respondentId, Number(questionId), responseText || null);
    }

    db.close();
    return NextResponse.json({ success: true, message: 'Réponses enregistrées' });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json({ success: false, error: 'Échec de l’enregistrement' }, { status: 500 });
  }
}