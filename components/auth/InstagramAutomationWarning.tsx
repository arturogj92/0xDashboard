// Nuevo componente para mostrar advertencias y conexión de Instagram
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaInstagram, FaFacebook } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

export function InstagramAutomationWarning() {
  const { user } = useAuth();
  const tHome = useTranslations('home');
  const t = useTranslations('dashboard');
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Verificar estados de conexión
  const canCreateAutomations = user?.isInstagramLinked && user?.isInstagramTokenValid;
  const isInstagramMissing = user?.isInstagramLinked && user?.isInstagramTokenValid && !user?.instagram_username;

  // SDK de Facebook para Instagram
  useEffect(() => {
    const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const FB_API_VERSION = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v17.0';
    const FB_CONFIG_ID = process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID;
    if (!FB_APP_ID || !FB_CONFIG_ID) return;
    if ((window as any).FB) return;
    (window as any).fbAsyncInit = function() {
      (window as any).FB?.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: true,
        version: FB_API_VERSION,
        config_id: FB_CONFIG_ID
      });
    };
    // Cargar script SDK de Facebook
    (function(d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement('script');
      js.id = id;
      js.src = 'https://connect.facebook.net/es_ES/sdk.js';
      fjs.parentNode?.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  function handleConnectInstagram() {
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') + '/api/auth/instagram/callback';
    const STATE = Math.random().toString(36).substring(2) + Date.now();
    if (!FACEBOOK_APP_ID || !REDIRECT_URI) {
      window.alert(tHome('errorConfig') || 'Configuración de Instagram incompleta. Contacta al administrador.');
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

  // Botón para conectar o reconectar
  function InstagramConnectButton({ reconnect = false }: { reconnect?: boolean }) {
    return (
      <Button
        className="px-8 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-white border-0 flex items-center justify-center space-x-2 mb-4 rounded-lg text-lg font-bold shadow-md mx-auto"
        onClick={handleConnectInstagram}
      >
        <FaInstagram className="w-6 h-6 text-white" />
        <span>{reconnect ? tHome('reconnectInstagram') : tHome('loginInstagram')}</span>
      </Button>
    );
  }

  // Botón de ayuda con diálogo
  function ConnectHelpButton({ reconnect = false }: { reconnect?: boolean }) {
    return (
      <>
        <button
          className="mt-3 text-xs text-yellow-300 underline hover:text-yellow-100 transition-colors text-center"
          onClick={() => setInfoModalOpen(true)}
          type="button"
        >
          {reconnect ? tHome('howReconnect') : tHome('howConnect')}
        </button>
        <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
          <DialogContent className="bg-[#120724] border border-indigo-900/50 text-white w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2 mb-2">
                <FaInstagram className="text-pink-400 text-xl" />
                <span>{tHome('connectInstagramFacebook')}</span>
                <FaFacebook className="text-blue-400 text-xl" />
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-center">
                {tHome('automationDialogParagraph1')}
                <br />
                <span className="block mt-2 text-yellow-200 font-semibold">{tHome('automationDialogParagraph2')}</span>
                <span className="block mt-2 text-gray-300">{tHome('automationDialogParagraph3')}</span>
                <a
                  href="https://www.facebook.com/help/instagram/570895513091465"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-blue-400 underline hover:text-blue-300"
                >
                  {tHome('linkHowToLinkFacebookInstagram')}
                </a>
                <span className="block mt-4 text-gray-300">{tHome('automationDialogParagraph4')}</span>
                <a
                  href="https://business.facebook.com/business/loginpage/?login_options[0]=FB&login_options[1]=IG&login_options[2]=SSO&config_ref=biz_login_tool_flavor_mbs&create_business_portfolio_for_bm=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-blue-400 underline hover:text-blue-300"
                >
                  {tHome('linkMetaBusiness')}
                </a>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Image
                src="/images/descriptions/instagram-not-connected.png"
                alt="Instagram no conectado"
                width={160}
                height={160}
                className="object-contain mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-center mb-4 text-yellow-200">{tHome('automationInfoTitle')}</h3>
              <ul className="space-y-4 text-left mb-6">
                <li className="flex items-start gap-3 p-2 border border-indigo-900/30 rounded bg-indigo-900/20">
                  <FaInstagram className="text-pink-400 text-xl mt-1 flex-shrink-0" />
                  <div className="text-white">{tHome('automationInfoInstagramType')}</div>
                </li>
                <li className="flex items-start gap-3 p-2 border border-indigo-900/30 rounded bg-indigo-900/20">
                  <FaFacebook className="text-blue-400 text-xl mt-1 flex-shrink-0" />
                  <div className="text-white">{tHome('automationInfoFacebookPage')}</div>
                </li>
                <li className="flex items-start gap-3 p-2 border border-indigo-900/30 rounded bg-indigo-900/20">
                  <span className="text-yellow-300 text-xl mt-1 flex-shrink-0">👑</span>
                  <div className="text-white">{tHome('automationInfoAdminPermissions')}</div>
                </li>
                <li className="flex items-start gap-3 p-2 border border-indigo-900/30 rounded bg-indigo-900/20">
                  <span className="text-green-400 text-xl mt-1 flex-shrink-0">✅</span>
                  <div className="text-white">{tHome('automationInfoPermissions')}</div>
                </li>
              </ul>
              <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-200 p-3 rounded text-center">
                {tHome('tokenExpiredWarning')}
              </div>
              <div className="flex justify-center mt-6">
                <Button className="bg-indigo-700 hover:bg-indigo-600 text-white" onClick={() => setInfoModalOpen(false)}>
                  {t('understood')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Renderizar banner según estado de conexión
  if (user) {
    let icon = '';
    let title = '';
    let description = '';
    let reconnect = false;
    if (user.isInstagramLinked && !user.isInstagramTokenValid) {
      icon = '⏰';
      title = tHome('reconnectTitle');
      description = tHome('reconnectDescription');
      reconnect = true;
    } else if (isInstagramMissing) {
      icon = '⚠️';
      title = tHome('noBusinessAccountTitle');
      description = tHome('noBusinessAccountDescription');
      reconnect = true;
    } else if (!canCreateAutomations) {
      icon = '⚠️';
      title = tHome('connectInstagramTitle');
      description = tHome('connectInstagramDescription');
      reconnect = false;
    }
    if (title) {
      return (
        <div className="w-full max-w-2xl mx-auto bg-[#120724] shadow-lg px-4 py-6 rounded-2xl mb-6 flex flex-col items-center">
          <span className="text-3xl mb-2">{icon}</span>
          <h2 className="font-extrabold text-xl text-center text-yellow-200 mb-2 leading-tight">{title}</h2>
          <p className="text-base text-center text-yellow-100 mb-4 break-words w-full leading-snug">{description}</p>
          <InstagramConnectButton reconnect={reconnect} />
          <ConnectHelpButton reconnect={reconnect} />
        </div>
      );
    }
  }
  return null;
} 