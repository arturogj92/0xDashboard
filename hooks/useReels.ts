import { useState, useEffect } from 'react';
import { Reel, Story, Media } from '@/lib/types';
import { 
  getReels,
  getStories,
  toggleReelStatus,
  toggleStoryStatus,
  deleteReel,
  deleteStory,
  getReelDmTotalCountToday, 
  getReelDmTotalCount, 
  getReelDmDailyCountLastWeek, 
  getReelDmTotalCount7d,
  getReelDmHourlyCountCurrentDay 
} from '@/lib/api';

interface MediaWithStats extends Omit<Media, 'thumbnailUrl'> {
  active: boolean;
  url: string;
  thumbnailUrl: string | null;
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
        const [reelsResponse, storiesResponse] = await Promise.all([
          getReels(),
          getStories()
        ]);

        if (reelsResponse.success) {
          const reelsWithStats = await Promise.all(reelsResponse.data
            .filter((item): item is Reel => item.media_type === 'reel')
            .map(async (item) => {
              let totalVisits = 0;
              let visits24 = 0;
              let visits7d = 0;

              try {
                const totalCountResponse = await getReelDmTotalCount(item.id);
                if (totalCountResponse.success) {
                  totalVisits = totalCountResponse.data.total_count;
                }

                const todayCountResponse = await getReelDmTotalCountToday(item.id);
                if (todayCountResponse.success) {
                  visits24 = todayCountResponse.data.total_count_today;
                }

                const weekCountResponse = await getReelDmTotalCount7d(item.id);
                if (weekCountResponse.success) {
                  visits7d = weekCountResponse.data.total_count_7d;
                }
              } catch (error) {
                // Si ocurre un error al obtener los contadores, se mantienen los valores en 0
              }

              const reelWithStats: ReelWithStats = {
                ...item,
                active: item.is_active,
                url: item.url || '',
                thumbnailUrl: item.url ? getThumbnailUrl(item.url) : null,
                totalVisits,
                visits24,
                visits7d,
                shortcode: item.shortcode
              };

              return reelWithStats;
            }));

          setReels(reelsWithStats);
        }

        if (storiesResponse.success) {
          const storiesWithStats = await Promise.all(storiesResponse.data.map(async (item: Story) => {
            let totalVisits = 0;
            let visits24 = 0;
            let visits7d = 0;

            try {
              const totalCountResponse = await getReelDmTotalCount(item.id);
              if (totalCountResponse.success) {
                totalVisits = totalCountResponse.data.total_count;
              }

              const todayCountResponse = await getReelDmTotalCountToday(item.id);
              if (todayCountResponse.success) {
                visits24 = todayCountResponse.data.total_count_today;
              }

              const weekCountResponse = await getReelDmTotalCount7d(item.id);
              if (weekCountResponse.success) {
                visits7d = weekCountResponse.data.total_count_7d;
              }
            } catch (error) {
              // Si ocurre un error al obtener los contadores, se mantienen los valores en 0
            }

            const storyWithStats: StoryWithStats = {
              ...item,
              active: item.is_active,
              url: item.url || '',
              thumbnailUrl: null,
              totalVisits,
              visits24,
              visits7d
            };

            return storyWithStats;
          }));

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
