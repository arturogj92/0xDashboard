import { useState, useEffect } from 'react';
import { getGlobalMediaStats, getGlobalStoryStats } from '@/lib/api';

interface GlobalStats {
  today_total: number;
  yesterday_total: number;
  last_7_days_total: number;
  last_28_days_total: number;
  all_time_total: number;
}

export function useGlobalMediaStats(timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getGlobalMediaStats(timezone);
        if (res.success) {
          setStats(res.data as GlobalStats);
        } else {
          setError(res.message || 'Error al obtener estadísticas globales');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [timezone]);

  return { stats, loading, error };
}

export function useGlobalStoryStats(timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getGlobalStoryStats(timezone);
        if (res.success) {
          setStats(res.data as GlobalStats);
        } else {
          setError(res.message || 'Error al obtener estadísticas globales de Historias');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [timezone]);

  return { stats, loading, error };
} 