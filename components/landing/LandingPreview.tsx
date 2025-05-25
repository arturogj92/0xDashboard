"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ExternalLink, Github, Linkedin, Facebook, Globe } from "lucide-react";
import { useTranslations } from 'next-intl';
import React, { useMemo, useEffect } from 'react';
import { LinkData, SectionData, SocialLinkData } from '@/components/editor/types';
import { useAuth } from '@/contexts/AuthContext';
import { getThemeById, getDefaultTheme } from '@/lib/themes';

interface LandingPreviewProps {
  name: string;
  description: string;
  links?: LinkData[];
  sections?: SectionData[];
  socialLinks?: SocialLinkData[];
  isPreview?: boolean;
  themeId?: string;
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
  isPreview = false,
  themeId = 'gradient-purple'
}: LandingPreviewProps) {
  const t = useTranslations('landing');
  const { user } = useAuth();
  
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

  // Obtener el tema actual
  const currentTheme = getThemeById(themeId) || getDefaultTheme();

  // Aplicar CSS variables cuando cambie el tema
  useEffect(() => {
    const previewElement = document.querySelector('[data-landing-preview]');
    if (previewElement) {
      const element = previewElement as HTMLElement;
      // Aplicar variables del tema
      element.style.setProperty('--preview-background', currentTheme.colors.background);
      element.style.setProperty('--preview-text-primary', currentTheme.colors.textPrimary);
      element.style.setProperty('--preview-text-secondary', currentTheme.colors.textSecondary);
      element.style.setProperty('--preview-text-muted', currentTheme.colors.textMuted);
      element.style.setProperty('--preview-link-background', currentTheme.colors.linkBackground);
      element.style.setProperty('--preview-link-border', currentTheme.colors.linkBorder);
      element.style.setProperty('--preview-link-text', currentTheme.colors.linkText);
      element.style.setProperty('--preview-link-hover', currentTheme.colors.linkHover);
      element.style.setProperty('--preview-font-family', currentTheme.typography.fontFamily);
      element.style.setProperty('--preview-font-family-heading', currentTheme.typography.fontFamilyHeading);
    }
  }, [currentTheme, themeId]);

  return (
    <div 
      data-landing-preview
      className="h-full"
      style={{
        background: currentTheme.colors.background,
        fontFamily: `${currentTheme.typography.fontFamily}, system-ui, sans-serif`,
        color: currentTheme.colors.textPrimary,
      }}
    >
      <div className={`flex flex-col items-center pt-20 ${isPreview ? 'px-1' : 'px-6 md:px-8 lg:px-12'} overflow-y-auto overflow-x-hidden h-full mx-auto max-w-lg`}>
      {/* Avatar */}
      <Avatar className="w-24 h-24 flex-shrink-0" style={{ backgroundColor: 'var(--preview-link-background)' }}>
        <AvatarImage 
          src={user?.avatar_url} 
          alt={user?.name || user?.username || 'Avatar'}
          className="object-cover"
        />
        <AvatarFallback 
          className="text-2xl font-bold"
          style={{ 
            backgroundColor: 'var(--preview-link-background)',
            color: 'var(--preview-text-primary)'
          }}
        >
          <User className="w-12 h-12" style={{ color: 'var(--preview-text-muted)' }} />
        </AvatarFallback>
      </Avatar>

      {/* Nombre y descripción */}
      <h2 
        className={`mt-3 ${isPreview ? 'text-sm' : 'text-2xl'} font-semibold text-center break-words leading-tight`}
        style={{ 
          color: 'var(--preview-text-primary)',
          fontFamily: `var(--preview-font-family-heading), ${currentTheme.typography.fontFamilyHeading}, system-ui, sans-serif`
        }}
      >
        {name || 'Your Name'}
      </h2>
      
      <p 
        className={`mt-2 mb-4 ${isPreview ? 'text-xs' : 'text-base'} text-center break-words line-clamp-3 leading-tight px-2 min-h-[3rem]`}
        style={{ 
          color: 'var(--preview-text-secondary)',
          fontFamily: `var(--preview-font-family), ${currentTheme.typography.fontFamily}, system-ui, sans-serif`
        }}
      >
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
              <div 
                className="text-lg text-center font-medium py-2 w-full"
                style={{ 
                  color: 'var(--preview-text-secondary)',
                  fontFamily: `var(--preview-font-family-heading), ${currentTheme.typography.fontFamilyHeading}, system-ui, sans-serif`
                }}
              >
                {section.title}
              </div>
              
              {/* Links de la sección */}
              {sectionLinks.map((link, linkIndex) => (
                <React.Fragment key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isPreview ? 'min-h-[65px] w-[95%]' : 'min-h-[60px] sm:min-h-[65px] md:min-h-[80px] w-full md:w-[30%]'} flex items-center overflow-hidden rounded-xl transition-all duration-200 hover:scale-105 group`}
                    style={{
                      backgroundColor: 'var(--preview-link-background)',
                      borderColor: 'var(--preview-link-border)',
                      color: 'var(--preview-link-text)',
                      border: '1px solid'
                    }}
                  >
                    {link.image && (
                      <img 
                        src={link.image} 
                        alt={link.title || 'Link image'}
                        className={`h-full object-cover flex-shrink-0 ${
                          currentTheme.layout.imageStyle === 'square' ? 'rounded-none' : 'rounded-lg'
                        }`}
                        style={{
                          width: isPreview ? '65px' : '80px',
                          aspectRatio: '1/1',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div className="flex-1 px-4">
                      <h3 
                        className={`${isPreview ? 'text-xs' : 'text-sm'} font-medium leading-tight`}
                        style={{ 
                          color: 'var(--preview-link-text)',
                          fontFamily: `var(--preview-font-family), ${currentTheme.typography.fontFamily}, system-ui, sans-serif`
                        }}
                      >
                        {link.title || 'Untitled Link'}
                      </h3>
                    </div>
                  </a>
                  {linkIndex < sectionLinks.length - 1 && (
                    <div className={`${isPreview ? 'w-[95%]' : 'w-full md:w-[30%]'} h-px bg-gradient-to-r from-transparent via-white/25 to-transparent my-1`} />
                  )}
                </React.Fragment>
              ))}
              
              {/* Separador entre secciones */}
              {sectionIndex < sections.length - 1 && (
                <div className={`${isPreview ? 'w-[95%]' : 'w-full md:w-[30%]'} h-px bg-white/20 my-2`} />
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

      {/* Social links */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {visibleSocialLinks.map((socialLink) => {
          const IconComponent = socialIcons[socialLink.name as keyof typeof socialIcons] || socialIcons.default;
          return (
            <a
              key={socialLink.id}
              href={socialLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--preview-link-background)',
                borderColor: 'var(--preview-link-border)',
                color: 'var(--preview-link-text)',
                border: '1px solid'
              }}
            >
              <IconComponent className="w-5 h-5" />
            </a>
          );
        })}
      </div>
      </div>
    </div>
  );
}); 