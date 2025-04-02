import { Media, Story } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Toggle } from '@/components/ui/toggle';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  TrashIcon, 
  ChartBarIcon,  
  DocumentTextIcon, 
  LinkIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { Calendar, CalendarDays, CalendarClock, Play, Pause } from 'lucide-react';
import { Card } from '../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MediaCardProps {
  media: Media;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
  onStatsClick: (id: number) => void;
  deleteLoading: number | null;
}

export function MediaCard({ 
  media, 
  onDelete, 
  onToggleActive, 
  onStatsClick,
  deleteLoading 
}: MediaCardProps) {
  const router = useRouter();
  const isDraft = !media.url || media.url === '';
  
  const getMediaPath = (media: Media) => {
    return media.media_type === 'story' ? 'stories' : 'reels';
  };

  const handleCardClick = () => {
    router.push(`/${getMediaPath(media)}/${media.id}`);
  };

  // Función para acortar la URL para visualización móvil
  const getShortenedUrl = (url: string) => {
    if (!url) return '';
    
    // Extraer el ID del reel de Instagram
    const match = url.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
    if (match && match[1]) {
      return `${match[1]}`;
    }

    return url;
  };

  return (
    <div className="relative">
      <Card 
        className={`relative border-2 border-b-dashed border-l-dashed border-r-dashed ${
          isDraft 
            ? 'border-indigo-900/50 border-t-amber-500 bg-[#12072f]' 
            : media.is_active 
              ? 'border-indigo-900/50 border-t-[#268529] bg-[#12072f]' 
              : 'border-gray-800/50 border-t-red-500 bg-[#170e23]'
        } hover:bg-[#1a0e35] rounded-xl transition-all duration-200 cursor-pointer shadow-lg`}
        onClick={handleCardClick}
      >
        
        <div className="flex p-5">
          {/* Miniatura a la izquierda */}
          <div className="w-20 h-20 md:w-28 md:h-28 mr-2 md:mr-5 relative flex-shrink-0 rounded-lg overflow-hidden border border-indigo-900/50 shadow-md">
            {media.media_type === 'story' && (media as Story).story_url_image && (media as Story).story_url_image !== '' ? (
              <Image 
                src={(media as Story).story_url_image as string} 
                alt={`Imagen de ${media.description}`}
                fill
                className="object-cover"
              />
            ) : media.thumbnailUrl ? (
              <Image 
                src={media.thumbnailUrl} 
                alt={`Miniatura de ${media.description}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                <DocumentTextIcon className="h-8 w-8 text-gray-600" />
              </div>
            )}
            
            {/* Controles de reproducción y pausa superpuestos en la miniatura */}
            {isDraft ? (
              <div className="absolute top-2 right-2 bg-amber-500/20 rounded-full p-1">
                <DocumentTextIcon className="h-3 w-3 text-amber-400" />
              </div>
            ) : media.is_active ? (
              <div className="absolute top-2 right-2 bg-[#faa011]/20 rounded-full p-1">
                <Play className="h-3 w-3 text-[#faa011]" />
              </div>
            ) : (
              <div className="absolute top-2 right-2 bg-red-600/30 rounded-full p-1">
                <Pause className="h-3 w-3 text-red-400" />
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 md:gap-2 mb-1.5">
                <h3 className="text-base md:text-lg font-semibold text-white line-clamp-1">
                  {media.description || <span className="italic text-gray-500">Sin descripción</span>}
                </h3>
                
                {/* Badge de estado junto al título */}
                {isDraft ? (
                  <span className="inline-flex items-center rounded-md px-1.5 md:px-2.5 py-0.5 md:py-1 text-[10px] md:text-xs font-medium text-amber-400 bg-[#120724] border border-amber-500/70 whitespace-nowrap">
                    DRAFT
                  </span>
                ) : (
                  <span className={`inline-flex items-center rounded-md px-1.5 md:px-2.5 py-0.5 md:py-1 text-[10px] md:text-xs font-medium bg-[#120724] border whitespace-nowrap ${
                    media.is_active 
                      ? 'text-green-400 border-green-500/70' 
                      : 'text-red-400 border-red-500/70'
                  }`}>
                    {media.is_active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                )}
              </div>
              
              <div className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 line-clamp-1">
                {media.url ? (
                  <Link 
                    href={media.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-indigo-400 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon className="h-3.5 w-3.5 mr-1.5 inline-block" />
                    <span className="hidden md:inline">{media.url}</span>
                    <span className="inline md:hidden">{getShortenedUrl(media.url)}</span>
                  </Link>
                ) : (
                  <span className="italic text-gray-600">Sin URL</span>
                )}
              </div>
            </div>

            {/* Indicadores de estadísticas en fila */}
            <div className="flex items-center gap-2 md:space-x-3 flex-wrap">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center bg-indigo-900/40 rounded-full px-1.5 md:px-2.5 py-0.5 md:py-1 border border-indigo-800/30">
                      <PlayIcon className="h-3 w-3 md:h-4 md:w-4 text-indigo-400 mr-0.5 md:mr-1.5" />
                      <span className="text-indigo-300 text-[10px] md:text-xs font-medium">{media.totalVisits || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total de visitas</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center bg-purple-900/40 rounded-full px-1.5 md:px-2.5 py-0.5 md:py-1 border border-purple-800/30">
                      <CalendarDays className="h-3 w-3 md:h-4 md:w-4 text-purple-400 mr-0.5 md:mr-1.5" />
                      <span className="text-purple-300 text-[10px] md:text-xs font-medium">{media.visits7d || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visitas en los últimos 7 días</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center bg-amber-900/40 rounded-full px-1.5 md:px-2.5 py-0.5 md:py-1 border border-amber-800/30">
                      <CalendarClock className="h-3 w-3 md:h-4 md:w-4 text-amber-400 mr-0.5 md:mr-1.5" />
                      <span className="text-amber-300 text-[10px] md:text-xs font-medium">{media.visits24 || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visitas en las últimas 24 horas</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Controles de acción a la derecha */}
          <div className="ml-1 md:ml-2 flex flex-col space-y-1.5 md:space-y-2.5 justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatsClick(media.id);
                    }}
                    className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-blue-900/40 text-blue-400 rounded-full border border-blue-900/30"
                  >
                    <ChartBarIcon className="h-3 w-3 md:h-4 md:w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver estadísticas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={!media.is_active}
                    onPressedChange={() => onToggleActive(media.id, media.is_active || false)}
                    disabled={deleteLoading === media.id}
                    className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full ${media.is_active ? 'text-[#faa011] hover:bg-[#faa011]/30' : 'text-red-400 hover:bg-red-900/30'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deleteLoading === media.id ? (
                      <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-b-2 border-gray-300"></div>
                    ) : media.is_active ? (
                      <Pause className="h-3 w-3 md:h-4 md:w-4" />
                    ) : (
                      <Play className="h-3 w-3 md:h-4 md:w-4" />
                    )}
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{media.is_active ? 'Desactivar' : 'Activar'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(media.id);
                    }}
                    disabled={deleteLoading === media.id}
                    className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-red-900/40 text-red-400 rounded-full border border-red-900/30"
                  >
                    {deleteLoading === media.id ? (
                      <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-b-2 border-gray-300"></div>
                    ) : (
                      <TrashIcon className="h-3 w-3 md:h-4 md:w-4" />
                    )}
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eliminar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>
    </div>
  );
} 