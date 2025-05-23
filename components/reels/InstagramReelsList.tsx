import { useState, useEffect, useRef, useCallback } from 'react';
import { getUserInstagramReels } from '@/lib/api';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

interface InstagramReel {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  thumbnail_url: string;
  timestamp: string;
  shortcode: string;
}

interface InstagramAccount {
  id: string;
  username: string;
  profile_picture_url: string;
  media_count: number;
}

interface Pagination {
  has_next_page: boolean;
  next_cursor: string | null;
}

interface InstagramReelsListProps {
  onSelectReel: (url: string, thumbnailUrl: string, caption: string) => void;
}

export const InstagramReelsList = ({ onSelectReel }: InstagramReelsListProps) => {
  const t = useTranslations('components.instagramReelsList');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const fetchReels = useCallback(async (afterCursor?: string | null) => {
    try {
      if (!afterCursor) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Reducir el número de reels inicial a 6 para cargar más rápido
      const limit = !afterCursor ? 6 : 6;
      const response = await getUserInstagramReels(limit, afterCursor ?? undefined);
      
      if (response.success && response.data) {
        if (afterCursor) {
          // Añadir a los reels existentes
          setReels(prev => [...prev, ...response.data.reels]);
        } else {
          // Primera carga
          setReels(response.data.reels);
          setAccount(response.data.instagram_account);
        }
        
        // Guardar información de paginación con la estructura correcta
        if (response.data.pagination) {
          setPagination({
            has_next_page: response.data.pagination.has_next_page,
            next_cursor: response.data.pagination.next_cursor
          });
        }
      } else {
        setError(response.message || t('errorFetching'));
      }
    } catch (error) {
      setError(t('errorLoading'));
      console.error('Error fetching Instagram reels:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);
  
  // Configurar el observador de Intersection para el scroll infinito
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && pagination?.has_next_page && !loadingMore) {
      fetchReels(pagination.next_cursor);
    }
  }, [pagination, loadingMore, fetchReels]);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;
    
    const option = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver(handleObserver, option);
    observer.observe(element);
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Skeleton para la info de la cuenta */}
        <div className="flex items-center space-x-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        
        {/* Grid de skeletons para los reels */}
        <div className="grid grid-cols-2 gap-3">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="relative aspect-[9/16] rounded-lg overflow-hidden">
              <Skeleton className="w-full h-full" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-2 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-900/20 border border-red-700/50 p-4 rounded-lg">
        <p>{error}</p>
        <p className="text-sm mt-2">{t('retryMessage')}</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-yellow-400 bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg">
        <p>{t('errorAccountInfo')}</p>
        <p className="text-sm mt-2">{t('checkConnection')}</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg text-blue-700 text-center">
        <p>No se encontraron reels en tu cuenta de Instagram.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        {account.profile_picture_url && (
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image 
              src={account.profile_picture_url} 
              alt={account.username} 
              fill 
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="font-medium">@{account.username}</h3>
          <p className="text-xs text-gray-500">{account.media_count} publicaciones</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {reels.map((reel) => (
          <motion.div
            key={reel.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectReel(reel.permalink, reel.thumbnail_url || '', reel.caption || 'Reel de Instagram');
              }}
            >
              {reel.thumbnail_url ? (
                <Image
                  src={reel.thumbnail_url}
                  alt={reel.caption || 'Instagram Reel'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-500 text-sm">Sin vista previa</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs truncate">
                  {reel.caption || 'Sin descripción'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Elemento observado para el scroll infinito */}
      <div ref={observerTarget} className="w-full flex items-center justify-center py-4">
        {loadingMore && (
          <div className="flex flex-col items-center justify-center">
            <Spinner size="md" />
            <p className="text-xs text-gray-300 mt-2">Cargando más reels...</p>
          </div>
        )}
      </div>
      
      {!pagination?.has_next_page && reels.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-2">
          {t('noMoreReels')}
        </p>
      )}

      {/* TODO: Restaurar el componente Select cuando esté disponible */}
      <p className="text-sm text-gray-400 p-4 border border-dashed border-gray-600 rounded-md">Componente Select eliminado temporalmente debido a error de import.</p>

      {pagination?.has_next_page && (
        <button onClick={() => fetchReels(pagination.next_cursor)} disabled={loadingMore} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50">
          {loadingMore ? t('loadingMore') : t('loadMoreReels')}
        </button>
      )}
      {!pagination?.has_next_page && reels.length > 0 && (
        <p className="mt-4 text-xs text-gray-500">{t('noMoreReels')}</p>
      )}
    </div>
  );
};

export default InstagramReelsList; 