'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, KeyIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { MediaCard } from '@/components/reels/ReelCard';
import { DeleteDialog } from '@/components/reels/DeleteDialog';
import { StatsDialog } from '@/components/reels/StatsDialog';
import { useReels } from '@/hooks/useReels';
import { useGlobalMediaStats, useGlobalStoryStats } from '@/hooks/useGlobalStats';
import { CreateMediaModal } from '@/components/media/CreateMediaModal';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FaInstagram, FaFacebook, FaPlug } from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import GlobalStatsModal from '@/components/dialogs/GlobalStatsModal';
import { useTranslations } from 'next-intl';

export default function Home() {
  const tHome = useTranslations('home');
  const t = useTranslations('dashboard');
  const { stats, loading: loadingGlobal, error: errorGlobal } = useGlobalMediaStats();
  const { stats: storyStats, loading: loadingStoryGlobal, error: errorStoryGlobal } = useGlobalStoryStats();
  const router = useRouter();
  const [reelModalOpen, setReelModalOpen] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  
  const {
    reels,
    stories,
    loading,
    error,
    deleteLoading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    statsDialogOpen,
    setStatsDialogOpen,
    loadingStats,
    statsError,
    totalDms,
    hourlyData,
    weeklyStats,
    openDeleteDialog,
    handleDelete,
    handleToggleActive,
    openStatsDialog
  } = useReels();

  // Usar el contexto de autenticación
  const { user } = useAuth();

  // Determinar si el usuario puede crear automatizaciones
  const canCreateAutomations = user?.isInstagramLinked && user?.isInstagramTokenValid;

  // Generalización de avisos para conexión/reconexión de Instagram
  let automationWarning = null;
  const isInstagramMissing = user?.isInstagramLinked && user?.isInstagramTokenValid && (!user?.instagram_username);
  if (user?.isInstagramLinked && !user?.isInstagramTokenValid) {
    automationWarning = (
      <div className="w-full max-w-2xl mx-auto bg-[#120724] shadow-lg px-4 py-6 rounded-2xl mb-6 flex flex-col items-center">
        <span className="text-3xl mb-2">⏰</span>
        <h2 className="font-extrabold text-xl text-center text-yellow-200 mb-2 leading-tight">{tHome('reconnectTitle')}</h2>
        <p className="text-base text-center text-yellow-100 mb-4 break-words w-full leading-snug">
          {tHome('reconnectDescription')}
        </p>
        <InstagramConnectButton reconnect />
        <ConnectHelpButton reconnect />
      </div>
    );
  } else if (isInstagramMissing) {
    automationWarning = (
      <div className="w-full max-w-2xl mx-auto bg-[#120724] shadow-lg px-4 py-6 rounded-2xl mb-6 flex flex-col items-center">
        <span className="text-3xl mb-2">⚠️</span>
        <h2 className="font-extrabold text-xl text-center text-yellow-200 mb-2 leading-tight">{tHome('noBusinessAccountTitle')}</h2>
        <p className="text-base text-center text-yellow-100 mb-4 break-words w-full leading-snug">
          {tHome('noBusinessAccountDescription')}
        </p>
        <InstagramConnectButton reconnect />
        <ConnectHelpButton reconnect />
      </div>
    );
  } else if (!canCreateAutomations) {
    automationWarning = (
      <div className="w-full max-w-2xl mx-auto bg-[#120724] shadow-lg px-4 py-6 rounded-2xl mb-6 flex flex-col items-center">
        <span className="text-3xl mb-2">⚠️</span>
        <h2 className="font-extrabold text-xl text-center text-yellow-200 mb-2 leading-tight">{tHome('connectInstagramTitle')}</h2>
        <p className="text-base text-center text-yellow-100 mb-4 break-words w-full leading-snug">
          {tHome('connectInstagramDescription')}
        </p>
        <InstagramConnectButton />
        <ConnectHelpButton />
      </div>
    );
  }

  // Componentes reutilizables para el botón y la ayuda
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

  const handleReelSuccess = (id: number) => {
    router.push(`/reels/${id}`);
  };

  const handleStorySuccess = (id: number) => {
    router.push(`/stories/${id}`);
  };

  // --- SDK Facebook y handler ---
  useEffect(() => {
    const NEXT_PUBLIC_FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const NEXT_PUBLIC_FACEBOOK_API_VERSION = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v17.0';
    const NEXT_PUBLIC_FACEBOOK_CONFIG_ID = process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID;

    if (!NEXT_PUBLIC_FACEBOOK_APP_ID || !NEXT_PUBLIC_FACEBOOK_CONFIG_ID) return;
    if (window.FB) return;
    window.fbAsyncInit = function() {
      window.FB?.init({
        appId: NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: NEXT_PUBLIC_FACEBOOK_API_VERSION,
        config_id: NEXT_PUBLIC_FACEBOOK_CONFIG_ID
      });
    };
    (function(d, s, id){
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/es_ES/sdk.js";
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  function handleConnectInstagram() {
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') + '/api/auth/instagram/callback';
    const STATE = Math.random().toString(36).substring(2) + Date.now(); // Puedes guardar este state en localStorage si quieres validación CSRF

    if (!FACEBOOK_APP_ID || !REDIRECT_URI) {
      window.alert('Configuración de Instagram incompleta. Contacta al administrador.');
      return;
    }

    // Scopes necesarios para Facebook + Instagram
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

    // El parámetro extras debe ir url-encoded
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

  // Estado para modal de estadísticas globales
  const [globalStatsInfo, setGlobalStatsInfo] = useState<
    { period: '28d'|'7d'|'yesterday'|'today'; mediaType: 'reel'|'story' } | null
  >(null);

  if (loading) {
    return (
      <ProtectedRoute>
        <PageSkeleton />
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">{t('error')}</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // Este casting corrige los errores del linter relacionados con la propiedad thumbnail_url
  const fixedReels = reels.map(reel => ({
    ...reel,
    thumbnail_url: reel.thumbnail_url === null ? undefined : reel.thumbnail_url
  }));

  const fixedStories = stories.map(story => ({
    ...story,
    thumbnail_url: story.thumbnail_url === null ? undefined : story.thumbnail_url
  }));

  return (
    <ProtectedRoute>
      {/* Si el usuario está autenticado, mostramos el contenido normal */}
      <div className="flex flex-col gap-8">
        <div className="px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            {/* @ts-expect-error permitir interpolación de variables en traducción */}
            {t('welcome', { name: user?.name || user?.username || 'Usuario' })}
          </h2>
          <p className="text-gray-400">
            {t('manageDesc')}
          </p>
        </div>
        
        {automationWarning}

        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
        />

        <StatsDialog
          open={statsDialogOpen}
          onOpenChange={setStatsDialogOpen}
          loading={loadingStats}
          error={statsError}
          totalDms={totalDms}
          hourlyData={hourlyData}
          weeklyStats={weeklyStats}
        />
        
        <CreateMediaModal 
          open={reelModalOpen}
          onOpenChange={setReelModalOpen}
          mediaType="reel"
          onSuccess={handleReelSuccess}
        />
        
        <CreateMediaModal 
          open={storyModalOpen}
          onOpenChange={setStoryModalOpen}
          mediaType="story"
          onSuccess={handleStorySuccess}
        />

        {/* Header con ilustración */}
        <div className="mb-12 relative px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="text-[#eea015] mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                  <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('yourAutomationsTitle')}</h1>
                <p className="text-sm text-gray-400">
                  {t('yourAutomationsDesc')}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center">
              <Image
                src="/images/icons/automation-landing-icon.png"
                alt="Automatizaciones"
                width={200}
                height={120}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          {/* Mostrar datos de Instagram solo si la cuenta está conectada y el token es válido */}
          {user?.isInstagramLinked && user?.isInstagramTokenValid && user?.instagram_username && (
            <div className="flex items-center gap-3 mt-6 bg-[#1c1033] px-4 py-2 rounded-lg border border-indigo-900/50 w-fit">
              <FaInstagram className="text-pink-500 w-6 h-6" />
              {user.instagram_profile_pic_url && (
                <img
                  src={user.instagram_profile_pic_url}
                  alt={user.instagram_username}
                  className="w-8 h-8 rounded-full object-cover border border-pink-500"
                />
              )}
              <span className="text-white font-medium">{user.instagram_username}</span>
              <span className="flex items-center text-xs text-green-400 ml-2 font-semibold space-x-2">
                <FaPlug className="inline-block text-green-400" />
                <span>{t('connectedText')}</span>
                {/* Punto verde pulsante */}
                <span className="relative inline-flex h-3 w-3 justify-center items-center">
                  {/* Onda más grande */}
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-[ping_1s_ease-in-out_infinite]"></span>
                  {/* Punto central */}
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Estadísticas globales de tus Reels */}
        {fixedReels.length > 0 && (
          <div className="mb-8 px-4 md:px-6">
            <h3 className="text-xl font-semibold text-white mb-1 text-center">{t('stats.reelsGlobalTitle')}</h3>
            <p className="text-center text-gray-400 mb-4 text-sm">{t('stats.reelsGlobalDesc')}</p>
            {loadingGlobal && (
              <p className="text-gray-400 text-center">{t('stats.loading')}</p>
            )}
            {errorGlobal && (
              <p className="text-red-400 text-center">{t('stats.errorReels')}</p>
            )}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Últimos 28 días */}
                <div
                  className="bg-[#1c1033] p-4 rounded-lg flex flex-col items-center cursor-pointer hover:bg-[#2a1d4b]"
                  onClick={() => setGlobalStatsInfo({ period: '28d', mediaType: 'reel' })}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-400 mb-2" />
                  <span className="text-gray-300 text-sm">{t('stats.last28Days')}</span>
                  <span className="text-white font-bold text-xl">{stats.last_28_days_total}</span>
                  <span className="text-gray-400 text-xs mt-1">{t('stats.messages')}</span>
                </div>
                {/* Últimos 7 días */}
                <div
                  className="bg-[#1c1033] p-4 rounded-lg flex flex-col items-center cursor-pointer hover:bg-[#2a1d4b]"
                  onClick={() => setGlobalStatsInfo({ period: '7d', mediaType: 'reel' })}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-400 mb-2" />
                  <span className="text-gray-300 text-sm">{t('stats.last7Days')}</span>
                  <span className="text-white font-bold text-xl">{stats.last_7_days_total}</span>
                  <span className="text-gray-400 text-xs mt-1">{t('stats.messages')}</span>
                </div>
                {/* Ayer */}
                <div
                  className="bg-[#1c1033] p-4 rounded-lg flex flex-col items-center cursor-pointer hover:bg-[#2a1d4b]"
                  onClick={() => setGlobalStatsInfo({ period: 'yesterday', mediaType: 'reel' })}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-400 mb-2" />
                  <span className="text-gray-300 text-sm">{t('stats.yesterday')}</span>
                  <span className="text-white font-bold text-xl">{stats.yesterday_total}</span>
                  <span className="text-gray-400 text-xs mt-1">{t('stats.messages')}</span>
                </div>
                {/* Hoy */}
                <div
                  className="bg-[#1c1033] p-4 rounded-lg flex flex-col items-center cursor-pointer hover:bg-[#2a1d4b]"
                  onClick={() => setGlobalStatsInfo({ period: 'today', mediaType: 'reel' })}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-400 mb-2" />
                  <span className="text-gray-300 text-sm">{t('stats.today')}</span>
                  <span className="text-white font-bold text-xl">{stats.today_total}</span>
                  <span className="text-gray-400 text-xs mt-1">{t('stats.messages')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de estadísticas globales */}
        {globalStatsInfo && (
          <GlobalStatsModal
            open={true}
            onOpenChange={(open) => !open && setGlobalStatsInfo(null)}
            period={globalStatsInfo.period}
            mediaType={globalStatsInfo.mediaType}
          />
        )}

        {/* Sección de Reels */}
        <div className="mb-16 bg-[#120724] rounded-xl p-6 shadow-md mx-4 md:mx-6">
          <div className="flex items-center mb-6">
            <Image
              src="/images/icons/reel-icon.png"
              alt="Reel Icon"
              width={36}
              height={36}
              className="mr-3"
            />
            <h2 className="text-xl font-semibold text-white">{t('reels.title')}</h2>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            {t('reels.description')}
          </p>

          <div className="flex justify-start mb-8">
            <Button 
              variant="outline" 
              className="rounded-full px-6 py-5 hover:bg-indigo-600/50 border-indigo-600/50"
              onClick={() => setReelModalOpen(true)}
              disabled={!canCreateAutomations}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('reels.addReel')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fixedReels.map((reel) => (
              <MediaCard
                key={reel.id}
                media={reel}
                onDelete={openDeleteDialog}
                onToggleActive={handleToggleActive}
                onStatsClick={openStatsDialog}
                deleteLoading={deleteLoading}
              />
            ))}
            
            {fixedReels.length === 0 && (
              <div className="col-span-full bg-[#1a0e35] p-8 rounded-lg border border-indigo-900/30 text-center">
                <div className="flex flex-col items-center">
                  <Image
                    src="/images/icons/reel-icon.png"
                    alt="No reels"
                    width={48}
                    height={48}
                    className="opacity-50 mb-4"
                  />
                  <p className="text-gray-400 mb-4">{t('reels.noReels')}</p>
                  <Button 
                    variant="outline" 
                    className="rounded-full px-6 py-2 hover:bg-indigo-600/50 border-indigo-600/50"
                    onClick={() => setReelModalOpen(true)}
                    disabled={!canCreateAutomations}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('reels.addFirstReel')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas globales de tus Historias */}
        {fixedStories.length > 0 && (
          <div className="mb-8 px-4 md:px-6">
            <h3 className="text-xl font-semibold text-white mb-1 text-center">{t('stats.storiesGlobalTitle')}</h3>
            <p className="text-center text-gray-400 mb-4 text-sm">{t('stats.storiesGlobalDesc')}</p>
            {loadingStoryGlobal && (
              <p className="text-gray-400 text-center">{t('stats.loading')}</p>
            )}
            {errorStoryGlobal && (
              <p className="text-red-400 text-center">{t('stats.errorStories')}</p>
            )}
            {storyStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Últimos 28 días */}
                <div
                  className="bg-[#1c1033] p-4 rounded-lg flex flex-col items-center cursor-pointer hover:bg-[#2a1d4b]"
                  onClick={() => setGlobalStatsInfo({ period: '28d', mediaType: 'story' })}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-400 mb-2" />
                  <span className="text-gray-300 text-sm">{t('stats.last28Days')}</span>
                  <span className="text-white font-bold text-xl">{storyStats.last_28_days_total}</span>
                  <span className="text-gray-400 text-xs mt-1">{t('stats.messages')}</span>
                </div>
                {/* Últimos 7 días */}
                <div
                  className="bg-[#1c1033] p-4 rounded-lg flex flex-col items-center cursor-pointer hover:bg-[#2a1d4b]"
                  onClick={() => setGlobalStatsInfo({ period: '7d', mediaType: 'story' })}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-400 mb-2" />
                  <span className="text-gray-300 text-sm">{t('stats.last7Days')}</span>
                  <span className="text-white font-bold text-xl">{storyStats.last_7_days_total}</span>
                  <span className="text-gray-400 text-xs mt-1">{t('stats.messages')}</span>
                </div>
                {/* Ayer */}
                <div
                  className="bg-[#1c1033] p-4 rounded-lg flex flex-col items-center cursor-pointer hover:bg-[#2a1d4b]"
                  onClick={() => setGlobalStatsInfo({ period: 'yesterday', mediaType: 'story' })}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-400 mb-2" />
                  <span className="text-gray-300 text-sm">{t('stats.yesterday')}</span>
                  <span className="text-white font-bold text-xl">{storyStats.yesterday_total}</span>
                  <span className="text-gray-400 text-xs mt-1">{t('stats.messages')}</span>
                </div>
                {/* Hoy */}
                <div
                  className="bg-[#1c1033] p-4 rounded-lg flex flex-col items-center cursor-pointer hover:bg-[#2a1d4b]"
                  onClick={() => setGlobalStatsInfo({ period: 'today', mediaType: 'story' })}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-400 mb-2" />
                  <span className="text-gray-300 text-sm">{t('stats.today')}</span>
                  <span className="text-white font-bold text-xl">{storyStats.today_total}</span>
                  <span className="text-gray-400 text-xs mt-1">{t('stats.messages')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sección de Historias */}
        <div className="mb-8 bg-[#120724] rounded-xl p-6 shadow-md mx-4 md:mx-6">
          <div className="flex items-center mb-6">
            <Image
              src="/images/icons/story-icon.png"
              alt="Story Icon"
              width={36}
              height={36}
              className="mr-3"
            />
            <h2 className="text-xl font-semibold text-white">{t('stories.title')}</h2>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            {t('stories.description')}
          </p>

          <div className="flex justify-start mb-8">
            <Button 
              variant="outline" 
              className="rounded-full px-6 py-5 hover:bg-indigo-600/50 border-indigo-600/50"
              onClick={() => setStoryModalOpen(true)}
              disabled={!canCreateAutomations}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('stories.addStory')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fixedStories.map((story) => (
              <MediaCard
                key={story.id}
                media={story}
                onDelete={openDeleteDialog}
                onToggleActive={handleToggleActive}
                onStatsClick={openStatsDialog}
                deleteLoading={deleteLoading}
              />
            ))}
            
            {fixedStories.length === 0 && (
              <div className="col-span-full bg-[#1a0e35] p-8 rounded-lg border border-indigo-900/30 text-center">
                <div className="flex flex-col items-center">
                  <Image
                    src="/images/icons/story-icon.png"
                    alt="No stories"
                    width={48}
                    height={48}
                    className="opacity-50 mb-4"
                  />
                  <p className="text-gray-400 mb-4">{t('stories.noStories')}</p>
                  <Button 
                    variant="outline" 
                    className="rounded-full px-6 py-2 hover:bg-indigo-600/50 border-indigo-600/50"
                    onClick={() => setStoryModalOpen(true)}
                    disabled={!canCreateAutomations}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('stories.addFirstStory')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}