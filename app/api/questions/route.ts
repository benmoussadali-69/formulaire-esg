// app/api/questions/route.ts
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

interface Question {
  id: number;
  section: string;
  question_number: string;
  question_text: string;
  input_type: string;
}

interface Option {
  question_id: number;
  option_text: string;
}

export async function GET() {
  try {
    const dbPath = path.resolve(process.cwd(), 'database', 'esg_kyc.db');
    const db = new Database(dbPath);

    const questions = db
      .prepare(`SELECT id, section, question_number, question_text, input_type FROM questions WHERE question_type = 'ESG' ORDER BY id`)
      .all() as Question[];

    const options = db
      .prepare(`SELECT question_id, option_text FROM question_options ORDER BY id`)
      .all() as Option[];

    const questionsWithOptions = questions.map(q => ({
      ...q,
      options: options
        .filter(opt => opt.question_id === q.id)
        .map(opt => opt.option_text),
    }));

    db.close();
    return NextResponse.json(questionsWithOptions);
  } catch (error) {
    console.error('Erreur chargement questions:', error);
    return NextResponse.json({ error: 'Impossible de charger les questions' }, { status: 500 });
  }
}