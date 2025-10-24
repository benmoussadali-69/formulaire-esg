'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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

const MOCK_QUESTIONS: Record<string, any[]> = {
  "Gouvernance et Stratégie ESG": [
    {
      id: "q1-1",
      question_number: "1.1",
      question_text: "Votre entreprise dispose-t-elle d'une stratégie ESG documentée ?",
      input_type: "radio",
      options: ["Oui", "Non", "En cours de développement"]
    },
    {
      id: "q1-2",
      question_number: "1.2",
      question_text: "Un comité ou responsable ESG est-il dédié dans votre organisation ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q1-3",
      question_number: "1.3",
      question_text: "La gouvernance ESG est-elle intégrée au niveau du conseil d'administration ?",
      input_type: "radio",
      options: ["Oui", "Non", "Partiellement"]
    },
    {
      id: "q1-4",
      question_number: "1.4",
      question_text: "Décrivez les objectifs ESG prioritaires de votre entreprise",
      input_type: "text"
    },
    {
      id: "q1-5",
      question_number: "1.5",
      question_text: "Disposez-vous d'un plan d'action pour atteindre vos objectifs ESG ?",
      input_type: "radio",
      options: ["Oui", "Non", "En développement"]
    }
  ],
  "Gestion des Risques et Matérialité": [
    {
      id: "q2-1",
      question_number: "2.1",
      question_text: "Décrivez votre processus d'identification des risques ESG",
      input_type: "text"
    },
    {
      id: "q2-2",
      question_number: "2.2",
      question_text: "Avez-vous effectué une analyse de matérialité ESG ?",
      input_type: "radio",
      options: ["Oui", "Non", "En cours"]
    },
    {
      id: "q2-3",
      question_number: "2.3",
      question_text: "Disposez-vous d'une cartographie des risques ESG ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q2-4",
      question_number: "2.4",
      question_text: "Quels sont les principaux risques ESG identifiés ?",
      input_type: "text"
    },
    {
      id: "q2-5",
      question_number: "2.5",
      question_text: "Avez-vous des indicateurs pour suivre les risques ESG ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    }
  ],
  "Politiques Environnementales": [
    {
      id: "q3-1",
      question_number: "3.1",
      question_text: "Avez-vous des objectifs de réduction des émissions carbone ?",
      input_type: "radio",
      options: ["Oui", "Non", "En cours"]
    },
    {
      id: "q3-2",
      question_number: "3.2",
      question_text: "Mesurez-vous votre empreinte carbone ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q3-3",
      question_number: "3.3",
      question_text: "Avez-vous une politique de gestion de l'eau ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q3-4",
      question_number: "3.4",
      question_text: "Disposez-vous d'une politique de gestion des déchets ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q3-5",
      question_number: "3.5",
      question_text: "Utilisez-vous des énergies renouvelables ?",
      input_type: "radio",
      options: ["Oui", "Non", "Partiellement"]
    }
  ],
  "Capital Humain & Conditions de Travail": [
    {
      id: "q4-1",
      question_number: "4.1",
      question_text: "Votre entreprise respecte-t-elle les standards internationaux du travail ?",
      input_type: "radio",
      options: ["Oui", "Non", "Partiellement"]
    },
    {
      id: "q4-2",
      question_number: "4.2",
      question_text: "Avez-vous une politique de santé et sécurité au travail ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q4-3",
      question_number: "4.3",
      question_text: "Proposez-vous un programme de formation et développement ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q4-4",
      question_number: "4.4",
      question_text: "Quel est votre taux de turnover des employés ?",
      input_type: "text"
    },
    {
      id: "q4-5",
      question_number: "4.5",
      question_text: "Avez-vous une politique de rémunération équitable ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    }
  ],
  "Droits humain et Equité": [
    {
      id: "q5-1",
      question_number: "5.1",
      question_text: "Avez-vous une politique contre la discrimination ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q5-2",
      question_number: "5.2",
      question_text: "Disposez-vous d'une politique d'égalité homme-femme ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q5-3",
      question_number: "5.3",
      question_text: "Quel est le pourcentage de femmes dans l'effectif ?",
      input_type: "text"
    },
    {
      id: "q5-4",
      question_number: "5.4",
      question_text: "Avez-vous une politique de protection des droits humains ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q5-5",
      question_number: "5.5",
      question_text: "Avez-vous un mécanisme de signalement des abus ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    }
  ],
  "Chaîne de Valeur & Fournisseurs": [
    {
      id: "q6-1",
      question_number: "6.1",
      question_text: "Effectuez-vous des audits ESG chez vos fournisseurs ?",
      input_type: "radio",
      options: ["Oui", "Non", "Sélectivement"]
    },
    {
      id: "q6-2",
      question_number: "6.2",
      question_text: "Avez-vous un code de conduite pour les fournisseurs ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q6-3",
      question_number: "6.3",
      question_text: "Favorisez-vous les fournisseurs locaux ?",
      input_type: "radio",
      options: ["Oui", "Non", "Partiellement"]
    },
    {
      id: "q6-4",
      question_number: "6.4",
      question_text: "Avez-vous une politique de travail équitable dans la chaîne d'approvisionnement ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q6-5",
      question_number: "6.5",
      question_text: "Évaluez-vous la performance ESG de vos fournisseurs ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    }
  ],
  "Produits, Services & Clients": [
    {
      id: "q7-1",
      question_number: "7.1",
      question_text: "Vos produits/services sont-ils évalués selon des critères ESG ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q7-2",
      question_number: "7.2",
      question_text: "Disposez-vous d'une politique de qualité et sécurité des produits ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q7-3",
      question_number: "7.3",
      question_text: "Informez-vous les clients sur l'impact ESG de vos produits ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q7-4",
      question_number: "7.4",
      question_text: "Avez-vous des produits ou services durables/éco-responsables ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q7-5",
      question_number: "7.5",
      question_text: "Écoutez-vous les retours des clients sur l'ESG ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    }
  ],
  "Éthique, Conformité & Lutte Contre la Corruption": [
    {
      id: "q8-1",
      question_number: "8.1",
      question_text: "Avez-vous un code de conduite éthique ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q8-2",
      question_number: "8.2",
      question_text: "Avez-vous une politique anti-corruption documentée ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q8-3",
      question_number: "8.3",
      question_text: "Formez-vous vos employés à l'éthique et la conformité ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q8-4",
      question_number: "8.4",
      question_text: "Avez-vous un système de dénonciation des violations ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q8-5",
      question_number: "8.5",
      question_text: "Avez-vous subi des sanctions ou amendes liées à la conformité ?",
      input_type: "radio",
      options: ["Non", "Oui"]
    }
  ],
  "Communautés & Développement Local": [
    {
      id: "q9-1",
      question_number: "9.1",
      question_text: "Participez-vous au développement des communautés locales ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q9-2",
      question_number: "9.2",
      question_text: "Avez-vous des programmes de responsabilité sociale ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q9-3",
      question_number: "9.3",
      question_text: "Contribuez-vous à l'éducation ou à la formation locale ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q9-4",
      question_number: "9.4",
      question_text: "Avez-vous des projets d'impact social ou environnemental ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q9-5",
      question_number: "9.5",
      question_text: "Décrivez vos initiatives communautaires principales",
      input_type: "text"
    }
  ],
  "Communication, Reporting & Transparence": [
    {
      id: "q10-1",
      question_number: "10.1",
      question_text: "Publiez-vous un rapport ESG annuel ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q10-2",
      question_number: "10.2",
      question_text: "Avez-vous une politique de communication ESG ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q10-3",
      question_number: "10.3",
      question_text: "Communiquez-vous vos données ESG sur votre site web ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q10-4",
      question_number: "10.4",
      question_text: "Suivez-vous un cadre de reporting (GRI, SASB, TCFD, etc.) ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q10-5",
      question_number: "10.5",
      question_text: "Vos rapports ESG sont-ils auditées/certifiés ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    }
  ],
  "Engagement des Parties Prenantes": [
    {
      id: "q11-1",
      question_number: "11.1",
      question_text: "Consultez-vous vos parties prenantes pour votre stratégie ESG ?",
      input_type: "radio",
      options: ["Oui", "Non", "En cours"]
    },
    {
      id: "q11-2",
      question_number: "11.2",
      question_text: "Avez-vous identifié vos parties prenantes clés ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q11-3",
      question_number: "11.3",
      question_text: "Quel est votre plan d'engagement avec les parties prenantes ?",
      input_type: "text"
    },
    {
      id: "q11-4",
      question_number: "11.4",
      question_text: "Écoutez-vous les attentes de vos parties prenantes ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    },
    {
      id: "q11-5",
      question_number: "11.5",
      question_text: "Avez-vous des mécanismes de retour de vos parties prenantes ?",
      input_type: "radio",
      options: ["Oui", "Non"]
    }
  ]
};

export default function ESGStepPage() {
  const params = useParams();
  const id = params?.id;
  const stepId = Array.isArray(id) ? Number(id[0]) : Number(id);
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [esgResponses, setEsgResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [kyc, setKyc] = useState<any>(null);

  useEffect(() => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') return;

    // Vérifier que l'ID est valide
    if (!stepId || isNaN(stepId) || stepId < 1 || stepId > 11) {
      router.push('/kyc');
      return;
    }

    // Récupérer les données de sessionStorage
    const kycData = sessionStorage.getItem('kycData');
    const savedResponses = sessionStorage.getItem('esgResponses');

    if (!kycData) {
      router.push('/kyc');
      return;
    }

    try {
      setKyc(JSON.parse(kycData));
      if (savedResponses) {
        setEsgResponses(JSON.parse(savedResponses));
      }
    } catch (error) {
      console.error('Erreur parsing données:', error);
      router.push('/kyc');
      return;
    }

    // Charger les questions
    setQuestions(Object.entries(MOCK_QUESTIONS).flatMap(([section, qs]) =>
      qs.map(q => ({ ...q, section }))
    ));

    setIsLoading(false);
  }, [stepId, router]);

  const currentSection = SECTIONS[stepId - 1];
  const currentQuestions = questions.filter(q => q.section === currentSection);

  const handleResponseChange = (questionId: string, value: string) => {
    const newResponses = { ...esgResponses, [questionId]: value };
    setEsgResponses(newResponses);
    sessionStorage.setItem('esgResponses', JSON.stringify(newResponses));
  };

  const handleNext = () => {
    const unanswered = currentQuestions.some(q => !esgResponses[q.id]);
    if (unanswered) {
      alert('Veuillez répondre à toutes les questions de cette section.');
      return;
    }

    if (stepId < 11) {
      router.push(`/esg/${stepId + 1}`);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (stepId > 1) {
      router.push(`/esg/${stepId - 1}`);
    } else {
      router.push('/kyc');
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc, esg: esgResponses }),
      });

      if (res.ok) {
        sessionStorage.removeItem('kycData');
        sessionStorage.removeItem('esgResponses');
        router.push('/confirmation');
      } else {
        alert('Erreur lors de la soumission.');
      }
    } catch (error) {
      alert('Erreur réseau.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Section non trouvée</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-[#06438a]">
        <div className="pl-[310px] pr-[310px] pt-[80px] pb-[80px] text-white">
          <h1 className="text-3xl font-semibold leading-tight mb-3">
            ÉVALUATION PRÉLIMINAIRE DE LA CONFORMITÉ<br />
            <span className="text-3xl font-semibold">AU RÉFÉRENTIEL ESG 1000®</span>
          </h1>
          <div className="w-12 h-1 bg-white mt-4"></div>
        </div>
      </div>

      <div className="pl-[310px] pr-[310px] pt-[80px] pb-[80px]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Étape {stepId} sur 11</span>
              <span>{Math.round((stepId / 11) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#06438a] h-2 rounded-full transition-all"
                style={{ width: `${(stepId / 11) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-[#06438a]">
                {stepId}. {currentSection}
              </h2>
            </div>

            <div className="space-y-6">
              {currentQuestions.length > 0 ? (
                currentQuestions.map(q => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-3">
                      {q.question_number && `${q.question_number} – `}{q.question_text}
                    </h3>
                    {q.input_type === 'text' ? (
                      <textarea
                        value={esgResponses[q.id] || ''}
                        onChange={e => handleResponseChange(q.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#06438a]"
                        rows={4}
                        placeholder="Votre reponse..."
                        style={{ borderRadius: '0' }}
                      />
                    ) : (
                      <div className="space-y-2">
                        {(q.options || []).sort((a: string, b: string) => {
                          const order = ['Oui', 'Non'];
                          const aIndex = order.indexOf(a);
                          const bIndex = order.indexOf(b);
                          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                          if (aIndex !== -1) return -1;
                          if (bIndex !== -1) return 1;
                          return a.localeCompare(b);
                        }).map((opt: string) => (
                          <label key={opt} className="flex items-center cursor-pointer p-2">
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              checked={esgResponses[q.id] === opt}
                              onChange={() => handleResponseChange(q.id, opt)}
                              className="h-4 w-4 text-[#06438a] cursor-pointer"
                            />
                            <span className="ml-3 text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Aucune question disponible.</p>
              )}
            </div>

            <div className="flex justify-between mt-8 gap-4">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex-1 py-3 px-6 border-2 border-[#06438a] bg-white text-[#06438a] font-semibold text-base cursor-pointer transition-none"
                style={{ cursor: 'pointer' }}
              >
                Précédent
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 px-6 bg-[#06438a] text-white font-semibold text-base cursor-pointer transition-none"
                style={{ cursor: 'pointer', border: 'none' }}
              >
                {stepId === 11 ? 'Soumettre le questionnaire' : 'Suivant'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}