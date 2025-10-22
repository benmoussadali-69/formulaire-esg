export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
          Formulaire ESG
        </h1>
        
        <h2 className="text-xl font-semibold text-indigo-600 text-center mb-6">
          Bienvenue sur votre formulaire ESG
        </h2>
        
        <p className="text-gray-700 text-center leading-relaxed">
          Remplissez vos informations et soumettez votre formulaire.
        </p>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Ce formulaire permet de collecter des données relatives aux critères 
            Environnementaux, Sociaux et de Gouvernance (ESG).
          </p>
        </div>
      </div>
    </main>
  )
}