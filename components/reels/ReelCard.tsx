import { Media, Story } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Toggle } from '@/components/ui/toggle';
import { useRouter } from 'next/navigation';
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
  const getMediaPath = (media: Media) => {
    return media.media_type === 'story' ? 'stories' : 'reels';
  };

  const handleCardClick = () => {
    router.push(`/${getMediaPath(media)}/${media.id}`);
  };

  return (
    <div className="relative">
      <Card 
        className={`relative border-2 border-b-dashed border-l-dashed border-r-dashed ${media.is_active ? 'border-indigo-900/50 border-t-[#268529] bg-[#12072f]' : 'border-gray-800/50 border-t-red-500 bg-[#170e23]'} hover:bg-[#1a0e35] rounded-xl transition-all duration-200 cursor-pointer shadow-lg`}
        onClick={handleCardClick}
      >
        
        <div className="flex p-5">
          {/* Miniatura a la izquierda */}
          <div className="w-28 h-28 mr-5 relative flex-shrink-0 rounded-lg overflow-hidden border border-indigo-900/50 shadow-md">
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
            {media.is_active ? (
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
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-lg font-semibold text-white line-clamp-1">
                  {media.description || <span className="italic text-gray-500">Sin descripción</span>}
                </h3>
                
                {/* Badge de estado junto al título */}
                <span className={`inline-flex items-center rounded-full h-5 px-2 text-xs font-medium shadow-sm border ${media.is_active ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'}`}>
                  {media.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="text-sm text-gray-400 mb-4 line-clamp-1">
                {media.url ? (
                  <Link 
                    href={media.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-indigo-400 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon className="h-3.5 w-3.5 mr-1.5 inline-block" />
                    {media.url}
                  </Link>
                ) : (
                  <span className="italic text-gray-600">Sin URL</span>
                )}
              </div>
            </div>

            {/* Indicadores de estadísticas en fila */}
            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center bg-indigo-900/40 rounded-full px-2.5 py-1 border border-indigo-800/30">
                      <PlayIcon className="h-4 w-4 text-indigo-400 mr-1.5" />
                      <span className="text-indigo-300 text-xs font-medium">{media.totalVisits || 0}</span>
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
                    <div className="flex items-center bg-purple-900/40 rounded-full px-2.5 py-1 border border-purple-800/30">
                      <CalendarDays className="h-4 w-4 text-purple-400 mr-1.5" />
                      <span className="text-purple-300 text-xs font-medium">{media.visits7d || 0}</span>
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
                    <div className="flex items-center bg-amber-900/40 rounded-full px-2.5 py-1 border border-amber-800/30">
                      <CalendarClock className="h-4 w-4 text-amber-400 mr-1.5" />
                      <span className="text-amber-300 text-xs font-medium">{media.visits24 || 0}</span>
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
          <div className="ml-2 flex flex-col space-y-2.5 justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatsClick(media.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-blue-900/40 text-blue-400 rounded-full border border-blue-900/30"
                  >
                    <ChartBarIcon className="h-4 w-4" />
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
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${media.is_active ? 'text-[#faa011] hover:bg-[#faa011]/30' : 'text-red-400 hover:bg-red-900/30'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deleteLoading === media.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-300"></div>
                    ) : media.is_active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
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
                    className="w-8 h-8 flex items-center justify-center hover:bg-red-900/40 text-red-400 rounded-full border border-red-900/30"
                  >
                    {deleteLoading === media.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-300"></div>
                    ) : (
                      <TrashIcon className="h-4 w-4" />
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