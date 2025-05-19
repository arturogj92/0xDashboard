"use client";

import { useState, useEffect } from "react";
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
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Previsualización */}
      <div className="order-first md:order-last w-full md:w-1/2 p-6 bg-transparent md:fixed md:top-12 md:right-0 md:bottom-0 flex flex-col items-center justify-center overflow-y-auto">
        <div className="text-white p-2 rounded mb-4 w-full text-center">
          <p className="font-bold">PREVIEW</p>
        </div>
        <div className="relative w-[200px] h-[400px]">
          <img
            src="/images/iphone16-frame.png"
            alt="iPhone frame"
            className="absolute w-full h-full z-20 pointer-events-none"
          />
          <div className="absolute top-[5px] left-0 w-full h-full z-10 pt-4 pb-4 overflow-y-auto bg-transparent rounded-[80px]">
            {/* Contenido de preview eliminado por ahora */}
          </div>
        </div>
      </div>
      {/* Panel de edición */}
      <div className="relative w-full md:w-1/2 order-last md:order-first max-w-5xl rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6 overflow-y-auto flex flex-col items-center">
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