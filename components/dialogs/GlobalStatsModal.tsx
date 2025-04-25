import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

// Tooltip personalizado con fondo oscuro y texto claro
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-2 border border-border rounded-md shadow-md text-gray-100">
        <p className="text-sm">{`${label} : ${payload[0].value} mensajes`}</p>
      </div>
    );
  }
  return null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: '28d' | '7d' | 'yesterday' | 'today';
  mediaType: 'reel' | 'story';
}

// Leer la URL base del backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function GlobalStatsModal({ open, onOpenChange, period, mediaType }: Props) {
  // Ref para evitar llamadas duplicadas en desarrollo (StrictMode)
  const fetchedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<Array<{ date: string; count: number }>>([]);
  const [hourlyData, setHourlyData] = useState<Array<{ hour: string; count: number }>>([]);

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
          else throw new Error(json.message || 'Error al cargar datos diarios');
        } else {
          const dateObj = new Date();
          if (period === 'yesterday') dateObj.setDate(dateObj.getDate() - 1);
          const dateStr = dateObj.toISOString().slice(0, 10);
          const res = await fetch(
            `${BASE_URL}/api/media/stats/hourly-visits?date=${dateStr}&media_type=${mediaType}`,
            { headers }
          );
          const json = await res.json();
          if (json.success) setHourlyData(json.data);
          else throw new Error(json.message || 'Error al cargar datos horarios');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [open, period, mediaType]);

  const getTitle = () => {
    switch (period) {
      case '28d': return 'Últimos 28 días';
      case '7d': return 'Últimos 7 días';
      case 'yesterday': return 'Ayer';
      case 'today': return 'Hoy';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-black/90 border border-gray-700 text-gray-200 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-100">Estadísticas: {getTitle()}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Desglose por {period === '28d' || period === '7d' ? 'día' : 'hora'} ({mediaType})
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <Skeleton className="h-64 w-full rounded-md" />
          ) : error ? (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
              {error}
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
                  <Bar dataKey="count" fill="var(--primary)">
                    {(period === '28d' || period === '7d' ? dailyData : displayHourlyData).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill="var(--accent)" />
                    ))}
                  </Bar>
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'gray', fillOpacity: 0.5 }}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 