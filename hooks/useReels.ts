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
  getAllMediaDmConsolidatedStats
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
    const fetchMedia = async () => {
      try {
        // Obtener todas las estadísticas consolidadas en una sola llamada
        const allStatsResponse = await getAllMediaDmConsolidatedStats();
        
        // Obtener listas de reels y stories
        const [reelsResponse, storiesResponse] = await Promise.all([
          getReels(),
          getStories()
        ]);

        // Extraer datos de estadísticas para facilitar acceso
        let mediaStats: Record<string, any> = {};
        let overallStats = {
          daily_breakdown: [] as Array<{day: string; count: number}>,
          today_total: 0,
          last_7_days_total: 0,
          all_time_total: 0
        };
        
        if (allStatsResponse.success) {
          mediaStats = allStatsResponse.data.by_media;
          overallStats = allStatsResponse.data.overall;
        }
        
        // Procesar reels con sus estadísticas correspondientes
        if (reelsResponse.success) {
          const reelsWithStats = reelsResponse.data
            .filter((item): item is Reel => item.media_type === 'reel')
            .map(item => {
              // Buscar estadísticas para este reel específico
              const stats = mediaStats[item.id.toString()] || null;
              
              const reelWithStats: ReelWithStats = {
                ...item,
                active: item.is_active,
                url: item.url || '',
                thumbnail_url: item.thumbnail_url || null,
                totalVisits: stats ? stats.all_time_total : 0,
                visits24: stats ? stats.today_total : 0,
                visits7d: stats ? stats.last_7_days_total : 0,
                shortcode: item.shortcode
              };
              
              return reelWithStats;
            });
          
          setReels(reelsWithStats);
        }
        
        // Procesar stories con sus estadísticas correspondientes
        if (storiesResponse.success) {
          const storiesWithStats = storiesResponse.data.map((item: Story) => {
            // Buscar estadísticas para esta story específica
            const stats = mediaStats[item.id.toString()] || null;
            
            const storyWithStats: StoryWithStats = {
              ...item,
              active: item.is_active,
              url: item.url || '',
              thumbnail_url: item.thumbnail_url || null,
              totalVisits: stats ? stats.all_time_total : 0,
              visits24: stats ? stats.today_total : 0,
              visits7d: stats ? stats.last_7_days_total : 0
            };
            
            return storyWithStats;
          });
          
          setStories(storiesWithStats);
        }
      } catch (err) {
        setError('Error al cargar los medios');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
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
      // Ejecutamos ambas peticiones en paralelo
      const [hourlyResponse, allStatsResponse] = await Promise.all([
        getReelDmHourlyCountCurrentDay(id),
        getAllMediaDmConsolidatedStats()
      ]);
      
      if (allStatsResponse.success) {
        const mediaStats = allStatsResponse.data.by_media[id.toString()];
        
        if (mediaStats) {
          setTotalDms(mediaStats.all_time_total);
          setWeeklyStats(mediaStats.daily_breakdown.map(item => ({
            day: item.day,
            count: item.count
          })));
        } else {
          // Si no hay estadísticas para este media, usar valores por defecto
          setTotalDms(0);
          setWeeklyStats([]);
        }
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
  };
} 
