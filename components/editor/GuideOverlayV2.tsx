'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { EyeOff } from 'lucide-react';

interface GuideOverlayV2Props {
  onScrollToSection: (sectionId: string) => void;
}

interface GuideMarker {
  id: string;
  tooltip: string;
  selector: string; // CSS selector para encontrar el elemento
  position: 'top-left' | 'top-right' | 'center' | 'bottom-right';
  sectionId: string;
}

const guideMarkers: GuideMarker[] = [
  {
    id: 'background',
    tooltip: 'Personalizar fondo con gradientes y patrones',
    selector: '[data-landing-preview]',
    position: 'top-left',
    sectionId: 'background-gradient'
  },
  {
    id: 'avatar',
    tooltip: 'Cambiar foto de perfil',
    selector: '.avatar-container',
    position: 'center',
    sectionId: 'avatar-section'
  },
  {
    id: 'title',
    tooltip: 'Editar nombre y biografía',
    selector: '.landing-title',
    position: 'center',
    sectionId: 'info-section'
  },
  {
    id: 'section-title',
    tooltip: 'Cambiar estilo de fuentes',
    selector: '.section-title',
    position: 'center',
    sectionId: 'font-family'
  },
  {
    id: 'link-background',
    tooltip: 'Personalizar estilo de enlaces',
    selector: '.link-item',
    position: 'bottom-right',
    sectionId: 'link-styles'
  }
];

export function GuideOverlayV2({ onScrollToSection }: GuideOverlayV2Props) {
  const [isVisible, setIsVisible] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [markers, setMarkers] = useState<Array<{marker: GuideMarker, rect: DOMRect}>>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<Element | null>(null);

  // Función para obtener la posición del marcador basado en el elemento
  const getMarkerPosition = (rect: DOMRect, position: string, containerRect: DOMRect) => {
    const relativeTop = rect.top - containerRect.top;
    const relativeLeft = rect.left - containerRect.left;
    
    switch (position) {
      case 'top-left':
        return { 
          top: relativeTop + 20, 
          left: relativeLeft + 20 
        };
      case 'top-right':
        return { 
          top: relativeTop + 20, 
          left: relativeLeft + rect.width - 20 
        };
      case 'center':
        return { 
          top: relativeTop + rect.height / 2, 
          left: relativeLeft + rect.width / 2 
        };
      case 'bottom-right':
        return { 
          top: relativeTop + rect.height - 20, 
          left: relativeLeft + rect.width - 20 
        };
      default:
        return { 
          top: relativeTop + rect.height / 2, 
          left: relativeLeft + rect.width / 2 
        };
    }
  };

  // Actualizar posiciones de los marcadores
  const updateMarkerPositions = () => {
    if (!overlayRef.current) return;
    
    const containerRect = overlayRef.current.getBoundingClientRect();
    const newMarkers: Array<{marker: GuideMarker, rect: DOMRect}> = [];
    
    // Buscar dentro del contenedor de scroll
    const scrollContainer = document.querySelector('.scrollbar-hide');
    if (!scrollContainer) return;
    
    guideMarkers.forEach(marker => {
      const element = scrollContainer.querySelector(marker.selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        newMarkers.push({ marker, rect });
      }
    });
    
    setMarkers(newMarkers);
  };

  // Observar cambios en el DOM y actualizar posiciones
  useEffect(() => {
    const scrollContainer = document.querySelector('.scrollbar-hide');
    if (!scrollContainer) return;
    
    scrollContainerRef.current = scrollContainer;
    
    // Actualizar posiciones iniciales
    setTimeout(updateMarkerPositions, 500); // Esperar a que se renderice el contenido
    
    // Observar cambios en el DOM
    const observer = new MutationObserver(() => {
      updateMarkerPositions();
    });
    
    observer.observe(scrollContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    // Observar cambios de tamaño
    const resizeObserver = new ResizeObserver(() => {
      updateMarkerPositions();
    });
    
    resizeObserver.observe(scrollContainer);
    
    // Escuchar eventos de ventana
    window.addEventListener('resize', updateMarkerPositions);
    
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateMarkerPositions);
    };
  }, []);

  // Manejar scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        const scrollY = scrollContainer.scrollTop;
        setShowGuides(scrollY < 50);
        updateMarkerPositions(); // Actualizar posiciones al hacer scroll
      }
    };

    const scrollContainer = document.querySelector('.scrollbar-hide');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleMarkerClick = (marker: GuideMarker) => {
    onScrollToSection(marker.sectionId);
  };

  return (
    <div 
      ref={overlayRef}
      className={`absolute inset-0 z-40 pointer-events-none transition-opacity duration-300 ease-in-out ${
        showGuides ? 'opacity-100' : 'opacity-0'
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

      {/* Guide markers */}
      {markers.map(({ marker, rect }) => {
        const containerRect = overlayRef.current?.getBoundingClientRect();
        if (!containerRect) return null;
        
        const position = getMarkerPosition(rect, marker.position, containerRect);
        
        return (
          <div
            key={marker.id}
            className={`absolute cursor-pointer transition-all duration-150 ${
              showGuides ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => handleMarkerClick(marker)}
            onMouseEnter={() => setHoveredMarker(marker.id)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            {/* Pulsing dot */}
            <div className="relative">
              <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              
              {/* Pulsing ring animation */}
              <div className="absolute inset-0 w-3 h-3 bg-orange-500/30 rounded-full animate-ping" />
            </div>

            {/* Tooltip */}
            {hoveredMarker === marker.id && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                  {marker.tooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}