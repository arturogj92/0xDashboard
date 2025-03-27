'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ReelCard } from '@/components/reels/ReelCard';
import { DeleteDialog } from '@/components/reels/DeleteDialog';
import { StatsDialog } from '@/components/reels/StatsDialog';
import { useReels } from '@/hooks/useReels';

export default function Home() {
  const {
    reels,
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
    dailyData,
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

  return (
    <div>
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
        dailyData={dailyData}
      />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Reels</h1>
        <p className="text-sm text-gray-400 mb-6">
          Lista de reels configurados para respuestas automáticas
        </p>
        <Button asChild variant="outline" className="mx-auto hover:bg-purple-900/30 transition-colors duration-200">
          <Link href="/reels/new" className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Añadir Reel
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reels.map((reel) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            onDelete={openDeleteDialog}
            onToggleActive={handleToggleActive}
            onStatsClick={openStatsDialog}
            deleteLoading={deleteLoading}
          />
        ))}
      </div>
    </div>
  );
}