'use client';

import { useState, useEffect } from 'react';
import { getShortUrlGlobalStats, getShortUrlDailyStats, getShortUrlDetailedStats } from '@/lib/api';

export interface ShortUrlGlobalStats {
  last_28_days_total: number;
  last_7_days_total: number;
  yesterday_total: number;
  today_total: number;
}

export interface ShortUrlDailyStats {
  date: string;
  count: number;
}

export interface ShortUrlDetailedStats {
  hourly_stats: Array<{ hour: string; count: number }>;
  daily_stats: Array<{ date: string; count: number }>;
  today_total: number;
  last_7_days_total: number;
  last_28_days_total: number;
  all_time_total: number;
}

// Hook para estadísticas globales del usuario
export function useShortUrlGlobalStats() {
  const [stats, setStats] = useState<ShortUrlGlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getShortUrlGlobalStats();
        
        if (!mounted) return;
        
        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch global statistics');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading, error };
}

// Hook para estadísticas diarias del usuario
export function useShortUrlDailyStats(days: number = 28) {
  const [stats, setStats] = useState<ShortUrlDailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getShortUrlDailyStats(days);
        
        if (!mounted) return;
        
        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch daily statistics');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [days]);

  return { stats, loading, error };
}

// Hook para estadísticas detalladas de una URL específica
export function useShortUrlDetailedStats(urlId: string | null) {
  const [stats, setStats] = useState<ShortUrlDetailedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!urlId) {
      setStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getShortUrlDetailedStats(urlId);
        
        if (!mounted) return;
        
        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch URL statistics');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [urlId]);

  return { stats, loading, error };
}