"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Youtube, PlayCircle, Instagram, TwitterIcon, ExternalLink } from "lucide-react";
import { useTranslations } from 'next-intl';
import React from 'react';
import { LinkData, SectionData, SocialLinkData } from '@/components/editor/types';

interface LandingPreviewProps {
  name: string;
  description: string;
  links?: LinkData[];
  sections?: SectionData[];
  socialLinks?: SocialLinkData[];
}

const socialIcons = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: TwitterIcon,
  default: ExternalLink
};

export function LandingPreview({ 
  name, 
  description, 
  links = [], 
  sections = [], 
  socialLinks = []
}: LandingPreviewProps) {
  const t = useTranslations('landing');
  
  // Filtrar y ordenar links visibles por sección
  const visibleLinks = links.filter(link => link.visible).sort((a, b) => a.position - b.position);
  const visibleSocialLinks = socialLinks.filter(link => link.visible).sort((a, b) => a.position - b.position);
  
  // Agrupar links por sección
  const linksBySection = sections.reduce((acc, section) => {
    acc[section.id] = visibleLinks.filter(link => link.section_id === section.id);
    return acc;
  }, {} as Record<string, LinkData[]>);
  
  // Links sin sección
  const linksWithoutSection = visibleLinks.filter(link => !link.section_id);

  return (
    <div className="flex flex-col items-center pt-10 md:pt-12 px-3 overflow-hidden bg-gradient-to-b from-[#230447] to-black h-full">
      {/* Avatar */}
      <div className="relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex-shrink-0">
        <Avatar className="w-full h-full rounded-full border-2 border-purple-500 ring-2 ring-purple-300/30">
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white font-semibold flex items-center justify-center">
            <User className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-40 blur-sm -z-10"></div>
      </div>

      {/* Nombre y descripción */}
      <h2 className="mt-2 text-xs md:text-sm lg:text-base font-semibold text-[#8ad2ff] text-center break-words">
        {name || 'Your Name'}
      </h2>
      <p className="mt-1 mb-2 pb-4 text-xs text-gray-300 text-center break-words line-clamp-2">
        {description || t('descriptionPlaceholder')}
      </p>

      {/* Links organizados por sección */}
      <div className="w-full space-y-2 mt-2 flex-1 overflow-y-auto">
        {/* Links sin sección */}
        {linksWithoutSection.map((link, index) => (
          <React.Fragment key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-3 md:h-4 lg:h-4 bg-orange-500/80 rounded border border-orange-300/40 hover:bg-orange-500 transition-colors"
              title={link.title}
            />
            {index < linksWithoutSection.length - 1 && (
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            )}
          </React.Fragment>
        ))}
        
        {/* Separador si hay tanto links sin sección como secciones */}
        {linksWithoutSection.length > 0 && sections.length > 0 && (
          <div className="w-full h-px bg-white/20 my-3" />
        )}
        
        {/* Secciones con sus links */}
        {sections.sort((a, b) => a.position - b.position).map((section, sectionIndex) => {
          const sectionLinks = linksBySection[section.id] || [];
          if (sectionLinks.length === 0) return null;
          
          return (
            <React.Fragment key={section.id}>
              {/* Título de sección */}
              <div className="text-xs text-gray-400 text-center font-medium py-1">
                {section.title}
              </div>
              
              {/* Links de la sección */}
              {sectionLinks.map((link, linkIndex) => (
                <React.Fragment key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-3 md:h-4 lg:h-4 bg-orange-500/80 rounded border border-orange-300/40 hover:bg-orange-500 transition-colors"
                    title={link.title}
                  />
                  {linkIndex < sectionLinks.length - 1 && (
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  )}
                </React.Fragment>
              ))}
              
              {/* Separador entre secciones */}
              {sectionIndex < sections.length - 1 && (
                <div className="w-full h-px bg-white/20 my-3" />
              )}
            </React.Fragment>
          );
        })}
        
        {/* Mostrar placeholders si no hay contenido */}
        {visibleLinks.length === 0 && (
          Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="w-full h-3 md:h-4 lg:h-4 bg-orange-500/80 rounded border border-orange-300/40 animate-pulse" />
              {i < 2 && (
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              )}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Línea separadora */}
      <div className="w-full h-px bg-white/20 my-3" />

      {/* Iconos de redes sociales */}
      <div className="flex items-center justify-center gap-2 md:gap-2.5 lg:gap-3 mb-2">
        {visibleSocialLinks.length > 0 ? (
          visibleSocialLinks.map((socialLink) => {
            const IconComponent = socialIcons[socialLink.name.toLowerCase() as keyof typeof socialIcons] || socialIcons.default;
            return (
              <a
                key={socialLink.id}
                href={socialLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
                title={socialLink.name}
              >
                <IconComponent className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4" />
              </a>
            );
          })
        ) : (
          // Placeholders por defecto
          <>
            <Youtube className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 text-orange-400" />
            <PlayCircle className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 text-orange-400" />
            <Instagram className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 text-orange-400" />
            <TwitterIcon className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 text-orange-400" />
          </>
        )}
      </div>
    </div>
  );
} 