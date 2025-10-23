// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Respondent = {
  id: number;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  job_title: string | null;
  email: string | null;
  submitted_at: string;
};

type ResponseItem = {
  respondent_id: number;
  question_id: number;
  question_text: string;
  response_text: string | null;
  input_type: string;
};

// Calculer le score ESG
const calculateESGScore = (responses: ResponseItem[]): { score: number; percentage: number } => {
  if (responses.length === 0) return { score: 0, percentage: 0 };

  let positive = 0;
  responses.forEach(r => {
    if (r.input_type === 'text') {
      if (r.response_text && r.response_text.trim() !== '') positive++;
    } else {
      // radio/select
      if (r.response_text === 'Oui') positive++;
    }
  });

  const percentage = Math.round((positive / responses.length) * 100);
  return { score: positive, percentage };
};

const getScoreColor = (percentage: number): string => {
  if (percentage >= 75) return 'text-green-700 bg-green-100';
  if (percentage >= 50) return 'text-yellow-700 bg-yellow-100';
  return 'text-red-700 bg-red-100';
};

const getScoreLabel = (percentage: number): string => {
  if (percentage >= 75) return 'Bon';
  if (percentage >= 50) return 'Moyen';
  return 'Faible';
};

export default function DashboardPage() {
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard-data');
        const data = await res.json();
        setRespondents(data.respondents || []);
        setResponses(data.responses || []);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Regrouper les réponses par société
  const groupedData = respondents.map(r => {
    const respList = responses.filter(resp => resp.respondent_id === r.id);
    const { percentage } = calculateESGScore(respList);
    return { ...r, responses: respList, esgPercentage: percentage };
  });

  // Générer PDF individuel avec score
  const downloadSinglePDF = async (data: typeof groupedData[0]) => {
    const content = `
      <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 210mm;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
          Rapport ESG – ${data.company_name}
        </h1>
        <p style="color: #666; margin-bottom: 20px;">
          Contact : ${data.contact_first_name} ${data.contact_last_name} • ${data.job_title || '—'} • ${data.email || '—'}<br />
          Date : ${new Date(data.submitted_at).toLocaleString('fr-FR')}
        </p>

        <!-- Encadré du score -->
        <div style="margin: 20px 0; padding: 12px; border-radius: 8px; ${
          data.esgPercentage >= 75
            ? 'background-color: #dcfce7; border: 1px solid #22c55e;'
            : data.esgPercentage >= 50
            ? 'background-color: #fef9c3; border: 1px solid #eab308;'
            : 'background-color: #fee2e2; border: 1px solid #ef4444;'
        }">
          <strong>Score ESG : ${data.esgPercentage}%</strong><br />
          Niveau : ${
            data.esgPercentage >= 75
              ? 'Bon'
              : data.esgPercentage >= 50
              ? 'Moyen'
              : 'Faible'
          }
        </div>

        <div style="margin-top: 20px;">
          ${data.responses.map(resp => `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: bold; color: #333;">${resp.question_text}</div>
              <div style="color: #555; margin-top: 4px;">${resp.response_text || '—'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = content;
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm';
    document.body.appendChild(tempContainer);

    try {
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        alert('Contenu vide – impossible de générer le PDF.');
        return;
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`rapport-esg-${data.company_name.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Erreur PDF:', error);
      alert('Erreur lors de la génération du PDF.');
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Dashboard ESG</h1>

        {/* Résumé global */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 Vue d'ensemble</h2>
          <div className="text-4xl font-bold text-indigo-700">{respondents.length}</div>
          <div className="text-gray-600">Formulaires remplis</div>
        </div>

        {/* Liste des entreprises avec score */}
        <div className="space-y-6">
          {groupedData.map(data => {
            const colorClass = getScoreColor(data.esgPercentage);
            const label = getScoreLabel(data.esgPercentage);
            return (
              <div key={data.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{data.company_name}</h2>
                      <p className="text-gray-600">
                        {data.contact_first_name} {data.contact_last_name} • {data.job_title || '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full font-bold ${colorClass}`}>
                        {data.esgPercentage}% – {label}
                      </div>
                      <button
                        onClick={() => downloadSinglePDF(data)}
                        className="mt-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
                      >
                        📄 PDF avec score
                      </button>
                    </div>
                  </div>

                  {/* Réponses */}
                  <div className="mt-4 space-y-3">
                    {data.responses.map((resp, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded">
                        <div className="font-medium text-gray-800">{resp.question_text}</div>
                        <div className="mt-1 text-gray-700">{resp.response_text || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {respondents.length === 0 && (
          <div className="text-center py-10 text-gray-500">Aucune réponse soumise.</div>
        )}
      </div>
    </div>
  );
}