'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Respondent = {
  id: number;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  job_title: string;
  email: string;
  submitted_at: string;
};

type ResponseItem = {
  respondent_id: number;
  question_id: string;
  question_text: string;
  response_text: string;
  input_type: string;
};

const calculateESGScore = (responses: ResponseItem[]): { score: number; percentage: number } => {
  if (responses.length === 0) return { score: 0, percentage: 0 };

  let positive = 0;
  responses.forEach(r => {
    if (r.input_type === 'text') {
      if (r.response_text && r.response_text.trim() !== '') positive++;
    } else {
      if (r.response_text === 'Oui') positive++;
    }
  });

  const percentage = Math.round((positive / responses.length) * 100);
  return { score: positive, percentage };
};

const getScoreColor = (percentage: number): { bg: string; text: string; label: string } => {
  if (percentage >= 75) return { bg: '#dcfce7', text: '#166534', label: 'Excellent' };
  if (percentage >= 50) return { bg: '#fef3c7', text: '#92400e', label: 'Bon' };
  return { bg: '#fee2e2', text: '#991b1b', label: 'A ameliorer' };
};

const getQuestionText = (questionId: string): string => {
  const questions: Record<string, string> = {
    'q1-1': 'Votre entreprise dispose-t-elle d\'une strategie ESG documentee ?',
    'q1-2': 'Un comite ou responsable ESG est-il dedie dans votre organisation ?',
    'q1-3': 'La gouvernance ESG est-elle integree au niveau du conseil d\'administration ?',
    'q1-4': 'Decrivez les objectifs ESG prioritaires de votre entreprise',
    'q1-5': 'Disposez-vous d\'un plan d\'action pour atteindre vos objectifs ESG ?',
    'q2-1': 'Decrivez votre processus d\'identification des risques ESG',
    'q2-2': 'Avez-vous effectue une analyse de materialite ESG ?',
    'q2-3': 'Disposez-vous d\'une cartographie des risques ESG ?',
    'q2-4': 'Quels sont les principaux risques ESG identifies ?',
    'q2-5': 'Avez-vous des indicateurs pour suivre les risques ESG ?',
    'q3-1': 'Avez-vous des objectifs de reduction des emissions carbone ?',
    'q3-2': 'Mesurez-vous votre empreinte carbone ?',
    'q3-3': 'Avez-vous une politique de gestion de l\'eau ?',
    'q3-4': 'Disposez-vous d\'une politique de gestion des dechets ?',
    'q3-5': 'Utilisez-vous des energies renouvelables ?',
    'q4-1': 'Votre entreprise respecte-t-elle les standards internationaux du travail ?',
    'q4-2': 'Avez-vous une politique de sante et securite au travail ?',
    'q4-3': 'Proposez-vous un programme de formation et developpement ?',
    'q4-4': 'Quel est votre taux de turnover des employes ?',
    'q4-5': 'Avez-vous une politique de remuneration equitable ?',
    'q5-1': 'Avez-vous une politique contre la discrimination ?',
    'q5-2': 'Disposez-vous d\'une politique d\'egalite homme-femme ?',
    'q5-3': 'Quel est le pourcentage de femmes dans l\'effectif ?',
    'q5-4': 'Avez-vous une politique de protection des droits humains ?',
    'q5-5': 'Avez-vous un mecanisme de signalement des abus ?',
    'q6-1': 'Effectuez-vous des audits ESG chez vos fournisseurs ?',
    'q6-2': 'Avez-vous un code de conduite pour les fournisseurs ?',
    'q6-3': 'Favorisez-vous les fournisseurs locaux ?',
    'q6-4': 'Avez-vous une politique de travail equitable dans la chaine d\'approvisionnement ?',
    'q6-5': 'Evaluez-vous la performance ESG de vos fournisseurs ?',
    'q7-1': 'Vos produits/services sont-ils evalues selon des criteres ESG ?',
    'q7-2': 'Disposez-vous d\'une politique de qualite et securite des produits ?',
    'q7-3': 'Informez-vous les clients sur l\'impact ESG de vos produits ?',
    'q7-4': 'Avez-vous des produits ou services durables/eco-responsables ?',
    'q7-5': 'Ecoutez-vous les retours des clients sur l\'ESG ?',
    'q8-1': 'Avez-vous un code de conduite ethique ?',
    'q8-2': 'Avez-vous une politique anti-corruption documentee ?',
    'q8-3': 'Formez-vous vos employes a l\'ethique et la conformite ?',
    'q8-4': 'Avez-vous un systeme de denonciation des violations ?',
    'q8-5': 'Avez-vous subi des sanctions ou amendes liees a la conformite ?',
    'q9-1': 'Participez-vous au developpement des communautes locales ?',
    'q9-2': 'Avez-vous des programmes de responsabilite sociale ?',
    'q9-3': 'Contribuez-vous a l\'education ou a la formation locale ?',
    'q9-4': 'Avez-vous des projets d\'impact social ou environnemental ?',
    'q9-5': 'Decrivez vos initiatives communautaires principales',
    'q10-1': 'Publiez-vous un rapport ESG annuel ?',
    'q10-2': 'Avez-vous une politique de communication ESG ?',
    'q10-3': 'Communiquez-vous vos donnees ESG sur votre site web ?',
    'q10-4': 'Suivez-vous un cadre de reporting (GRI, SASB, TCFD, etc.) ?',
    'q10-5': 'Vos rapports ESG sont-ils audites/certifies ?',
    'q11-1': 'Consultez-vous vos parties prenantes pour votre strategie ESG ?',
    'q11-2': 'Avez-vous identifie vos parties prenantes cles ?',
    'q11-3': 'Quel est votre plan d\'engagement avec les parties prenantes ?',
    'q11-4': 'Ecoutez-vous les attentes de vos parties prenantes ?',
    'q11-5': 'Avez-vous des mecanismes de retour de vos parties prenantes ?'
  };

  return questions[questionId] || 'Question inconnue';
};

const getQuestionType = (questionId: string): string => {
  const textQuestions = ['q1-4', 'q2-1', 'q2-4', 'q4-4', 'q5-3', 'q9-5', 'q11-3'];
  return textQuestions.includes(questionId) ? 'text' : 'radio';
};

const generatePDF = async (data: any): Promise<Blob> => {
  const calcScore = calculateESGScore(data.responses);
  const percentage = calcScore.percentage;
  const colors = getScoreColor(percentage);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { padding: 20mm; max-width: 210mm; }
          .header { background: #06438a; color: white; padding: 20mm; margin: -20mm -20mm 20mm -20mm; text-align: center; }
          .header h1 { font-size: 22px; margin-bottom: 8px; }
          .header p { font-size: 11px; opacity: 0.9; }
          .score-box { background: ${colors.bg}; color: ${colors.text}; padding: 15mm; margin-bottom: 20mm; text-align: center; border: 2px solid ${colors.text}; }
          .score-box .percentage { font-size: 42px; font-weight: bold; }
          .score-box .label { font-size: 16px; margin-top: 8px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15mm; margin-bottom: 20mm; font-size: 11px; }
          .info-item { background: #f5f5f5; padding: 10mm; border: 1px solid #ddd; }
          .info-label { font-weight: bold; color: #666; margin-bottom: 4px; }
          .info-value { color: #333; }
          .questions-section h2 { font-size: 16px; margin-bottom: 15mm; color: #06438a; margin-top: 20mm; }
          .question-item { margin-bottom: 10mm; }
          .question-text { font-weight: bold; color: #333; margin-bottom: 6px; font-size: 11px; }
          .answer-text { color: #555; margin-left: 5mm; font-size: 10px; background: #f9f9f9; padding: 6mm; border-left: 3mm solid #06438a; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RAPPORT D EVALUATION ESG</h1>
          <p>Evaluation preliminaire de la conformite au referentiel ESG 1000</p>
        </div>

        <div class="container">
          <div class="score-box">
            <div class="percentage">${percentage}%</div>
            <div class="label">${colors.label}</div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Entreprise</div>
              <div class="info-value">${data.company_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Contact</div>
              <div class="info-value">${data.contact_first_name} ${data.contact_last_name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Poste</div>
              <div class="info-value">${data.job_title}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${data.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date de soumission</div>
              <div class="info-value">${new Date(data.submitted_at).toLocaleDateString('fr-FR')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Questions repondues</div>
              <div class="info-value">${data.responses.length}</div>
            </div>
          </div>

          <div class="questions-section">
            <h2>Detail des reponses</h2>
            ${data.responses.map((r: ResponseItem, i: number) => `
              <div class="question-item">
                <div class="question-text">${i + 1}. ${r.question_text}</div>
                <div class="answer-text">${r.response_text || '-'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
    </html>
  `;

  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.position = 'fixed';
  element.style.top = '-9999px';
  element.style.left = '-9999px';
  element.style.width = '210mm';
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const pdfBlob = pdf.output('blob');
    return pdfBlob as Blob;
  } finally {
    document.body.removeChild(element);
  }
};

export default function DashboardPage() {
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard-data');
        const data = await res.json();

        if (data.success && data.data) {
          const resps = data.data.map((sub: any) => sub.respondent);
          const respsList = data.data.flatMap((sub: any) =>
            Object.entries(sub.esg).map(([questionId, answer]: [string, any]) => ({
              respondent_id: sub.respondent.id,
              question_id: questionId,
              question_text: getQuestionText(questionId),
              response_text: answer,
              input_type: getQuestionType(questionId)
            }))
          );

          setRespondents(resps);
          setResponses(respsList);
  
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const groupedData = respondents.map(r => {
    const respList = responses.filter(resp => resp.respondent_id === r.id);
    const scoreCalc = calculateESGScore(respList);
    return { ...r, responses: respList, esgPercentage: scoreCalc.percentage };
  });

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const downloadSinglePDF = async (data: any) => {
    try {
      setDownloading(true);
      const pdfBlob = await generatePDF(data);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-esg-${data.company_name.replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur PDF');
    } finally {
      setDownloading(false);
    }
  };

  const downloadMultiplePDFs = async () => {
    if (selectedIds.size === 0) {
      alert('Selectionnez au moins un formulaire');
      return;
    }

    try {
      setDownloading(true);
      const selectedData = groupedData.filter(d => selectedIds.has(d.id));

      for (const data of selectedData) {
        await downloadSinglePDF(data);
      }

      setSelectedIds(new Set());
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur download');
    } finally {
      setDownloading(false);
    }
  };

  const downloadAllPDFs = async () => {
    try {
      setDownloading(true);

      for (const data of groupedData) {
        await downloadSinglePDF(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-[#06438a]">
          <div className="pl-[310px] pr-[310px] pt-[150px] pb-[150px] text-white">
            <h1 className="text-4xl font-semibold mb-2">TABLEAU DE BORD - RESULTATS ESG</h1>
            <div className="w-12 h-1 bg-white mt-4"></div>
          </div>
        </div>
        <div className="pl-[310px] pr-[310px] pt-[150px] pb-[150px]">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-[#06438a]">
        <div className="pl-[310px] pr-[310px] pt-[150px] pb-[150px] text-white">
          <h1 className="text-4xl font-semibold mb-2">TABLEAU DE BORD - RESULTATS ESG</h1>
          <div className="w-12 h-1 bg-white mt-4"></div>
        </div>
      </div>

      <div className="pl-[310px] pr-[310px] pt-[150px] pb-[150px]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-6 border border-gray-200 text-center">
              <div className="text-4xl font-bold text-[#06438a] mb-2">{respondents.length}</div>
              <div className="text-gray-600 text-sm">Formulaires recus</div>
            </div>
            <div className="bg-gray-50 p-6 border border-gray-200 text-center">
              <div className="text-4xl font-bold text-[#06438a] mb-2">{responses.length}</div>
              <div className="text-gray-600 text-sm">Reponses totales</div>
            </div>
            <div className="bg-gray-50 p-6 border border-gray-200 text-center">
              <div className="text-4xl font-bold text-[#06438a] mb-2">
                {respondents.length > 0 ? Math.round(groupedData.reduce((sum: number, d: any) => sum + d.esgPercentage, 0) / respondents.length) : 0}%
              </div>
              <div className="text-gray-600 text-sm">Score moyen</div>
            </div>
          </div>

          {respondents.length > 0 && (
            <div className="mb-8 flex gap-4">
              <button
                onClick={downloadAllPDFs}
                disabled={downloading}
                className="py-3 px-6 bg-[#06438a] text-white font-semibold cursor-pointer border-none"
              >
                Telecharger tous ({respondents.length})
              </button>
              {selectedIds.size > 0 && (
                <button
                  onClick={downloadMultiplePDFs}
                  disabled={downloading}
                  className="py-3 px-6 bg-green-600 text-white font-semibold cursor-pointer border-none"
                >
                  Telecharger selectionnes ({selectedIds.size})
                </button>
              )}
            </div>
          )}

          {respondents.length === 0 ? (
            <div className="bg-white p-12 text-center border border-gray-200">
              <p className="text-gray-500 text-lg">Aucun formulaire recu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedData.map(data => {
                const colors = getScoreColor(data.esgPercentage);
                const isExpanded = expandedId === data.id;
                const isSelected = selectedIds.has(data.id);

                return (
                  <div key={data.id} className="bg-white border border-gray-200 flex">
                    <div className="w-16 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelect(data.id)}
                        className="w-5 h-5"
                        style={{ accentColor: '#06438a' }}
                      />
                    </div>

                    <div className="flex-1">
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : data.id)}
                        className="p-8 cursor-pointer bg-gray-50 hover:bg-gray-100 border-b border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-2xl font-semibold">{data.company_name}</h3>
                              <div
                                className="px-4 py-2 font-bold text-sm"
                                style={{ backgroundColor: colors.bg, color: colors.text, border: `2px solid ${colors.text}` }}
                              >
                                {data.esgPercentage}% - {colors.label}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-2">
                              Contact: {data.contact_first_name} {data.contact_last_name} - {data.job_title}
                            </p>
                            <p className="text-gray-600 text-sm">Email: {data.email}</p>
                            <p className="text-gray-600 text-sm mt-2">Date: {new Date(data.submitted_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div className="text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadSinglePDF(data);
                              }}
                              className="py-2 px-4 bg-[#06438a] text-white font-semibold text-sm cursor-pointer border-none mb-2"
                            >
                              Telecharger
                            </button>
                            <div className="text-2xl text-gray-400">{isExpanded ? 'A' : 'V'}</div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-8 bg-white border-t border-gray-200">
                          <h4 className="text-lg font-semibold text-[#06438a] mb-6">Reponses ({data.responses.length})</h4>
                          <div className="space-y-4">
                            {data.responses.map((resp, idx) => (
                              <div key={idx} className="bg-gray-50 p-4 border border-gray-200">
                                <h5 className="font-medium text-gray-800 mb-2">{idx + 1}. {resp.question_text}</h5>
                                <p className="text-gray-700 text-sm">{resp.response_text || '-'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}