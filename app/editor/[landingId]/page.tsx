"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_URL, createAuthHeaders } from "@/lib/api";
import MultiSectionsBoard from "@/components/editor/MultiSectionsBoard";
import SocialLinksPanel from "@/components/editor/SocialLinksPanel";
import { LandingPreview } from "@/components/landing/LandingPreview";
import { LinkData, SectionData, SocialLinkData } from "@/components/editor/types";
import { useParams } from 'next/navigation';

export default function AdminPage() {
  const params = useParams();
  // Hooks en el orden necesario
  const [links, setLinks] = useState<LinkData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);
  const [_, setRefreshing] = useState(0);
  const [previewPosition, setPreviewPosition] = useState('fixed');
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Guardar landingId en closure
    const lid = params.landingId;
    if (lid && !Array.isArray(lid)) {
      fetch(`${API_URL}/api/sections?landingId=${lid}`, { headers: createAuthHeaders() })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setSections(data); })
        .catch(err => console.error('Error cargando secciones:', err));
      fetch(`${API_URL}/api/links?landingId=${lid}`, { headers: createAuthHeaders() })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setLinks(data); })
        .catch(err => console.error('Error cargando enlaces:', err));
    }
  }, [params.landingId]);

  // Detectar posición del scroll para ajustar el preview
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      const preview = previewRef.current;
      
      if (!footer || !preview) return;
      
      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const previewHeight = 700; // Altura aproximada del preview
      
      // Si el footer está visible y el preview se solaparía
      if (footerRect.top < viewportHeight && footerRect.top < viewportHeight - previewHeight/2) {
        setPreviewPosition('absolute');
      } else {
        setPreviewPosition('fixed');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Ejecutar una vez al cargar
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Validar landingId después de hooks
  if (!params.landingId || Array.isArray(params.landingId)) {
    return <div>Error: landingId inválido</div>;
  }
  const landingId: string = params.landingId;

  // Handlers de ejemplo
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
    // Actualización optimista: guardamos estado previo para posible rollback
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
        // Sincronizar con respuesta del backend (opcional)
        setSections(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      } else {
        // Rollback en caso de error en backend
        setSections(previousSections);
        console.error('Error actualizando sección:', data.error);
      }
    } catch (error) {
      // Rollback en caso de error de red
      setSections(previousSections);
      console.error('Error actualizando sección:', error);
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
        console.error('Error eliminando sección:', data.error);
      }
    } catch (error) {
      console.error('Error eliminando sección:', error);
    }
  };

  // Simulación de landing para preview
  const landingPreview = {
    name: "Mi landing de ejemplo",
    description: "Descripción de ejemplo",
    settings: {},
    links,
    sections,
    socialLinks,
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {/* Efectos de gradiente - Solo en el 50% izquierdo */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 -top-24 -bottom-24 right-1/4 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>
        <div className="absolute left-1/4 -top-32 -bottom-32 right-1/4 bg-[radial-gradient(circle,_rgba(17,24,39,0)_60%,_rgba(88,28,135,0.35)_100%)] blur-[300px] opacity-50 pointer-events-none"></div>
      </div>
      {/* Previsualización */}
      <div 
        ref={previewRef}
        className={`order-first md:order-last w-full md:w-1/2 p-4 md:p-8 bg-transparent flex flex-col items-center justify-center overflow-y-auto z-0 transition-all duration-300 ${
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
        <div className="relative w-[280px] h-[580px] md:w-[320px] md:h-[650px] lg:w-[380px] lg:h-[750px] xl:w-[420px] xl:h-[850px]">
          <img
            src="/images/iphone16-frame.png"
            alt="iPhone frame"
            className="absolute w-full h-full z-20 pointer-events-none object-contain"
          />
          <div className="absolute top-[8px] left-0 w-full h-[calc(100%-16px)] z-10 pt-6 pb-6 overflow-y-auto bg-transparent rounded-[80px] md:rounded-[90px] lg:rounded-[100px]">
            {/* Contenido de preview */}
          </div>
        </div>
      </div>
      {/* Panel de edición */}
      <div className="relative w-full md:w-1/2 order-last md:order-first rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6 overflow-y-auto flex flex-col items-center">
        <h2 className="font-bold mb-4">Edición</h2>
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