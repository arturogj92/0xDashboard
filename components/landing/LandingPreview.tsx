"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ExternalLink, Github, Linkedin, Facebook, Globe } from "lucide-react";
import { useTranslations } from 'next-intl';
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LinkData, SectionData, SocialLinkData } from '@/components/editor/types';
import { getThemeById, getDefaultTheme } from '@/lib/themes';
import { useTypewriter } from '@/hooks/useTypewriter';

interface LandingPreviewProps {
  name: string;
  description: string;
  links?: LinkData[];
  sections?: SectionData[];
  socialLinks?: SocialLinkData[];
  isPreview?: boolean;
  themeId?: string;
  avatarUrl?: string;
  configurations?: {
    borderRadius?: string;
    gradient?: {
      color1: string;
      color2: string;
    };
    fontColor?: {
      primary: string;
      secondary: string;
    };
    linkColor?: {
      background: string;
      text: string;
      backgroundOpacity?: number;
    };
    fontFamily?: {
      family: string;
      url: string;
    };
    effects?: {
      showBadge?: boolean;
      typewriterEffect?: boolean;
    };
    titleStyle?: {
      fontSize?: string;
      gradientEnabled?: boolean;
      gradientColors?: {
        from: string;
        via?: string;
        to: string;
      };
      gradientDirection?: string;
    };
    avatarDisplay?: {
      showAvatar?: boolean;
    };
    backgroundPattern?: {
      pattern: string;
      color: string;
      opacity: number;
    };
    linkImageStyle?: {
      style: 'rectangle' | 'circle' | 'rectangle-padded';
    };
  };
}

// Función para generar el CSS del patrón de fondo
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
        backgroundImage: `url('/images/background/geometric.png')`,
        backgroundSize: '200px 200px',
        backgroundRepeat: 'repeat',
        opacity: opacity
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
    
    case 'dark_marble':
      return {
        backgroundImage: `url('/images/background/dark_marmol.png')`,
        backgroundSize: '300px 300px',
        backgroundRepeat: 'repeat',
        opacity: opacity
      };
    
    case 'white_marble':
      return {
        backgroundImage: `url('/images/background/white_marmol.png')`,
        backgroundSize: '300px 300px',
        backgroundRepeat: 'repeat',
        opacity: opacity
      };
    
    default:
      return {};
  }
};

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

// Componente para el tooltip usando portal
const TooltipPortal = ({ 
  children, 
  show, 
  triggerRef 
}: { 
  children: React.ReactNode; 
  show: boolean; 
  triggerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10, // Un poco arriba del elemento
        left: rect.left + rect.width / 2 // Centrado horizontalmente
      });
    }
  }, [show, triggerRef]);

  if (!show) return null;

  return createPortal(
    <div 
      className="fixed pointer-events-none"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        zIndex: 99999,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {children}
    </div>,
    document.body
  );
};

// Componente para la guía del avatar
const AvatarGuide = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const guideRef = useRef<HTMLDivElement | null>(null);
  
  return (
    <>
      <div 
        ref={guideRef}
        className="absolute -top-1 -right-1 w-3 h-3 cursor-pointer z-[100]"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          console.log('🔵 Avatar guide clicked');
          const event = new CustomEvent('guideClick', { detail: { sectionId: 'avatar-section' } });
          console.log('📤 Dispatching event to window:', event.detail);
          window.dispatchEvent(event);
        }}
      >
        {/* Pulsing dot */}
        <div className="relative">
          <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 bg-orange-500/30 rounded-full animate-ping" />
        </div>
      </div>
      
      {/* Tooltip usando portal */}
      <TooltipPortal show={showTooltip} triggerRef={guideRef}>
        <div 
          className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Cambiar foto de perfil
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      </TooltipPortal>
    </>
  );
};

// Componente para guía de configuración de fondos
const BackgroundGuide = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const guideRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div 
        ref={guideRef}
        className="absolute top-4 left-4 w-3 h-3 cursor-pointer z-[100]"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          console.log('🎨 Background guide clicked');
          const event = new CustomEvent('guideClick', { detail: { sectionId: 'background-gradient' } });
          console.log('📤 Dispatching background event to window:', event.detail);
          window.dispatchEvent(event);
        }}
      >
        {/* Pulsing dot */}
        <div className="relative">
          <div className="w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 bg-purple-500/30 rounded-full animate-ping" />
        </div>
      </div>
      
      {/* Tooltip usando portal */}
      <TooltipPortal show={showTooltip} triggerRef={guideRef}>
        <div 
          className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Personalizar fondos
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      </TooltipPortal>
    </>
  );
};

// Componente para guía de información básica
const InfoGuide = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const guideRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div 
        ref={guideRef}
        className="absolute -top-1 -right-1 w-3 h-3 cursor-pointer z-[100]"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          console.log('ℹ️ Info guide clicked');
          const event = new CustomEvent('guideClick', { detail: { sectionId: 'info-section' } });
          console.log('📤 Dispatching info event to window:', event.detail);
          window.dispatchEvent(event);
        }}
      >
        {/* Pulsing dot */}
        <div className="relative">
          <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 bg-blue-500/30 rounded-full animate-ping" />
        </div>
      </div>
      
      {/* Tooltip usando portal */}
      <TooltipPortal show={showTooltip} triggerRef={guideRef}>
        <div 
          className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Editar nombre y perfil
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      </TooltipPortal>
    </>
  );
};

// Componente para guía de configuración de enlaces
const LinksGuide = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const guideRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div 
        ref={guideRef}
        className="absolute -top-1 right-2 w-3 h-3 cursor-pointer z-[100]"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          console.log('🔗 Links guide clicked');
          const event = new CustomEvent('guideClick', { detail: { sectionId: 'link-styles' } });
          console.log('📤 Dispatching links event to window:', event.detail);
          window.dispatchEvent(event);
        }}
      >
        {/* Pulsing dot */}
        <div className="relative">
          <div className="w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 bg-indigo-500/30 rounded-full animate-ping" />
        </div>
      </div>
      
      {/* Tooltip usando portal */}
      <TooltipPortal show={showTooltip} triggerRef={guideRef}>
        <div 
          className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Personalizar enlaces
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      </TooltipPortal>
    </>
  );
};

// Componente para guía de configuración de fuentes
const FontGuide = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const guideRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div 
        ref={guideRef}
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 cursor-pointer z-[100]"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          console.log('🔤 Font guide clicked');
          const event = new CustomEvent('guideClick', { detail: { sectionId: 'font-family' } });
          console.log('📤 Dispatching font event to window:', event.detail);
          window.dispatchEvent(event);
        }}
      >
        {/* Pulsing dot */}
        <div className="relative">
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 bg-green-500/30 rounded-full animate-ping" />
        </div>
      </div>
      
      {/* Tooltip usando portal */}
      <TooltipPortal show={showTooltip} triggerRef={guideRef}>
        <div 
          className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Cambiar tipografía
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      </TooltipPortal>
    </>
  );
};

export const LandingPreview = React.memo(function LandingPreview({ 
  name, 
  description, 
  links = [], 
  sections = [], 
  socialLinks = [],
  isPreview = false,
  themeId = 'dark',
  avatarUrl,
  configurations = {}
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
  }, [links, sections, socialLinks, isPreview]);
  
  // Configuración de efectos
  const effectsConfig = configurations.effects || { showBadge: true, typewriterEffect: true };
  
  // Configuración del título
  const titleStyleConfig = configurations.titleStyle || { 
    fontSize: 'text-2xl', 
    gradientEnabled: false 
  };
  
  // Configuración del avatar
  const avatarDisplayConfig = configurations.avatarDisplay || { 
    showAvatar: true 
  };
  
  // Efecto typewriter para la descripción (solo si está habilitado)
  const { displayText: typewriterDescription, isComplete } = useTypewriter({
    text: effectsConfig.typewriterEffect ? (description || t('descriptionPlaceholder')) : '',
    speed: 30,
    delay: 1000 // Delay de 1 segundo antes de empezar
  });
  
  // Texto final para mostrar (con o sin efecto typewriter)
  const finalDescription = effectsConfig.typewriterEffect 
    ? typewriterDescription 
    : (description || t('descriptionPlaceholder'));

  // Obtener el tema actual
  const currentTheme = getThemeById(themeId) || getDefaultTheme();
  
  // Configuraciones con valores por defecto
  const borderRadiusValue = configurations.borderRadius || 'rounded-xl';
  const gradientConfig = configurations.gradient || { color1: '#000000', color2: '#4a044d' };
  const fontColorConfig = configurations.fontColor || { primary: '#ffffff', secondary: '#e2e8f0' };
  const linkColorConfig = configurations.linkColor || { background: '#000000', text: '#ffffff', backgroundOpacity: 1 };
  const fontFamilyConfig = configurations.fontFamily || { family: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' };
  const linkImageStyleConfig = configurations.linkImageStyle || { style: 'rectangle' };
  
  // Generar gradiente dinámico si existe configuración personalizada
  const dynamicBackground = configurations.gradient 
    ? `linear-gradient(to bottom, ${gradientConfig.color1} 0%, ${gradientConfig.color2} 100%)`
    : currentTheme.colors.background;
    
  // Configuración del patrón de fondo
  const backgroundPatternConfig = configurations.backgroundPattern || { pattern: 'none', color: '#ffffff', opacity: 0.1 };
  const backgroundPatternStyle = backgroundPatternConfig.pattern !== 'none' 
    ? generatePatternCSS(backgroundPatternConfig.pattern, backgroundPatternConfig.color, backgroundPatternConfig.opacity)
    : {};
    
  // Colores de fuente dinámicos
  const dynamicTextPrimary = configurations.fontColor ? fontColorConfig.primary : currentTheme.colors.textPrimary;
  const dynamicTextSecondary = configurations.fontColor ? fontColorConfig.secondary : currentTheme.colors.textSecondary;
  
  // Función para aplicar opacidad a un color
  const applyOpacityToColor = (color: string, opacity: number) => {
    // Si ya es rgba, actualizar la opacidad
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
    }
    
    // Si es hex, convertir a rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return color;
  };

  // Colores de links dinámicos
  const dynamicLinkBackground = configurations.linkColor 
    ? applyOpacityToColor(linkColorConfig.background, linkColorConfig.backgroundOpacity ?? 1)
    : currentTheme.colors.linkBackground;
  const dynamicLinkText = configurations.linkColor ? linkColorConfig.text : currentTheme.colors.linkText;
  
  // Familia de fuente dinámica
  const dynamicFontFamily = configurations.fontFamily ? fontFamilyConfig.family : currentTheme.typography.fontFamily;
  
  // Función para obtener el estilo de imagen según la configuración
  const getImageStyle = () => {
    const style = linkImageStyleConfig.style;
    
    switch (style) {
      case 'circle':
        return {
          containerClass: 'p-3',
          imageClass: 'rounded-full',
          imageStyle: {
            width: isPreview ? '50px' : '60px',
            height: isPreview ? '50px' : '60px',
            aspectRatio: '1/1',
            objectFit: 'cover' as const
          }
        };
      
      case 'rectangle-padded':
        return {
          containerClass: 'p-2',
          imageClass: 'rounded-lg',
          imageStyle: {
            width: isPreview ? '60px' : '75px',
            height: '100%',
            aspectRatio: '1/1',
            objectFit: 'cover' as const
          }
        };
      
      case 'rectangle':
      default:
        return {
          containerClass: '',
          imageClass: currentTheme.layout.imageStyle === 'square' ? 'rounded-none' : 'rounded-lg',
          imageStyle: {
            width: isPreview ? '65px' : '80px',
            height: '100%',
            aspectRatio: '1/1',
            objectFit: 'cover' as const
          }
        };
    }
  };
  
  // Convertir tamaño de fuente para preview móvil
  const getPreviewFontSize = (fontSize: string) => {
    const sizeMap: Record<string, string> = {
      'text-lg': 'text-xs',
      'text-xl': 'text-sm', 
      'text-2xl': 'text-sm',
      'text-3xl': 'text-base',
      'text-4xl': 'text-lg'
    };
    return sizeMap[fontSize] || 'text-sm';
  };

  // Generar estilo del título con gradiente
  const getTitleStyle = () => {
    const baseStyle = {
      fontFamily: `${dynamicFontFamily}, system-ui, sans-serif`
    };
    
    if (!titleStyleConfig.gradientEnabled || !titleStyleConfig.gradientColors) {
      return {
        ...baseStyle,
        color: dynamicTextPrimary,
        background: 'none',
        WebkitBackgroundClip: 'unset',
        WebkitTextFillColor: 'unset'
      };
    }
    
    const { from, via, to } = titleStyleConfig.gradientColors;
    const direction = titleStyleConfig.gradientDirection || 'to right';
    
    let gradientString = `linear-gradient(${direction}, ${from}`;
    if (via) gradientString += `, ${via}`;
    gradientString += `, ${to})`;
    
    return {
      ...baseStyle,
      background: gradientString,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      MozBackgroundClip: 'text',
      MozTextFillColor: 'transparent',
      color: 'transparent',
      display: 'inline-block',
      // Forzar re-render del gradiente
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat'
    };
  };
  
  // Convertir borderRadius CSS a valor de píxeles para estilos inline
  const getBorderRadiusStyle = (cssValue: string): string => {
    if (cssValue === 'rounded-none') return '0px';
    if (cssValue === 'rounded-sm') return '2px';
    if (cssValue === 'rounded-md') return '6px';
    if (cssValue === 'rounded-lg') return '8px';
    if (cssValue === 'rounded-xl') return '12px';
    if (cssValue === 'rounded-2xl') return '16px';
    
    // Extraer valor de rounded-[Npx]
    const pxMatch = cssValue.match(/rounded-\[(\d+)px\]/);
    if (pxMatch) return `${pxMatch[1]}px`;
    
    // Si es un valor en %, ignorar y usar default
    const percentMatch = cssValue.match(/rounded-\[(\d+)%\]/);
    if (percentMatch) return '12px'; // Convertir a px default
    
    return '12px'; // Default
  };
  
  const borderRadiusStyle = getBorderRadiusStyle(borderRadiusValue);

  // Cargar fuente dinámica
  useEffect(() => {
    if (configurations.fontFamily && fontFamilyConfig.url) {
      // Verificar si la fuente ya está cargada
      const existingLink = document.querySelector(`link[href="${fontFamilyConfig.url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = fontFamilyConfig.url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [configurations.fontFamily, fontFamilyConfig.url]);

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
      element.style.setProperty('--preview-font-family', dynamicFontFamily);
      element.style.setProperty('--preview-font-family-heading', dynamicFontFamily);
    }
  }, [currentTheme, themeId, dynamicFontFamily]);

  return (
    <div 
      data-landing-preview
      className={`${isPreview ? 'min-h-full' : 'min-h-screen'} relative`}
      style={{
        background: dynamicBackground,
        fontFamily: `${dynamicFontFamily}, system-ui, sans-serif`,
        color: dynamicTextPrimary,
      }}
    >
      {/* Guía de configuración de fondos */}
      <BackgroundGuide />
      
      {/* Patrón superpuesto */}
      {backgroundPatternConfig.pattern !== 'none' && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={backgroundPatternStyle}
        />
      )}
      <div className={`relative z-10 flex flex-col items-center ${isPreview ? 'pt-16' : 'pt-20'} ${isPreview ? 'px-1 pb-4' : 'px-6 md:px-8 lg:px-12 pb-16'} ${isPreview ? 'min-h-full' : 'min-h-screen'} mx-auto ${isPreview ? 'max-w-lg' : 'max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl'}`}>
      {/* Avatar (solo si está habilitado) */}
      {avatarDisplayConfig.showAvatar && (
        <div className="relative">
          <Avatar className={`${isPreview ? 'w-16 h-16 mb-4' : 'w-24 h-24 mb-6'} flex-shrink-0`} style={{ backgroundColor: 'var(--preview-link-background)' }}>
            <AvatarImage 
              src={avatarUrl} 
              alt="Avatar de landing"
              className="object-cover"
            />
            <AvatarFallback 
              className={`${isPreview ? 'text-lg' : 'text-2xl'} font-bold`}
              style={{ 
                backgroundColor: 'var(--preview-link-background)',
                color: 'var(--preview-text-primary)'
              }}
            >
              <User className={`${isPreview ? 'w-8 h-8' : 'w-12 h-12'}`} style={{ color: 'var(--preview-text-muted)' }} />
            </AvatarFallback>
          </Avatar>
          
          {/* Guía del avatar */}
          <AvatarGuide />
        </div>
      )}

      {/* Nombre y descripción */}
      <div className={`${avatarDisplayConfig.showAvatar ? (isPreview ? 'mt-2' : 'mt-3') : (isPreview ? 'mt-0' : 'mt-0')} flex items-center justify-center gap-1.5`}>
        {effectsConfig.showBadge && (
          <img 
            src="/images/icons/badge.png" 
            alt="Verificado"
            className={`${isPreview ? 'w-4 h-4' : 'w-6 h-6'} flex-shrink-0`}
          />
        )}
        <div className="relative">
          <h2 
            key={`title-${titleStyleConfig.gradientEnabled}-${JSON.stringify(titleStyleConfig.gradientColors)}`}
            className={`${isPreview ? getPreviewFontSize(titleStyleConfig.fontSize || 'text-2xl') : titleStyleConfig.fontSize} font-semibold text-center break-words leading-tight`}
            style={getTitleStyle()}
          >
            {name || 'Your Name'}
          </h2>
          {/* Guía de información básica */}
          <InfoGuide />
        </div>
      </div>
      
      <div className="relative">
        <p 
          className={`${isPreview ? 'mt-1 mb-2' : 'mt-2 mb-4'} ${isPreview ? 'text-xs' : 'text-base'} text-center break-words line-clamp-3 leading-tight px-2 ${isPreview ? 'min-h-[2rem]' : 'min-h-[3rem]'}`}
          style={{ 
            color: dynamicTextSecondary,
            fontFamily: `${dynamicFontFamily}, system-ui, sans-serif`
          }}
        >
          {finalDescription}
          {effectsConfig.typewriterEffect && !isComplete && (
            <span className="animate-pulse text-current ml-0.5">|</span>
          )}
        </p>
        {/* Guía de configuración de fuentes */}
        <FontGuide />
      </div>

      {/* Links organizados por sección */}
      <div className="w-full space-y-2 mt-2 flex-1 px-0 flex flex-col items-center">
        
        {/* Secciones con sus links */}
        {(() => {
          const sectionsWithLinks = sections
            .sort((a, b) => a.position - b.position)
            .filter(section => (linksBySection[section.id] || []).length > 0);
          
          return sectionsWithLinks.map((section, sectionIndex) => {
            const sectionLinks = linksBySection[section.id] || [];
          
          return (
            <React.Fragment key={section.id}>
              {/* Título de sección */}
              <div 
                className="text-base lg:text-lg text-center font-medium py-2 w-full"
                style={{ 
                  color: dynamicTextSecondary,
                  fontFamily: `${dynamicFontFamily}, system-ui, sans-serif`
                }}
              >
                {section.title}
              </div>
              
              {/* Links de la sección */}
              {sectionLinks.map((link, linkIndex) => (
                <React.Fragment key={link.id}>
                  <div className="relative w-full flex justify-center">
                    <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isPreview ? 'min-h-[65px] w-[95%]' : 'min-h-[60px] sm:min-h-[65px] md:min-h-[80px] w-full md:w-[70%] lg:w-[60%] xl:w-[50%]'} flex items-center overflow-hidden transition-all duration-100 hover:scale-105 group`}
                    style={{
                      backgroundColor: dynamicLinkBackground,
                      borderColor: 'var(--preview-link-border)',
                      color: dynamicLinkText,
                      border: '1px solid',
                      borderRadius: borderRadiusStyle
                    }}
                  >
                    {link.image && (
                      <div className={`flex-shrink-0 ${getImageStyle().containerClass}`}>
                        <img 
                          src={link.image} 
                          alt={link.title || 'Link image'}
                          className={`object-cover ${getImageStyle().imageClass}`}
                          style={getImageStyle().imageStyle}
                        />
                      </div>
                    )}
                    <div className="flex-1 px-4">
                      <h3 
                        className={`${isPreview ? 'text-[8px] sm:text-[10px]' : 'text-[10px] sm:text-xs'} font-medium leading-tight`}
                        style={{ 
                          color: dynamicLinkText,
                          fontFamily: `${dynamicFontFamily}, system-ui, sans-serif`
                        }}
                      >
                        {link.title || 'Untitled Link'}
                      </h3>
                    </div>
                    </a>
                    {/* Guía de configuración de enlaces - solo en el primer enlace */}
                    {sectionIndex === 0 && linkIndex === 0 && <LinksGuide />}
                  </div>
                  {linkIndex < sectionLinks.length - 1 && (
                    <div className={`${isPreview ? 'w-[95%]' : 'w-full md:w-[70%] lg:w-[60%] xl:w-[50%]'} h-px bg-gradient-to-r from-transparent via-white/25 to-transparent my-1`} />
                  )}
                </React.Fragment>
              ))}
              
              {/* Separador entre secciones (solo entre secciones que tienen enlaces) */}
              {sectionIndex < sectionsWithLinks.length - 1 && (
                <div className={`${isPreview ? 'w-[95%]' : 'w-full md:w-[70%] lg:w-[60%] xl:w-[50%]'} h-px bg-white/20 my-2`} />
              )}
            </React.Fragment>
          );
        });
        })()}
        
        {/* Mostrar placeholders si no hay secciones con contenido */}
        {sections.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-6">
            Crea secciones para organizar tus enlaces
          </div>
        )}
      </div>

      {/* Línea separadora */}
      <div className={`w-full h-px bg-white/20 ${isPreview ? 'my-12' : 'my-12'}`} />

      {/* Social links */}
      <div className={`flex flex-nowrap justify-center ${isPreview ? 'gap-1.5 mb-4 py-1' : 'gap-1 mb-6 py-2'} ${isPreview ? 'overflow-hidden' : 'overflow-visible'} px-1`}>
        {visibleSocialLinks.map((socialLink) => {
          const IconComponent = socialIcons[socialLink.name as keyof typeof socialIcons] || socialIcons.default;
          return (
            <a
              key={socialLink.id}
              href={socialLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${isPreview ? 'p-1.5' : 'p-1.5 sm:p-2 md:p-2.5'} transition-all duration-100 ${isPreview ? '' : 'hover:scale-110'} flex-shrink-0`}
              style={{
                backgroundColor: dynamicLinkBackground,
                borderColor: 'var(--preview-link-border)',
                color: dynamicLinkText,
                border: '1px solid',
                borderRadius: borderRadiusStyle
              }}
            >
              <IconComponent className={`${isPreview ? 'w-3.5 h-3.5' : 'w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4'}`} />
            </a>
          );
        })}
      </div>
      </div>
    </div>
  );
}); 