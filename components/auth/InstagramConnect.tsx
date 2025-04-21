'use client';

import { FaInstagram } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

interface InstagramConnectProps {
  reconnect?: boolean;
}

export function InstagramConnect({ reconnect = false }: InstagramConnectProps) {
  function handleConnectInstagram() {
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') + '/api/auth/instagram/callback';
    const STATE = Math.random().toString(36).substring(2) + Date.now();
    if (!FACEBOOK_APP_ID || !REDIRECT_URI) {
      window.alert('Configuración de Instagram incompleta. Contacta al administrador.');
      return;
    }
    const scope = [
      'public_profile',
      'email',
      'pages_manage_ads',
      'pages_manage_metadata',
      'pages_read_engagement',
      'pages_read_user_content',
      'pages_messaging',
      'ads_read',
      'pages_show_list',
      'instagram_basic',
      'business_management',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
      'page_events',
      'instagram_manage_messages',
      'instagram_manage_events'
    ].join(',');
    const extras = encodeURIComponent(JSON.stringify({ setup: { channel: 'IG_API_ONBOARDING' } }));
    const fbOauthUrl =
      `https://www.facebook.com/dialog/oauth?` +
      `client_id=${FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&response_type=code` +
      `&state=${encodeURIComponent(STATE)}` +
      `&extras=${extras}`;
    window.location.href = fbOauthUrl;
  }

  return (
    <div className="flex flex-col items-center">
      <Button
        className="px-8 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-white border-0 flex items-center justify-center space-x-2 mb-4 rounded-lg text-lg font-bold shadow-md"
        onClick={handleConnectInstagram}
      >
        <FaInstagram className="w-6 h-6 text-white" />
        <span>{reconnect ? 'Reconectar cuenta de Instagram' : 'Conecta tu cuenta de Instagram'}</span>
      </Button>
      {!reconnect && (
        <p className="text-sm text-yellow-300 text-center">
          Es necesario conectar su cuenta de Instagram para crear automatizaciones.
        </p>
      )}
      {reconnect && (
        <p className="text-sm text-yellow-300 text-center">
          Si estás teniendo problemas con la cuenta de Instagram, prueba a reconectarla.
        </p>
      )}
    </div>
  );
} 