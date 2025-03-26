'use client';

import { useEffect, useState } from 'react';
import { Reel } from '@/lib/types';
import { getReels, toggleReelStatus, deleteReel } from '@/lib/api';
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
import { PencilIcon, EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Función para extraer el ID del reel de Instagram desde la URL
  const extractInstagramReelId = (url: string) => {
    if (!url) return null;
    
    // Intentar extraer el ID del reel de diferentes formatos de URL de Instagram
    const regex = /(?:reel|p)\/([A-Za-z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Función para generar la URL de la miniatura
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
          // Mapear is_active a active para mantener compatibilidad
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

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este reel?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      // Llamar a la API para eliminar el reel
      const response = await deleteReel(id);

      if (response.success) {
        // Actualizar el estado local después de eliminar
        setReels(reels.filter(reel => reel.id !== id));
      } else {
        setError('Error al eliminar el reel');
      }
    } catch (err) {
      setError('Error al eliminar el reel');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setDeleteLoading(id);
    try {
      // Implementar la llamada a la API para cambiar el estado
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
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
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Reels</h1>
          <p className="mt-2 text-sm text-gray-400">
            Lista de reels configurados para respuestas automáticas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button asChild>
            <Link href="/reels/new">
              Añadir Reel
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {reels.map((reel) => (
          <Card key={reel.id} className={`overflow-hidden border border-dashed border-gray-700 ${!reel.is_active ? "bg-gray-900/50" : ""}`}>
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
              <div className="flex-1 p-4">
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
                        >
                          {reel.url}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Sin URL</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-0">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${reel.is_active ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                      {reel.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-3 justify-end">
                  <Toggle
                    asChild
                    className="w-10 h-6 flex items-center justify-center hover:bg-purple-900"
                    variant="outline"
                  >
                    <Link href={`/reels/${reel.id}`}>
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                  </Toggle>
                  
                  <Toggle
                    pressed={!reel.is_active}
                    onPressedChange={() => handleToggleActive(reel.id, reel.is_active || false)}
                    disabled={deleteLoading === reel.id}
                    className="w-10 h-6 flex items-center justify-center hover:bg-purple-900"
                    variant="outline"
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
                    onClick={() => handleDelete(reel.id)}
                    disabled={deleteLoading === reel.id}
                    className="w-10 h-6 flex items-center justify-center hover:bg-red-900 text-red-400"
                    variant="outline"
                  >
                    {deleteLoading === reel.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-300"></div>
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </Toggle>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}