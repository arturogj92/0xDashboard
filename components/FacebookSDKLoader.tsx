'use client';

import Script from 'next/script';
import { useEffect } from 'react';

// Añadir declaración global para FB (para evitar errores de TypeScript)
declare global {
  interface Window {
    FB: any; // Puedes ser más específico si tienes los tipos del SDK
    fbAsyncInit: () => void;
  }
}

const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID';

export default function FacebookSDKLoader() {

  useEffect(() => {
    // Definir fbAsyncInit en el window
    window.fbAsyncInit = function() {
      if (!window.FB) {
          console.error("FB object not found after SDK load.");
          return;
      }
      console.log('Facebook SDK Initializing with App ID:', FACEBOOK_APP_ID);
      window.FB.init({
        appId      : FACEBOOK_APP_ID, // Usar variable de entorno
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
      console.log('Facebook SDK Initialized.');
      // Opcional: Comprobar estado inicial
      // window.FB.getLoginStatus(function(response) {
      //   console.log('Initial FB Login Status:', response);
      // });
    };
  }, []);

  if (!FACEBOOK_APP_ID || FACEBOOK_APP_ID === 'YOUR_FACEBOOK_APP_ID') {
    console.error("Error: NEXT_PUBLIC_FACEBOOK_APP_ID no está configurado en las variables de entorno.");
    // Podrías retornar null o un mensaje de error aquí si prefieres no cargar el script sin ID
    // return <div>Error: Facebook App ID no configurado.</div>;
  }

  return (
    <Script
      id="facebook-jssdk"
      src="https://connect.facebook.net/en_US/sdk.js"
      strategy="lazyOnload"
      onLoad={() => {
        console.log('Facebook SDK Script loaded.');
        // fbAsyncInit ya está definido en el useEffect y será llamado automáticamente por el SDK
      }}
      onError={(e) => {
        console.error('Error loading Facebook SDK Script:', e);
      }}
    />
  );
} 