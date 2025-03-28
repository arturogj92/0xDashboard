import { DmLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';

interface StatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  error: string | null;
  totalDms: number;
  hourlyData: any[];
  weeklyStats: Array<{ day: string; count: number }>;
}

export function StatsDialog({
  open,
  onOpenChange,
  loading,
  error,
  totalDms,
  hourlyData,
  weeklyStats
}: StatsDialogProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 border border-border rounded-md shadow-md">
          <p className="text-sm">{`${label}: ${payload[0].value} mensajes`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-black/90 border border-gray-700 text-gray-200 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-100">Estadísticas de Mensajes</DialogTitle>
          <DialogDescription className="text-gray-400">
            Análisis de mensajes directos enviados para este reel
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
                <p className="flex items-center gap-1">
                  📊 <strong>Total mensajes enviados:</strong> {totalDms}
                </p>
                <p className="flex items-center gap-1">
                  📈 <strong>Total última semana:</strong> {weeklyStats.reduce((acc, curr) => acc + curr.count, 0)}
                </p>
              </div>
              
              <h3 className="text-lg font-medium mb-2">Mensajes por hora</h3>
              <div className="w-full mb-6">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={(() => {
                    const now = new Date();
                    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    const last24Hours = [];

                    // Crear array con las últimas 24 horas
                    for (let i = 0; i < 24; i++) {
                      const hour = new Date(twentyFourHoursAgo.getTime() + i * 60 * 60 * 1000);
                      const existingData = hourlyData.find(item => {
                        const itemDate = new Date(item.timestamp);
                        return itemDate.getHours() === hour.getHours() &&
                               itemDate.getDate() === hour.getDate() &&
                               itemDate.getMonth() === hour.getMonth();
                      });

                      last24Hours.push({
                        hour: `${hour.getHours()}h`,
                        count: existingData ? existingData.count : 0,
                        isYesterday: hour.getDate() !== now.getDate()
                      });
                    }
                    return last24Hours;
                  })()}>
                    <CartesianGrid stroke="none" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(val) => {
                        const hour = parseInt(val.replace('h', ''));
                        return `${hour.toString().padStart(2, '0')}h`;
                      }}
                    />
                    <YAxis />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const isYesterday = payload[0].payload.isYesterday;
                          return (
                            <div className="bg-card p-2 border border-border rounded-md shadow-md">
                              <p className="text-sm">{`${label} ${isYesterday ? '(ayer)' : '(hoy)'}: ${payload[0].value} mensajes`}</p>
                            </div>
                          );
                        }
                        return null;
                      }} 
                      cursor={{fill: "gray", fillOpacity: 0.5}} 
                    />
                    <Bar dataKey="count" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-500 text-right">* Mostrando las últimas 24 horas</p>
              </div>
              
              <h3 className="text-lg font-medium mb-2">Mensajes últimos 7 días</h3>
              <div className="w-full mb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyStats}>
                    <CartesianGrid stroke="none" />
                    <XAxis 
                      dataKey="day" 
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return d.toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{fill: "gray", fillOpacity: 0.5}} />
                    <Bar dataKey="count">
                      {weeklyStats.map((entry, index) => (
                        <Cell 
                          key={`cell-day-${index}`} 
                          fill="var(--accent)"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
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