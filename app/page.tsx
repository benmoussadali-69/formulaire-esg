// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [kyc, setKyc] = useState({
    company_name: '',
    contact_first_name: '',
    contact_last_name: '',
    job_title: '',
    email: '',
  });
  const [esgResponses, setEsgResponses] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Charger les questions au chargement
  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        // Initialiser les réponses vides
        const initialResponses: Record<string, string> = {};
        data.forEach((q: any) => {
          initialResponses[q.id] = '';
        });
        setEsgResponses(initialResponses);
      });
  }, []);

  const handleKycChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKyc(prev => ({ ...prev, [name]: value }));
  };

  const handleEsgChange = (questionId: string, value: string) => {
    setEsgResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc, esg: esgResponses }),
      });

      if (response.ok) {
        setStatus('success');
        // Réinitialiser le formulaire si besoin
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Formulaire ESG</h1>
        <p className="text-gray-600 text-center mb-6">Veuillez remplir les informations ci-dessous</p>

        {status === 'success' && (
          <div className="bg-green-100 text-green-800 p-4 rounded mb-6 text-center">
            ✅ Vos réponses ont été enregistrées avec succès !
          </div>
        )}
        {status === 'error' && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-6 text-center">
            ❌ Une erreur est survenue. Veuillez réessayer.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section KYC */}
          <section className="border-b pb-6">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">Informations de contact (KYC)</h2>
            {(['company_name', 'contact_first_name', 'contact_last_name', 'job_title', 'email'] as const).map(field => (
              <div key={field} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field.replace('_', ' ')} *
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={kyc[field]}
                  onChange={handleKycChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            ))}
          </section>

          {/* Section ESG */}
          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">Questions ESG</h2>
            {questions.map(q => (
              <div key={q.id} className="mb-4 p-3 bg-gray-50 rounded">
                <p className="font-medium">{q.question_number} – {q.question_text}</p>
                {q.input_type === 'text' ? (
                  <textarea
                    value={esgResponses[q.id] || ''}
                    onChange={e => handleEsgChange(q.id, e.target.value)}
                    className="mt-2 w-full p-2 border rounded"
                    rows={3}
                  />
                ) : (
                  <div className="mt-2 space-y-2">
                    {(q.options || []).map((opt: string) => (
                      <label key={opt} className="flex items-center">
                        <input
                          type={q.input_type === 'radio' ? 'radio' : 'checkbox'}
                          name={`q-${q.id}`}
                          checked={esgResponses[q.id] === opt}
                          onChange={() => handleEsgChange(q.id, opt)}
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Envoi en cours...' : 'Soumettre le formulaire'}
          </button>
        </form>
      </div>
    </main>
  );
}