import { NextResponse } from 'next/server';
import path from 'path';
import Database from 'better-sqlite3';

// 🧩 Définition claire des types de données
interface Respondent {
  id: number;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  job_title: string;
  email: string;
  submitted_at: string;
}

interface ResponseItem {
  respondent_id: number;
  question_id: number;
  response_text: string | null;
  question_text: string;
  input_type: string;
  section: string;
}

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'esg_kyc.db');
    const db = new Database(dbPath);

  
    const respondents = db
      .prepare(`
        SELECT 
          id, 
          company_name, 
          contact_first_name, 
          contact_last_name, 
          job_title, 
          email, 
          submitted_at 
        FROM respondents 
        ORDER BY submitted_at DESC
      `)
      .all() as Respondent[];

    
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
      .all() as ResponseItem[];

    db.close();

    
    const data = respondents.map((resp: Respondent) => {
      const esgResponses = responses
        .filter((r: ResponseItem) => r.respondent_id === resp.id)
        .reduce(
          (acc: Record<string, string | null>, curr: ResponseItem) => {
            acc[curr.question_id] = curr.response_text;
            return acc;
          },
          {}
        );

      return {
        respondent: {
          id: resp.id,
          company_name: resp.company_name,
          contact_first_name: resp.contact_first_name,
          contact_last_name: resp.contact_last_name,
          job_title: resp.job_title,
          email: resp.email,
          submitted_at: resp.submitted_at,
        },
        esg: esgResponses,
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('❌ Erreur dashboard-data:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur', error: String(error) },
      { status: 500 }
    );
  }
}
