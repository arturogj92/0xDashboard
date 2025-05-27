"use client";
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import ThemeSelector from "@/components/editor/ThemeSelector";
import BorderRadiusSelector from "@/components/editor/BorderRadiusSelector";
import BackgroundGradientSelector from "@/components/editor/BackgroundGradientSelector";
import FontColorSelector from "@/components/editor/FontColorSelector";
import LinkColorSelector from "@/components/editor/LinkColorSelector";
import FontFamilySelector from "@/components/editor/FontFamilySelector";
import EffectsSelector from "@/components/editor/EffectsSelector";
import TitleStyleSelector from "@/components/editor/TitleStyleSelector";
import AvatarDisplaySelector from "@/components/editor/AvatarDisplaySelector";
import { LandingAvatarUpload } from "@/components/editor/LandingAvatarUpload";
import BackgroundPatternSelector from "@/components/editor/BackgroundPatternSelector";

interface StyleCustomizationAccordionProps {
  landing: {
    id?: string;
    theme_id?: string;
    configurations?: any;
    avatar_url?: string;
  };
  handleConfigurationUpdate: (config: any) => void;
  handleConfigurationSave: (config: any) => void;
  handleThemeUpdate: (themeId: string) => void;
  onAvatarUpdate: (avatarUrl: string | null) => void;
  className?: string;
}

export default function StyleCustomizationAccordion({ 
  landing, 
  handleConfigurationUpdate, 
  handleConfigurationSave,
  handleThemeUpdate,
  onAvatarUpdate,
  className = "" 
}: StyleCustomizationAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`${className}`}>
      {/* Header del accordion */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-accordion="style-customization"
        aria-expanded={isOpen}
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
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-none opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="mt-4 space-y-6">
          {/* Theme Selector */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <ThemeSelector
              currentThemeId={landing.theme_id || 'dark'}
              onThemeChange={handleThemeUpdate}
            />
          </div>

          {/* Avatar Display */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <AvatarDisplaySelector
              value={landing.configurations?.avatarDisplay || { showAvatar: true }}
              onChange={(avatarDisplay) => handleConfigurationUpdate({ avatarDisplay })}
              onSave={(avatarDisplay) => handleConfigurationSave({ avatarDisplay })}
            />
          </div>

          {/* Landing Avatar Upload */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <div className="text-white text-sm mb-3 font-medium">Avatar de la Landing</div>
            <p className="text-gray-400 text-xs mb-4">Sube un avatar específico para esta landing page que se mostrará públicamente.</p>
            <LandingAvatarUpload
              landingId={landing.id || ''}
              currentAvatarUrl={landing.avatar_url}
              onAvatarUpdate={onAvatarUpdate}
              size="lg"
            />
          </div>

          {/* Border Radius */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <BorderRadiusSelector
              value={landing.configurations?.borderRadius || 'rounded-xl'}
              onChange={(borderRadius) => handleConfigurationUpdate({ borderRadius })}
              onSave={(borderRadius) => handleConfigurationSave({ borderRadius })}
            />
          </div>

          {/* Background Gradient */}
          <div id="background-gradient" className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <BackgroundGradientSelector
              value={landing.configurations?.gradient || { color1: '#000000', color2: '#4a044d' }}
              onChange={(gradient) => handleConfigurationUpdate({ gradient })}
              onSave={(gradient) => handleConfigurationSave({ gradient })}
            />
          </div>

          {/* Background Pattern */}
          <div id="background-pattern" className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <BackgroundPatternSelector
              value={landing.configurations?.backgroundPattern || { pattern: 'none', color: '#ffffff', opacity: 0.1 }}
              onChange={(backgroundPattern) => handleConfigurationUpdate({ backgroundPattern })}
              onSave={(backgroundPattern) => handleConfigurationSave({ backgroundPattern })}
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

          {/* Title Style */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <TitleStyleSelector
              value={landing.configurations?.titleStyle || { fontSize: 'text-2xl', gradientEnabled: false }}
              onChange={(titleStyle) => handleConfigurationUpdate({ titleStyle })}
              onSave={(titleStyle) => handleConfigurationSave({ titleStyle })}
            />
          </div>

          {/* Font Family */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <div className="text-white text-sm mb-2">Font Family Selector:</div>
            <FontFamilySelector
              value={landing.configurations?.fontFamily || { family: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }}
              onChange={(fontFamily) => handleConfigurationUpdate({ fontFamily })}
              onSave={(fontFamily) => handleConfigurationSave({ fontFamily })}
            />
          </div>

          {/* Effects */}
          <div className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4">
            <EffectsSelector
              currentConfig={landing.configurations?.effects || { showBadge: true, typewriterEffect: true }}
              onConfigUpdate={handleConfigurationUpdate}
              onConfigSave={handleConfigurationSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}