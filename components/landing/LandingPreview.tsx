"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Youtube, PlayCircle, Instagram, TwitterIcon, ExternalLink, Github, Linkedin, Facebook, Globe } from "lucide-react";
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { LinkData, SectionData, SocialLinkData } from '@/components/editor/types';

interface LandingPreviewProps {
  name: string;
  description: string;
  links?: LinkData[];
  sections?: SectionData[];
  socialLinks?: SocialLinkData[];
}

// Icono personalizado de TikTok
const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const socialIcons = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: TwitterIcon,
  tiktok: TikTokIcon,
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  website: Globe,
  web: Globe,
  default: ExternalLink
};

export const LandingPreview = React.memo(function LandingPreview({ 
  name, 
  description, 
  links = [], 
  sections = [], 
  socialLinks = []
}: LandingPreviewProps) {
  const t = useTranslations('landing');
  
  // Memorizar cálculos para optimizar rendimiento
  const { visibleLinks, visibleSocialLinks, linksBySection } = useMemo(() => {
    const visibleLinks = links.filter(link => link.visible).sort((a, b) => a.position - b.position);
    const visibleSocialLinks = socialLinks.filter(link => link.visible).sort((a, b) => a.position - b.position);
    
    const linksBySection = sections.reduce((acc, section) => {
      acc[section.id] = visibleLinks.filter(link => link.section_id === section.id);
      return acc;
    }, {} as Record<string, LinkData[]>);
    
    return { visibleLinks, visibleSocialLinks, linksBySection };
  }, [links, sections, socialLinks]);
  
  // Links sin sección (no se mostrarán en la vista previa)
  // const linksWithoutSection = visibleLinks.filter(link => !link.section_id);

  return (
    <div className="flex flex-col items-center pt-20 px-4 overflow-hidden bg-gradient-to-b from-[#230447] to-black h-full">
      {/* Avatar */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <Avatar className="w-full h-full rounded-full border-2 border-purple-500 ring-2 ring-purple-300/30">
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white font-semibold flex items-center justify-center">
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-40 blur-sm -z-10"></div>
      </div>

      {/* Nombre y descripción */}
      <h2 className="mt-3 text-lg font-semibold text-[#8ad2ff] text-center break-words leading-tight">
        {name || 'Your Name'}
      </h2>
      <p className="mt-2 mb-4 text-sm text-gray-300 text-center break-words line-clamp-2 leading-tight px-2">
        {description || t('descriptionPlaceholder')}
      </p>

      {/* Links organizados por sección */}
      <div className="w-full space-y-2 mt-2 flex-1 overflow-y-auto px-1">
        
        {/* Secciones con sus links */}
        {sections.sort((a, b) => a.position - b.position).map((section, sectionIndex) => {
          const sectionLinks = linksBySection[section.id] || [];
          if (sectionLinks.length === 0) return null;
          
          return (
            <React.Fragment key={section.id}>
              {/* Título de sección */}
              <div className="text-sm text-gray-400 text-center font-medium py-1">
                {section.title}
              </div>
              
              {/* Links de la sección */}
              {sectionLinks.map((link, linkIndex) => (
                <React.Fragment key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full min-h-[44px] p-3 bg-gradient-to-r from-orange-500/90 to-orange-600/90 rounded-lg border border-orange-300/40 hover:from-orange-500 hover:to-orange-600 transition-all duration-200 text-white text-sm font-medium text-center flex items-center justify-center"
                    title={link.title}
                  >
                    <span className="truncate px-1 leading-tight">{link.title || 'Untitled Link'}</span>
                  </a>
                  {linkIndex < sectionLinks.length - 1 && (
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/25 to-transparent my-2" />
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
        
        {/* Mostrar placeholders si no hay secciones con contenido */}
        {sections.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-6">
            Crea secciones para organizar tus enlaces
          </div>
        )}
      </div>

      {/* Línea separadora */}
      <div className="w-full h-px bg-white/20 my-3" />

      {/* Iconos de redes sociales */}
      <div className="flex items-center justify-center gap-4 mb-3">
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
                <IconComponent className="w-5 h-5" />
              </a>
            );
          })
        ) : (
          // Placeholders por defecto
          <>
            <Youtube className="w-5 h-5 text-orange-400" />
            <PlayCircle className="w-5 h-5 text-orange-400" />
            <Instagram className="w-5 h-5 text-orange-400" />
            <TwitterIcon className="w-5 h-5 text-orange-400" />
          </>
        )}
      </div>
    </div>
  );
}); 