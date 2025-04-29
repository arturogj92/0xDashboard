import { useState, useEffect } from 'react';
import { Reel, Story, Media } from '@/lib/types';
import { 
  getReels,
  getStories,
  toggleReelStatus,
  toggleStoryStatus,
  deleteReel,
  deleteStory,
  getReelDmHourlyCountCurrentDay,
  getAllMediaDmConsolidatedStats,
  getMediaBatchStats,
  getMediaDmStats
} from '@/lib/api';

interface MediaWithStats extends Omit<Media, 'thumbnail_url'> {
  active: boolean;
  url: string;
  thumbnail_url: string | null;
  totalVisits: number;
  visits24: number;
  visits7d: number;
}

interface ReelWithStats extends MediaWithStats {
  media_type: 'reel';
  shortcode: string;
}

interface StoryWithStats extends MediaWithStats {
  media_type: 'story';
}

// --- Multi-sorting types ---
export type SortField = 'date' | 'visits' | 'draft';
export type SortOrder = 'asc' | 'desc';

export function useReels() {
  const [reels, setReels] = useState<ReelWithStats[]>([]);
  const [stories, setStories] = useState<StoryWithStats[]>([]);
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
  const [reelsPagination, setReelsPagination] = useState<{ page: number; totalPages: number } | null>(null);
  const [storiesPagination, setStoriesPagination] = useState<{ page: number; totalPages: number } | null>(null);

  // Estado de ordenación
  const [sortField, setSortField] = useState<SortField>('visits');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Paginación independiente
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

  const fetchReelsPage = async (pageNumber: number, sField: SortField = sortField, sOrder: SortOrder = sortOrder) => {
    setLoading(true);
    const apiSort = sField === 'draft' ? undefined : sField;
    const apiOrder = sOrder;
    try {
      const reelsResponse = await getReels({ page: pageNumber, limit: 6, sort: apiSort, order: apiOrder });

      // Asegurar que la paginación se establezca incluso si solo hay 1 página
      if (reelsResponse.success) {
        setReelsPagination({
          page: reelsResponse.pagination?.page || 1,
          totalPages: reelsResponse.pagination?.totalPages || 1
        });
      } else {
        setReelsPagination(null); // Resetear en caso de error
      }

      const mediaIds = reelsResponse.success ? reelsResponse.data.map(r => r.id) : [];
      const batchStatsResp = mediaIds.length ? await getMediaBatchStats(mediaIds) : { success: true, data: [] };
      const statsMap: Record<number, any> = {};
      if (batchStatsResp.success) batchStatsResp.data.forEach(stat => (statsMap[stat.media_id] = stat));

      if (reelsResponse.success) {
        const reelsWithStats = reelsResponse.data
          .filter((it): it is Reel => it.media_type === 'reel')
          .map(item => {
            const stats = statsMap[item.id] || null;
            return {
              ...item,
              active: item.is_active,
              url: item.url || '',
              thumbnail_url: item.thumbnail_url || null,
              totalVisits: stats ? stats.all_time_total : 0,
              visits24: stats ? stats.today_total : 0,
              visits7d: stats ? stats.last_7_days_total : 0,
              shortcode: item.shortcode
            } as ReelWithStats;
          });

        // Orden borrador (por ahora no incluido)
        setReels(reelsWithStats);
      }
    } catch (err) {
      setError('Error al cargar los reels');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoriesPage = async (pageNumber: number, sField: SortField = sortField, sOrder: SortOrder = sortOrder) => {
    setLoading(true);
    const apiSort = sField === 'draft' ? undefined : sField;
    const apiOrder = sOrder;
    try {
      const storiesResponse = await getStories({ page: pageNumber, limit: 6, sort: apiSort, order: apiOrder });

      // Asegurar que la paginación se establezca incluso si solo hay 1 página
      if (storiesResponse.success) {
        setStoriesPagination({
          page: storiesResponse.pagination?.page || 1,
          totalPages: storiesResponse.pagination?.totalPages || 1
        });
      } else {
        setStoriesPagination(null); // Resetear en caso de error
      }

      const mediaIds = storiesResponse.success ? storiesResponse.data.map(r => r.id) : [];
      const batchStatsResp = mediaIds.length ? await getMediaBatchStats(mediaIds) : { success: true, data: [] };
      const statsMap: Record<number, any> = {};
      if (batchStatsResp.success) batchStatsResp.data.forEach(stat => (statsMap[stat.media_id] = stat));

      if (storiesResponse.success) {
        const storiesWithStats = storiesResponse.data.map(item => {
          const stats = statsMap[item.id] || null;
          return {
            ...item,
            active: item.is_active,
            url: item.url || '',
            thumbnail_url: item.thumbnail_url || null,
            totalVisits: stats ? stats.all_time_total : 0,
            visits24: stats ? stats.today_total : 0,
            visits7d: stats ? stats.last_7_days_total : 0
          } as StoryWithStats;
        });
        setStories(storiesWithStats);
      }
    } catch (err) {
      setError('Error al cargar las historias');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    if (reelsPagination && pageNumber === reelsPagination.page) return;
    fetchReelsPage(pageNumber);
  };

  // Carga inicial de datos (reels y stories)
  useEffect(() => {
    fetchReelsPage(1);
    fetchStoriesPage(1);
  }, []);

  // Cambiar criterio de ordenación y recargar ambas listas en página 1
  const changeSorting = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    fetchReelsPage(1, field, order);
    fetchStoriesPage(1, field, order);
  };

  const openDeleteDialog = (id: number) => {
    setReelToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!reelToDelete) return;
    
    setDeleteLoading(reelToDelete);
    setDeleteDialogOpen(false);
    
    try {
      // Determinar si es un reel o una historia
      const isStory = stories.some(story => story.id === reelToDelete);
      const response = isStory 
        ? await deleteStory(reelToDelete)
        : await deleteReel(reelToDelete);

      if (response.success) {
        setReels(reels.filter(reel => reel.id !== reelToDelete));
        setStories(stories.filter(story => story.id !== reelToDelete));
      } else {
        setError('Error al eliminar el medio');
      }
    } catch (err) {
      setError('Error al eliminar el medio');
    } finally {
      setDeleteLoading(null);
      setReelToDelete(null);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setDeleteLoading(id);
    try {
      // Determinar si es un reel o una historia
      const isStory = stories.some(story => story.id === id);
      const response = isStory
        ? await toggleStoryStatus(id, !currentStatus)
        : await toggleReelStatus(id, !currentStatus);

      if (response.success) {
        setReels(reels.map(reel =>
          reel.id === id ? { ...reel, active: !currentStatus, is_active: !currentStatus } : reel
        ));
        setStories(stories.map(story =>
          story.id === id ? { ...story, active: !currentStatus, is_active: !currentStatus } : story
        ));
      } else {
        setError('Error al cambiar el estado del medio');
      }
    } catch (err) {
      setError('Error al cambiar el estado del medio');
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
      const statsResp = await getMediaDmStats(id);
      if (statsResp.success) {
        setTotalDms(statsResp.data.all_time_total);
        setWeeklyStats(statsResp.data.daily_stats);
        const formattedHourly = statsResp.data.hourly_stats.map(item => ({
          hour: new Date(item.hour).getHours() + 'h',
          count: item.count,
          timestamp: new Date(item.hour).getTime()
        }));
        setHourlyData(formattedHourly);
      } else {
        setStatsError('Error al cargar las estadísticas');
      }
    } catch (err) {
      setStatsError('Error al cargar las estadísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleReelsPageChange = (pageNumber: number) => {
    if (reelsPagination && pageNumber === reelsPagination.page) return;
    fetchReelsPage(pageNumber);
  };

  const handleStoriesPageChange = (pageNumber: number) => {
    if (storiesPagination && pageNumber === storiesPagination.page) return;
    fetchStoriesPage(pageNumber);
  };

  return {
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
    openStatsDialog,
    reelsPagination,
    storiesPagination,
    sortField,
    sortOrder,
    changeSorting,
    handleReelsPageChange,
    handleStoriesPageChange
  };
} 
