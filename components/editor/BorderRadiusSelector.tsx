"use client";
import React, { useState, useEffect, useRef } from 'react';

interface BorderRadiusSelectorProps {
  value: string;
  onChange: (borderRadius: string) => void;
  onSave?: (borderRadius: string) => void;
  className?: string;
}

// Función para convertir valor de slider a border radius CSS
const radiusToSliderValue = (radiusPx: number): string => {
  if (radiusPx === 0) return 'rounded-none';
  return `rounded-[${radiusPx}px]`;
};

// Función para extraer valor numérico del border radius CSS
const extractRadiusValue = (cssValue: string): number => {
  if (cssValue === 'rounded-none') return 0;
  if (cssValue === 'rounded-sm') return 2;
  if (cssValue === 'rounded-md') return 6;
  if (cssValue === 'rounded-lg') return 8;
  if (cssValue === 'rounded-xl') return 12;
  if (cssValue === 'rounded-2xl') return 16;
  
  // Extraer valor de rounded-[Npx]
  const pxMatch = cssValue.match(/rounded-\[(\d+)px\]/);
  if (pxMatch) return parseInt(pxMatch[1]);
  
  // Si es un valor en %, ignorar y usar default
  const percentMatch = cssValue.match(/rounded-\[(\d+)%\]/);
  if (percentMatch) return 12; // Convertir a px default
  
  return 12; // Default a 12px si no se puede parsear
};

export default function BorderRadiusSelector({ 
  value, 
  onChange, 
  onSave,
  className = "" 
}: BorderRadiusSelectorProps) {
  const [sliderValue, setSliderValue] = useState(0);
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [ , startTransition] = React.useTransition();

  // Sincronizar slider con valor prop
  useEffect(() => {
    const currentRadius = extractRadiusValue(value);
    setSliderValue(currentRadius);
  }, [value]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    setPendingValue(newValue);
    
    const borderRadiusStyle = radiusToSliderValue(newValue);
    
    // Actualizar configuración en baja prioridad para no bloquear la UI
    startTransition(() => {
      onChange(borderRadiusStyle);
    });
    
    // Cancelar cualquier timeout previo mientras se arrastra
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
    // Cancelar timeout si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Solo iniciar el countdown cuando se suelta el slider
    if (onSave && pendingValue !== null) {
      const borderRadiusStyle = radiusToSliderValue(pendingValue);
      timeoutRef.current = setTimeout(() => {
        onSave(borderRadiusStyle);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000); // Esperar 1 segundo después de soltar
    } else if (!onSave) {
      setPendingValue(null);
    }
  };


  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">
          Bordes de los Links
        </label>
      </div>
      
      {/* Slider */}
      <div className="space-y-3">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, 
              #8b5cf6 0%, 
              #8b5cf6 ${sliderValue}%, 
              #374151 ${sliderValue}%, 
              #374151 100%)`
          }}
        />
        
        {/* Marcadores del slider */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span className={`${sliderValue <= 2 ? 'text-purple-400 font-medium' : ''}`}>0px</span>
          <span className={`${Math.abs(sliderValue - 25) <= 2 ? 'text-purple-400 font-medium' : ''}`}>25px</span>
          <span className={`${Math.abs(sliderValue - 50) <= 2 ? 'text-purple-400 font-medium' : ''}`}>50px</span>
          <span className={`${Math.abs(sliderValue - 75) <= 2 ? 'text-purple-400 font-medium' : ''}`}>75px</span>
          <span className={`${sliderValue >= 98 ? 'text-purple-400 font-medium' : ''}`}>100px</span>
        </div>
      </div>

      <style jsx>{`
        .slider {
          will-change: background;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
          border: 2px solid #ffffff;
          will-change: transform, box-shadow;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
          will-change: transform, box-shadow;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .slider:hover::-webkit-slider-thumb {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
        }

        .slider:hover::-moz-range-thumb {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
        }

        .slider:active::-webkit-slider-thumb {
          transform: scale(1.15);
        }

        .slider:active::-moz-range-thumb {
          transform: scale(1.15);
        }

        /* Track styling optimizado */
        .slider::-webkit-slider-runnable-track {
          height: 12px;
          border-radius: 6px;
          background: #374151;
        }

        .slider::-moz-range-track {
          height: 12px;
          border-radius: 6px;
          background: #374151;
          border: none;
        }
      `}</style>
    </div>
  );
}