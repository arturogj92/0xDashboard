import { useState, useEffect } from 'react';
import { Reel } from '@/lib/types';
import { 
  getReels, 
  toggleReelStatus, 
  deleteReel, 
  getReelDmTotalCountToday, 
  getReelDmTotalCount, 
  getReelDmDailyCountLastWeek, 
  getReelDmTotalCount7d,
  getReelDmHourlyCountCurrentDay 
} from '@/lib/api';

export function useReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reelToDelete, setReelToDelete] = useState<number | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState<number | null>(null);
  const [totalDms, setTotalDms] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<Array<{ day: string; count: number }>>([]);

  const extractInstagramReelId = (url: string) => {
    if (!url) return null;
    const regex = /(?:reel|p)\/([A-Za-z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (url: string) => {
    if (!url) return null;
    const reelId = extractInstagramReelId(url);
    if (reelId) {
      return `https://www.instagram.com/p/${reelId}/media/?size=l`;
    }
    return null;
  };

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await getReels();
        if (response.success) {
          const reelsWithStats = await Promise.all(response.data.map(async (reel: any) => {
            let totalVisits = 0;
            let visits24 = 0;
            let visits7d = 0;

            try {
              const totalCountResponse = await getReelDmTotalCount(reel.id);
              if (totalCountResponse.success) {
                totalVisits = totalCountResponse.data.total_count;
              }

              const todayCountResponse = await getReelDmTotalCountToday(reel.id);
              if (todayCountResponse.success) {
                visits24 = todayCountResponse.data.total_count_today;
              }

              const weekCountResponse = await getReelDmTotalCount7d(reel.id);
              if (weekCountResponse.success) {
                visits7d = weekCountResponse.data.total_count_7d;
              }
            } catch (error) {
              // Si ocurre un error al obtener los contadores, se mantienen los valores en 0
            }
            return {
              ...reel,
              active: reel.is_active,
              url: reel.url || '',
              thumbnailUrl: reel.url ? getThumbnailUrl(reel.url) : null,
              totalVisits,
              visits24,
              visits7d
            };
          }));
          setReels(reelsWithStats);
        } else {
          setError('Error al cargar los reels');
        }
      } catch (err) {
        setError('Error al cargar los reels');
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  const openDeleteDialog = (id: number) => {
    setReelToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!reelToDelete) return;
    
    setDeleteLoading(reelToDelete);
    setDeleteDialogOpen(false);
    
    try {
      const response = await deleteReel(reelToDelete);

      if (response.success) {
        setReels(reels.filter(reel => reel.id !== reelToDelete));
      } else {
        setError('Error al eliminar el reel');
      }
    } catch (err) {
      setError('Error al eliminar el reel');
    } finally {
      setDeleteLoading(null);
      setReelToDelete(null);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setDeleteLoading(id);
    try {
      const response = await toggleReelStatus(id, !currentStatus);

      if (response.success) {
        setReels(reels.map(reel =>
          reel.id === id ? { ...reel, active: !currentStatus, is_active: !currentStatus } : reel
        ));
      } else {
        setError('Error al cambiar el estado del reel');
      }
    } catch (err) {
      setError('Error al cambiar el estado del reel');
    } finally {
      setDeleteLoading(null);
    }
  };

  const openStatsDialog = async (id: number) => {
    setSelectedReelId(id);
    setStatsDialogOpen(true);
    setLoadingStats(true);
    setStatsError(null);
    
    try {
      const [weeklyResponse, hourlyResponse, totalResponse] = await Promise.all([
        getReelDmDailyCountLastWeek(id),
        getReelDmHourlyCountCurrentDay(id),
        getReelDmTotalCount(id)
      ]);

      if (totalResponse.success) {
        setTotalDms(totalResponse.data.total_count);
      }

      if (weeklyResponse.success) {
        setWeeklyStats(weeklyResponse.data.daily_stats);
      }

      if (hourlyResponse.success) {
        const formattedHourlyData = hourlyResponse.data.hourly_stats.map(stat => {
          const date = new Date(stat.hour);
          return {
            hour: `${date.getHours()}h`,
            count: stat.count,
            timestamp: date.getTime()
          };
        });
        setHourlyData(formattedHourlyData);
      }
    } catch (err) {
      setStatsError('Error al cargar las estadísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  return {
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
    weeklyStats,
    openDeleteDialog,
    handleDelete,
    handleToggleActive,
    openStatsDialog
  };
} 
