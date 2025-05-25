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


  const presets = [
    { value: 0, label: 'Cuadrado' },
    { value: 8, label: 'Poco' },
    { value: 16, label: 'Mediano' },
    { value: 50, label: 'Redondeado' }
  ];

  const handlePresetClick = (value: number) => {
    setSliderValue(value);
    setPendingValue(value);
    
    const borderRadiusStyle = radiusToSliderValue(value);
    
    // Actualizar inmediatamente
    startTransition(() => {
      onChange(borderRadiusStyle);
    });
    
    // Simular que se soltó el slider para iniciar el guardado
    if (onSave) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onSave(borderRadiusStyle);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000);
    } else {
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
          max="50"
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
              #8b5cf6 ${(sliderValue/50)*100}%, 
              #374151 ${(sliderValue/50)*100}%, 
              #374151 100%)`
          }}
        />
        
        {/* Marcadores del slider */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span className={`${sliderValue <= 1 ? 'text-purple-400 font-medium' : ''}`}>0px</span>
          <span className={`${Math.abs(sliderValue - 12.5) <= 1 ? 'text-purple-400 font-medium' : ''}`}>12px</span>
          <span className={`${Math.abs(sliderValue - 25) <= 1 ? 'text-purple-400 font-medium' : ''}`}>25px</span>
          <span className={`${Math.abs(sliderValue - 37.5) <= 1 ? 'text-purple-400 font-medium' : ''}`}>37px</span>
          <span className={`${sliderValue >= 49 ? 'text-purple-400 font-medium' : ''}`}>50px</span>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs text-gray-400">Valores rápidos:</span>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                Math.abs(sliderValue - preset.value) <= 1
                  ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white'
              }`}
            >
              {/* Rectángulo visual que representa un link */}
              <div 
                className={`w-12 h-8 mb-2 border-2 ${
                  Math.abs(sliderValue - preset.value) <= 1
                    ? 'bg-purple-100 border-purple-400'
                    : 'bg-white border-gray-400'
                }`}
                style={{
                  borderRadius: `${preset.value}px`
                }}
              />
              <span className="text-xs font-medium">{preset.label}</span>
              <span className={`text-xs ${
                Math.abs(sliderValue - preset.value) <= 1 
                  ? 'text-purple-200' 
                  : 'text-gray-500'
              }`}>
                {preset.value}px
              </span>
            </button>
          ))}
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