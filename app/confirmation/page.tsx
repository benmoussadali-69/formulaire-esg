import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-[#06438a]">
        <div className="pl-[310px] pr-[310px] pt-[150px] pb-[150px] text-white">
          <h1 className="text-4xl font-semibold mb-2 leading-tight">
            ÉVALUATION PRÉLIMINAIRE DE LA CONFORMITÉ<br />
            AU RÉFÉRENTIEL ESG 1000®
          </h1>
          <div className="w-12 h-1 bg-white mt-4"></div>
        </div>
      </div>

      <div className="pl-[310px] pr-[310px] pt-[150px] pb-[150px]">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-none shadow-lg p-12 text-center border border-gray-200">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-none flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Merci !</h1>
            </div>

            <p className="text-gray-700 text-lg mb-8">
              Vos réponses ont été enregistrées avec succès.<br />
              <span className="font-medium">Notre équipe vous contactera prochainement.</span>
            </p>

            <div className="bg-gray-50 rounded-none p-6 mb-8 text-center border border-gray-200">
              <p className="text-gray-600 text-sm">
                Un email de confirmation a été envoyé à votre adresse email.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href="/kyc"
                className="py-3 px-6 bg-[#06438a] text-white font-semibold text-base cursor-pointer border-none inline-block"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}