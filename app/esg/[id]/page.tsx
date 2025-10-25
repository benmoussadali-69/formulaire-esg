'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageHeader from '@/components/PageHeader';

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

const SECTIONS = [
  "Gouvernance et Stratégie ESG",
  "Gestion des Risques et Matérialité",
  "Politiques Environnementales",
  "Capital Humain & Conditions de Travail",
  "Droits humain et Équité",
  "Chaîne de Valeur & Fournisseurs",
  "Produits, Services & Clients",
  "Éthique, Conformité & Lutte Contre la Corruption",
  "Communautés & Développement Local",
  "Communication, Reporting & Transparence",
  "Engagement des Parties Prenantes"
];

const MOCK_QUESTIONS: Record<string, any[]> = {
  "Gouvernance et Stratégie ESG": [
    { id: "q1-1", qn: "1.1", text: "Votre entreprise dispose-t-elle d'une stratégie ESG documentée ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q1-2", qn: "1.2", text: "Un comité ou responsable ESG est-il dédié ?", type: "radio", opts: ["Oui", "Non"] },
    { id: "q1-3", qn: "1.3", text: "Les objectifs ESG sont-ils intégrés à la stratégie globale ?", type: "radio", opts: ["Oui", "Non", "Partiellement"] },
    { id: "q1-4", qn: "1.4", text: "Décrivez vos priorités stratégiques ESG.", type: "text", opts: [] },
  ],
  "Gestion des Risques et Matérialité": [
    { id: "q2-1", qn: "2.1", text: "Avez-vous identifié vos risques ESG majeurs ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q2-2", qn: "2.2", text: "Disposez-vous d'une cartographie des risques ESG ?", type: "radio", opts: ["Oui", "Non"] },
    { id: "q2-3", qn: "2.3", text: "Quels sont les principaux risques identifiés ?", type: "text", opts: [] },
  ],
  "Politiques Environnementales": [
    { id: "q3-1", qn: "3.1", text: "Avez-vous une politique environnementale écrite ?", type: "radio", opts: ["Oui", "Non"] },
    { id: "q3-2", qn: "3.2", text: "Mesurez-vous vos émissions de CO₂ ?", type: "radio", opts: ["Oui", "Non"] },
    { id: "q3-3", qn: "3.3", text: "Quelles initiatives environnementales mettez-vous en œuvre ?", type: "text", opts: [] },
  ],
  "Capital Humain & Conditions de Travail": [
    { id: "q4-1", qn: "4.1", text: "Disposez-vous d'une politique RH formelle ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q4-2", qn: "4.2", text: "Comment le bien-être des collaborateurs est-il assuré ?", type: "text", opts: [] },
  ],
  "Droits humain et Équité": [
    { id: "q5-1", qn: "5.1", text: "Avez-vous une politique de respect des droits humains ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q5-2", qn: "5.2", text: "Comment est assurée la diversité et l'égalité ?", type: "text", opts: [] },
  ],
  "Chaîne de Valeur & Fournisseurs": [
    { id: "q6-1", qn: "6.1", text: "Intégrez-vous des critères ESG dans le choix des fournisseurs ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q6-2", qn: "6.2", text: "Comment les fournisseurs sont-ils accompagnés ?", type: "text", opts: [] },
  ],
  "Produits, Services & Clients": [
    { id: "q7-1", qn: "7.1", text: "Comment les retours des clients sont-ils intégrés ?", type: "text", opts: [] },
    { id: "q7-2", qn: "7.2", text: "Comment vos produits contribuent-ils à des impacts positifs ?", type: "text", opts: [] },
  ],
  "Éthique, Conformité & Lutte Contre la Corruption": [
    { id: "q8-1", qn: "8.1", text: "Avez-vous une politique anti-corruption ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q8-2", qn: "8.2", text: "Comment sont appliquées ces politiques en interne ?", type: "text", opts: [] },
  ],
  "Communautés & Développement Local": [
    { id: "q9-1", qn: "9.1", text: "Participez-vous à des actions de mécénat ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q9-2", qn: "9.2", text: "Comment les impacts sociaux sont-ils mesurés ?", type: "text", opts: [] },
  ],
  "Communication, Reporting & Transparence": [
    { id: "q10-1", qn: "10.1", text: "Publiez-vous un rapport ESG ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q10-2", qn: "10.2", text: "Comment communiquez-vous vos engagements ESG ?", type: "text", opts: [] },
  ],
  "Engagement des Parties Prenantes": [
    { id: "q11-1", qn: "11.1", text: "Les parties prenantes clés sont-elles identifiées ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q11-2", qn: "11.2", text: "Quelles sont vos prochaines priorités ESG ?", type: "text", opts: [] },
  ],
};

export default function ESGStepPage() {
  const params = useParams();
  const router = useRouter();
  const stepId = Number(params.id);
  const [esgResponses, setEsgResponses] = useState<Record<string, string>>({});
  const [kyc, setKyc] = useState<any>(null);

  useEffect(() => {
    const kycData = safeLocalStorage.getItem('kycData');
    const saved = safeLocalStorage.getItem('esgResponses');
    if (!kycData) return router.push('/kyc');
    setKyc(JSON.parse(kycData));
    if (saved) setEsgResponses(JSON.parse(saved));
  }, [router]);

  const currentSection = SECTIONS[stepId - 1];
  const currentQuestions = MOCK_QUESTIONS[currentSection] || [];

  const handleResponseChange = (id: string, value: string) => {
    const newR = { ...esgResponses, [id]: value };
    setEsgResponses(newR);
    safeLocalStorage.setItem('esgResponses', JSON.stringify(newR));
  };

  const handleNext = async () => {
    const unanswered = currentQuestions.some(q => !esgResponses[q.id]);
    if (unanswered) return alert('Veuillez répondre à toutes les questions de cette section.');
    if (stepId < SECTIONS.length) router.push(`/esg/${stepId + 1}`);
    else {
      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kyc, esg: esgResponses }),
        });
        if (res.ok) {
          safeLocalStorage.removeItem('kycData');
          safeLocalStorage.removeItem('esgResponses');
          router.push('/confirmation');
        } else {
          alert('Erreur lors de la soumission.');
        }
      } catch {
        alert('Erreur réseau.');
      }
    }
  };

  const handlePrevious = () => {
    if (stepId > 1) router.push(`/esg/${stepId - 1}`);
    else router.push('/kyc');
  };

  if (!currentSection) return <div>Section non trouvée</div>;

  return (
    <main className="min-h-screen bg-white">
      
          <PageHeader />
     

      <div className="pl-[310px] pr-[310px] pt-[100px] pb-[100px]">
        <div className="flex justify-center">
          <div>
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Étape {stepId} sur 11</span>
                <span>{Math.round((stepId / 11) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div className="bg-[#06438a] h-2" style={{ width: `${(stepId / 11) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-[#06438a] mb-6">{stepId}. {currentSection}</h2>
              
              <div className="space-y-6">
                {currentQuestions.map(q => (
                  <div key={q.id} className="bg-gray-50 p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-3">{q.qn} – {q.text}</h3>
                    {q.type === 'text' ? (
                      <textarea value={esgResponses[q.id] || ''} onChange={e => handleResponseChange(q.id, e.target.value)} className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#06438a]" rows={3} placeholder="Votre réponse..." />
                    ) : (
                      <div className="space-y-2">
                        {q.opts.map((opt: string) => (
                          <label key={opt} className="flex items-center p-2 cursor-pointer">
                            <input type="radio" name={`q-${q.id}`} checked={esgResponses[q.id] === opt} onChange={() => handleResponseChange(q.id, opt)} className="h-4 w-4" />
                            <span className="ml-3">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={handlePrevious} className="flex-1 btn-secondary">Précédent</button>
                <button onClick={handleNext} className="flex-1 btn-primary">{stepId === 11 ? 'Soumettre' : 'Suivant'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}