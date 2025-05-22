"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkData, SectionData } from "./types";
import MultiSectionsContainer from "./MultiSectionsContainer";
import { API_URL, createAuthHeaders } from "@/lib/api";

interface MultiSectionsBoardProps {
  landingId: string;
  links: LinkData[];
  setLinks: React.Dispatch<React.SetStateAction<LinkData[]>>;
  sections: SectionData[];
  setSections: React.Dispatch<React.SetStateAction<SectionData[]>>;
  onUpdateLink: (id: string, updates: Partial<LinkData>) => void;
  onDeleteLink: (id: string) => void;
  onUpdateSection: (id: string, updates: Partial<SectionData>) => void;
  onDeleteSection: (id: string) => void;
  onLinksReordered?: () => void;
}

export default function MultiSectionsBoard({
  links,
  setLinks,
  sections,
  setSections,
  onUpdateLink,
  onDeleteLink,
  onUpdateSection,
  onDeleteSection,
  onLinksReordered,
  landingId,
}: MultiSectionsBoardProps) {
  const [containers, setContainers] = useState<{ id: string; items: string[] }[]>([]);

  useEffect(() => {
    const noSectionItems = links.filter((l) => l.section_id === null).sort((a, b) => a.position - b.position).map((l) => l.id);
    const sortedSecs = [...sections].sort((a, b) => a.position - b.position);
    const sectionContainers = sortedSecs.map((sec) => ({
      id: sec.id,
      items: links.filter((l) => l.section_id === sec.id).sort((a, b) => a.position - b.position).map((l) => l.id),
    }));
    setContainers([{ id: "no-section", items: noSectionItems }, ...sectionContainers]);
  }, [links, sections]);

  async function createLinkInSection(sectionId: string) {
    const container = containers.find((c) => c.id === sectionId);
    const newPos = container ? container.items.length : 0;
    const dummyLink = {
      title: "Nuevo Enlace",
      url: "",
      image: "",
      visible: true,
      position: newPos,
      section_id: sectionId === "no-section" ? null : sectionId,
    };
    const res = await fetch(`${API_URL}/api/links?landingId=${landingId}`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(dummyLink),
    });
    const data = await res.json();
    if (res.ok) { setLinks((prev) => [...prev, data]); onLinksReordered?.(); } else { console.error("Err creando link:", data.error); }
  }

  async function reorderLinksInContainer(itemIds: string[]) {
    setLinks((prev) => {
      const newLinks = structuredClone(prev);
      itemIds.forEach((id, idx) => {
        const l = newLinks.find((lnk) => lnk.id === id);
        if (l) l.position = idx;
      });
      return newLinks;
    });
    const updates = itemIds.map((id, idx) => ({ id, position: idx }));
    await fetch(`${API_URL}/api/links?landingId=${landingId}`, { method: "PATCH", headers: createAuthHeaders(), body: JSON.stringify(updates) });
  }

  function moveSectionUp(sectionId: string) {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sectionId);
      if (idx <= 0) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
      arr.forEach((s, i) => (s.position = i));
      patchSections(arr); onLinksReordered?.(); return arr;
    });
  }
  function moveSectionDown(sectionId: string) {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sectionId);
      if (idx >= prev.length - 1 || idx < 0) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      arr.forEach((s, i) => (s.position = i));
      patchSections(arr); onLinksReordered?.(); return arr;
    });
  }
  async function patchSections(arr: SectionData[]) {
    await fetch(`${API_URL}/api/sections?landingId=${landingId}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(arr.map((s) => ({ id: s.id, position: s.position }))),
    });
  }

  async function handleItemDrop(id: string, newSectionId: string) {
    const prevLinks = structuredClone(links);
    const item = prevLinks.find((l) => l.id === id);
    if (!item) return;
    const oldSectionId = item.section_id ?? "no-section";
    const oldPosition = item.position;
    const destItems = prevLinks.filter(
      (l) => (l.section_id ?? "no-section") === newSectionId && l.id !== id
    );
    const newPosition = destItems.length;
    item.section_id = newSectionId === "no-section" ? null : newSectionId;
    item.position = newPosition;
    prevLinks
      .filter((l) => (l.section_id ?? "no-section") === oldSectionId && l.id !== id)
      .forEach((l) => {
        if (l.position > oldPosition) l.position--;
      });
    prevLinks
      .filter((l) => (l.section_id ?? "no-section") === newSectionId && l.id !== id)
      .forEach((l) => {
        if (l.position >= newPosition) l.position++;
      });
    setLinks(prevLinks);
    onLinksReordered?.();
    const updates = prevLinks
      .filter(
        (l) =>
          l.id === id ||
          (l.section_id ?? "no-section") === oldSectionId ||
          (l.section_id ?? "no-section") === newSectionId
      )
      .map((l) => ({
        id: l.id,
        position: l.position,
        section_id: l.section_id,
      }));
    await fetch(`${API_URL}/api/links?landingId=${landingId}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(updates),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence initial={false} mode="popLayout">
        {containers.map((c, idx) => (
          <motion.div key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            <MultiSectionsContainer
              containerId={c.id}
              items={c.items}
              links={links}
              sections={sections}
              moveSectionUp={moveSectionUp}
              moveSectionDown={moveSectionDown}
              idx={idx}
              total={containers.length}
              onUpdateLink={onUpdateLink}
              onDeleteLink={onDeleteLink}
              onCreateLinkInSection={createLinkInSection}
              onUpdateSection={onUpdateSection}
              onDeleteSection={onDeleteSection}
              reorderLinksInContainer={reorderLinksInContainer}
              onDropLink={handleItemDrop}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex justify-center mt-8">
        <button
          onClick={async () => {
            const dummy = { title: "Sección Nueva", position: sections.length };
            const res = await fetch(`${API_URL}/api/sections?landingId=${landingId}`, { method: "POST", headers: createAuthHeaders(), body: JSON.stringify(dummy) });
            const data = await res.json();
            if (res.ok) { setSections((p) => [...p, data]); onLinksReordered?.(); } else { console.error("Err creando sección:", data.error); }
          }}
          className="border border-white bg-black text-white px-4 py-2 rounded flex flex-col items-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="mt-1 text-sm">Nueva Sección</span>
        </button>
      </div>
    </div>
  );
}
