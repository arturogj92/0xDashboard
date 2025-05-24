"use client";

import { useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkData, SectionData } from "./types";
import MultiSectionsContainer from "./MultiSectionsContainer";
import { API_URL, createAuthHeaders } from "@/lib/api";

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
  onLinksReordered,
}: Props) {
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
    <div className="relative flex flex-col gap-6">
      {/* Efecto de sombra degradada radial */}
      <div className="absolute -inset-24 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>
      
      <AnimatePresence>
        {containers.map((c, idx) => (
          <motion.div
            key={c.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
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
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
