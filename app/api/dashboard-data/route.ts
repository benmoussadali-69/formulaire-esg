import { NextRequest, NextResponse } from 'next/server';

// Récupérer les données du fichier submit (simulation)
const submissions: any[] = [];

export async function GET(request: NextRequest) {
  try {
    // Récupérer les données du fichier submit
    const submitRes = await fetch(new URL('/api/submit', request.url).toString());
    const submitData = await submitRes.json();

    if (!submitData.success || !submitData.data) {
      return NextResponse.json(
        {
          respondents: [],
          responses: []
        },
        { status: 200 }
      );
    }

    // Transformer les données pour le dashboard
    const respondents = submitData.data.map((sub: any) => ({
      id: sub.respondent.id,
      company_name: sub.respondent.company_name,
      contact_first_name: sub.respondent.contact_first_name,
      contact_last_name: sub.respondent.contact_last_name,
      job_title: sub.respondent.job_title,
      email: sub.respondent.email,
      submitted_at: sub.respondent.submitted_at
    }));

    // Transformer les réponses ESG
    const responses = submitData.data.flatMap((sub: any, index: number) =>
      Object.entries(sub.esg).map(([questionId, answer]: [string, any]) => ({
        respondent_id: sub.respondent.id,
        question_id: questionId,
        question_text: getQuestionText(questionId),
        response_text: answer,
        input_type: getQuestionType(questionId)
      }))
    );

    return NextResponse.json(
      {
        respondents,
        responses
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);

    return NextResponse.json(
      {
        respondents: [],
        responses: []
      },
      { status: 200 }
    );
  }
}

// Fonction pour obtenir le texte de la question
function getQuestionText(questionId: string): string {
  const questions: Record<string, string> = {
    'q1-1': 'Votre entreprise dispose-t-elle d\'une stratégie ESG documentée ?',
    'q1-2': 'Un comité ou responsable ESG est-il dédié dans votre organisation ?',
    'q1-3': 'La gouvernance ESG est-elle intégrée au niveau du conseil d\'administration ?',
    'q1-4': 'Décrivez les objectifs ESG prioritaires de votre entreprise',
    'q1-5': 'Disposez-vous d\'un plan d\'action pour atteindre vos objectifs ESG ?',
    'q2-1': 'Décrivez votre processus d\'identification des risques ESG',
    'q2-2': 'Avez-vous effectué une analyse de matérialité ESG ?',
    'q2-3': 'Disposez-vous d\'une cartographie des risques ESG ?',
    'q2-4': 'Quels sont les principaux risques ESG identifiés ?',
    'q2-5': 'Avez-vous des indicateurs pour suivre les risques ESG ?',
    'q3-1': 'Avez-vous des objectifs de réduction des émissions carbone ?',
    'q3-2': 'Mesurez-vous votre empreinte carbone ?',
    'q3-3': 'Avez-vous une politique de gestion de l\'eau ?',
    'q3-4': 'Disposez-vous d\'une politique de gestion des déchets ?',
    'q3-5': 'Utilisez-vous des énergies renouvelables ?',
    'q4-1': 'Votre entreprise respecte-t-elle les standards internationaux du travail ?',
    'q4-2': 'Avez-vous une politique de santé et sécurité au travail ?',
    'q4-3': 'Proposez-vous un programme de formation et développement ?',
    'q4-4': 'Quel est votre taux de turnover des employés ?',
    'q4-5': 'Avez-vous une politique de rémunération équitable ?',
    'q5-1': 'Avez-vous une politique contre la discrimination ?',
    'q5-2': 'Disposez-vous d\'une politique d\'égalité homme-femme ?',
    'q5-3': 'Quel est le pourcentage de femmes dans l\'effectif ?',
    'q5-4': 'Avez-vous une politique de protection des droits humains ?',
    'q5-5': 'Avez-vous un mécanisme de signalement des abus ?',
    'q6-1': 'Effectuez-vous des audits ESG chez vos fournisseurs ?',
    'q6-2': 'Avez-vous un code de conduite pour les fournisseurs ?',
    'q6-3': 'Favorisez-vous les fournisseurs locaux ?',
    'q6-4': 'Avez-vous une politique de travail équitable dans la chaîne d\'approvisionnement ?',
    'q6-5': 'Évaluez-vous la performance ESG de vos fournisseurs ?',
    'q7-1': 'Vos produits/services sont-ils évalués selon des critères ESG ?',
    'q7-2': 'Disposez-vous d\'une politique de qualité et sécurité des produits ?',
    'q7-3': 'Informez-vous les clients sur l\'impact ESG de vos produits ?',
    'q7-4': 'Avez-vous des produits ou services durables/éco-responsables ?',
    'q7-5': 'Écoutez-vous les retours des clients sur l\'ESG ?',
    'q8-1': 'Avez-vous un code de conduite éthique ?',
    'q8-2': 'Avez-vous une politique anti-corruption documentée ?',
    'q8-3': 'Formez-vous vos employés à l\'éthique et la conformité ?',
    'q8-4': 'Avez-vous un système de dénonciation des violations ?',
    'q8-5': 'Avez-vous subi des sanctions ou amendes liées à la conformité ?',
    'q9-1': 'Participez-vous au développement des communautés locales ?',
    'q9-2': 'Avez-vous des programmes de responsabilité sociale ?',
    'q9-3': 'Contribuez-vous à l\'éducation ou à la formation locale ?',
    'q9-4': 'Avez-vous des projets d\'impact social ou environnemental ?',
    'q9-5': 'Décrivez vos initiatives communautaires principales',
    'q10-1': 'Publiez-vous un rapport ESG annuel ?',
    'q10-2': 'Avez-vous une politique de communication ESG ?',
    'q10-3': 'Communiquez-vous vos données ESG sur votre site web ?',
    'q10-4': 'Suivez-vous un cadre de reporting (GRI, SASB, TCFD, etc.) ?',
    'q10-5': 'Vos rapports ESG sont-ils auditées/certifiés ?',
    'q11-1': 'Consultez-vous vos parties prenantes pour votre stratégie ESG ?',
    'q11-2': 'Avez-vous identifié vos parties prenantes clés ?',
    'q11-3': 'Quel est votre plan d\'engagement avec les parties prenantes ?',
    'q11-4': 'Écoutez-vous les attentes de vos parties prenantes ?',
    'q11-5': 'Avez-vous des mécanismes de retour de vos parties prenantes ?'
  };

  return questions[questionId] || 'Question inconnue';
}

// Fonction pour obtenir le type de question
function getQuestionType(questionId: string): string {
  const textQuestions = ['q1-4', 'q2-1', 'q2-4', 'q4-4', 'q5-3', 'q9-5', 'q11-3'];
  return textQuestions.includes(questionId) ? 'text' : 'radio';
}