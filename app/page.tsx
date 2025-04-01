'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon, KeyIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { MediaCard } from '@/components/reels/ReelCard';
import { DeleteDialog } from '@/components/reels/DeleteDialog';
import { StatsDialog } from '@/components/reels/StatsDialog';
import { useReels } from '@/hooks/useReels';

export default function Home() {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // Este casting corrige los errores del linter relacionados con la propiedad thumbnailUrl
  const fixedReels = reels.map(reel => ({
    ...reel,
    thumbnailUrl: reel.thumbnailUrl === null ? undefined : reel.thumbnailUrl
  }));

  const fixedStories = stories.map(story => ({
    ...story,
    thumbnailUrl: story.thumbnailUrl === null ? undefined : story.thumbnailUrl
  }));

  return (
    <div className="pb-16">
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

      {/* Header con ilustración */}
      <div className="mb-12 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="text-[#eea015] mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tus automatizaciones</h1>
              <p className="text-sm text-gray-400">
                Gestiona tus respuestas automáticas para reels e historias
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
      </div>

      {/* Sección de Reels */}
      <div className="mb-16 bg-[#120724] rounded-xl p-6 shadow-md">
        <div className="flex items-center mb-6">
          <Image
            src="/images/icons/reel-icon.png"
            alt="Reel Icon"
            width={36}
            height={36}
            className="mr-3"
          />
          <h2 className="text-xl font-semibold text-white">Reels</h2>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          Lista de reels configurados para respuestas automáticas
        </p>

        <div className="flex justify-start mb-8">
          <Button asChild variant="outline" className="rounded-full px-6 py-5 hover:bg-indigo-600/50 border-indigo-600/50">
            <Link href="/reels/new" className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Añadir Reel
            </Link>
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
                <p className="text-gray-400 mb-4">No tienes reels configurados</p>
                <Button asChild variant="outline" className="rounded-full px-6 py-2 hover:bg-indigo-600/50 border-indigo-600/50">
                  <Link href="/reels/new" className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Añadir tu primer Reel
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Historias */}
      <div className="bg-[#120724] rounded-xl p-6 shadow-md">
        <div className="flex items-center mb-6">
          <Image
            src="/images/icons/story-icon.png"
            alt="Story Icon"
            width={36}
            height={36}
            className="mr-3"
          />
          <h2 className="text-xl font-semibold text-white">Historias</h2>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          Lista de historias configuradas para respuestas automáticas
        </p>

        <div className="flex justify-start mb-8">
          <Button asChild variant="outline" className="rounded-full px-6 py-5 hover:bg-indigo-600/50 border-indigo-600/50">
            <Link href="/stories/new" className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Añadir Historia
            </Link>
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
                <p className="text-gray-400 mb-4">No tienes historias configuradas</p>
                <Button asChild variant="outline" className="rounded-full px-6 py-2 hover:bg-indigo-600/50 border-indigo-600/50">
                  <Link href="/stories/new" className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Añadir tu primera Historia
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}