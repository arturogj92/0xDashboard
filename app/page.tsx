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
import { PageSkeleton, Skeleton } from '@/components/ui/skeleton';
import { FaInstagram, FaPlug } from 'react-icons/fa';
import GlobalStatsModal from '@/components/dialogs/GlobalStatsModal';
import { useTranslations } from 'next-intl';
import { Pagination } from '@/components/ui/Pagination';
import { SortingDropdown } from '@/components/ui/SortingDropdown';
import { ArrowUpWideNarrow, ArrowDownWideNarrow } from 'lucide-react';
import { HideFiltersDropdown } from '@/components/ui/HideFiltersDropdown';
import React from 'react';
import { InstagramAutomationWarning } from '@/components/auth/InstagramAutomationWarning';
import { PageHeader } from '@/components/ui/PageHeader';

export default function Home() {
  const tHome = useTranslations('home');
  const t = useTranslations('dashboard');
  const { stats, loading: loadingGlobal, error: errorGlobal } = useGlobalMediaStats();
  const { stats: storyStats, loading: loadingStoryGlobal, error: errorStoryGlobal } = useGlobalStoryStats();
  const router = useRouter();
  const [reelModalOpen, setReelModalOpen] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  
  // Referencias para las secciones de reels y stories
  const reelsSectionRef = React.useRef<HTMLDivElement>(null);
  const storiesSectionRef = React.useRef<HTMLDivElement>(null);
  
  const {
    reels,
    stories,
    reelsLoading,
    storiesLoading,
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
    openStatsDialog,
    reelsPagination,
    storiesPagination,

    handleReelsPageChange,
    handleStoriesPageChange,
    reelsHide,
    changeReelsHide,
    storiesHide,
    changeStoriesHide,
    reelsSortField,
    reelsSortOrder,
    changeReelsSorting,
    storiesSortField,
    storiesSortOrder,
    changeStoriesSorting
  } = useReels();

  // Usar el contexto de autenticación
  const { user } = useAuth();

  const handleReelSuccess = (id: number) => {
    router.push(`/reels/${id}`);
  };

  const handleStorySuccess = (id: number) => {
    router.push(`/stories/${id}`);
  };

  // Estado para modal de estadísticas globales
  const [globalStatsInfo, setGlobalStatsInfo] = useState<
    { period: '28d'|'7d'|'yesterday'|'today'; mediaType: 'reel'|'story' } | null
  >(null);

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
      {/* Banner de conexión Instagram */}
      <InstagramAutomationWarning />
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

        {/* Encabezado de página */}
        <PageHeader
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
              <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
            </svg>
          }
          title={t('yourAutomationsTitle')}
          description={t('yourAutomationsDesc')}
          imageSrc="/images/icons/automation-landing-icon.png"
          imageAlt="Automatizaciones"
        />

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
        <div className="mb-16 relative bg-[#120724] rounded-xl p-6 shadow-md mx-4 md:mx-6" ref={reelsSectionRef}>
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Image
                src="/images/icons/reel-icon.png"
                alt="Reel Icon"
                width={36}
                height={36}
                className="mr-3"
              />
              <h2 className="text-xl font-semibold text-white">{t('reels.title')}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <HideFiltersDropdown
                mediaType="reel"
                filters={reelsHide}
                onChange={changeReelsHide}
              />
              <SortingDropdown
                sortField={reelsSortField}
                sortOrder={reelsSortOrder}
                changeSorting={changeReelsSorting}
              />
              <Button
                variant="outline"
                className="p-2"
                onClick={() => changeReelsSorting(reelsSortField, reelsSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {reelsSortOrder === 'asc' ? (
                  <ArrowUpWideNarrow className="w-5 h-5" />
                ) : (
                  <ArrowDownWideNarrow className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            {t('reels.description')}
          </p>

          <div className="flex justify-start mb-8">
            <Button 
              variant="outline" 
              className="rounded-full px-6 py-5 hover:bg-indigo-600/50 border-indigo-600/50"
              onClick={() => setReelModalOpen(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('reels.addReel')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reelsLoading && (
              <>
                <Skeleton className="h-[150px] w-full rounded-xl" />
                <Skeleton className="h-[150px] w-full rounded-xl" />
              </>
            )}
            {!reelsLoading && fixedReels.map((reel) => (
              <MediaCard
                key={reel.id}
                media={reel}
                onDelete={openDeleteDialog}
                onToggleActive={handleToggleActive}
                onStatsClick={openStatsDialog}
                deleteLoading={deleteLoading}
              />
            ))}
            
            {!reelsLoading && fixedReels.length === 0 && (
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
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('reels.addFirstReel')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Paginación reels */}
          {!reelsLoading && reelsPagination && reelsPagination.totalPages >= 1 && (
            <Pagination
              currentPage={reelsPagination.page}
              totalPages={reelsPagination.totalPages}
              onPageChange={(page) => {
                handleReelsPageChange(page);
                // Hacer scroll al inicio de la sección de reels
                if (reelsSectionRef.current) {
                  reelsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          )}
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
        <div className="mb-8 bg-[#120724] rounded-xl p-6 shadow-md mx-4 md:mx-6" ref={storiesSectionRef}>
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Image
                src="/images/icons/story-icon.png"
                alt="Story Icon"
                width={36}
                height={36}
                className="mr-3"
              />
              <h2 className="text-xl font-semibold text-white">{t('stories.title')}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <HideFiltersDropdown
                mediaType="story"
                filters={storiesHide}
                onChange={changeStoriesHide}
              />
              <SortingDropdown
                sortField={storiesSortField}
                sortOrder={storiesSortOrder}
                changeSorting={changeStoriesSorting}
              />
              <Button
                variant="outline"
                className="p-2"
                onClick={() => changeStoriesSorting(storiesSortField, storiesSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {storiesSortOrder === 'asc' ? (
                  <ArrowUpWideNarrow className="w-5 h-5" />
                ) : (
                  <ArrowDownWideNarrow className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-6">
            {t('stories.description')}
          </p>

          <div className="flex justify-start mb-8">
            <Button 
              variant="outline" 
              className="rounded-full px-6 py-5 hover:bg-indigo-600/50 border-indigo-600/50"
              onClick={() => setStoryModalOpen(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('stories.addStory')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {storiesLoading && (
              <>
                <Skeleton className="h-[150px] w-full rounded-xl" />
                <Skeleton className="h-[150px] w-full rounded-xl" />
              </>
            )}
            {!storiesLoading && fixedStories.map((story) => (
              <MediaCard
                key={story.id}
                media={story}
                onDelete={openDeleteDialog}
                onToggleActive={handleToggleActive}
                onStatsClick={openStatsDialog}
                deleteLoading={deleteLoading}
              />
            ))}
            
            {!storiesLoading && fixedStories.length === 0 && (
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
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('stories.addFirstStory')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Paginación stories */}
          {!storiesLoading && storiesPagination && (
            <Pagination
              currentPage={storiesPagination.page}
              totalPages={storiesPagination.totalPages}
              onPageChange={(page) => {
                handleStoriesPageChange(page);
                // Hacer scroll al inicio de la sección de stories
                if (storiesSectionRef.current) {
                  storiesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}