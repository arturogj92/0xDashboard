"use client";
import React, { useState, useEffect, useRef } from 'react';

interface LinkColorSelectorProps {
  value: {
    background: string;
    text: string;
  };
  onChange: (linkColors: { background: string; text: string }) => void;
  onSave?: (linkColors: { background: string; text: string }) => void;
  className?: string;
}

export default function LinkColorSelector({ 
  value, 
  onChange, 
  onSave,
  className = "" 
}: LinkColorSelectorProps) {
  const [localColors, setLocalColors] = useState(value);
  const [pendingValue, setPendingValue] = useState<{ background: string; text: string } | null>(null);
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

  const handleColorChange = (colorKey: 'background' | 'text', newColor: string) => {
    const newLinkColors = { ...localColors, [colorKey]: newColor };
    setLocalColors(newLinkColors);
    setPendingValue(newLinkColors);
    
    // Actualizar inmediatamente en baja prioridad
    startTransition(() => {
      onChange(newLinkColors);
    });
    
    // Configurar guardado con debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (onSave) {
      timeoutRef.current = setTimeout(() => {
        onSave(newLinkColors);
        setPendingValue(null);
        timeoutRef.current = null;
      }, 1000);
    } else {
      setPendingValue(null);
    }
  };

  const presets = [
    { 
      name: 'Negro Clásico', 
      background: '#000000', 
      text: '#ffffff' 
    },
    { 
      name: 'Blanco Limpio', 
      background: '#ffffff', 
      text: '#000000' 
    },
    { 
      name: 'Gris Oscuro', 
      background: '#374151', 
      text: '#ffffff' 
    },
    { 
      name: 'Azul Elegante', 
      background: '#1e40af', 
      text: '#ffffff' 
    }
  ];

  const handlePresetClick = (preset: { background: string; text: string }) => {
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

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">
          Color de los Links
        </label>
      </div>
      
      {/* Vista previa del link */}
      <div className="space-y-3">
        <div className="flex justify-center">
          <div 
            className="px-6 py-3 rounded-lg border flex items-center justify-center text-sm font-medium transition-all duration-200"
            style={{ 
              backgroundColor: localColors.background,
              color: localColors.text,
              borderColor: 'rgba(148, 163, 184, 0.2)'
            }}
          >
            Mi Link de Ejemplo
          </div>
        </div>
        
        {/* Controles de color */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Fondo del Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={localColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Texto del Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={localColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={localColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs text-gray-400">Combinaciones predefinidas:</span>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isActive = localColors.background === preset.background && localColors.text === preset.text;
            
            return (
              <button
                key={preset.name}
                onClick={() => handlePresetClick({ background: preset.background, text: preset.text })}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white'
                }`}
              >
                {/* Vista previa del link preset */}
                <div className="w-full mb-2">
                  <div 
                    className="w-full h-8 rounded border flex items-center justify-center text-xs font-medium"
                    style={{ 
                      backgroundColor: preset.background,
                      color: preset.text,
                      borderColor: 'rgba(148, 163, 184, 0.3)'
                    }}
                  >
                    Link
                  </div>
                </div>
                <span className="text-xs font-medium text-center">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}