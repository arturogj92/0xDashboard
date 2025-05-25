"use client";
import React, { useState, useEffect } from 'react';

interface BorderRadiusSelectorProps {
  value: string;
  onChange: (borderRadius: string) => void;
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
  className = "" 
}: BorderRadiusSelectorProps) {
  const [sliderValue, setSliderValue] = useState(0);

  // Sincronizar slider con valor prop
  useEffect(() => {
    const currentRadius = extractRadiusValue(value);
    setSliderValue(currentRadius);
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    const borderRadiusStyle = radiusToSliderValue(newValue);
    onChange(borderRadiusStyle);
  };

  const getRadiusLabel = (radius: number): string => {
    if (radius === 0) return 'Sin bordes';
    if (radius <= 4) return 'Muy pequeño';
    if (radius <= 8) return 'Pequeño';
    if (radius <= 16) return 'Mediano';
    if (radius <= 24) return 'Grande';
    if (radius <= 40) return 'Muy grande';
    return 'Completamente redondeado';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">
          Bordes de los Links
        </label>
        <span className="text-xs text-gray-400">
          {sliderValue}px - {getRadiusLabel(sliderValue)}
        </span>
      </div>
      
      {/* Slider */}
      <div className="space-y-3">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
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
      
      {/* Preview visual */}
      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
        <span className="text-xs text-gray-400">Vista previa:</span>
        <div 
          className="w-20 h-8 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
          style={{
            borderRadius: `${sliderValue}px`
          }}
        />
        <span className="text-xs text-gray-300 ml-auto">
          {sliderValue}px
        </span>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
          border: 2px solid #ffffff;
        }

        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
        }

        .slider:hover::-webkit-slider-thumb {
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
          transform: scale(1.1);
        }

        .slider:hover::-moz-range-thumb {
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}