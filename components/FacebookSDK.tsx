'use client';

import Script from 'next/script';
import { useEffect } from 'react';

interface FacebookSDKProps {
  appId: string;
  apiVersion: string;
}

export default function FacebookSDK({ appId, apiVersion }: FacebookSDKProps) {
  // Esta función se ejecutará cuando el SDK esté listo
  useEffect(() => {
    // Definir manejador para cuando el SDK se ha cargado
    const handleFBLoaded = () => {
      if (window.FB) {
        console.log('Facebook SDK cargado correctamente');
      }
    };

    // Agregar evento para detectar cuando el SDK está listo
    if (window.FB) {
      handleFBLoaded();
    } else {
      window.addEventListener('fb-sdk-ready', handleFBLoaded);
    }

    // Limpieza al desmontar
    return () => {
      window.removeEventListener('fb-sdk-ready', handleFBLoaded);
    };
  }, []);

  return (
    <>
      <Script id="facebook-sdk" strategy="afterInteractive">
        {`
          window.fbAsyncInit = function() {
            FB.init({
              appId      : '${appId}',
              cookie     : true,
              xfbml      : true,
              version    : '${apiVersion}',
              status     : true,
              autoLogAppEvents: true
            });
              
            FB.AppEvents.logPageView();   
            // Disparar evento para indicar que el SDK está listo
            window.dispatchEvent(new Event('fb-sdk-ready'));
          };
        `}
      </Script>
      <Script
        src="https://connect.facebook.net/es_ES/sdk.js"
        strategy="afterInteractive"
      />
    </>
  );
} 