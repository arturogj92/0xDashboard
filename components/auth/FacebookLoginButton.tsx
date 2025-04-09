'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

declare global {
  interface Window {
    FB: any;
  }
}

export default function FacebookLoginButton() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookLogin = () => {
    setIsLoading(true);
    
    window.FB.login(function(response: any) {
      if (response.authResponse) {
        // Obtener información básica del usuario y de negocio
        window.FB.api('/me', { 
          fields: 'id,name,email,businesses{id,name,picture}'
        }, function(userData: any) {
          const accessToken = response.authResponse.accessToken;
          
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
          .then(() => {
            router.push('/');
          })
          .catch((error) => {
            console.error('Error durante el login con Facebook:', error);
          })
          .finally(() => {
            setIsLoading(false);
          });
        });
      } else {
        console.log('Usuario canceló el login o no autorizó.');
        setIsLoading(false);
      }
    }, {
      config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
      auth_type: 'rerequest'
    });
  };

  return (
    <Button
      onClick={handleFacebookLogin}
      className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Conectando...
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
  );
} 