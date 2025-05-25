"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, PlayCircle, ExternalLink, Github, Linkedin, Facebook, Globe } from "lucide-react";
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { LinkData, SectionData, SocialLinkData } from '@/components/editor/types';

interface LandingPreviewProps {
  name: string;
  description: string;
  links?: LinkData[];
  sections?: SectionData[];
  socialLinks?: SocialLinkData[];
  isPreview?: boolean;
}

// Iconos personalizados
const TikTokIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TwitterIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const socialIcons = {
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
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
  socialLinks = [],
  isPreview = false
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
    <div className={`flex flex-col items-center pt-20 ${isPreview ? 'px-1' : 'px-6 md:px-8 lg:px-12'} overflow-y-auto overflow-x-hidden bg-gradient-to-b from-black via-black to-[#49044d] h-full`}>
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
      <h2 className={`mt-3 ${isPreview ? 'text-sm' : 'text-sm sm:text-lg md:text-xl'} font-semibold text-[#8ad2ff] text-center break-words leading-tight`}>
        {name || 'Your Name'}
      </h2>
      <p className={`mt-2 mb-4 ${isPreview ? 'text-xs' : 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl'} text-gray-300 text-center break-words line-clamp-3 leading-tight px-2 min-h-[3rem]`}>
        {description || t('descriptionPlaceholder')}
      </p>

      {/* Links organizados por sección */}
      <div className="w-full space-y-2 mt-2 flex-1 px-0 flex flex-col items-center">
        
        {/* Secciones con sus links */}
        {sections.sort((a, b) => a.position - b.position).map((section, sectionIndex) => {
          const sectionLinks = linksBySection[section.id] || [];
          if (sectionLinks.length === 0) return null;
          
          return (
            <React.Fragment key={section.id}>
              {/* Título de sección */}
              <div className="text-lg text-gray-300 text-center font-medium py-2 w-full">
                {section.title}
              </div>
              
              {/* Links de la sección */}
              {sectionLinks.map((link, linkIndex) => (
                <React.Fragment key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isPreview ? 'w-[98%]' : 'w-full'} ${isPreview ? '' : 'md:w-1/2'} ${isPreview ? 'min-h-[65px]' : 'min-h-[60px] sm:min-h-[65px] md:min-h-[80px]'} bg-black/80 rounded-xl border-2 border-purple-400/60 hover:border-purple-300/80 hover:bg-black/90 transition-all duration-200 text-white font-medium flex items-stretch backdrop-blur-sm overflow-hidden`}
                    title={link.title}
                  >
                    {/* Imagen placeholder */}
                    <div className="w-14 md:w-16 bg-gray-600/50 rounded-l-xl md:rounded-lg flex items-center justify-center flex-shrink-0 self-stretch">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {/* Texto que puede ir en múltiples líneas */}
                    <div className="flex-1 flex items-center justify-center md:justify-start px-2 md:p-3">
                      <span className="text-center md:text-left leading-tight line-clamp-2 text-[10px] md:text-xs">{link.title || 'Untitled Link'}</span>
                    </div>
                  </a>
                  {linkIndex < sectionLinks.length - 1 && (
                    <div className={`${isPreview ? 'w-[98%]' : 'w-full'} ${isPreview ? '' : 'md:w-1/2'} h-px bg-gradient-to-r from-transparent via-white/25 to-transparent my-1`} />
                  )}
                </React.Fragment>
              ))}
              
              {/* Separador entre secciones */}
              {sectionIndex < sections.length - 1 && (
                <div className={`${isPreview ? 'w-[98%]' : 'w-full'} ${isPreview ? '' : 'md:w-1/2'} h-px bg-white/20 my-2`} />
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
            <YoutubeIcon className="w-5 h-5 text-orange-400" />
            <PlayCircle className="w-5 h-5 text-orange-400" />
            <InstagramIcon className="w-5 h-5 text-orange-400" />
            <TwitterIcon className="w-5 h-5 text-orange-400" />
          </>
        )}
      </div>
    </div>
  );
}); 