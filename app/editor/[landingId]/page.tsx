"use client";

import { useState, useEffect, useRef } from "react";
import { API_URL, createAuthHeaders } from "@/lib/api";
import MultiSectionsBoard from "@/components/editor/MultiSectionsBoard";
import SocialLinksPanel from "@/components/editor/SocialLinksPanel";
import { AvatarUpload } from "@/components/editor/AvatarUpload";
import { LandingInfoEditor } from "@/components/editor/LandingInfoEditor";
import { LandingPreview } from "@/components/landing/LandingPreview";
import { LinkData, SectionData, SocialLinkData } from "@/components/editor/types";
import ThemeSelector from "@/components/editor/ThemeSelector";
import BorderRadiusSelector from "@/components/editor/BorderRadiusSelector";
import { useParams } from 'next/navigation';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

export default function AdminPage() {
  const t = useTranslations('editor');
  const params = useParams();
  
  const [links, setLinks] = useState<LinkData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);
  const [landing, setLanding] = useState<{name: string; description: string; theme_id?: string; configurations?: any}>({name: '', description: ''});
  const [_, setRefreshing] = useState(0);
  const [previewPosition, setPreviewPosition] = useState('fixed');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lid = params.landingId;
    if (lid && !Array.isArray(lid)) {
      // Obtener datos de la landing
      fetch(`${API_URL}/api/landings/${lid}`, { headers: createAuthHeaders() })
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setLanding({
              name: data.data.name || '',
              description: data.data.description || '',
              theme_id: data.data.theme_id || 'gradient-purple',
              configurations: data.data.configurations || {}
            });
          }
        })
        .catch(err => console.error('Error cargando landing:', err));
      
      fetch(`${API_URL}/api/sections?landingId=${lid}`, { headers: createAuthHeaders() })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setSections(data); })
        .catch(err => console.error('Error cargando secciones:', err));
      fetch(`${API_URL}/api/links?landingId=${lid}`, { headers: createAuthHeaders() })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setLinks(data); })
        .catch(err => console.error('Error cargando enlaces:', err));
      fetch(`${API_URL}/api/social-links?landingId=${lid}`, { headers: createAuthHeaders() })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setSocialLinks(data); })
        .catch(err => console.error('Error cargando enlaces sociales:', err));
    }
  }, [params.landingId]);

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

  if (!params.landingId || Array.isArray(params.landingId)) {
    return <div>Error: landingId invalido</div>;
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
        setSections(sections => sections.filter(s => s.id !== id));
      } else {
        const data = await res.json();
        console.error('Error eliminando seccion:', data.error);
      }
    } catch (error) {
      console.error('Error eliminando seccion:', error);
    }
  };

  const handleLandingInfoUpdate = (name: string, description: string) => {
    setLanding(prev => ({ ...prev, name, description }));
  };

  const handleThemeUpdate = async (themeId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/landings/${landingId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ theme_id: themeId }),
      });
      
      if (res.ok) {
        setLanding(prev => ({ ...prev, theme_id: themeId }));
      } else {
        console.error('Error actualizando tema');
      }
    } catch (error) {
      console.error('Error actualizando tema:', error);
    }
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

  const landingPreview = {
    name: landing.name || "Mi landing de ejemplo",
    description: landing.description || "Descripcion de ejemplo",
    theme_id: landing.theme_id || "gradient-purple",
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
        <div className="relative w-[50vw] sm:w-[40vw] md:w-[30vw] lg:w-[300px] max-w-[300px] aspect-[9/19.5]">
          <img
            src="/images/iphone16-frame.png"
            alt="iPhone frame"
            className="absolute w-full h-full z-20 pointer-events-none object-contain"
          />
          <div className="absolute inset-[4%] z-10 rounded-[20px] md:rounded-[24px] lg:rounded-[28px] xl:rounded-[32px] overflow-hidden">
            <LandingPreview 
              name={landingPreview.name}
              description={landingPreview.description}
              links={links}
              sections={sections}
              socialLinks={socialLinks}
              isPreview={true}
              themeId={landingPreview.theme_id}
              configurations={landing.configurations}
            />
          </div>
        </div>
      </div>
      
      <div className="relative w-full md:w-1/2 order-last md:order-first rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6 overflow-y-auto flex flex-col items-center">
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
          
          <div className="mt-6 mb-4">
            <AvatarUpload size="lg" />
          </div>
        </div>
        
        <div className="w-full mb-8">
          <LandingInfoEditor
            landingId={landingId}
            initialName={landing.name}
            initialDescription={landing.description}
            onUpdate={handleLandingInfoUpdate}
            className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4"
          />
        </div>
        
        <div className="w-full mb-8">
          <ThemeSelector
            value={landing.theme_id || 'gradient-purple'}
            onChange={handleThemeUpdate}
            className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4"
          />
        </div>

        <div className="w-full mb-8">
          <BorderRadiusSelector
            value={landing.configurations?.borderRadius || 'rounded-xl'}
            onChange={(borderRadius) => handleConfigurationUpdate({ borderRadius })}
            onSave={(borderRadius) => handleConfigurationSave({ borderRadius })}
            className="bg-gray-800/20 border border-gray-700/50 rounded-lg p-4"
          />
        </div>

        <div className="w-full">
          <MultiSectionsBoard
            links={links}
            setLinks={setLinks}
            sections={sections}
            setSections={setSections}
            onUpdateLink={handleUpdateLink}
            onDeleteLink={handleDeleteLink}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            landingId={landingId}
          />
        </div>
        <div className="mt-8 w-full">
          <SocialLinksPanel
            landingId={landingId}
            onReorder={() => setRefreshing((r) => r + 1)}
          />
        </div>
      </div>
    </div>
  );
}