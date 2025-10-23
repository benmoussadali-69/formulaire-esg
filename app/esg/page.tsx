// app/esg/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ESGPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [esgResponses, setEsgResponses] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const router = useRouter();

  // Sections dans l'ordre exact du questionnaire
  const SECTIONS = [
    "Gouvernance et Stratégie ESG",
    "Gestion des Risques et Matérialité",
    "Politiques Environnementales",
    "Capital Humain & Conditions de Travail",
    "Droits humain et Equité",
    "Chaîne de Valeur & Fournisseurs",
    "Produits, Services & Clients",
    "Éthique, Conformité & Lutte Contre la Corruption",
    "Communautés & Développement Local",
    "Communication, Reporting & Transparence",
    "Engagement des Parties Prenantes"
  ];

  const getSectionNumber = (section: string): string => {
    const index = SECTIONS.indexOf(section);
    return index !== -1 ? `${index + 1}.` : '?.';
  };

  useEffect(() => {
    const savedKyc = localStorage.getItem('kycData');
    if (!savedKyc) {
      router.push('/');
    }

    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        const initial: Record<string, string> = {};
        data.forEach((q: any) => initial[q.id] = '');
        setEsgResponses(initial);
      });
  }, [router]);

  const handleEsgChange = (questionId: string, value: string) => {
    setEsgResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const kycData = JSON.parse(localStorage.getItem('kycData') || '{}');
    if (!kycData.company_name) {
      setStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc: kycData, esg: esgResponses }),
      });

      if (response.ok) {
        localStorage.removeItem('kycData');
        setStatus('success');
        setTimeout(() => router.push('/confirmation'), 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  // Regrouper les questions par section
  const groupedQuestions: Record<string, any[]> = {};
  questions.forEach(q => {
    if (!groupedQuestions[q.section]) {
      groupedQuestions[q.section] = [];
    }
    groupedQuestions[q.section].push(q);
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">🌱 Questionnaire ESG</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Veuillez répondre aux questions organisées par thématique.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-200">
          {status === 'success' && (
            <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-md text-center">
              ✅ Merci ! Vos réponses ont été enregistrées.
            </div>
          )}
          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md text-center">
              ❌ Une erreur est survenue. Veuillez réessayer.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {SECTIONS.map(section => {
              const qs = groupedQuestions[section] || [];
              if (qs.length === 0) return null;

              return (
                <div key={section} className="border-b border-gray-200 pb-8 last:border-0">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                    {getSectionNumber(section)} {section}
                  </h2>
                  <div className="space-y-6">
                    {qs.map(q => (
                      <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3">
                          {q.question_number && `${q.question_number} – `}{q.question_text}
                        </h3>
                        {q.input_type === 'text' ? (
                          <textarea
                            value={esgResponses[q.id] || ''}
                            onChange={e => handleEsgChange(q.id, e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                            rows={3}
                          />
                        ) : (
                          <div className="space-y-2">
                            {(q.options || []).map((opt: string) => (
                              <label key={opt} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  checked={esgResponses[q.id] === opt}
                                  onChange={() => handleEsgChange(q.id, opt)}
                                  className="h-4 w-4 text-[#0066CC] focus:ring-[#0066CC]"
                                />
                                <span className="ml-3 text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="btn-secondary flex-1 text-center"
              >
                ← Retour au formulaire KYC
              </button>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-primary flex-1"
              >
                {status === 'submitting' ? 'Envoi en cours...' : 'Soumettre le questionnaire'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}