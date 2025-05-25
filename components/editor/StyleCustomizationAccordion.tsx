"use client";
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import BorderRadiusSelector from "@/components/editor/BorderRadiusSelector";
import BackgroundGradientSelector from "@/components/editor/BackgroundGradientSelector";
import FontColorSelector from "@/components/editor/FontColorSelector";
import LinkColorSelector from "@/components/editor/LinkColorSelector";
import FontFamilySelector from "@/components/editor/FontFamilySelector";

interface StyleCustomizationAccordionProps {
  landing: {
    configurations?: any;
  };
  handleConfigurationUpdate: (config: any) => void;
  handleConfigurationSave: (config: any) => void;
  className?: string;
}

export default function StyleCustomizationAccordion({ 
  landing, 
  handleConfigurationUpdate, 
  handleConfigurationSave,
  className = "" 
}: StyleCustomizationAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${className}`}>
      {/* Header del accordion */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:bg-gray-800/40 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg shadow-lg">
            <PaintBrushIcon className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">
              Personaliza el Estilo
            </h3>
            <p className="text-sm text-gray-400">
              Cambia colores, fuentes y bordes de tu landing
            </p>
          </div>
        </div>
        
        <div className="text-gray-400">
          {isOpen ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Contenido del accordion */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-4 space-y-6">
          {/* Border Radius */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <BorderRadiusSelector
              value={landing.configurations?.borderRadius || 'rounded-xl'}
              onChange={(borderRadius) => handleConfigurationUpdate({ borderRadius })}
              onSave={(borderRadius) => handleConfigurationSave({ borderRadius })}
            />
          </div>

          {/* Background Gradient */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <BackgroundGradientSelector
              value={landing.configurations?.gradient || { color1: '#000000', color2: '#4a044d' }}
              onChange={(gradient) => handleConfigurationUpdate({ gradient })}
              onSave={(gradient) => handleConfigurationSave({ gradient })}
            />
          </div>

          {/* Font Colors */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <FontColorSelector
              value={landing.configurations?.fontColor || { primary: '#ffffff', secondary: '#e2e8f0' }}
              onChange={(fontColor) => handleConfigurationUpdate({ fontColor })}
              onSave={(fontColor) => handleConfigurationSave({ fontColor })}
            />
          </div>

          {/* Link Colors */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <LinkColorSelector
              value={landing.configurations?.linkColor || { background: '#000000', text: '#ffffff' }}
              onChange={(linkColor) => handleConfigurationUpdate({ linkColor })}
              onSave={(linkColor) => handleConfigurationSave({ linkColor })}
            />
          </div>

          {/* Font Family */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <FontFamilySelector
              value={landing.configurations?.fontFamily || { family: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }}
              onChange={(fontFamily) => handleConfigurationUpdate({ fontFamily })}
              onSave={(fontFamily) => handleConfigurationSave({ fontFamily })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}