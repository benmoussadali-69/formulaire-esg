'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KYCPage() {
  const [kyc, setKyc] = useState({
    company_name: '',
    contact_first_name: '',
    contact_last_name: '',
    job_title: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKyc(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!kyc.company_name.trim()) newErrors.company_name = 'Nom de l\'entreprise requis';
    if (!kyc.contact_first_name.trim()) newErrors.contact_first_name = 'Prénom requis';
    if (!kyc.contact_last_name.trim()) newErrors.contact_last_name = 'Nom requis';
    if (!kyc.job_title.trim()) newErrors.job_title = 'Titre de poste requis';
    if (!kyc.email.trim()) newErrors.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kyc.email)) newErrors.email = 'Email invalide';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    sessionStorage.setItem('kycData', JSON.stringify(kyc));
    sessionStorage.setItem('esgResponses', JSON.stringify({}));

    router.push('/esg/1');
  };

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
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-6 text-[#06438a]">Informations KYC</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={kyc.company_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#06438a] ${
                    errors.company_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.company_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="contact_first_name"
                  value={kyc.contact_first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#06438a] ${
                    errors.contact_first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.contact_first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Nom *
                </label>
                <input
                  type="text"
                  name="contact_last_name"
                  value={kyc.contact_last_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#06438a] ${
                    errors.contact_last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.contact_last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Titre de poste *
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={kyc.job_title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#06438a] ${
                    errors.job_title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.job_title && (
                  <p className="text-red-500 text-sm mt-1">{errors.job_title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={kyc.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#06438a] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="exemple@entreprise.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-[#06438a] text-white font-semibold text-base cursor-pointer border-none mt-6"
              >
                Commencer le questionnaire ESG
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}