// app/confirmation/page.tsx
export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci !</h1>
        <p className="text-gray-700">
          Vos réponses ont été enregistrées avec succès.  
          Notre équipe vous contactera prochainement.
        </p>
        <div className="mt-6">
          <a 
            href="/" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Retour à l’accueil
          </a>
        </div>
      </div>
    </main>
  );
}