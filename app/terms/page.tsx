import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0118] text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">Términos de Servicio</h1>
            <p className="text-gray-400">Última actualización: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="bg-[#120724] p-8 rounded-xl shadow-lg border border-indigo-900/30 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">1. Aceptación de los Términos</h2>
              <p className="text-gray-300 leading-relaxed">
                Al acceder y utilizar 0xReplyer, aceptas estar legalmente vinculado por estos términos de servicio. Si no estás de acuerdo con alguna parte de estos términos, no podrás usar nuestros servicios.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">2. Descripción del Servicio</h2>
              <p className="text-gray-300 leading-relaxed">
                0xReplyer es una plataforma que proporciona servicios de automatización y gestión de redes sociales. Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">3. Cuenta de Usuario</h2>
              <p className="text-gray-300 leading-relaxed">
                Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Todas las actividades que ocurran bajo tu cuenta son tu responsabilidad.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">4. Uso Aceptable</h2>
              <p className="text-gray-300 leading-relaxed">
                Te comprometes a no utilizar el servicio para ningún propósito ilegal o prohibido por estos términos. No debes violar ninguna ley en tu jurisdicción.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">5. Limitación de Responsabilidad</h2>
              <p className="text-gray-300 leading-relaxed">
                0xReplyer no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, o cualquier pérdida de beneficios o ingresos.
              </p>
            </div>
          </section>

          <div className="text-center mt-8">
            <Link 
              href="/login" 
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 