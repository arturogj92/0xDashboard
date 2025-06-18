'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { getShortUrlDailyStats, getShortUrlDetailedStats, getShortUrlHourlyStats } from '@/lib/api';

// Interfaz para tooltip personalizado
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps & { t: any }> = ({ active, payload, label, t }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-2 border border-gray-700 rounded shadow-lg">
        <p className="text-sm">{`${label || ''}: ${payload[0].value} ${t('tooltip.clicks')}`}</p>
      </div>
    );
  }
  return null;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: '28d' | '7d' | 'yesterday' | 'today';
  urlId?: string; // Si se proporciona, muestra stats de URL específica
  urlTitle?: string; // Para mostrar en el título
  onPeriodChange?: (period: '28d' | '7d' | 'yesterday' | 'today') => void; // Para cambiar período
}

// Leer la URL base del backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function ShortUrlStatsModal({ open, onOpenChange, period, urlId, urlTitle, onPeriodChange }: Props) {
  const t = useTranslations('shortUrls.statsModal');
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
    // Reset fetchedRef when modal opens/closes or period changes
    if (open) {
      fetchedRef.current = false;
    }
  }, [open, period, urlId]);

  useEffect(() => {
    // Ejecutar fetchData solo la primera vez que open pasa a true
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        
        if (period === '28d' || period === '7d') {
          const days = period === '28d' ? 28 : 7;
          
          if (urlId) {
            // Estadísticas de URL específica - obtener datos diarios de la URL
            const response = await getShortUrlDetailedStats(urlId, timezone);
            if (response.success) {
              // Para URLs específicas, tomamos solo los días que necesitamos de daily_stats
              const relevantDays = response.data.daily_stats.slice(-days);
              setDailyData(relevantDays);
            } else {
              throw new Error(response.message || 'Error loading URL daily statistics');
            }
          } else {
            // Estadísticas globales del usuario
            const response = await getShortUrlDailyStats(days, timezone);
            if (response.success) {
              setDailyData(response.data);
            } else {
              throw new Error(response.message || 'Error loading daily statistics');
            }
          }
        } else {
          // Para 'today' y 'yesterday' - datos por hora
          if (urlId) {
            // Estadísticas de URL específica
            const response = await getShortUrlDetailedStats(urlId, timezone);
            if (response.success) {
              // Filtrar datos por hora para hoy o ayer
              let filteredHourlyData = response.data.hourly_stats;
              
              if (period === 'today') {
                // Para hoy, mostrar solo hasta la hora actual
                const now = new Date();
                const maxHour = now.getHours();
                filteredHourlyData = response.data.hourly_stats.filter(item => {
                  const hourStr = item.hour.includes(':') ? item.hour : `${item.hour}:00`;
                  const h = parseInt(hourStr.split(':')[0], 10);
                  return h <= maxHour;
                });
              }
              
              setHourlyData(filteredHourlyData);
            } else {
              throw new Error(response.message || 'Error loading URL hourly statistics');
            }
          } else {
            // Estadísticas globales por hora - usar el nuevo endpoint
            const response = await getShortUrlHourlyStats(24, timezone);
            if (response.success) {
              // Filtrar datos para mostrar solo hasta la hora actual para 'today'
              let filteredData = response.data;
              if (period === 'today') {
                const now = new Date();
                const maxHour = now.getHours();
                filteredData = response.data.filter(item => {
                  const hourStr = item.hour.includes(':') ? item.hour : `${item.hour}:00`;
                  const h = parseInt(hourStr.split(':')[0], 10);
                  return h <= maxHour;
                });
              }
              setHourlyData(filteredData);
            } else {
              throw new Error(response.message || 'Error loading hourly statistics');
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || t('errors.genericError'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [open, period, urlId]);

  const getTitle = () => {
    const baseTitle = urlTitle ? `${urlTitle} - ` : (urlId ? `${t('urlTitle')} - ` : `${t('globalTitle')} - `);
    return `${baseTitle}${t(`periods.${period}`)}`;
  };

  // Para 'today', mostrar hasta la hora actual
  const displayHourlyData = (() => {
    if (period === 'today') {
      const now = new Date();
      const maxHour = now.getHours();
      return hourlyData.filter(item => {
        const hourStr = item.hour.includes(':') ? item.hour : `${item.hour}:00`;
        const h = parseInt(hourStr.split(':')[0], 10);
        return h <= maxHour;
      });
    }
    return hourlyData;
  })();

  const interval = period === '28d' || period === '7d' ? t('description.day') : t('description.hour');

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-black/90 border border-gray-700 text-gray-200 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ width: '100%', height: '100%' }}
            >
              <DialogHeader>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <DialogTitle className="text-xl text-gray-100">{t('title')} - {getTitle()}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {interval}
                  </DialogDescription>
                </motion.div>
                
                {/* Botones de período para URLs individuales */}
                {urlId && onPeriodChange && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}
                  >
                    <Button
                      size="sm"
                      variant={period === '28d' ? 'default' : 'outline'}
                      onClick={() => onPeriodChange('28d')}
                      className={period === '28d' ? 'bg-indigo-600' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                    >
                      {t('buttons.28days')}
                    </Button>
                    <Button
                      size="sm"
                      variant={period === '7d' ? 'default' : 'outline'}
                      onClick={() => onPeriodChange('7d')}
                      className={period === '7d' ? 'bg-indigo-600' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                    >
                      {t('buttons.7days')}
                    </Button>
                    <Button
                      size="sm"
                      variant={period === 'today' ? 'default' : 'outline'}
                      onClick={() => onPeriodChange('today')}
                      className={period === 'today' ? 'bg-indigo-600' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                    >
                      {t('buttons.today')}
                    </Button>
                  </motion.div>
                )}
              </DialogHeader>

              {/* Contenedor con altura fija para evitar saltos */}
              <div className="mt-4 h-[400px] flex flex-col">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Skeleton className="h-64 w-full rounded-md" />
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
                        {t('errors.loadingError')}: {error}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`chart-${period}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      {/* Chart container con altura fija */}
                      <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={period === '28d' || period === '7d' ? dailyData : displayHourlyData}>
                            <CartesianGrid stroke="none" />
                            <XAxis
                              dataKey={period === '28d' || period === '7d' ? 'date' : 'hour'}
                              tickFormatter={(val: any) => {
                                if (period === '28d' || period === '7d') {
                                  const d = new Date(val);
                                  return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
                                }
                                const hourStr = String(val).includes(':') ? val : `${val}:00`;
                                return hourStr.split(':')[0].padStart(2, '0') + 'h';
                              }}
                              fontSize={11}
                            />
                            <YAxis />
                            <Bar dataKey="count">
                              {(period === '28d' || period === '7d' ? dailyData : displayHourlyData).map((entry, idx) => {
                                let fill = '#6366F1'; // Color por defecto indigo
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
                              content={<CustomTooltip t={t} />}
                              cursor={{ fill: 'gray', fillOpacity: 0.5 }}
                              wrapperStyle={{ zIndex: 1000 }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Legend para 28 días con altura fija */}
                      {period === '28d' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          style={{ marginTop: '1rem', height: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                          <p className="text-center text-xs text-gray-400">
                            {t('legend.clickToFilter')}
                          </p>
                          <div className="flex justify-center flex-wrap gap-4 mt-2">
                            {dayKeys.map((key, idx) => (
                              <div
                                key={key}
                                onClick={() => handleLegendClick(idx)}
                                className={`flex items-center gap-1 cursor-pointer transition-all duration-200 ${selectedDay !== null && selectedDay !== idx ? 'opacity-50' : 'opacity-100'} ${selectedDay === idx ? 'font-medium' : ''} hover:scale-105 active:scale-95`}
                              >
                                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: dayColors[idx] }} />
                                <span className="text-xs">{`${t(`days.${key}`)}: ${dayTotals[idx].toLocaleString()}`}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <DialogFooter className="flex justify-end gap-3 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    {t('buttons.close')}
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

