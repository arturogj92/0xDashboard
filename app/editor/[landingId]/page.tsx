"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_URL, createAuthHeaders } from "@/lib/api";
import MultiSectionsBoard from "@/components/editor/MultiSectionsBoard";
import SocialLinksPanel from "@/components/editor/SocialLinksPanel";
import { LandingPreview } from "@/components/landing/LandingPreview";
import { LinkData, SectionData, SocialLinkData } from "@/components/editor/types";
import StyleCustomizationAccordion from "@/components/editor/StyleCustomizationAccordion";
import CustomDomainConfiguration from "@/components/editor/CustomDomainConfiguration";
import { useParams, useRouter } from 'next/navigation';
import { PencilSquareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getThemeById } from '@/lib/themes';

export default function AdminPage() {
  const t = useTranslations('editor');
  const tCustomDomains = useTranslations('customDomains');
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [links, setLinks] = useState<LinkData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);
  const [landing, setLanding] = useState<{id?: string; name: string; description: string; theme_id?: string; avatar_url?: string; configurations?: any; user_id?: string}>({name: '', description: ''});
  const [previewPosition, setPreviewPosition] = useState('fixed');
  const [isOwnershipVerified, setIsOwnershipVerified] = useState(false);
  const [isCustomDomainOpen, setIsCustomDomainOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Protección de autenticación y ownership
  useEffect(() => {
    if (isLoading) return; // Esperar a que termine de cargar la autenticación
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const lid = params.landingId;
    if (lid && !Array.isArray(lid)) {
      // Primero verificar ownership de la landing
      fetch(`${API_URL}/api/landings/${lid}`, { headers: createAuthHeaders() })
        .then(res => {
          if (res.status === 404) {
            router.push('/');
            return null;
          }
          if (res.status === 403) {
            // Redirigir a la home si no es propietario
            router.push('/');
            return null;
          }
          return res.json();
        })
        .then(async (data) => {
          if (!data || !data.data) return;
          
          setIsOwnershipVerified(true);
          
          // Configurar datos de la landing
          const existingConfigurations = data.data.configurations || {};
          const defaultEffects = {
            showBadge: true,
            typewriterEffect: true
          };
          
          const defaultTitleStyle = {
            fontSize: 'text-2xl',
            gradientEnabled: false,
            gradientColors: {
              from: '#007AFF',
              to: '#00D4FF'
            },
            gradientDirection: 'to right'
          };
          
          const defaultAvatarDisplay = {
            showAvatar: true
          };
          
          const defaultBackgroundPattern = {
            pattern: 'none',
            color: '#ffffff',
            opacity: 0.1
          };
          
          setLanding({
            id: data.data.id,
            name: data.data.name || '',
            description: data.data.description || '',
            theme_id: data.data.theme_id || 'dark',
            avatar_url: data.data.avatar_url,
            user_id: data.data.user_id,
            configurations: {
              ...existingConfigurations,
              effects: {
                ...defaultEffects,
                ...existingConfigurations.effects
              },
              titleStyle: {
                ...defaultTitleStyle,
                ...existingConfigurations.titleStyle
              },
              avatarDisplay: {
                ...defaultAvatarDisplay,
                ...existingConfigurations.avatarDisplay
              },
              backgroundPattern: {
                ...defaultBackgroundPattern,
                ...existingConfigurations.backgroundPattern
              }
            }
          });

          // Solo después de verificar ownership, cargar el resto de datos
          try {
            const [sectionsRes, linksRes, socialLinksRes] = await Promise.all([
              fetch(`${API_URL}/api/sections?landingId=${lid}`, { headers: createAuthHeaders() }),
              fetch(`${API_URL}/api/links?landingId=${lid}`, { headers: createAuthHeaders() }),
              fetch(`${API_URL}/api/social-links?landingId=${lid}`, { headers: createAuthHeaders() })
            ]);

            const [sectionsData, linksData, socialLinksData] = await Promise.all([
              sectionsRes.json(),
              linksRes.json(),
              socialLinksRes.json()
            ]);

            if (Array.isArray(sectionsData)) setSections(sectionsData);
            if (Array.isArray(linksData)) setLinks(linksData);
            if (Array.isArray(socialLinksData)) setSocialLinks(socialLinksData);
          } catch (err) {
            console.error('Error cargando datos relacionados:', err);
          }
        })
        .catch(err => {
          console.error('Error cargando landing:', err);
          router.push('/');
        });
    }
  }, [params.landingId, isLoading, isAuthenticated, user?.id, router]);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      const preview = previewRef.current;
      
      if (!footer || !preview) return;
      
      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const previewHeight = 700;
      
      if (footerRect.top < viewportHeight && footerRect.top < viewportHeight - previewHeight/2) {
        setPreviewPosition('absolute');
      } else {
        setPreviewPosition('fixed');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para manejar scroll a secciones - definida con useCallback
  const handleScrollToSection = useCallback((sectionId: string) => {
    console.log('🚀 handleScrollToSection called with:', sectionId);
    // Casos especiales para elementos dentro del acordeón de personalización
    if (sectionId === 'landing-info' || sectionId === 'info-section' || sectionId === 'background-gradient' || sectionId === 'background-pattern' || sectionId === 'avatar-section' || sectionId === 'link-styles' || sectionId === 'font-family') {
      console.log('🎯 Section matches accordion sections');
      // Primero, asegurar que el acordeón esté abierto
      const accordionButton = document.querySelector('[data-accordion="style-customization"]');
      console.log('🔍 Accordion button found:', accordionButton);
      
      if (accordionButton) {
        const isOpen = accordionButton.getAttribute('aria-expanded') === 'true';
        console.log('📋 Accordion is open:', isOpen);
        
        if (!isOpen) {
          console.log('🔓 Clicking accordion button');
          (accordionButton as HTMLElement).click();
          console.log('✅ Accordion click executed');
          // Esperar a que se abra el acordeón antes de continuar
          setTimeout(() => {
            console.log('⏰ Continuing after accordion animation');
            handleSpecificSection(sectionId);
          }, 300);
        } else {
          console.log('✅ Accordion already open, handling specific section');
          handleSpecificSection(sectionId);
        }
      } else {
        console.error('❌ Accordion button not found');
      }
    } else {
      // Para otras secciones, scroll directo
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        targetElement.classList.add('highlight-section');
        setTimeout(() => {
          targetElement.classList.remove('highlight-section');
        }, 3000);
      } else {
        console.error('Target element not found:', sectionId);
      }
    }

    function handleSpecificSection(sectionId: string) {
      if (sectionId === 'background-gradient') {
        console.log('🎨 Handling background-gradient');
        // Para background-gradient, necesitamos abrir el accordion de fondos
        const backgroundAccordion = document.querySelector('#background-configuration button');
        console.log('🔍 Background accordion button found:', backgroundAccordion);
        if (backgroundAccordion) {
          // Verificar si el accordion de fondos está cerrado
          // Como el contenido se renderiza condicionalmente, verificamos si existe
          const backgroundContent = document.querySelector('#background-configuration div.p-4.pt-0.space-y-6');
          const isBackgroundOpen = backgroundContent !== null;
          console.log('📋 Background accordion content found:', backgroundContent, 'isOpen:', isBackgroundOpen);
          
          if (!isBackgroundOpen) {
            console.log('🔓 Clicking background accordion button');
            (backgroundAccordion as HTMLElement).click();
            console.log('✅ Background accordion click executed');
            // Esperar un poco más para que se abra el accordion interno
            setTimeout(() => {
              const targetElement = document.getElementById('background-configuration');
              if (targetElement) {
                targetElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start',
                  inline: 'nearest'
                });
                
                targetElement.classList.add('highlight-section');
                setTimeout(() => {
                  targetElement.classList.remove('highlight-section');
                }, 3000);
              } else {
                console.error('❌ Target element not found for background-configuration');
              }
            }, 300);
          } else {
            // Si ya está abierto, solo hacer scroll
            console.log('✅ Background accordion already open, scrolling');
            const targetElement = document.getElementById('background-configuration');
            if (targetElement) {
              targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
              
              targetElement.classList.add('highlight-section');
              setTimeout(() => {
                targetElement.classList.remove('highlight-section');
              }, 3000);
            }
          }
        }
      } else if (sectionId === 'avatar-section') {
        console.log('🎭 Handling avatar-section');
        // Para avatar-section, necesitamos abrir el accordion de avatar
        const avatarAccordion = document.querySelector('#avatar-configuration button');
        console.log('🔍 Avatar accordion button found:', avatarAccordion);
        if (avatarAccordion) {
          // Verificar si el accordion de avatar está cerrado
          // Como el contenido se renderiza condicionalmente, verificamos si existe
          const avatarContent = document.querySelector('#avatar-configuration div.p-4.pt-0.space-y-6');
          const isAvatarOpen = avatarContent !== null;
          console.log('📋 Avatar accordion content found:', avatarContent, 'isOpen:', isAvatarOpen);
          
          if (!isAvatarOpen) {
            console.log('🔓 Clicking avatar accordion button');
            (avatarAccordion as HTMLElement).click();
            console.log('✅ Avatar accordion click executed');
            // Esperar un poco más para que se abra el accordion interno
            setTimeout(() => {
              const targetElement = document.getElementById('avatar-configuration');
              if (targetElement) {
                targetElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start',
                  inline: 'nearest'
                });
                
                targetElement.classList.add('highlight-section');
                setTimeout(() => {
                  targetElement.classList.remove('highlight-section');
                }, 3000);
              } else {
                console.error('❌ Target element not found for avatar-configuration');
              }
            }, 300);
          } else {
            // Si ya está abierto, solo hacer scroll
            console.log('✅ Avatar accordion already open, scrolling');
            const targetElement = document.getElementById('avatar-configuration');
            if (targetElement) {
              targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
              
              targetElement.classList.add('highlight-section');
              setTimeout(() => {
                targetElement.classList.remove('highlight-section');
              }, 3000);
            }
          }
        }
      } else if (sectionId === 'info-section') {
        // Para info-section, necesitamos abrir el accordion de información básica
        const infoAccordion = document.querySelector('#landing-info button');
        if (infoAccordion) {
          // Verificar si el accordion de información está cerrado
          const infoSection = document.querySelector('#landing-info');
          const isInfoOpen = infoSection?.querySelector('[class*="pt-0"]') !== null;
          
          if (!isInfoOpen) {
            (infoAccordion as HTMLElement).click();
            // Esperar un poco más para que se abra el accordion interno
            setTimeout(() => {
              const targetElement = document.getElementById('landing-info');
              if (targetElement) {
                targetElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start',
                  inline: 'nearest'
                });
                
                targetElement.classList.add('highlight-section');
                setTimeout(() => {
                  targetElement.classList.remove('highlight-section');
                }, 3000);
              }
            }, 300);
          } else {
            // Si ya está abierto, solo hacer scroll
            const targetElement = document.getElementById('landing-info');
            if (targetElement) {
              targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
              
              targetElement.classList.add('highlight-section');
              setTimeout(() => {
                targetElement.classList.remove('highlight-section');
              }, 3000);
            }
          }
        }
      } else if (sectionId === 'font-family') {
        // Para font-family, necesitamos abrir el accordion de fuentes
        const fontAccordion = document.querySelector('#font-configuration button');
        if (fontAccordion) {
          // Verificar si el accordion de fuentes está cerrado
          const fontSection = document.querySelector('#font-configuration');
          const isFontOpen = fontSection?.querySelector('[class*="pt-0"]') !== null;
          
          if (!isFontOpen) {
            (fontAccordion as HTMLElement).click();
            // Esperar un poco más para que se abra el accordion interno
            setTimeout(() => {
              const targetElement = document.getElementById('font-configuration');
              if (targetElement) {
                targetElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start',
                  inline: 'nearest'
                });
                
                targetElement.classList.add('highlight-section');
                setTimeout(() => {
                  targetElement.classList.remove('highlight-section');
                }, 3000);
              }
            }, 300);
          } else {
            // Si ya está abierto, solo hacer scroll
            const targetElement = document.getElementById('font-configuration');
            if (targetElement) {
              targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
              
              targetElement.classList.add('highlight-section');
              setTimeout(() => {
                targetElement.classList.remove('highlight-section');
              }, 3000);
            }
          }
        }
      } else if (sectionId === 'link-styles') {
        console.log('🔗 Handling link-styles');
        // Para link-styles, necesitamos abrir el accordion de enlaces
        const linkAccordion = document.querySelector('#link-styles button');
        console.log('🔍 Link accordion button found:', linkAccordion);
        if (linkAccordion) {
          // Verificar si el accordion de enlaces está cerrado
          // Como el contenido se renderiza condicionalmente, verificamos si existe
          const linkContent = document.querySelector('#link-styles div.p-4.pt-0.space-y-6');
          const isLinkOpen = linkContent !== null;
          console.log('📋 Link accordion content found:', linkContent, 'isOpen:', isLinkOpen);
          
          if (!isLinkOpen) {
            console.log('🔓 Clicking link accordion button');
            (linkAccordion as HTMLElement).click();
            console.log('✅ Link accordion click executed');
            // Esperar un poco más para que se abra el accordion interno
            setTimeout(() => {
              const targetElement = document.getElementById('link-styles');
              if (targetElement) {
                targetElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start',
                  inline: 'nearest'
                });
                
                targetElement.classList.add('highlight-section');
                setTimeout(() => {
                  targetElement.classList.remove('highlight-section');
                }, 3000);
              } else {
                console.error('❌ Target element not found for link-styles');
              }
            }, 300);
          } else {
            // Si ya está abierto, solo hacer scroll
            console.log('✅ Link accordion already open, scrolling');
            const targetElement = document.getElementById('link-styles');
            if (targetElement) {
              targetElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
              
              targetElement.classList.add('highlight-section');
              setTimeout(() => {
                targetElement.classList.remove('highlight-section');
              }, 3000);
            }
          }
        }
      } else {
        // Para otras secciones específicas dentro del acordeón
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
          
          targetElement.classList.add('highlight-section');
          setTimeout(() => {
            targetElement.classList.remove('highlight-section');
          }, 3000);
        } else {
          console.error('Target element not found:', sectionId);
        }
      }
    }
  }, []);

  // Listener para eventos de guías internas
  useEffect(() => {
    const handleGuideClick = (event: CustomEvent) => {
      console.log('📥 Guide event received:', event.detail);
      const { sectionId } = event.detail;
      console.log('🎯 Calling handleScrollToSection with:', sectionId);
      handleScrollToSection(sectionId);
    };

    console.log('🔧 Setting up event listener on window');
    window.addEventListener('guideClick', handleGuideClick as EventListener);
    console.log('✅ Event listener added successfully');
    return () => {
      console.log('🧹 Removing event listener');
      window.removeEventListener('guideClick', handleGuideClick as EventListener);
    };
  }, [handleScrollToSection]);

  // Protección de acceso
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>{t('verifyingAccess')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El useEffect ya redirigió
  }

  if (!isOwnershipVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>{t('verifyingPermissions')}</p>
        </div>
      </div>
    );
  }

  if (!params.landingId || Array.isArray(params.landingId)) {
    return <div className="text-white">{t('invalidLandingId')}</div>;
  }
  const landingId: string = params.landingId;

  const handleUpdateLink = async (id: string, updates: Partial<LinkData>) => {
    try {
      const body = { id, ...updates };
      const res = await fetch(`${API_URL}/api/links?landingId=${landingId}`, {
        method: 'PATCH',
        headers: createAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setLinks(prev => prev.map(l => (l.id === id ? { ...l, ...data } : l)));
      } else {
        console.error('Error actualizando link:', data.error);
      }
    } catch (error) {
      console.error('Error actualizando link:', error);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/links?landingId=${landingId}&id=${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setLinks(links => links.filter(l => l.id !== id));
      } else {
        console.error('Error eliminando link:', data.error);
      }
    } catch (error) {
      console.error('Error eliminando link:', error);
    }
  };

  const handleUpdateSection = async (id: string, updates: Partial<SectionData>) => {
    const previousSections = sections;
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    try {
      const body = { id, ...updates };
      const res = await fetch(`${API_URL}/api/sections?landingId=${landingId}`, {
        method: 'PATCH',
        headers: createAuthHeaders(),
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setSections(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      } else {
        setSections(previousSections);
        console.error('Error actualizando seccion:', data.error);
      }
    } catch (error) {
      setSections(previousSections);
      console.error('Error actualizando seccion:', error);
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/sections?landingId=${landingId}&id=${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders()
      });
      if (res.ok) {
        // Actualizar secciones
        setSections(sections => sections.filter(s => s.id !== id));
        
        // Actualizar enlaces: mover todos los enlaces de esta sección a "sin sección"
        setLinks(links => links.map(link => 
          link.section_id === id 
            ? { ...link, section_id: null }
            : link
        ));
      } else {
        const data = await res.json();
        console.error('Error eliminando seccion:', data.error);
      }
    } catch (error) {
      console.error('Error eliminando seccion:', error);
    }
  };

  const handleCreateSection = async () => {
    try {
      const newSection = {
        title: 'Nueva Sección',
        position: sections.length
      };

      const res = await fetch(`${API_URL}/api/sections?landingId=${landingId}`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(newSection)
      });

      if (res.ok) {
        const data = await res.json();
        setSections(prev => [...prev, data]);
        
        // Hacer scroll a la nueva sección después de un pequeño delay para que se renderice
        setTimeout(() => {
          const sectionElement = document.querySelector(`[data-section-id="${data.id}"]`);
          if (sectionElement) {
            // Scroll suave hacia la nueva sección
            sectionElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
            
            // Opcional: agregar un brillo temporal para destacar la nueva sección
            sectionElement.classList.add('highlight-new-section');
            setTimeout(() => {
              sectionElement.classList.remove('highlight-new-section');
            }, 2000);
          }
        }, 150);
      } else {
        const data = await res.json();
        console.error('Error creando seccion:', data.error);
      }
    } catch (error) {
      console.error('Error creando seccion:', error);
    }
  };

  const handleLandingInfoUpdate = (name: string, description: string) => {
    setLanding(prev => ({ ...prev, name, description }));
  };

  const handleThemeUpdate = async (themeId: string) => {
    try {
      // Obtener configuraciones del tema seleccionado
      const themeConfigurations = getThemeConfigurations(themeId);
      
      const res = await fetch(`${API_URL}/api/landings/${landingId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ 
          theme_id: themeId,
          configurations: themeConfigurations
        }),
      });
      
      if (res.ok) {
        setLanding(prev => ({ 
          ...prev, 
          theme_id: themeId,
          configurations: themeConfigurations
        }));
      } else {
        console.error('Error actualizando tema');
      }
    } catch (error) {
      console.error('Error actualizando tema:', error);
    }
  };

  // Función para obtener configuraciones basadas en el tema
  const getThemeConfigurations = (themeId: string) => {
    const theme = getThemeById(themeId);
    
    const baseConfig = {
      borderRadius: 'rounded-xl',
      fontFamily: {
        family: 'Inter',
        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      },
      effects: {
        showBadge: true,
        typewriterEffect: true
      },
      titleStyle: {
        fontSize: 'text-2xl',
        gradientEnabled: false,
        gradientColors: {
          from: '#007AFF',
          to: '#00D4FF'
        },
        gradientDirection: 'to right'
      },
      avatarDisplay: {
        showAvatar: true
      }
    };

    // Si existe el tema, usar sus configuraciones
    if (theme) {
      return {
        ...baseConfig,
        fontFamily: {
          family: theme.typography.fontFamily,
          url: theme.typography.googleFontsUrl || baseConfig.fontFamily.url
        },
        gradient: extractGradientColors(theme.colors.background),
        fontColor: { 
          primary: theme.colors.textPrimary, 
          secondary: theme.colors.textSecondary 
        },
        linkColor: { 
          background: theme.colors.linkBackground, 
          text: theme.colors.linkText 
        },
        // Agregar el patrón de fondo del tema si existe
        backgroundPattern: theme.layout.backgroundPattern || { 
          pattern: 'none', 
          color: '#ffffff', 
          opacity: 0.1 
        }
      };
    }

    // Configuraciones por defecto para temas legacy
    switch (themeId) {
      case 'dark':
        return {
          ...baseConfig,
          gradient: { color1: '#000000', color2: '#000000' },
          fontColor: { primary: '#ffffff', secondary: '#ffffff' },
          linkColor: { background: '#000000', text: '#ffffff' },
          backgroundPattern: { pattern: 'grid', color: '#ffffff', opacity: 0.1 },
          titleStyle: {
            fontSize: 'text-2xl',
            gradientEnabled: true,
            gradientColors: {
              from: '#667eea',
              via: '#764ba2',
              to: '#f093fb'
            },
            gradientDirection: 'to right'
          }
        };
      case 'light':
        return {
          ...baseConfig,
          gradient: { color1: '#f8fafc', color2: '#e2e8f0' },
          fontColor: { primary: '#000000', secondary: '#000000' },
          linkColor: { background: '#ffffff', text: '#000000' },
          backgroundPattern: { pattern: 'dots', color: '#000000', opacity: 0.15 }
        };
      case 'gradient':
        return {
          ...baseConfig,
          gradient: { color1: '#667eea', color2: '#764ba2' },
          fontColor: { primary: '#ffffff', secondary: '#f1f5f9' },
          linkColor: { background: 'rgba(255,255,255,0.15)', text: '#ffffff' },
          backgroundPattern: { pattern: 'geometric', color: '#8b5cf6', opacity: 0.2 }
        };
      default:
        return baseConfig;
    }
  };

  // Función auxiliar para extraer colores del gradiente
  const extractGradientColors = (gradient: string) => {
    // Buscar colores hexadecimales en el gradiente
    const colors = gradient.match(/#[0-9a-fA-F]{6}/g) || ['#000000', '#000000'];
    return {
      color1: colors[0] || '#000000',
      color2: colors[1] || colors[0] || '#000000'
    };
  };

  const handleConfigurationUpdate = (newConfig: any) => {
    // Actualizar estado local inmediatamente para ver cambios en tiempo real
    const updatedConfigurations = {
      ...landing.configurations,
      ...newConfig
    };
    setLanding(prev => ({ ...prev, configurations: updatedConfigurations }));
  };

  const handleConfigurationSave = async (newConfig: any) => {
    // Esta función se llamará con debounce para guardar en el backend
    try {
      const updatedConfigurations = {
        ...landing.configurations,
        ...newConfig
      };
      
      const res = await fetch(`${API_URL}/api/landings/${landingId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ configurations: updatedConfigurations }),
      });
      
      if (!res.ok) {
        console.error('Error guardando configuracion');
      }
    } catch (error) {
      console.error('Error guardando configuracion:', error);
    }
  };

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    setLanding(prev => ({ ...prev, avatar_url: avatarUrl || undefined }));
  };

  const landingPreview = {
    name: landing.name || "Mi landing de ejemplo",
    description: landing.description || "Descripcion de ejemplo",
    theme_id: landing.theme_id || "dark",
    settings: {},
    links,
    sections,
    socialLinks,
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 -top-24 -bottom-24 right-1/4 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>
        <div className="absolute left-1/4 -top-32 -bottom-32 right-1/4 bg-[radial-gradient(circle,_rgba(17,24,39,0)_60%,_rgba(88,28,135,0.35)_100%)] blur-[300px] opacity-50 pointer-events-none"></div>
      </div>
      
      <div 
        ref={previewRef}
        className={`order-first md:order-last w-full md:w-1/2 p-4 md:p-8 bg-transparent flex flex-col items-center justify-center z-0 transition-all duration-300 ${
          previewPosition === 'fixed' 
            ? 'md:fixed md:top-16 md:right-0 md:bottom-16' 
            : 'md:absolute md:top-0 md:right-0 md:h-screen'
        }`}
        style={previewPosition === 'absolute' ? {
          transform: 'translateY(-100px)',
        } : {}}
      >
        <div className="text-white p-2 rounded mb-4 w-full text-center">
          <p className="font-bold text-lg md:text-xl">VISTA PREVIA</p>
        </div>
        <div 
          className="relative w-[50vw] sm:w-[40vw] md:w-[30vw] lg:w-[300px] max-w-[300px] aspect-[9/19.5]"
          data-editor-container="true"
        >
          <img
            src="/images/iphone16-frame.png"
            alt="iPhone frame"
            className="absolute w-full h-full z-20 pointer-events-none object-contain"
          />
          <div className="absolute inset-[4%] z-10 rounded-[20px] md:rounded-[24px] lg:rounded-[28px] xl:rounded-[32px] overflow-hidden">
            <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
              <LandingPreview 
                name={landingPreview.name}
                description={landingPreview.description}
                links={links}
                sections={sections}
                socialLinks={socialLinks}
                isPreview={true}
                showGuides={true}
                themeId={landingPreview.theme_id}
                avatarUrl={landing.avatar_url}
                configurations={landing.configurations}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative w-full md:w-1/2 order-last md:order-first rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex flex-col items-center">
        <div className="text-center mb-6 w-full">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <PencilSquareIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t('title')}</h2>
          </div>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('description')}
          </p>
          
        </div>
        
        <div id="style-customization" className="w-full mb-8">
          <StyleCustomizationAccordion
            landing={landing}
            handleConfigurationUpdate={handleConfigurationUpdate}
            handleConfigurationSave={handleConfigurationSave}
            handleThemeUpdate={handleThemeUpdate}
            onAvatarUpdate={handleAvatarUpdate}
            onLandingInfoUpdate={handleLandingInfoUpdate}
          />
        </div>

        <div id="custom-domain" className="w-full mb-8">
          {/* Header del accordion de dominio personalizado */}
          <button
            onClick={() => setIsCustomDomainOpen(!isCustomDomainOpen)}
            data-accordion="custom-domain"
            aria-expanded={isCustomDomainOpen}
            className="w-full flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:bg-gray-800/40 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">
                  {tCustomDomains('title')}
                </h3>
                <p className="text-sm text-gray-400">
                  {tCustomDomains('description')}
                </p>
              </div>
            </div>
            
            <div className="text-gray-400">
              {isCustomDomainOpen ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </div>
          </button>

          {/* Contenido del accordion */}
          <div 
            className={`transition-all duration-300 ease-in-out ${
              isCustomDomainOpen ? 'max-h-none opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="mt-4">
              <CustomDomainConfiguration
                landingId={landingId}
                hideHeader={true}
              />
            </div>
          </div>
        </div>

        <div id="sections-board" className="w-full">
          <MultiSectionsBoard
            links={links}
            setLinks={setLinks}
            sections={sections}
            setSections={setSections}
            onUpdateLink={handleUpdateLink}
            onDeleteLink={handleDeleteLink}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onCreateSection={handleCreateSection}
            landingId={landingId}
          />
        </div>
        <div id="social-links" className="mt-8 w-full">
          <SocialLinksPanel
            landingId={landingId}
            onUpdate={(updatedSocialLinks) => setSocialLinks(updatedSocialLinks)}
          />
        </div>
      </div>
      
      {/* Estilos para preview */}
      <style jsx global>{`
        /* Ocultar scrollbar pero mantener funcionalidad de scroll */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Safari and Chrome */
        }
        
        /* Ocultar navbar en el preview */
        .preview-container nav,
        .preview-container header,
        .preview-container [data-navbar],
        .preview-container .navbar,
        .preview-container .nav {
          display: none !important;
        }
        
        /* Ocultar scrollbars completamente en el preview */
        .preview-container,
        .preview-container *,
        .preview-container *:before,
        .preview-container *:after {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .preview-container::-webkit-scrollbar,
        .preview-container *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        /* Prevenir overflow en hover */
        .preview-container a:hover,
        .preview-container button:hover {
          transform: none !important;
          overflow: hidden !important;
        }
        
        /* Forzar overflow hidden en todos los elementos del preview */
        .preview-container [data-landing-preview],
        .preview-container [data-landing-preview] * {
          overflow: hidden !important;
        }
        
        /* Efecto de brillo para nueva sección creada */
        .highlight-new-section {
          animation: highlight-glow 2s ease-in-out;
        }
        
        /* Efecto de brillo para sección enfocada por la guía */
        .highlight-section {
          animation: guide-highlight 3s ease-in-out;
        }
        
        @keyframes highlight-glow {
          0% { 
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
            border-color: rgba(168, 85, 247, 0.3);
          }
          50% { 
            box-shadow: 0 0 20px 5px rgba(168, 85, 247, 0.6);
            border-color: rgba(168, 85, 247, 0.8);
          }
          100% { 
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
            border-color: rgba(168, 85, 247, 0.3);
          }
        }
        
        @keyframes guide-highlight {
          0% { 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
            background-color: rgba(59, 130, 246, 0.05);
          }
          25% { 
            box-shadow: 0 0 30px 10px rgba(59, 130, 246, 0.8);
            background-color: rgba(59, 130, 246, 0.15);
          }
          75% { 
            box-shadow: 0 0 30px 10px rgba(59, 130, 246, 0.8);
            background-color: rgba(59, 130, 246, 0.15);
          }
          100% { 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
            background-color: rgba(59, 130, 246, 0.05);
          }
        }
      `}</style>
    </div>
  );
}