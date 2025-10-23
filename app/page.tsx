// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [kyc, setKyc] = useState({
    company_name: '',
    contact_first_name: '',
    contact_last_name: '',
    job_title: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKyc(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    localStorage.setItem('kycData', JSON.stringify(kyc));
    router.push('/esg');
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Formulaire ESG</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Veuillez remplir les informations de contact de votre entreprise.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-left">🏢 Informations KYC</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(['company_name', 'contact_first_name', 'contact_last_name', 'job_title', 'email'] as const).map(field => (
              <div key={field}>
                <label className="block text-sm font-medium mb-2 capitalize">
                  {field.replace('_', ' ')} *
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={kyc[field]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                />
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Continuer vers le questionnaire ESG →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}