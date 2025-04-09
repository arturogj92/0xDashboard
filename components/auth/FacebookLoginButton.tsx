'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    FB: any;
  }
}

export default function FacebookLoginButton() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFBReady, setIsFBReady] = useState(false);

  // Verificar cuando el SDK de Facebook esté listo
  useEffect(() => {
    const handleSDKReady = () => {
      console.log('SDK de Facebook detectado como cargado');
      setIsFBReady(true);
    };

    // Comprobar si ya está disponible
    if (window.FB) {
      setIsFBReady(true);
    } else {
      window.addEventListener('fb-sdk-ready', handleSDKReady);
    }

    return () => {
      window.removeEventListener('fb-sdk-ready', handleSDKReady);
    };
  }, []);

  const handleFacebookLogin = () => {
    setIsLoading(true);
    setError(null);
    
    // Verificar que el SDK de Facebook esté disponible
    if (!window.FB) {
      console.error('El SDK de Facebook no está disponible');
      setError('Error de conexión con Facebook. Inténtalo de nuevo.');
      setIsLoading(false);
      return;
    }
    
    const loginOptions = {
      config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
      auth_type: 'rerequest',
      scope: 'email,pages_show_list,instagram_basic,pages_read_engagement'
    };

    console.log('Iniciando login con opciones:', loginOptions);
    
    window.FB.login(function(response: any) {
      if (response.authResponse) {
        console.log('Facebook login response:', response);
        
        // Usar el token específicamente para esta API, sin sobrescribir el global
        const accessToken = response.authResponse.accessToken;
        const userId = response.authResponse.userID;
        
        // Obtener información básica del usuario y de negocio
        window.FB.api(`/${userId}`, { 
          fields: 'id,name,email,businesses{id,name,picture}',
          access_token: accessToken  // Pasar el token explícitamente
        }, function(userData: any) {
          console.log('Facebook user data:', userData);
          
          login({
            provider: 'facebook',
            accessToken,
            userData: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              businesses: userData.businesses?.data || []
            }
          })
          .then((result) => {
            console.log('Login result:', result);
            if (result.success) {
              router.push('/');
            } else {
              setError(result.message || 'Error al iniciar sesión con Facebook');
            }
          })
          .catch((error) => {
            console.error('Error durante el login con Facebook:', error);
            setError('Error al procesar el login. Inténtalo de nuevo.');
          })
          .finally(() => {
            setIsLoading(false);
          });
        });
      } else {
        console.log('Usuario canceló el login o no autorizó:', response);
        setError('Login cancelado o no autorizado');
        setIsLoading(false);
      }
    }, loginOptions);
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}
      <Button
        onClick={handleFacebookLogin}
        className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white"
        disabled={isLoading || !isFBReady}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Conectando...
          </div>
        ) : !isFBReady ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando SDK...
          </div>
        ) : (
          <>
            <svg
              className="mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
            Continuar con Facebook
          </>
        )}
      </Button>
    </>
  );
} 