'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function GoogleCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Obtener el código de autorización de la URL
        const code = searchParams.get('code');
        if (!code) {
          const errorMsg = searchParams.get('error') || 'No se recibió código de autorización';
          setError(`Error en la autenticación con Google: ${errorMsg}`);
          setLoading(false);
          return;
        }

        // Intercambiar el código por un token ID en el backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/mobile-callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || 'Error al procesar la autenticación con Google');
          setLoading(false);
          return;
        }

        // Guardar el token y datos de usuario
        loginWithToken(data.data.token, data.data.user);
        
        // Redirigir al home o dashboard
        router.push('/');
      } catch (err) {
        console.error('Error procesando callback de Google:', err);
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