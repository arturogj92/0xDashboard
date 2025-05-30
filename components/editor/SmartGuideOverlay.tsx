'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EyeOff } from 'lucide-react';

interface SmartGuideOverlayProps {
  onScrollToSection: (sectionId: string) => void;
}

interface GuidePoint {
  id: string;
  tooltip: string;
  position: {
    top: string;
    left: string;
  };
  // Posiciones para diferentes anchos de viewport
  responsivePositions?: {
    sm?: { top: string; left: string };
    md?: { top: string; left: string };
    lg?: { top: string; left: string };
  };
  sectionId: string;
}

const guidePoints: GuidePoint[] = [
  {
    id: 'background',
    tooltip: 'Personalizar fondo con gradientes y patrones',
    position: { top: '10%', left: '15%' },
    responsivePositions: {
      sm: { top: '8%', left: '20%' },
      md: { top: '9%', left: '18%' },
      lg: { top: '10%', left: '15%' }
    },
    sectionId: 'background-gradient'
  },
  {
    id: 'avatar',
    tooltip: 'Cambiar foto de perfil',
    position: { top: '16%', left: '50%' },
    responsivePositions: {
      sm: { top: '15%', left: '50%' },
      md: { top: '15.5%', left: '50%' },
      lg: { top: '16%', left: '50%' }
    },
    sectionId: 'avatar-section'
  },
  {
    id: 'title',
    tooltip: 'Editar nombre y biografía',
    position: { top: '26%', left: '50%' },
    responsivePositions: {
      sm: { top: '24%', left: '50%' },
      md: { top: '25%', left: '50%' },
      lg: { top: '26%', left: '50%' }
    },
    sectionId: 'info-section'
  },
  {
    id: 'section-title',
    tooltip: 'Cambiar estilo de fuentes',
    position: { top: '40%', left: '50%' },
    responsivePositions: {
      sm: { top: '38%', left: '50%' },
      md: { top: '39%', left: '50%' },
      lg: { top: '40%', left: '50%' }
    },
    sectionId: 'font-family'
  },
  {
    id: 'link-background',
    tooltip: 'Personalizar estilo de enlaces',
    position: { top: '56%', left: '80%' },
    responsivePositions: {
      sm: { top: '54%', left: '75%' },
      md: { top: '55%', left: '78%' },
      lg: { top: '56%', left: '80%' }
    },
    sectionId: 'link-styles'
  }
];

export function SmartGuideOverlay({ onScrollToSection }: SmartGuideOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState<'sm' | 'md' | 'lg'>('lg');

  // Detectar el tamaño del viewport
  useEffect(() => {
    const updateViewportSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setViewportSize('sm');
      } else if (width < 1024) {
        setViewportSize('md');
      } else {
        setViewportSize('lg');
      }
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const previewContainer = document.querySelector('.scrollbar-hide');
      if (previewContainer) {
        const scrollY = previewContainer.scrollTop;
        setShowGuides(scrollY < 50);
      }
    };

    const previewContainer = document.querySelector('.scrollbar-hide');
    if (previewContainer) {
      previewContainer.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => previewContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  const handlePointClick = (point: GuidePoint) => {
    onScrollToSection(point.sectionId);
  };

  // Obtener la posición correcta según el tamaño del viewport
  const getPosition = (point: GuidePoint) => {
    if (point.responsivePositions && point.responsivePositions[viewportSize]) {
      return point.responsivePositions[viewportSize];
    }
    return point.position;
  };

  return (
    <div 
      className={`absolute inset-0 z-40 pointer-events-none transition-opacity duration-300 ease-in-out ${
        showGuides ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        // Aplicar scale-correction para mantener las proporciones
        '--scale-factor': viewportSize === 'sm' ? '0.8' : viewportSize === 'md' ? '0.9' : '1',
      } as React.CSSProperties}
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

      {/* Guide dots con contenedor relativo para cada sección */}
      {guidePoints.map((point) => {
        const position = getPosition(point);
        return (
          <div
            key={point.id}
            className={`absolute cursor-pointer transition-all duration-300 ${
              showGuides ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              top: position.top,
              left: position.left,
              transform: `translate(-50%, -50%) scale(var(--scale-factor))`,
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
        );
      })}

      {/* Guías visuales de depuración (opcional) */}
      {process.env.NODE_ENV === 'development' && false && (
        <>
          <div className="absolute top-0 left-1/2 w-px h-full bg-red-500/20" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/20" />
          <div className="absolute top-1/4 left-0 w-full h-px bg-blue-500/20" />
          <div className="absolute top-3/4 left-0 w-full h-px bg-blue-500/20" />
        </>
      )}
    </div>
  );
}