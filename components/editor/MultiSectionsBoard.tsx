"use client";

import { useMemo, useCallback } from "react";
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

  /* ─────────── Mover link a OTRA sección ─────────── */
  const handleDrop = useCallback(
    async (id: string, newSectionId: string, pos: number) => {
      setLinks((prev) => {
        const nl = structuredClone(prev);
        const link = nl.find((l) => l.id === id)!;

        const oldSectionId = link.section_id ?? "no-section";
        const targetId = newSectionId === "no-section" ? null : newSectionId;

        // asignar nueva sección
        link.section_id = targetId;

        /* ── Reindex origen ── */
        nl
          .filter(
            (l) => (l.section_id ?? "no-section") === oldSectionId && l.id !== id
          )
          .sort((a, b) => a.position - b.position)
          .forEach((l, i) => {
            l.position = i;
          });

        /* ── Reindex destino con inserción en posición pos ── */
        const destWithout = nl
          .filter((l) => (l.section_id ?? "no-section") === newSectionId && l.id !== id)
          .sort((a, b) => a.position - b.position);
        const destItems: typeof destWithout = [];
        for (let i = 0; i < destWithout.length + 1; i++) {
          if (i < pos) destItems.push(destWithout[i]);
          else if (i === pos) destItems.push(link);
          else destItems.push(destWithout[i - 1]);
        }
        destItems.forEach((l, i) => (l.position = i));

        return nl;
      });

      await fetch(`${API_URL}/api/links?landingId=${landingId}`, {
        method: "PATCH",
        headers: createAuthHeaders(),
        body: JSON.stringify({
          id,
          section_id: newSectionId === "no-section" ? null : newSectionId,
          position: pos,
        }),
      });

      //reorder
      onLinksReordered?.();
      /* 👉 NO hace falta forzar rebuild: containers viene de useMemo y recibirá el nuevo `links` en el próximo render */
    },
    [landingId, setLinks, onLinksReordered]
  );

  /* ─────────── Mover secciones arriba / abajo ─────────── */
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
    [setSections, onLinksReordered]
  );

  async function patchSections(arr: SectionData[]) {
    await fetch(`${API_URL}/api/sections?landingId=${landingId}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(arr.map((s) => ({ id: s.id, position: s.position }))),
    });
  }

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
    <div className="flex flex-col gap-6">
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
              onDropLink={handleDrop}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
