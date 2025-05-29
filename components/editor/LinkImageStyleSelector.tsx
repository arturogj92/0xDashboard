"use client";

import React, { useState, useEffect } from 'react';

interface LinkImageStyleConfig {
  style: 'rectangle' | 'circle' | 'rectangle-padded';
}

interface LinkImageStyleSelectorProps {
  value: LinkImageStyleConfig;
  onChange: (config: LinkImageStyleConfig) => void;
  onSave?: (config: LinkImageStyleConfig) => void;
  className?: string;
}

export default function LinkImageStyleSelector({
  value,
  onChange,
  onSave,
  className = ""
}: LinkImageStyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState(value.style);

  useEffect(() => {
    setSelectedStyle(value.style);
  }, [value]);

  const handleStyleChange = (style: 'rectangle' | 'circle' | 'rectangle-padded') => {
    setSelectedStyle(style);
    const newConfig = { style };
    onChange(newConfig);
    if (onSave) {
      onSave(newConfig);
    }
  };

  const styles = [
    {
      id: 'rectangle',
      name: 'Rectangular',
      description: 'Imagen completa sin padding',
      preview: (
        <div className="w-full h-20 bg-gray-800 rounded-lg border border-gray-600 flex items-center overflow-hidden">
          <div className="w-20 h-full bg-gradient-to-br from-purple-500 to-pink-500" />
          <div className="flex-1 px-4">
            <div className="h-2 bg-gray-600 rounded w-3/4 mb-2" />
            <div className="h-1.5 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      )
    },
    {
      id: 'circle',
      name: 'Circular',
      description: 'Imagen en forma circular',
      preview: (
        <div className="w-full h-20 bg-gray-800 rounded-lg border border-gray-600 flex items-center overflow-hidden px-3">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-shrink-0" />
          <div className="flex-1 px-4">
            <div className="h-2 bg-gray-600 rounded w-3/4 mb-2" />
            <div className="h-1.5 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      )
    },
    {
      id: 'rectangle-padded',
      name: 'Rectangular con Padding',
      description: 'Imagen con espacio alrededor',
      preview: (
        <div className="w-full h-20 bg-gray-800 rounded-lg border border-gray-600 flex items-center overflow-hidden">
          <div className="w-20 h-full p-2 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
          </div>
          <div className="flex-1 px-4">
            <div className="h-2 bg-gray-600 rounded w-3/4 mb-2" />
            <div className="h-1.5 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="text-sm font-medium text-white mb-4 block">
          Estilo de Imagen en Links
        </label>
        
        <div className="space-y-3">
          {styles.map((style) => (
            <div
              key={style.id}
              onClick={() => handleStyleChange(style.id as 'rectangle' | 'circle' | 'rectangle-padded')}
              className={`w-full text-left transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] ${
                selectedStyle === style.id
                  ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900'
                  : ''
              }`}
            >
              <div className={`p-4 rounded-lg border ${
                selectedStyle === style.id
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
              }`}>
                {/* Preview */}
                <div className="mb-3">
                  {style.preview}
                </div>
                
                {/* Text */}
                <div>
                  <h3 className={`font-medium text-sm ${
                    selectedStyle === style.id ? 'text-white' : 'text-gray-300'
                  }`}>
                    {style.name}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    selectedStyle === style.id ? 'text-purple-200' : 'text-gray-500'
                  }`}>
                    {style.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}