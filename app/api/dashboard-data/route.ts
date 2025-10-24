// app/api/dashboard-data/route.ts
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'esg_kyc.db');
    const db = new Database(dbPath);

    // Récupérer les répondants
    const respondents = db
      .prepare(`SELECT id, company_name, contact_first_name, contact_last_name, job_title, email, submitted_at FROM respondents ORDER BY submitted_at DESC`)
      .all();

    // Récupérer les réponses avec les sections
    const responses = db
      .prepare(`
        SELECT 
          r.respondent_id,
          r.question_id,
          r.response_text,
          q.question_text,
          q.input_type,
          q.section
        FROM responses r
        JOIN questions q ON r.question_id = q.id
        ORDER BY r.respondent_id, q.id
      `)
      .all();

    db.close();
    return NextResponse.json({ respondents, responses });
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    return NextResponse.json({ respondents: [], responses: [] }, { status: 500 });
  }
}