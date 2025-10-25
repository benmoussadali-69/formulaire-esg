'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-white">

          <PageHeader />
      

      <div className="pl-[310px] pr-[310px] pt-[100px] pb-[100px]">
        <div className="flex justify-center">
          <div>
            <div className="bg-white p-12 text-center border border-gray-200">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Merci !</h2>
              <p className="text-gray-700 text-lg mb-8">
                Vos réponses ont été enregistrées avec succès.<br />
                <span className="font-medium">Notre équipe vous contactera prochainement.</span>
              </p>

              <Link
                href="/kyc"
                className="btn-primary inline-block"
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