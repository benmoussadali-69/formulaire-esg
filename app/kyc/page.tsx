'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
};

export default function KYCPage() {
  const [kyc, setKyc] = useState({
    company_name: '',
    contact_first_name: '',
    contact_last_name: '',
    job_title: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKyc(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
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
    if (!validateForm()) return;
    setLoading(true);
    safeLocalStorage.setItem('kycData', JSON.stringify(kyc));
    safeLocalStorage.setItem('esgResponses', JSON.stringify({}));
    router.push('/esg/1');
  };

  return (
    <main className="min-h-screen bg-white">
      
          <PageHeader />
       
      <div className="pb-[50px]"></div>
      <div className="pl-[310px] pr-[310px] pt-[100px] pb-[100px]">
        <div className="flex justify-center">
          <div className="w-full max-w-[630px]">
            <div className="bg-white p-8 border border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-[#06438a]">Informations KYC</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { name: 'company_name', label: "Nom de l'entreprise *" },
                  { name: 'contact_first_name', label: 'Prénom *' },
                  { name: 'contact_last_name', label: 'Nom *' },
                  { name: 'job_title', label: 'Titre de poste *' },
                  { name: 'email', label: 'Email *', type: 'email', placeholder: 'exemple@entreprise.com' },
                ].map(({ name, label, type = 'text', placeholder }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={(kyc as any)[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      disabled={loading}
                      required
                      className={`w-full px-4 py-3 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#06438a]`}
                    />
                    {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Chargement...' : 'Commencer le questionnaire ESG'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}