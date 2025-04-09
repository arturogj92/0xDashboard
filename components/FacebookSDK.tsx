'use client';

import Script from 'next/script';

interface FacebookSDKProps {
  appId: string;
  apiVersion: string;
}

export default function FacebookSDK({ appId, apiVersion }: FacebookSDKProps) {
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
              status     : true
            });
              
            FB.AppEvents.logPageView();   
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