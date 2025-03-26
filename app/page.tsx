'use client';

import { useEffect, useState } from 'react';
import { Reel, DmLog } from '@/lib/types';
import { getReels, toggleReelStatus, deleteReel, getReelDmLogs } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { PencilIcon, EyeIcon, EyeSlashIcon, TrashIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';

export default function Home() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reelToDelete, setReelToDelete] = useState<number | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState<number | null>(null);
  const [dmLogs, setDmLogs] = useState<DmLog[]>([]);
  const [totalDms, setTotalDms] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);

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
      return `https://www.instagram.com/p/${reelId}/media/?size=t`;
    }
    return null;
  };

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await getReels();
        if (response.success) {
          const formattedReels = response.data.map((reel: any) => ({
            ...reel,
            active: reel.is_active,
            url: reel.url || '',
            thumbnailUrl: reel.url ? getThumbnailUrl(reel.url) : null
          }));
          setReels(formattedReels);
        } else {
          setError('Error al cargar los reels');
        }
      } catch (err) {
        setError('Error al cargar los reels');
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
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
      const response = await deleteReel(reelToDelete);

      if (response.success) {
        setReels(reels.filter(reel => reel.id !== reelToDelete));
      } else {
        setError('Error al eliminar el reel');
      }
    } catch (err) {
      setError('Error al eliminar el reel');
    } finally {
      setDeleteLoading(null);
      setReelToDelete(null);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setDeleteLoading(id);
    try {
      const response = await toggleReelStatus(id, !currentStatus);

      if (response.success) {
        // Actualizar el estado local después de cambiar el estado
        setReels(reels.map(reel =>
          reel.id === id ? { ...reel, active: !currentStatus, is_active: !currentStatus } : reel
        ));
      } else {
        setError('Error al cambiar el estado del reel');
      }
    } catch (err) {
      setError('Error al cambiar el estado del reel');
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
      const response = await getReelDmLogs(id);
      if (response.success) {
        setDmLogs(response.data.logs);
        setTotalDms(response.data.total);
        
        // Procesar datos para gráficas
        processStatsData(response.data.logs);
      } else {
        setStatsError('Error al cargar las estadísticas');
      }
    } catch (err) {
      setStatsError('Error al cargar las estadísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  const processStatsData = (logs: DmLog[]) => {
    // Datos por hora del día actual
    const hourCounts: {[key: number]: number} = {};
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }
    
    // Datos por día (últimos 7 días)
    const today = new Date();
    const last7Days: {[key: string]: number} = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days[dateStr] = 0;
    }
    
    logs.forEach(log => {
      const sentDate = new Date(log.sent_at);
      
      // Contar por hora
      const hour = sentDate.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      
      // Contar por día
      const dateStr = sentDate.toISOString().split('T')[0];
      if (last7Days.hasOwnProperty(dateStr)) {
        last7Days[dateStr] = (last7Days[dateStr] || 0) + 1;
      }
    });
    
    // Convertir a formato para Recharts
    const hourlyData = Object.keys(hourCounts).map(hour => ({
      hour: `${hour}h`,
      count: hourCounts[parseInt(hour)]
    }));
    
    const dailyData = Object.keys(last7Days).map(date => ({
      date,
      count: last7Days[date]
    }));
    
    setHourlyData(hourlyData);
    setDailyData(dailyData);
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-black/90 border border-gray-700 text-gray-200 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-100">Confirmar eliminación</DialogTitle>
            <DialogDescription className="text-gray-400">
              ¿Estás seguro de que deseas eliminar este reel? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white relative overflow-hidden group"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDelete} 
              className="bg-red-900/80 hover:bg-red-800 text-red-100"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="sm:max-w-3xl bg-black/90 border border-gray-700 text-gray-200 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-100">Estadísticas de Mensajes</DialogTitle>
            <DialogDescription className="text-gray-400">
              Análisis de mensajes directos enviados para este reel
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {loadingStats ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900"></div>
              </div>
            ) : statsError ? (
              <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded relative">
                <span className="block sm:inline">{statsError}</span>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
                  <p className="flex items-center gap-1">
                    📊 <strong>Total mensajes enviados:</strong> {totalDms}
                  </p>
                </div>
                
                <h3 className="text-lg font-medium mb-2">Mensajes por hora</h3>
                <div className="w-full mb-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hourlyData}>
                      <CartesianGrid stroke="none" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{fill: "gray", fillOpacity: 0.5}} />
                      <Bar dataKey="count">
                        {hourlyData.map((entry, index) => (
                          <Cell 
                            key={`cell-hour-${index}`} 
                            fill="var(--primary)"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <h3 className="text-lg font-medium mb-2">Mensajes últimos 7 días</h3>
                <div className="w-full mb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyData}>
                      <CartesianGrid stroke="none" />
                      <XAxis 
                        dataKey="date" 
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
                        {dailyData.map((entry, index) => (
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
              onClick={() => setStatsDialogOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Reels</h1>
        <p className="text-sm text-gray-400 mb-6">
          Lista de reels configurados para respuestas automáticas
        </p>
        <Button asChild variant="outline" className="mx-auto hover:bg-purple-900/30 transition-colors duration-200">
          <Link href="/reels/new" className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Añadir Reel
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reels.map((reel) => (
          <Card 
            key={reel.id} 
            className={`overflow-hidden border border-gray-400 ${!reel.is_active ? "bg-gray-900/50" : "bg-black"} transition-all duration-200 hover:scale-[1.01] hover:bg-purple-900/30 cursor-pointer relative`}
            onClick={() => window.location.href = `/reels/${reel.id}`}
          >
            {/* Indicador de estado en la esquina superior derecha */}
            <div className="absolute top-2 right-2 z-10">
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${reel.is_active ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                {reel.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row">
              {/* Imagen del Reel */}
              <div className="w-full sm:w-32 h-32 bg-gray-800 flex-shrink-0">
                {reel.thumbnailUrl ? (
                  <div className="w-full h-full relative">
                    <Image 
                      src={reel.thumbnailUrl} 
                      alt={`Miniatura de ${reel.description}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-gray-400">Sin miniatura</span>
                  </div>
                )}
              </div>
              
              {/* Contenido del Reel */}
              <div className="flex-1 p-6">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-200 truncate">
                      {reel.description || <span className="italic text-gray-500">Sin descripción</span>}
                    </h3>
                    <div className="mt-1">
                      {reel.url ? (
                        <a 
                          href={reel.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-indigo-400 hover:text-indigo-300 truncate block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {reel.url}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Sin URL</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Botones de acción originales removidos de esta sección */}
              </div>
            </div>
            {/* Nueva posición de los botones: abajo a la derecha */}
            <div className="absolute bottom-2 right-2 flex space-x-3">
              <Toggle
                asChild
                className="w-10 h-6 flex items-center justify-center hover:bg-purple-900"
                onClick={(e) => e.stopPropagation()}
              >
                <Link href={`/reels/${reel.id}`}>
                  <PencilIcon className="h-4 w-4" />
                </Link>
              </Toggle>

              <Toggle
                onClick={(e) => {
                  e.stopPropagation();
                  openStatsDialog(reel.id);
                }}
                className="w-10 h-6 flex items-center justify-center hover:bg-blue-900 text-blue-400"
              >
                <ChartBarIcon className="h-4 w-4" />
              </Toggle>
              
              <Toggle
                pressed={!reel.is_active}
                onPressedChange={() => handleToggleActive(reel.id, reel.is_active || false)}
                disabled={deleteLoading === reel.id}
                className="w-10 h-6 flex items-center justify-center hover:bg-purple-900"
                onClick={(e) => e.stopPropagation()}
              >
                {deleteLoading === reel.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-300"></div>
                ) : reel.is_active ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <EyeSlashIcon className="h-4 w-4" />
                )}
              </Toggle>
              
              <Toggle
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(reel.id);
                }}
                disabled={deleteLoading === reel.id}
                className="w-10 h-6 flex items-center justify-center hover:bg-red-900 text-red-400"
              >
                {deleteLoading === reel.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-300"></div>
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
              </Toggle>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}