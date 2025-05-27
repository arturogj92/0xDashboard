"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface BackgroundPatternConfiguration {
  pattern: string;
  color: string;
  opacity: number;
}

interface BackgroundPatternSelectorProps {
  value: BackgroundPatternConfiguration;
  onChange: (config: BackgroundPatternConfiguration) => void;
  onSave: (config: BackgroundPatternConfiguration) => void;
}

const patterns = [
  {
    id: 'none',
    name: 'Sin patrón',
    description: 'Fondo sólido sin patrones'
  },
  {
    id: 'grid',
    name: 'Grid',
    description: 'Patrón de cuadrícula moderna'
  },
  {
    id: 'dots',
    name: 'Puntos',
    description: 'Patrón de puntos elegante'
  },
  {
    id: 'diagonal',
    name: 'Líneas diagonales',
    description: 'Líneas diagonales dinámicas'
  },
  {
    id: 'waves',
    name: 'Ondas',
    description: 'Patrón de ondas suaves'
  },
  {
    id: 'geometric',
    name: 'Geométrico',
    description: 'Formas geométricas modernas'
  },
  {
    id: 'circuit',
    name: 'Circuitos',
    description: 'Patrón tecnológico de circuitos'
  },
  {
    id: 'lines',
    name: 'Líneas sueltas',
    description: 'Líneas flotantes dispersas'
  }
];

const colors = [
  { name: 'Blanco', value: '#ffffff' },
  { name: 'Gris claro', value: '#f3f4f6' },
  { name: 'Gris', value: '#9ca3af' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Púrpura', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Amarillo', value: '#f59e0b' },
  { name: 'Rojo', value: '#ef4444' }
];

// Función para generar el CSS del patrón (solo para preview en selector)
const generatePatternCSS = (pattern: string, color: string, opacity: number) => {
  const colorWithOpacity = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  
  switch (pattern) {
    case 'grid':
      return {
        backgroundImage: `
          linear-gradient(${colorWithOpacity} 1px, transparent 1px),
          linear-gradient(90deg, ${colorWithOpacity} 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      };
    
    case 'dots':
      return {
        backgroundImage: `radial-gradient(circle, ${colorWithOpacity} 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      };
    
    case 'diagonal':
      return {
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 40px,
          ${colorWithOpacity} 40px,
          ${colorWithOpacity} 42px
        )`
      };
    
    case 'waves':
      return {
        backgroundImage: `
          radial-gradient(ellipse at center, transparent 50%, ${colorWithOpacity} 50%),
          linear-gradient(90deg, transparent 50%, ${colorWithOpacity} 50%)
        `,
        backgroundSize: '40px 40px, 40px 20px'
      };
    
    case 'geometric':
      return {
        backgroundImage: `
          linear-gradient(45deg, ${colorWithOpacity} 25%, transparent 25%),
          linear-gradient(-45deg, ${colorWithOpacity} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${colorWithOpacity} 75%),
          linear-gradient(-45deg, transparent 75%, ${colorWithOpacity} 75%)
        `,
        backgroundSize: '60px 60px',
        backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
      };
    
    case 'circuit':
      return {
        backgroundImage: `
          linear-gradient(90deg, ${colorWithOpacity} 1px, transparent 1px),
          linear-gradient(${colorWithOpacity} 1px, transparent 1px),
          radial-gradient(circle at 20px 20px, ${colorWithOpacity} 2px, transparent 2px)
        `,
        backgroundSize: '40px 40px, 40px 40px, 40px 40px'
      };
    
    case 'lines':
      return {
        backgroundImage: `
          linear-gradient(23deg, ${colorWithOpacity} 1px, transparent 1px),
          linear-gradient(67deg, ${colorWithOpacity} 1px, transparent 1px),
          linear-gradient(135deg, ${colorWithOpacity} 1px, transparent 1px),
          linear-gradient(158deg, ${colorWithOpacity} 1px, transparent 1px)
        `,
        backgroundSize: '60px 80px, 80px 60px, 100px 70px, 70px 90px',
        backgroundPosition: '0 0, 20px 10px, 40px 30px, 10px 50px'
      };
    
    default:
      return {};
  }
};

export default function BackgroundPatternSelector({ value, onChange, onSave }: BackgroundPatternSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(value);

  const handlePatternChange = (pattern: string) => {
    const newConfig = { ...localConfig, pattern };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleColorChange = (color: string) => {
    const newConfig = { ...localConfig, color };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleOpacityChange = (opacity: number) => {
    const newConfig = { ...localConfig, opacity };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleSave = () => {
    onSave(localConfig);
  };

  const selectedPattern = patterns.find(p => p.id === localConfig.pattern) || patterns[0];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-600 flex-shrink-0"
            style={{
              background: localConfig.pattern === 'none' ? localConfig.color : undefined,
              ...generatePatternCSS(localConfig.pattern, localConfig.color, localConfig.opacity)
            }}
          />
          <div className="text-left">
            <div className="text-white font-medium text-sm">{selectedPattern.name}</div>
            <div className="text-gray-400 text-xs">{selectedPattern.description}</div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
          {/* Selector de patrón */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Patrón de fondo</label>
            <div className="grid grid-cols-2 gap-2">
              {patterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => handlePatternChange(pattern.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    localConfig.pattern === pattern.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded mb-2 border border-gray-600"
                    style={{
                      background: pattern.id === 'none' ? localConfig.color : undefined,
                      ...generatePatternCSS(pattern.id, localConfig.color, localConfig.opacity)
                    }}
                  />
                  <div className="text-xs text-white font-medium">{pattern.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de color (solo si no es 'none') */}
          {localConfig.pattern !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-white mb-3">Color del patrón</label>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value)}
                    className={`p-2 rounded-lg border transition-all ${
                      localConfig.color === color.value
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded border border-gray-600 mx-auto mb-1"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="text-xs text-white">{color.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Slider de opacidad (solo si no es 'none') */}
          {localConfig.pattern !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Opacidad: {Math.round(localConfig.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={localConfig.opacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* Botón de guardar */}
          <Button
            onClick={handleSave}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Aplicar patrón de fondo
          </Button>
        </div>
      )}
    </div>
  );
}