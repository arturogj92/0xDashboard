"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  FileText, 
  Share2, 
  ChevronUp, 
  ChevronDown,
  X
} from "lucide-react";
import { useTranslations } from 'next-intl';

interface MobileEditorNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function MobileEditorNavigation({ 
  activeSection, 
  onSectionChange 
}: MobileEditorNavigationProps) {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);

  const navigationItems = [
    {
      id: 'style',
      label: t('styleCustomization.title'),
      description: t('styleCustomization.description'),
      icon: Settings,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      id: 'content',
      label: t('editor.title'),
      description: t('editor.description'),
      icon: FileText,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 'social',
      label: t('social.title'),
      description: t('social.description'),
      icon: Share2,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/20'
    }
  ];

  const activeItem = navigationItems.find(item => item.id === activeSection) || navigationItems[0];

  const handleSectionSelect = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Mobile Navigation - Fixed Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        
        {/* Expanded Menu Overlay */}
        {isExpanded && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}

        {/* Collapsible Menu */}
        {isExpanded && (
          <div className="relative z-50 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 shadow-2xl">
            <div className="p-4 space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">
                  {t('editor.title')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation Items */}
              {navigationItems.map((item) => {
                const isActive = item.id === activeSection;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionSelect(item.id)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/20 border border-purple-500/50 shadow-lg' 
                        : 'bg-gray-800/50 hover:bg-gray-700/60 border border-gray-600/30 hover:border-gray-500/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${item.bgColor} flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm mb-1 ${
                        isActive ? 'text-white' : 'text-gray-200'
                      }`}>
                        {item.label}
                      </h4>
                      <p className={`text-xs leading-relaxed ${
                        isActive ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Compact Navigation Bar */}
        <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 shadow-2xl">
          <div className="flex items-center">
            
            {/* Active Section Display */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeItem.bgColor} flex-shrink-0`}>
                  <activeItem.icon className={`h-5 w-5 ${activeItem.iconColor}`} />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="text-white font-medium text-sm truncate">
                    {activeItem.label}
                  </h4>
                  <p className="text-gray-400 text-xs truncate">
                    {activeItem.description}
                  </p>
                </div>
              </div>
              
              <div className="flex-shrink-0 ml-2">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Quick Access Icons */}
            <div className="flex border-l border-gray-700/50">
              {navigationItems.map((item) => {
                const isActive = item.id === activeSection;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionSelect(item.id)}
                    className={`p-4 hover:bg-gray-800/50 transition-colors border-l border-gray-700/50 first:border-l-0 ${
                      isActive ? 'bg-purple-600/20' : ''
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      isActive ? activeItem.iconColor : 'text-gray-500'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navigation */}
      <div className="md:hidden h-20" />
    </>
  );
}