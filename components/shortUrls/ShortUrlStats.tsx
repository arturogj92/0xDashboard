'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  ClockIcon,
  FireIcon,
  HeartIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { 
  getShortUrlDailyStats,
  getShortUrlGlobalStats,
  type ShortUrlStats 
} from '@/lib/api';

interface ShortUrlStatsProps {
  userId?: string;
  refreshTrigger?: number;
}

interface DailyStats {
  date: string;
  count: number;
}

interface GlobalStats {
  last_28_days_total: number;
  last_7_days_total: number;
  yesterday_total: number;
  today_total: number;
}

export function ShortUrlStats({ userId, refreshTrigger }: ShortUrlStatsProps) {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '14' | '28'>('28');

  useEffect(() => {
    loadStats();
  }, [refreshTrigger, selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const days = parseInt(selectedPeriod);

      const [dailyResponse, globalResponse] = await Promise.all([
        getShortUrlDailyStats(days, timezone),
        getShortUrlGlobalStats(timezone)
      ]);

      if (dailyResponse.success) {
        setDailyStats(dailyResponse.data);
      } else {
        setError('Error loading daily stats');
      }

      if (globalResponse.success) {
        setGlobalStats(globalResponse.data);
      } else {
        setError('Error loading global stats');
      }
    } catch (err) {
      setError('Error loading statistics');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMaxClicks = () => {
    return Math.max(...dailyStats.map(stat => stat.count), 1);
  };

  const getTrendData = () => {
    if (!globalStats) return { trend: 0, isPositive: true };
    
    const todayVsYesterday = globalStats.today_total - globalStats.yesterday_total;
    const percentChange = globalStats.yesterday_total > 0 
      ? ((todayVsYesterday / globalStats.yesterday_total) * 100) 
      : (globalStats.today_total > 0 ? 100 : 0);
    
    return {
      trend: Math.abs(percentChange),
      isPositive: todayVsYesterday >= 0
    };
  };

  const getStatsIcon = (count: number) => {
    if (count > 100) return <FireIcon className="h-5 w-5 text-orange-400" />;
    if (count > 50) return <HeartIcon className="h-5 w-5 text-pink-400" />;
    if (count > 10) return <SparklesIcon className="h-5 w-5 text-yellow-400" />;
    return <ChartBarIcon className="h-5 w-5 text-indigo-400" />;
  };

  const { trend, isPositive } = getTrendData();

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-gradient-to-br from-[#120724] to-[#1c1033] border border-indigo-900/30 rounded-xl p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="inline-block">
            <SparklesIcon className="h-8 w-8 text-indigo-400 mb-4" />
          </div>
        </motion.div>
        <p className="text-gray-300">Cargando estadísticas mágicas... ✨</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-xl p-8 text-center">
        <div className="text-red-400 mb-4">❌</div>
        <p className="text-red-300">Oops! No pudimos cargar las estadísticas</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" onClick={loadStats}>
            🔄 Reintentar
          </div>
        </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards con animaciones super chulas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="bg-gradient-to-br from-[#120724] to-[#1c1033] border border-indigo-900/30 rounded-xl p-6 relative overflow-hidden group">
          <motion.div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 3 
                }}
              >
                <ClockIcon className="h-6 w-6 text-blue-400" />
              </motion.div>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {trend.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs font-medium text-gray-400 mb-1">Hoy</div>
            <motion.div 
              key={globalStats?.today_total}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <div className="text-2xl font-bold text-white">
                {globalStats?.today_total || 0}
              </div>
            </motion.div>
          </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="bg-gradient-to-br from-[#120724] to-[#1c1033] border border-indigo-900/30 rounded-xl p-6 relative overflow-hidden group">
          <motion.div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <motion.div
                animate={{ 
                  rotate: [0, -15, 15, 0] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  repeatDelay: 4 
                }}
              >
                <CalendarDaysIcon className="h-6 w-6 text-yellow-400" />
              </motion.div>
            </div>
            <div className="text-xs font-medium text-gray-400 mb-1">7 días</div>
            <motion.div 
              key={globalStats?.last_7_days_total}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <div className="text-2xl font-bold text-white">
                {globalStats?.last_7_days_total || 0}
              </div>
            </motion.div>
          </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="bg-gradient-to-br from-[#120724] to-[#1c1033] border border-indigo-900/30 rounded-xl p-6 relative overflow-hidden group">
          <motion.div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 2 
                }}
              >
                <GlobeAltIcon className="h-6 w-6 text-green-400" />
              </motion.div>
            </div>
            <div className="text-xs font-medium text-gray-400 mb-1">28 días</div>
            <motion.div 
              key={globalStats?.last_28_days_total}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <div className="text-2xl font-bold text-white">
                {globalStats?.last_28_days_total || 0}
              </div>
            </motion.div>
          </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="bg-gradient-to-br from-[#120724] to-[#1c1033] border border-indigo-900/30 rounded-xl p-6 relative overflow-hidden group">
          <motion.div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <motion.div
                animate={{ 
                  rotate: [0, 360] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {getStatsIcon(globalStats?.yesterday_total || 0)}
              </motion.div>
            </div>
            <div className="text-xs font-medium text-gray-400 mb-1">Ayer</div>
            <motion.div 
              key={globalStats?.yesterday_total}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <div className="text-2xl font-bold text-white">
                {globalStats?.yesterday_total || 0}
              </div>
            </motion.div>
          </div>
          </div>
        </motion.div>
      </div>

      {/* Gráfico de barras animado súper chulo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-gradient-to-br from-[#120724] to-[#1c1033] border border-indigo-900/30 rounded-xl p-6 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: [0, 360] 
            }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full blur-xl" />
          </motion.div>
        </div>

        <div className="relative z-10">
          {/* Header del gráfico */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 3 
                }}
              >
                <ChartBarIcon className="h-6 w-6 text-indigo-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white">
                📊 Clicks diarios
              </h3>
            </div>

            {/* Selector de período */}
            <div className="flex gap-2">
              {(['7', '14', '28'] as const).map((period) => (
                <motion.button
                  key={period}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div 
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedPeriod === period
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30'
                        : 'bg-[#1c1033] text-gray-300 hover:bg-[#2c1b4d] border border-gray-700'
                    }`}
                  >
                    {period}d
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Gráfico de barras animado */}
          <div className="h-48 flex items-end justify-center gap-1 px-2">
            <AnimatePresence mode="wait">
              {dailyStats.map((stat, index) => {
                const height = (stat.count / getMaxClicks()) * 100;
                const isToday = index === dailyStats.length - 1;
                
                return (
                  <motion.div
                    key={`${stat.date}-${selectedPeriod}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: `${height}%`, 
                      opacity: 1 
                    }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      y: -2
                    }}
                  >
                    <div className={`relative group cursor-pointer ${
                      dailyStats.length > 20 ? 'w-2' : 'w-4'
                    } min-h-[4px] rounded-t-lg ${
                      isToday 
                        ? 'bg-gradient-to-t from-yellow-600 to-orange-400 shadow-lg shadow-orange-500/20' 
                        : stat.count > getMaxClicks() * 0.7
                        ? 'bg-gradient-to-t from-green-600 to-emerald-400'
                        : stat.count > getMaxClicks() * 0.3
                        ? 'bg-gradient-to-t from-indigo-600 to-blue-400'
                        : 'bg-gradient-to-t from-gray-600 to-gray-400'
                    }`}
                    >
                    {/* Tooltip animado */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      whileHover={{ opacity: 1, y: -8, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-20">
                        <div className="font-medium">{stat.date}</div>
                        <div className="text-yellow-300">{stat.count} clicks</div>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45" />
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Efecto de brillo al hacer hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.3 }}
                    >
                      <div className="absolute inset-0 bg-white rounded-t-lg" />
                    </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Labels de fecha (solo algunos para no sobrecargar) */}
          <div className="flex justify-between mt-4 text-xs text-gray-400">
            <span>{dailyStats[0]?.date}</span>
            {dailyStats.length > 7 && (
              <span>{dailyStats[Math.floor(dailyStats.length / 2)]?.date}</span>
            )}
            <span className="text-yellow-400 font-medium">
              {dailyStats[dailyStats.length - 1]?.date} ✨
            </span>
          </div>
        </div>
        </div>
      </motion.div>

      {/* Mensaje motivacional dinámico */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="text-center">
        <motion.p 
          animate={{ 
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <span className="text-sm bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-medium">
          {globalStats?.today_total === 0 
            ? "🌟 ¡Hoy puede ser tu día de más clicks!" 
            : globalStats && globalStats.today_total > globalStats.yesterday_total
            ? "🚀 ¡Vas por buen camino! Más clicks que ayer"
            : "💪 Sigue creando contenido increíble, ¡los clicks vendrán!"
          }
          </span>
        </motion.p>
        </div>
      </motion.div>
    </div>
  );
}