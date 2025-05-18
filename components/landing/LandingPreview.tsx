import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Youtube, PlayCircle, Instagram, Twitter } from "lucide-react";
import { useTranslations } from 'next-intl';
import React from 'react';

interface LandingPreviewProps {
  name: string;
  description: string;
}

export function LandingPreview({ name, description }: LandingPreviewProps) {
  const t = useTranslations('landing');
  // Extraer inicial del nombre para el fallback del avatar
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="relative w-[120px] h-[258px] md:w-[150px] md:h-[322px] lg:w-[180px] lg:h-[386px] select-none">
      {/* Marco del iPhone */}
      <Image
        src="/images/iphone16-frame.png"
        alt="iPhone frame"
        fill
        className="absolute inset-0 z-20 pointer-events-none"
      />

      {/* Contenido de la pantalla */}
      <div className="absolute inset-0 z-10 flex flex-col items-center pt-10 md:pt-12 px-3 overflow-hidden bg-gradient-to-b from-[#230447] to-black rounded-[36px]">
        {/* Avatar */}
        <div className="relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex-shrink-0">
          {/* Avatar con estilo humano */}
          <Avatar className="w-full h-full rounded-full border-2 border-purple-500 ring-2 ring-purple-300/30">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white font-semibold flex items-center justify-center">
              <User className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
            </AvatarFallback>
          </Avatar>
          
          {/* Efecto decorativo alrededor del avatar */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-40 blur-sm -z-10"></div>
        </div>

        {/* Nombre dinámico */}
        <h2 className="mt-2 text-xs md:text-sm lg:text-base font-semibold text-[#8ad2ff] text-center break-words">
          {name || 'Your Name'}
        </h2>

        {/* Descripción dinámica justo debajo del nombre con padding bottom */}
        <p className="mt-1 mb-2 pb-4 text-xs text-gray-300 text-center break-words line-clamp-2">
          {description || t('descriptionPlaceholder')}
        </p>

        {/* Enlaces (más finos) con separadores de sección */}
        <div className="w-full space-y-2 mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              <div
                className="w-full h-3 md:h-4 lg:h-4 bg-orange-500/80 rounded border border-orange-300/40 animate-pulse"
              />
              {i < 2 && (
                <div
                  className="w-full h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Línea separadora fina */}
        <div className="w-full h-px bg-white/20 my-3" />

        {/* Iconos de redes sociales alineados al fondo */}
        <div className="flex items-center justify-center gap-2 md:gap-2.5 lg:gap-3 mt-1 md:mt-auto mb-2">
          <Youtube className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 text-orange-400" />
          <PlayCircle className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 text-orange-400" />
          <Instagram className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 text-orange-400" />
          <Twitter className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 text-orange-400" />
        </div>
      </div>
    </div>
  );
} 