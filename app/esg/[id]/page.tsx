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
    { id: "q1-1", qn: "1.1", text: "Existe-t-il un comité ou un organe dédié à la gouvernance ESG/RSE au sein de votre entité ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q1-2", qn: "1.2", text: "L’entité dispose-t-elle d’une politique ou charte ESG/RSE approuvée par la Direction Générale ou le Conseil d’administration ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q1-3", qn: "1.3", text: "Cette politique ou charte est-elle communiquée en interne (auprès du personnel, des filiales ou de la direction) ?", type: "radio", opts: ["Oui", "Non"] },
    { id: "q1-4", qn: "1.4", text: "L’entité dispose-t-elle d’un code d’éthique ou de conduite, incluant un mécanisme d’alerte pour signaler les manquements ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q1-5", qn: "1.5", text: "L’entité dispose-t-elle de politiques spécifiques sur les thématiques suivantes ?", type: "group", opts: [
      "Environnementale", 
      "Sociale et capital humain", 
      "Santé et sécurité au travail", 
      "Investissement ou financement responsable (si applicable)"
    ] },
    { id: "q1-6", qn: "1.6", text: "Comment la Direction intègre-t-elle les enjeux ESG dans les décisions stratégiques ?", type: "text", opts: [] },
    { id: "q1-7", qn: "1.7", text: "Quels sont les objectifs ESG prioritaires définis à moyen terme (3 à 5 ans) ?", type: "text", opts: [] },
  ],

  "Gestion des Risques et Matérialité": [
    { id: "q2-1", qn: "2.1", text: "L’entité dispose-t-elle d’une cartographie des risques ESG (impacts, risques, opportunités) ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q2-2", qn: "2.2", text: "Cette analyse repose-t-elle sur une matérialité simple ou double ?", type: "radio", opts: ["Simple", "Double", "En cours"] },
    { id: "q2-3", qn: "2.3", text: "Comment les risques ESG sont-ils suivis et mis à jour ?", type: "text", opts: [] },
    { id: "q2-4", qn: "2.4", text: "Les risques ESG identifiés sont-ils priorisés en fonction de leur impact et probabilité ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
  ],

  "Politiques Environnementales": [
    { id: "q3-1", qn: "3.1", text: "L’entité dispose-t-elle d’une politique environnementale (énergie, déchets, pollution, biodiversité, liée au changement climatique, etc.) ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q3-2", qn: "3.2", text: "L’entité mesure-t-elle les émissions GES (Scopes 1, 2 et Scope 3 matériel) et suit-elle des indicateurs environnementaux chiffrés (énergie, déchets, biodiversité, etc.) ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q3-3", qn: "3.3", text: "Quelles actions concrètes sont mises en œuvre pour réduire les impacts environnementaux ?", type: "text", opts: [] },
    { id: "q3-4", qn: "3.4", text: "L’entité a-t-elle défini des objectifs de réduction des émissions de GES et d’autres impacts environnementaux ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
  ],

  "Capital Humain & Conditions de Travail": [
    { id: "q4-1", qn: "4.1", text: "L’entité dispose-t-elle d’une politique RH formelle couvrant santé, sécurité, diversité, inclusion et développement des compétences ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q4-2", qn: "4.2", text: "Comment le bien-être, la santé et la sécurité des collaborateurs sont-ils assurés et suivis ?", type: "text", opts: [] },
    { id: "q4-3", qn: "4.3", text: "Quelles sont les actions sociales ou solidaires mises en place en faveur du personnel ?", type: "text", opts: [] },
    { id: "q4-4", qn: "4.4", text: "L’entité mesure-t-elle la satisfaction et l’engagement des collaborateurs ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
  ],

  "Droits humain et Équité": [   // <- clé exactement comme dans ton front
    { id: "q5-1", qn: "5.1", text: "L’entité dispose-t-elle d’une politique de respect des droits humains incluant la chaîne de valeur et les fournisseurs ? Comment la conformité est-elle vérifiée ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q5-2", qn: "5.2", text: "Des mécanismes de prévention et de traitement des violations des droits humains existent-ils ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q5-3", qn: "5.3", text: "Comment sont assurés la diversité et l’égalité des chances dans l’entreprise ?", type: "text", opts: [] },
    { id: "q5-4", qn: "5.4", text: "L’entité réalise-t-elle des évaluations ou audits externes pour s’assurer du respect des droits humains ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
  ],
  
  "Chaîne de Valeur & Fournisseurs": [
    { id: "q6-1", qn: "6.1", text: "L’entité intègre-t-elle des critères ESG dans le choix, l’évaluation et les contrats des fournisseurs et partenaires ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q6-2", qn: "6.2", text: "Comment les fournisseurs sont-ils accompagnés pour améliorer leur performance ESG et intégrer les critères ESG dans leurs contrats ?", type: "text", opts: [] },
  ],

  "Produits, Services & Clients": [
    { id: "q7-1", qn: "7.1", text: "Comment les retours des clients et autres parties prenantes sont-ils intégrés dans la stratégie ESG ?", type: "text", opts: [] },
    { id: "q7-2", qn: "7.2", text: "Comment les produits et services contribuent-ils à des impacts positifs (sociaux ou environnementaux) et ces impacts sont-ils quantifiés et reportés ?", type: "text", opts: [] },
    { id: "q7-3", qn: "7.3", text: "Existe-t-il une politique d’innovation ou de conception responsable pour les produits/services ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
  ],

  "Éthique, Conformité & Lutte Contre la Corruption": [
    { id: "q8-1", qn: "8.1", text: "L’entité dispose-t-elle d’une politique anti-corruption, AML/CFT, concurrence loyale et cybersécurité ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q8-2", qn: "8.2", text: "Comment sont communiquées et appliquées ces politiques en interne ?", type: "text", opts: [] },
    { id: "q8-3", qn: "8.3", text: "Des audits internes ou externes incluent-ils la conformité ESG et éthique ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q8-4", qn: "8.4", text: "L’entité propose-t-elle des formations régulières à ses collaborateurs sur la conformité, l’éthique et la lutte anti-corruption ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
  ],

  "Communautés & Développement Local": [
    { id: "q9-1", qn: "9.1", text: "L’entité participe-t-elle à des actions de mécénat, inclusion ou développement communautaire ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q9-2", qn: "9.2", text: "Comment les impacts sociaux positifs de ces initiatives sont-ils mesurés ?", type: "text", opts: [] },
    { id: "q9-3", qn: "9.3", text: "L’entité évalue-t-elle l’impact socio-économique de ses initiatives locales (emplois, inclusion, services) ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
  ],

  "Communication, Reporting & Transparence": [
    { id: "q10-1", qn: "10.1", text: "L’entité publie-t-elle un rapport ESG ou un rapport intégré/extra-financier ? Si oui, à quels standards fait-il référence (GRI, SASB…) et quelles informations clés sont présentées ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q10-2", qn: "10.2", text: "Comment l’entité communique ses engagements et résultats ESG auprès des parties prenantes, et ces informations sont-elles vérifiées ou assurées par un organisme tiers ?", type: "text", opts: [] },
  ],

  "Engagement des Parties Prenantes": [
    { id: "q11-1", qn: "11.1", text: "Les parties prenantes clés (salariés, clients, régulateurs, communauté) sont-elles identifiées et consultées ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
    { id: "q11-2", qn: "11.2", text: "Quelles sont les prochaines priorités ESG ou engagements prévus pour les 12 mois à venir ?", type: "text", opts: [] },
    { id: "q11-3", qn: "11.3", text: "Les priorités ESG pour les 12 prochains mois sont-elles alignées avec les attentes des parties prenantes et les engagements stratégiques ?", type: "text", opts: [] },
    { id: "q11-4", qn: "11.4", text: "Existe-t-il un plan de dialogue ou consultation régulière avec les parties prenantes clés ?", type: "radio", opts: ["Oui", "Non", "En cours"] },
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
     
 
      
        <div className="flex justify-center pt-[100px] pb-[100px]">
          <div className="w-full max-w-[800px] px-6">
            <div className="mb-8">
               
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Étape {stepId} sur 11</span>
                <span>{Math.round((stepId / 11) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div className="bg-[#06438a] h-2" style={{ width: `${(stepId / 11) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-8 border border-gray-200 ">
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
                            <span className="ml-3 text-sm sm:text-base">{opt}</span>
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
      
    </main>
  );
}