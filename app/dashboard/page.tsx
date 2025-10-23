// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface Respondent {
  id: number;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  job_title: string | null;
  email: string | null;
  submitted_at: string;
}

interface ResponseItem {
  company_name: string;
  question_text: string;
  response_text: string | null;
}

export default function DashboardPage() {
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard-data');
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setRespondents(data.respondents);
          setResponses(data.responses);
        }
      } catch (err) {
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">Erreur : {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Dashboard ESG</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🏢 Répondants ({respondents.length})</h2>
          <div className="grid gap-4">
            {respondents.map(r => (
              <div key={r.id} className="bg-white p-4 rounded shadow">
                <strong>{r.company_name}</strong> – {r.contact_first_name} {r.contact_last_name}
                {r.job_title && ` (${r.job_title})`}
                {r.email && ` – ${r.email}`}
                <br />
                <small className="text-gray-500">
                  {new Date(r.submitted_at).toLocaleString('fr-FR')}
                </small>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🌱 Réponses ESG</h2>
          <div className="space-y-4">
            {responses.map((resp, i) => (
              <div key={i} className="bg-white p-4 rounded shadow">
                <div className="text-sm text-indigo-600 font-medium">{resp.company_name}</div>
                <div className="font-medium">{resp.question_text}</div>
                <div className="mt-1 text-gray-700">{resp.response_text || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
