'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

// Interfaz para tooltip personalizado
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  const t = useTranslations('components.globalStatsModal');
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-2 border border-gray-700 rounded shadow-lg">
        <p className="text-sm">{(t as any)('tooltipLabel', { label: label || '', value: payload[0].value })}</p>
      </div>
    );
  }
  return null;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: '28d' | '7d' | 'yesterday' | 'today';
  mediaType: 'reel' | 'story';
}

// Leer la URL base del backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function GlobalStatsModal({ open, onOpenChange, period, mediaType }: Props) {
  const t = useTranslations('components.globalStatsModal');
  // Ref para evitar llamadas duplicadas en desarrollo (StrictMode)
  const fetchedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<Array<{ date: string; count: number }>>([]);
  const [hourlyData, setHourlyData] = useState<Array<{ hour: string; count: number }>>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const dayColors = ['#F87171','#A78BFA','#34D399','#FBBF24','#60A5FA','#F472B6','#10B981'];
  const dayKeys = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const handleLegendClick = (dayIndex: number) => setSelectedDay(prev => prev === dayIndex ? null : dayIndex);
  const dayTotals = useMemo<number[]>(() => {
    const totals = Array(7).fill(0);
    if (period === '28d') {
      dailyData.forEach(({ date, count }) => {
        const d = new Date((date as string));
        totals[d.getDay()] += count;
      });
    }
    return totals;
  }, [dailyData, period]);

  useEffect(() => {
    // Ejecutar fetchData solo la primera vez que open pasa a true
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (period === '28d' || period === '7d') {
          const days = period === '28d' ? 28 : 7;
          const res = await fetch(
            `${BASE_URL}/api/media/stats/daily-visits?days=${days}&media_type=${mediaType}&timezone=UTC`,
            { headers }
          );
          const json = await res.json();
          if (json.success) setDailyData(json.data);
          else throw new Error(json.message || t('errorLoadingDaily'));
        } else {
          const dateObj = new Date();
          if (period === 'yesterday') dateObj.setDate(dateObj.getDate() - 1);
          const dateStr = dateObj.toISOString().slice(0, 10);
          // Obtengo la zona horaria del usuario
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          const res = await fetch(
            `${BASE_URL}/api/media/stats/hourly-visits?date=${dateStr}&media_type=${mediaType}&timezone=${encodeURIComponent(tz)}`,
            { headers }
          );
          const json = await res.json();
          if (json.success) setHourlyData(json.data);
          else throw new Error(json.message || t('errorLoadingHourly'));
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || t('errorGeneric'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [open, period, mediaType]);

  const getTitle = () => {
    switch (period) {
      case '28d': return t('period28d');
      case '7d': return t('period7d');
      case 'yesterday': return t('periodYesterday');
      case 'today': return t('periodToday');
    }
  };

  // Para 'today', mostrar hasta la hora actual
  const displayHourlyData = (() => {
    if (period === 'today') {
      const now = new Date();
      const maxHour = now.getHours();
      return hourlyData.filter(item => {
        const h = parseInt(item.hour.split(':')[0], 10);
        return h <= maxHour;
      });
    }
    return hourlyData;
  })();

  const interval = period === '28d' || period === '7d' ? t('intervalDay') : t('intervalHour');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-black/90 border border-gray-700 text-gray-200 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-100">{t('titlePrefix')} {getTitle()}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {(t as any)('subtitle', { interval, mediaType })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <Skeleton className="h-64 w-full rounded-md" />
          ) : error ? (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
              {t('errorLoadingMessage')}: {error}
            </div>
          ) : (
            <div className="w-full mb-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={period === '28d' || period === '7d' ? dailyData : displayHourlyData}>
                  <CartesianGrid stroke="none" />
                  <XAxis
                    dataKey={period === '28d' || period === '7d' ? 'date' : 'hour'}
                    tickFormatter={(val: any) => {
                      if (period === '28d' || period === '7d') {
                        const d = new Date(val);
                        return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
                      }
                      return String(val).padStart(2, '0');
                    }}
                    fontSize={11}
                  />
                  <YAxis />
                  <Bar dataKey="count">
                    {(period === '28d' || period === '7d' ? dailyData : displayHourlyData).map((entry, idx) => {
                      let fill = 'var(--accent)';
                      let opacity = 1;
                      if (period === '28d') {
                        const d = new Date((entry as any).date);
                        const dayIndex = d.getDay();
                        fill = dayColors[dayIndex];
                        opacity = selectedDay === null || selectedDay === dayIndex ? 1 : 0.3;
                      }
                      return <Cell key={`cell-${idx}`} fill={fill} fillOpacity={opacity} />;
                    })}
                  </Bar>
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'gray', fillOpacity: 0.5 }}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                </BarChart>
              </ResponsiveContainer>
              {period === '28d' && (
                <>
                  <p className="text-center text-xs text-gray-400 mt-2">{t('legendHint')}</p>
                  <div className="flex justify-center flex-wrap gap-4 mt-2">
                    {dayKeys.map((key, idx) => (
                      <div
                        key={key}
                        onClick={() => handleLegendClick(idx)}
                        className={`flex items-center gap-1 cursor-pointer ${selectedDay !== null && selectedDay !== idx ? 'opacity-50' : 'opacity-100'} ${selectedDay === idx ? 'font-medium' : ''}`}
                      >
                        <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: dayColors[idx] }} />
                        <span className="text-xs">{`${t(`day${key}`)}: ${dayTotals[idx].toLocaleString()}`}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            {t('buttonClose')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 