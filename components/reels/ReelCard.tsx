import { Media } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Toggle } from '@/components/ui/toggle';
import { useRouter } from 'next/navigation';
import { 
  TrashIcon, 
  ChartBarIcon,  
  DocumentTextIcon, 
  LinkIcon,
} from '@heroicons/react/24/outline';
import { Calendar, CalendarDays, CalendarClock, Play, Pause, Power, PowerOff } from 'lucide-react';
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
    <Card 
      className={`overflow-hidden border border-gray-400 ${!media.is_active ? "bg-gray-900/50" : "bg-black"} transition-all duration-200 hover:scale-[1.01] hover:bg-purple-900/30 cursor-pointer relative`}
      onClick={handleCardClick}
    >
      {/* Indicadores en la esquina superior derecha */}
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`inline-flex items-center rounded-full px-2 text-xs font-semibold leading-5 ${media.is_active ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                {media.is_active ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{media.is_active ? 'Activo' : 'Inactivo'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center rounded-full px-2 text-xs font-semibold leading-5 bg-indigo-900/50 text-indigo-400">
                <Calendar className="h-3 w-3 mr-1" />
                {media.totalVisits}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total de visitas</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center rounded-full px-2 text-xs font-semibold leading-5 bg-purple-900/50 text-purple-400">
                <CalendarDays className="h-3 w-3 mr-1" />
                {media.visits7d}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visitas en los últimos 7 días</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center rounded-full px-2 text-xs font-semibold leading-5 bg-yellow-900/50 text-yellow-400">
                <CalendarClock className="h-3 w-3 mr-1" />
                {media.visits24}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visitas en las últimas 24 horas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex flex-col sm:flex-row">
        {/* Imagen del Media */}
        <div className="w-full sm:w-32 h-32 bg-gray-800 flex-shrink-0">
          {media.thumbnailUrl ? (
            <div className="w-full h-full relative">
              <Image 
                src={media.thumbnailUrl} 
                alt={`Miniatura de ${media.description}`}
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
        
        {/* Contenido del Media */}
        <div className="flex-1 p-6">
          <div className="flex flex-col sm:flex-row justify-between">
            <div>
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-200 truncate">
                  {media.description || <span className="italic text-gray-500">Sin descripción</span>}
                </h3>
              </div>
              <div className="mt-1 flex items-center">
                <LinkIcon className="h-4 w-4 text-indigo-400 mr-1" />
                {media.url ? (
                  <a 
                    href={media.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-indigo-400 hover:text-indigo-300 truncate block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {media.url}
                  </a>
                ) : (
                  <span className="text-sm text-gray-500 italic">Sin URL</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="absolute bottom-2 right-2 flex space-x-3">
        <Toggle
          onClick={(e) => {
            e.stopPropagation();
            onStatsClick(media.id);
          }}
          className="w-10 h-6 flex items-center justify-center hover:bg-blue-900 text-blue-400"
        >
          <ChartBarIcon className="h-4 w-4" />
        </Toggle>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={!media.is_active}
                onPressedChange={() => onToggleActive(media.id, media.is_active || false)}
                disabled={deleteLoading === media.id}
                className="w-10 h-6 flex items-center justify-center hover:bg-purple-900"
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
        
        <Toggle
          onClick={(e) => {
            e.stopPropagation();
            onDelete(media.id);
          }}
          disabled={deleteLoading === media.id}
          className="w-10 h-6 flex items-center justify-center hover:bg-red-900 text-red-400"
        >
          {deleteLoading === media.id ? (
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-300"></div>
          ) : (
            <TrashIcon className="h-4 w-4" />
          )}
        </Toggle>
      </div>
    </Card>
  );
} 