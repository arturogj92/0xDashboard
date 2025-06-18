'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function GoogleCallbackContent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      try {
        console.log('Iniciando procesamiento de callback de Google');
        
        // Recopilar información de depuración
        const params = Array.from(searchParams.entries())
          .map(([key, value]) => `${key}: ${key === 'code' ? value.substring(0, 10) + '...' : value}`)
          .join(', ');
        
        setDebugInfo(`URL params: ${params}`);
        console.log(`Parámetros de URL: ${params}`);
        
        // Obtener el código de autorización de la URL
        const code = searchParams.get('code');
        if (!code) {
          const errorMsg = searchParams.get('error') || 'No se recibió código de autorización';
          console.error(`Error en callback: ${errorMsg}`);
          setError(`Error en la autenticación con Google: ${errorMsg}`);
          setLoading(false);
          return;
        }

        console.log('Código de autorización recibido, enviando al backend...');
        
        // Verificar que la URL de la API está configurada
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          console.error('NEXT_PUBLIC_API_URL no está configurado');
          setError('Error de configuración: URL de API no establecida');
          setLoading(false);
          return;
        }
        
        setDebugInfo(prev => `${prev}\nURL de API: ${apiUrl}`);
        console.log(`Enviando solicitud a: ${apiUrl}/api/auth/google/mobile-callback`);

        // Intercambiar el código por un token ID en el backend
        const response = await fetch(`${apiUrl}/api/auth/google/mobile-callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        console.log('Respuesta del backend recibida:', { success: data.success, hasToken: !!data?.data?.token });
        
        if (!response.ok || !data.success) {
          setDebugInfo(prev => `${prev}\nRespuesta de error: ${JSON.stringify(data)}`);
          console.error('Error en respuesta del backend:', data);
          setError(data.message || 'Error al procesar la autenticación con Google');
          setLoading(false);
          return;
        }

        if (!data.data?.token) {
          console.error('No se recibió token en la respuesta');
          setError('Error: No se recibió token de autenticación');
          setLoading(false);
          return;
        }

        console.log('Login exitoso, guardando token y redirigiendo...');
        
        // Guardar el token y datos de usuario
        loginWithToken(data.data.token, data.data.user);
        
        // Redirigir al home o dashboard después de un breve retraso para permitir que se guarde el token
        setTimeout(() => {
          router.push('/automations');
        }, 500);
        
      } catch (err) {
        console.error('Error procesando callback de Google:', err);
        setDebugInfo(prev => `${prev}\nError: ${err instanceof Error ? err.message : String(err)}`);
        setError('Error inesperado al procesar la autenticación');
        setLoading(false);
      }
    }

    handleCallback();
  }, [searchParams, router, loginWithToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-300">Completando inicio de sesión con Google...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-[#120724] p-8 rounded-xl shadow-lg border border-red-900/30 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
              <svg className="w-8 h-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Error de Autenticación</h2>
          </div>
          
          <p className="text-red-300 mb-6">{error}</p>
          
          {/* Mostrar información de depuración en entorno de desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-900 p-3 mb-4 rounded overflow-auto text-xs text-gray-400">
              <pre>{debugInfo}</pre>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-md"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Componente de carga para Suspense
function GoogleCallbackLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mb-4">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-300">Cargando...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<GoogleCallbackLoading />}>
      <GoogleCallbackContent />
    </Suspense>
  );
} 