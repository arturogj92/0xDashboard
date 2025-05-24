"use client";

import React, { useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { LinkData, SectionData } from "./types";
import MultiSectionsContainer from "./MultiSectionsContainer";
import { API_URL, createAuthHeaders } from "@/lib/api";
import { useTranslations } from 'next-intl';

interface Props {
  landingId: string;
  links: LinkData[];
  setLinks: React.Dispatch<React.SetStateAction<LinkData[]>>;
  sections: SectionData[];
  setSections: React.Dispatch<React.SetStateAction<SectionData[]>>;
  onUpdateLink: (id: string, u: Partial<LinkData>) => void;
  onDeleteLink: (id: string) => void;
  onUpdateSection: (id: string, u: Partial<SectionData>) => void;
  onDeleteSection: (id: string) => void;
  onCreateSection: () => void;
  onLinksReordered?: () => void;
}

/* ──────────────────────────────────────────────────────────── */
/*  ESTE FICHERO ES EL ÚNICO QUE CAMBIA PARA REFRESCO INSTANTE  */
/* ──────────────────────────────────────────────────────────── */

export default function MultiSectionsBoard({
  landingId,
  links,
  setLinks,
  sections,
  setSections,
  onUpdateLink,
  onDeleteLink,
  onUpdateSection,
  onDeleteSection,
  onCreateSection,
  onLinksReordered,
}: Props) {
  const t = useTranslations('editor');
  
  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  const [activeId, setActiveId] = useState<string | null>(null);
  /* containers SIEMPRE se recalculan a partir de links/sections.
     Con useMemo el cálculo es barato y se sincroniza en el mismo render,
     por lo que el cambio de sección se ve inmediatamente.               */
  const containers = useMemo(() => {
    const noSectionItems = links
      .filter((l) => l.section_id === null)
      .sort((a, b) => a.position - b.position)
      .map((l) => l.id);

    const sortedSecs = [...sections].sort((a, b) => a.position - b.position);
    const sectionContainers = sortedSecs.map((sec) => ({
      id: sec.id,
      items: links
        .filter((l) => l.section_id === sec.id)
        .sort((a, b) => a.position - b.position)
        .map((l) => l.id),
    }));
    return [...sectionContainers, { id: "no-section", items: noSectionItems }];
  }, [links, sections]);

  /* ─────────── Reordenar dentro de la misma sección ─────────── */
  const reorderLinks = useCallback(
    async (ids: string[]) => {
      setLinks((prev) => {
        const nl = structuredClone(prev);
        ids.forEach((id, i) => {
          const l = nl.find((x) => x.id === id);
          if (l) l.position = i;
        });
        return nl;
      });

      await fetch(`${API_URL}/api/links?landingId=${landingId}`, {
        method: "PATCH",
        headers: createAuthHeaders(),
        body: JSON.stringify(ids.map((id, i) => ({ id, position: i }))),
      });
      onLinksReordered?.();
    },
    [landingId, setLinks, onLinksReordered]
  );

  /* ─────────── Estado para transiciones progresivas ─────────── */
  const [transitioningLinks, setTransitioningLinks] = useState<Set<string>>(new Set());
  
  /* ─────────── Handlers de drag and drop ─────────── */
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Si se suelta sobre una sección diferente
    if (overId.startsWith('section-') || overId === 'no-section') {
      const targetSectionId = overId.replace('section-', '');
      handleMoveToSection(activeId, targetSectionId);
      return;
    }
    
    // Si se reordena dentro de la misma sección
    const activeLink = links.find(l => l.id === activeId);
    const overLink = links.find(l => l.id === overId);
    
    if (activeLink && overLink && 
        (activeLink.section_id ?? 'no-section') === (overLink.section_id ?? 'no-section')) {
      const sectionId = activeLink.section_id ?? 'no-section';
      const sectionLinks = links
        .filter(l => (l.section_id ?? 'no-section') === sectionId)
        .sort((a, b) => a.position - b.position);
      
      const oldIndex = sectionLinks.findIndex(l => l.id === activeId);
      const newIndex = sectionLinks.findIndex(l => l.id === overId);
      
      if (oldIndex !== newIndex) {
        const reorderedIds = [...sectionLinks];
        const [movedItem] = reorderedIds.splice(oldIndex, 1);
        reorderedIds.splice(newIndex, 0, movedItem);
        
        reorderLinks(reorderedIds.map(l => l.id));
      }
    }
  }

  /* ─────────── Mover link a OTRA sección ─────────── */
  const handleMoveToSection = useCallback(
    async (id: string, newSectionId: string) => {
      const targetId = newSectionId === "no-section" ? null : newSectionId;
      
      const currentLink = links.find(l => l.id === id);
      if (!currentLink) return;
      
      const oldSectionId = currentLink.section_id ?? "no-section";
      
      // Si no hay cambio real, no hacer nada
      if (oldSectionId === newSectionId) {
        return;
      }
      
      // Calcular posición al final de la sección destino
      const destSectionLinks = links.filter(l => 
        l.id !== id && (l.section_id ?? "no-section") === newSectionId
      );
      const pos = destSectionLinks.length;

      // Marcar como en transición para efectos visuales
      setTransitioningLinks((prev: Set<string>) => new Set(prev).add(id));

      // Usar una sola actualización fluida para evitar choppy animations
      const animateReorganization = async () => {
        // Primera actualización: mover el elemento y hacer reindexación completa suavemente
        await new Promise(resolve => requestAnimationFrame(() => {
          setLinks((prev) => {
            const nl = [...prev];
            const linkIndex = nl.findIndex((l) => l.id === id);
            if (linkIndex === -1) return prev;
            
            const link = { ...nl[linkIndex] };
            
            // Actualizar el elemento movido
            link.section_id = targetId;
            link.position = pos;
            nl[linkIndex] = link;
            
            // Reindexar inmediatamente pero de forma que framer-motion pueda animar suavemente
            // Sección destino: primero obtener todos los elementos actuales (sin el movido)
            const destSectionLinksExcludeMoved = nl.filter(l => 
              l.id !== id && (l.section_id ?? "no-section") === newSectionId
            ).sort((a, b) => a.position - b.position);
            
            // Ajustar posiciones de elementos existentes para hacer espacio
            destSectionLinksExcludeMoved.forEach((destLink, idx) => {
              const linkInArray = nl.find(l => l.id === destLink.id);
              if (linkInArray) {
                // Si el índice actual es >= pos, desplazar hacia adelante
                const newPos = idx >= pos ? idx + 1 : idx;
                linkInArray.position = newPos;
              }
            });
            
            // Sección origen si es diferente
            if (oldSectionId !== newSectionId) {
              const originSectionLinks = nl.filter(l => 
                l.id !== id && (l.section_id ?? "no-section") === oldSectionId
              ).sort((a, b) => a.position - b.position);
              
              originSectionLinks.forEach((originLink, idx) => {
                const linkInArray = nl.find(l => l.id === originLink.id);
                if (linkInArray && linkInArray.position !== idx) {
                  linkInArray.position = idx;
                }
              });
            }
            
            return [...nl];
          });
          resolve(undefined);
        }));

        // Esperar que las animaciones de framer-motion se estabilicen (más rápido)
        await new Promise(resolve => setTimeout(resolve, 120));

        // Remover estado de transición
        setTransitioningLinks((prev: Set<string>) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      };

      animateReorganization();

      // Hacer la actualización en el servidor después de completar las animaciones
      setTimeout(async () => {
        try {
          // Obtener el estado final después de todas las reindexaciones
          setLinks((currentLinks) => {
            const nl = [...currentLinks];
            
            // Recolectar todos los elementos que necesitan actualización
            const updatesToSend: Array<{id: string, position: number, section_id: string | null}> = [];
            
            // Reindexar correctamente la sección destino
            const destSectionLinks = nl.filter(l => 
              (l.section_id ?? "no-section") === newSectionId
            ).sort((a, b) => a.position - b.position);
            
            // Reindexar correctamente: cada elemento debe tener posición secuencial
            destSectionLinks.forEach((destLink, idx) => {
              const linkInArray = nl.find(l => l.id === destLink.id);
              if (linkInArray) {
                linkInArray.position = idx;
                updatesToSend.push({
                  id: linkInArray.id,
                  position: idx,
                  section_id: linkInArray.section_id ?? null
                });
              }
            });
            
            // Reindexar y recolectar cambios para la sección origen si es diferente
            if (oldSectionId !== newSectionId) {
              const originSectionLinks = nl.filter(l => 
                l.id !== id && (l.section_id ?? "no-section") === oldSectionId
              ).sort((a, b) => a.position - b.position);
              
              originSectionLinks.forEach((originLink, idx) => {
                const linkInArray = nl.find(l => l.id === originLink.id);
                if (linkInArray) {
                  linkInArray.position = idx;
                  updatesToSend.push({
                    id: linkInArray.id,
                    position: idx,
                    section_id: linkInArray.section_id ?? null
                  });
                }
              });
            }
            
            // Enviar todas las actualizaciones al servidor
            if (updatesToSend.length > 0) {
              fetch(`${API_URL}/api/links?landingId=${landingId}`, {
                method: "PATCH",
                headers: createAuthHeaders(),
                body: JSON.stringify(updatesToSend),
              }).catch(error => {
                console.error("Error updating links:", error);
              });
            }
            
            return [...nl];
          });

          onLinksReordered?.();
        } catch (error) {
          console.error("Error in final server update:", error);
        }
      }, 140); // Esperar a que terminen las animaciones (más rápido)
    },
    [landingId, setLinks, onLinksReordered, links]
  );

  /* ─────────── Mover secciones arriba / abajo ─────────── */
  const patchSections = useCallback(async (arr: SectionData[]) => {
    await fetch(`${API_URL}/api/sections?landingId=${landingId}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(arr.map((s) => ({ id: s.id, position: s.position }))),
    });
  }, [landingId]);

  const moveSection = useCallback(
    (dir: "up" | "down", id: string) => {
      setSections((prev) => {
        const idx = prev.findIndex((s) => s.id === id);
        if (
          idx < 0 ||
          (dir === "up" && idx === 0) ||
          (dir === "down" && idx === prev.length - 1)
        )
          return prev;
        const arr = [...prev];
        const swap = dir === "up" ? idx - 1 : idx + 1;
        [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
        arr.forEach((s, i) => (s.position = i));
        patchSections(arr);
        onLinksReordered?.();
        return arr;
      });
    },
    [setSections, onLinksReordered, patchSections]
  );


  /* ─────────── Crear link nuevo ─────────── */
  const createLinkInSection = useCallback(
    async (sectionId: string) => {
      const dummyLink = {
        title: "Nuevo Enlace",
        url: "",
        image: "",
        visible: true,
        position: 0,
        section_id: sectionId === "no-section" ? null : sectionId,
      };

      const res = await fetch(`${API_URL}/api/links?landingId=${landingId}`, {
        method: "POST",
        headers: createAuthHeaders(),
        body: JSON.stringify(dummyLink),
      });
      const data = await res.json();
      if (res.ok) {
        setLinks((prev) => [...prev, data]);
        onLinksReordered?.();
      } else {
        console.error(data.error);
      }
    },
    [landingId, setLinks, onLinksReordered]
  );

  /* ─────────── Render ─────────── */
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative flex flex-col gap-6">
        {/* Efecto de sombra degradada radial */}
        <div className="absolute -inset-24 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>
        
        <AnimatePresence>
          {containers.map((c, idx) => {
            return (
              <motion.div
                key={`section-${c.id}`}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.3
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: -20, 
                  scale: 0.95,
                  transition: {
                    duration: 0.2,
                    ease: "easeInOut"
                  }
                }}
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.4
                  }
                }}
                style={{ position: 'relative' }}
              >
                <MultiSectionsContainer
                  containerId={c.id}
                  items={c.items}
                  links={links}
                  sections={sections}
                  moveSectionUp={(id) => moveSection("up", id)}
                  moveSectionDown={(id) => moveSection("down", id)}
                  idx={idx}
                  total={containers.length}
                  onUpdateLink={onUpdateLink}
                  onDeleteLink={onDeleteLink}
                  onCreateLinkInSection={createLinkInSection}
                  onUpdateSection={onUpdateSection}
                  onDeleteSection={onDeleteSection}
                  reorderLinksInContainer={reorderLinks}
                  onMoveToSection={handleMoveToSection}
                  transitioningLinks={transitioningLinks}
                  activeId={activeId}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Botón para crear nueva sección - siempre al final */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <motion.button
            onClick={onCreateSection}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-5 h-5"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </motion.svg>
            {t('newSection')}
          </motion.button>
        </motion.div>
      </div>
    </DndContext>
  );
}
