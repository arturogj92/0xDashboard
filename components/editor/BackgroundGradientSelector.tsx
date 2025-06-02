"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface BackgroundGradientSelectorProps {
  value: {
    color1: string;
    color2: string;
  };
  onChange: (gradient: { color1: string; color2: string }) => void;
  onSave?: (gradient: { color1: string; color2: string }) => void;
  className?: string;
}

export default function BackgroundGradientSelector({ 
  value, 
  onChange, 
  onSave,
  className = "" 
}: BackgroundGradientSelectorProps) {
  const t = useTranslations('backgroundGradientSelector');
  const [localColors, setLocalColors] = useState(value);
  const [pendingValue, setPendingValue] = useState<{ color1: string; color2: string } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = React.useTransition();

  // Sincronizar con valor prop
  useEffect(() => {
    setLocalColors(value);
  }, [value]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleColorChange = (colorKey: 'color1' | 'color2', newColor: string) => {
    const newGradient = { ...localColors, [colorKey]: newColor };
    setLocalColors(newGradient);
    setPendingValue(newGradient);
    
    // Actualizar inmediatamente en baja prioridad
    startTransition(() => {
      onChange(newGradient);
    });
    
    // Configurar guardado con debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (onSave) {
      timeoutRef.current = setTimeout(() => {
        onSave(newGradient);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000);
    } else {
      setPendingValue(null);
    }
  };

  const presets = [
    { 
      name: t('presets.classicPurple'), 
      color1: '#000000', 
      color2: '#4a044d' 
    },
    { 
      name: t('presets.oceanBlue'), 
      color1: '#1e3a8a', 
      color2: '#06b6d4' 
    },
    { 
      name: t('presets.sunrise'), 
      color1: '#f97316', 
      color2: '#fbbf24' 
    },
    { 
      name: t('presets.forestGreen'), 
      color1: '#064e3b', 
      color2: '#10b981' 
    }
  ];

  const handlePresetClick = (preset: { color1: string; color2: string }) => {
    setLocalColors(preset);
    setPendingValue(preset);
    
    // Actualizar inmediatamente
    startTransition(() => {
      onChange(preset);
    });
    
    // Configurar guardado
    if (onSave) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onSave(preset);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000);
    } else {
      setPendingValue(null);
    }
  };

  const gradientStyle = `linear-gradient(to bottom, ${localColors.color1} 0%, ${localColors.color2} 100%)`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">
          {t('title')}
        </label>
      </div>
      
      {/* Vista previa del gradiente */}
      <div className="space-y-3">
        <div 
          className="w-full h-20 rounded-lg border border-gray-600"
          style={{ background: gradientStyle }}
        />
        
        {/* Controles de color */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">{t('topColor')}</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localColors.color1}
                onChange={(e) => handleColorChange('color1', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={localColors.color1}
                onChange={(e) => handleColorChange('color1', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-400">{t('bottomColor')}</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localColors.color2}
                onChange={(e) => handleColorChange('color2', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={localColors.color2}
                onChange={(e) => handleColorChange('color2', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                placeholder="#4a044d"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs text-gray-400">{t('presetsTitle')}</span>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isActive = localColors.color1 === preset.color1 && localColors.color2 === preset.color2;
            const presetGradient = `linear-gradient(to bottom, ${preset.color1} 0%, ${preset.color2} 100%)`;
            
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetClick({ color1: preset.color1, color2: preset.color2 })}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white'
                }`}
              >
                {/* Vista previa del gradiente */}
                <div 
                  className="w-full h-8 mb-2 rounded border border-gray-500"
                  style={{ background: presetGradient }}
                />
                <span className="text-xs font-medium text-center">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}