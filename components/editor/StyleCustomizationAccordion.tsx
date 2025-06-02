"use client";
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { Palette, User, Type, Link2, Sparkles, Paintbrush2 } from 'lucide-react';
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
import LinkImageStyleSelector from "@/components/editor/LinkImageStyleSelector";
import { LandingInfoEditor } from "@/components/editor/LandingInfoEditor";
import CustomDomainConfiguration from "@/components/editor/CustomDomainConfiguration";
import { Info, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StyleCustomizationAccordionProps {
  landing: {
    id?: string;
    theme_id?: string;
    configurations?: any;
    avatar_url?: string;
    name?: string;
    description?: string;
  };
  handleConfigurationUpdate: (config: any) => void;
  handleConfigurationSave: (config: any) => void;
  handleThemeUpdate: (themeId: string) => void;
  onAvatarUpdate: (avatarUrl: string | null) => void;
  onLandingInfoUpdate?: (name: string, description: string) => void;
  className?: string;
}

export default function StyleCustomizationAccordion({ 
  landing, 
  handleConfigurationUpdate, 
  handleConfigurationSave,
  handleThemeUpdate,
  onAvatarUpdate,
  onLandingInfoUpdate,
  className = "" 
}: StyleCustomizationAccordionProps) {
  const t = useTranslations('styleCustomization');
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    info: false,
    avatar: false,
    backgrounds: false,
    links: false,
    fonts: false,
    effects: false,
    domain: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
              {t('title')}
            </h3>
            <p className="text-sm text-gray-400">
              {t('description')}
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
          {/* Selector de Temas - Destacado */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-2 border-indigo-500/50 rounded-xl p-6 shadow-lg shadow-indigo-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Paintbrush2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{t('themeSelector.title')}</h3>
                <p className="text-sm text-indigo-200">{t('themeSelector.description')}</p>
              </div>
            </div>
            <ThemeSelector
              currentThemeId={landing.theme_id || 'dark'}
              onThemeChange={handleThemeUpdate}
              landingName={landing.name}
              landingDescription={landing.description}
            />
          </div>

          {/* Información Básica */}
          <div id="landing-info" className="bg-gray-800/20 border border-gray-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('info')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg shadow-lg">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{t('basicInfo.title')}</h3>
              </div>
              {openSections.info ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {openSections.info && (
              <div className="p-4 pt-0">
                {landing.id && onLandingInfoUpdate && (
                  <LandingInfoEditor
                    landingId={landing.id}
                    initialName={landing.name || ''}
                    initialDescription={landing.description || ''}
                    onUpdate={onLandingInfoUpdate}
                  />
                )}
              </div>
            )}
          </div>

          {/* Configuración de Avatar */}
          <div id="avatar-configuration" className="bg-gray-800/20 border border-gray-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('avatar')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-lg shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{t('avatar.title')}</h3>
              </div>
              {openSections.avatar ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {openSections.avatar && (
              <div className="p-4 pt-0 space-y-6">
                {/* Avatar Upload */}
                <div>
                  <div className="text-white text-sm mb-3">{t('avatar.upload.title')}</div>
                  <p className="text-gray-400 text-xs mb-4">{t('avatar.upload.description')}</p>
                  <LandingAvatarUpload
                    landingId={landing.id || ''}
                    currentAvatarUrl={landing.avatar_url}
                    onAvatarUpdate={onAvatarUpdate}
                    size="lg"
                  />
                </div>
                
                {/* Separador visual */}
                <div className="border-t border-gray-600/30"></div>
                
                {/* Avatar Display Toggle */}
                <AvatarDisplaySelector
                  value={landing.configurations?.avatarDisplay || { showAvatar: true }}
                  onChange={(avatarDisplay) => handleConfigurationUpdate({ avatarDisplay })}
                  onSave={(avatarDisplay) => handleConfigurationSave({ avatarDisplay })}
                />
              </div>
            )}
          </div>


          {/* Configuración de Fondos */}
          <div id="background-configuration" className="bg-gray-800/20 border border-gray-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('backgrounds')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{t('backgrounds.title')}</h3>
              </div>
              {openSections.backgrounds ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {openSections.backgrounds && (
              <div className="p-4 pt-0 space-y-6">
                {/* Background Gradient */}
                <BackgroundGradientSelector
                  value={landing.configurations?.gradient || { color1: '#000000', color2: '#4a044d' }}
                  onChange={(gradient) => handleConfigurationUpdate({ gradient })}
                  onSave={(gradient) => handleConfigurationSave({ gradient })}
                />
                
                {/* Separador visual */}
                <div className="border-t border-gray-600/30"></div>
                
                {/* Background Pattern */}
                <BackgroundPatternSelector
                  value={landing.configurations?.backgroundPattern || { pattern: 'none', color: '#ffffff', opacity: 0.1 }}
                  onChange={(backgroundPattern) => handleConfigurationUpdate({ backgroundPattern })}
                  onSave={(backgroundPattern) => handleConfigurationSave({ backgroundPattern })}
                />
              </div>
            )}
          </div>


          {/* Configuración de Enlaces */}
          <div id="link-styles" className="bg-gray-800/20 border border-gray-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('links')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-lg shadow-lg">
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{t('links.title')}</h3>
              </div>
              {openSections.links ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {openSections.links && (
              <div className="p-4 pt-0 space-y-6">
                {/* Border Radius */}
                <BorderRadiusSelector
                  value={landing.configurations?.borderRadius || 'rounded-xl'}
                  onChange={(borderRadius) => handleConfigurationUpdate({ borderRadius })}
                  onSave={(borderRadius) => handleConfigurationSave({ borderRadius })}
                />
                
                {/* Separador visual */}
                <div className="border-t border-gray-600/30"></div>
                
                {/* Link Colors */}
                <LinkColorSelector
                  value={landing.configurations?.linkColor || { background: '#000000', text: '#ffffff' }}
                  onChange={(linkColor) => handleConfigurationUpdate({ linkColor })}
                  onSave={(linkColor) => handleConfigurationSave({ linkColor })}
                />
                
                {/* Separador visual */}
                <div className="border-t border-gray-600/30"></div>
                
                {/* Link Image Style */}
                <LinkImageStyleSelector
                  value={landing.configurations?.linkImageStyle || { style: 'rectangle' }}
                  onChange={(linkImageStyle) => handleConfigurationUpdate({ linkImageStyle })}
                  onSave={(linkImageStyle) => handleConfigurationSave({ linkImageStyle })}
                />
              </div>
            )}
          </div>

          {/* Configuración de Fuentes */}
          <div id="font-configuration" className="bg-gray-800/20 border border-gray-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('fonts')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg">
                  <Type className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{t('fonts.title')}</h3>
              </div>
              {openSections.fonts ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {openSections.fonts && (
              <div className="p-4 pt-0 space-y-6">
                {/* Font Family */}
                <FontFamilySelector
                  value={landing.configurations?.fontFamily || { family: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }}
                  onChange={(fontFamily) => handleConfigurationUpdate({ fontFamily })}
                  onSave={(fontFamily) => handleConfigurationSave({ fontFamily })}
                />
                
                {/* Separador visual */}
                <div className="border-t border-gray-600/30"></div>
                
                {/* Font Colors */}
                <FontColorSelector
                  value={landing.configurations?.fontColor || { primary: '#ffffff', secondary: '#e2e8f0' }}
                  onChange={(fontColor) => handleConfigurationUpdate({ fontColor })}
                  onSave={(fontColor) => handleConfigurationSave({ fontColor })}
                />
                
                {/* Separador visual */}
                <div className="border-t border-gray-600/30"></div>
                
                {/* Title Style (Font Size) */}
                <TitleStyleSelector
                  value={landing.configurations?.titleStyle || { fontSize: 'text-2xl', gradientEnabled: false }}
                  onChange={(titleStyle) => handleConfigurationUpdate({ titleStyle })}
                  onSave={(titleStyle) => handleConfigurationSave({ titleStyle })}
                />
              </div>
            )}
          </div>

          {/* Configuración de Efectos */}
          <div id="effects-configuration" className="bg-gray-800/20 border border-gray-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('effects')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-lg shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{t('effects.title')}</h3>
              </div>
              {openSections.effects ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {openSections.effects && (
              <div className="p-4 pt-0">
                <EffectsSelector
                  currentConfig={landing.configurations?.effects || { showBadge: true, typewriterEffect: true }}
                  onConfigUpdate={handleConfigurationUpdate}
                  onConfigSave={handleConfigurationSave}
                />
              </div>
            )}
          </div>

          {/* Configuración de Dominio Personalizado */}
          <div id="domain-configuration" className="bg-gray-800/20 border border-gray-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('domain')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{t('domain.title')}</h3>
              </div>
              {openSections.domain ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {openSections.domain && (
              <div className="p-4 pt-0">
                <CustomDomainConfiguration
                  landingId={landing.id || ''}
                  hideHeader={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}