// app/api/dashboard-data/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Fonction pour lire la base SQLite (sans dépendance native)
async function queryDatabase() {
  // On utilise une méthode simple : lire le fichier et parser avec un module pur JS
  // Mais comme SQLite est binaire, on va utiliser une alternative légère :
  // Pour un projet simple, on peut utiliser 'sqlite' mais il faut le configurer correctement.
  // Ici, on va utiliser une approche compatible : on suppose que vous avez 'better-sqlite3' installé.
  // Si ça échoue, on retourne des données vides.

  try {
    // Vérifier si better-sqlite3 est disponible
    const Database = require('better-sqlite3');
    const dbPath = path.join(process.cwd(), 'database', 'esg_kyc.db');
    const db = new Database(dbPath);

    const respondents = db.prepare(`
      SELECT id, company_name, contact_first_name, contact_last_name, job_title, email, submitted_at
      FROM respondents
      ORDER BY submitted_at DESC
    `).all();

    const responses = db.prepare(`
      SELECT r.response_text, q.question_text, q.section, resp.company_name
      FROM responses r
      JOIN questions q ON r.question_id = q.id
      JOIN respondents resp ON r.respondent_id = resp.id
      ORDER BY resp.submitted_at DESC, q.id
    `).all();

    db.close();

    return { respondents, responses, error: null };
  } catch (error) {
    console.error('Erreur base de données:', error);
    return { respondents: [], responses: [], error: 'Base de données inaccessible' };
  }
}

export async function GET() {
  const data = await queryDatabase();
  return NextResponse.json(data);
}