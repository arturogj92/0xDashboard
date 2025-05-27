'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EyeOff } from 'lucide-react';

interface GuideOverlayProps {
  onScrollToSection: (sectionId: string) => void;
}

interface GuidePoint {
  id: string;
  tooltip: string;
  position: {
    top: string;
    left: string;
  };
  sectionId: string;
}

const guidePoints: GuidePoint[] = [
  {
    id: 'background',
    tooltip: 'Personalizar fondo con gradientes y patrones',
    position: { top: '10%', left: '15%' },
    sectionId: 'background-gradient'
  },
  {
    id: 'avatar',
    tooltip: 'Cambiar foto de perfil',
    position: { top: '16%', left: '59%' },
    sectionId: 'avatar-section'
  },
  {
    id: 'title',
    tooltip: 'Editar nombre y biografía',
    position: { top: '26%', left: '50%' },
    sectionId: 'info-section'
  },
  {
    id: 'section-title',
    tooltip: 'Cambiar estilo de fuentes',
    position: { top: '40%', left: '50%' },
    sectionId: 'font-family'
  },
  {
    id: 'link-background',
    tooltip: 'Personalizar estilo de enlaces',
    position: { top: '56%', left: '86%' },
    sectionId: 'link-styles'
  }
];

export function GuideOverlay({ onScrollToSection }: GuideOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Buscar el contenedor de scroll del preview (dentro del iframe del teléfono)
      const previewContainer = document.querySelector('.scrollbar-hide');
      if (previewContainer) {
        const scrollY = previewContainer.scrollTop;
        // Mostrar guías solo cuando el scroll del preview esté en la parte superior (menos de 50px)
        setShowGuides(scrollY < 50);
      }
    };

    // Buscar el contenedor de scroll del preview
    const previewContainer = document.querySelector('.scrollbar-hide');
    if (previewContainer) {
      // Agregar el listener de scroll al contenedor del preview
      previewContainer.addEventListener('scroll', handleScroll);
      
      // Verificar posición inicial
      handleScroll();

      // Cleanup
      return () => previewContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  const handlePointClick = (point: GuidePoint) => {
    onScrollToSection(point.sectionId);
    // No cerrar la guía al hacer click
  };

  return (
    <div 
      className={`absolute inset-0 z-40 pointer-events-none transition-opacity duration-300 ease-in-out ${
        showGuides ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Hide guide button */}
      <div className={`absolute top-2 right-2 ${showGuides ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <Button
          onClick={() => setIsVisible(false)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-200 text-gray-600 hover:bg-gray-50 shadow-lg text-xs px-2 py-1"
        >
          <EyeOff className="w-3 h-3 mr-1" />
          Ocultar guías
        </Button>
      </div>

      {/* Guide dots */}
      {guidePoints.map((point) => (
        <div
          key={point.id}
          className={`absolute cursor-pointer ${showGuides ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={{
            top: point.position.top,
            left: point.position.left,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => handlePointClick(point)}
          onMouseEnter={() => setHoveredPoint(point.id)}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Pulsing dot */}
          <div className="relative">
            <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
            
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 w-3 h-3 bg-orange-500/30 rounded-full animate-ping" />
          </div>

          {/* Tooltip */}
          {hoveredPoint === point.id && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                {point.tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}