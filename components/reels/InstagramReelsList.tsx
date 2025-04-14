import { useState, useEffect } from 'react';
import { getUserInstagramReels } from '@/lib/api';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/Spinner';

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

interface InstagramReelsListProps {
  onSelectReel: (url: string) => void;
}

export const InstagramReelsList = ({ onSelectReel }: InstagramReelsListProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [account, setAccount] = useState<InstagramAccount | null>(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        const response = await getUserInstagramReels(10);
        
        if (response.success && response.data) {
          setReels(response.data.reels);
          setAccount(response.data.instagram_account);
        } else {
          setError(response.message || 'Error al obtener los reels');
        }
      } catch (error) {
        setError('Error al cargar los reels de Instagram');
        console.error('Error fetching Instagram reels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
        <p>{error}</p>
        <p className="text-sm mt-2">Por favor intenta de nuevo más tarde o añade el reel manualmente.</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700 text-center">
        <p>No se pudo obtener información de tu cuenta de Instagram.</p>
        <p className="text-sm mt-2">¿Has conectado tu cuenta de Instagram?</p>
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
            className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => onSelectReel(reel.permalink)}
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
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InstagramReelsList; 