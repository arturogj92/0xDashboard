"use client";

import {useEffect, useState} from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    rectIntersection,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {arrayMove, SortableContext, verticalListSortingStrategy,} from "@dnd-kit/sortable";
import {LinkData, SectionData} from "./types";
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
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        // no-section
        const noSectionItems = links
            .filter((l) => l.section_id === null)
            .sort((a, b) => a.position - b.position)
            .map((l) => l.id);

        // secciones
        const sortedSecs = [...sections].sort((a, b) => a.position - b.position);
        const sectionContainers = sortedSecs.map((sec) => {
            const secItems = links
                .filter((l) => l.section_id === sec.id)
                .sort((a, b) => a.position - b.position)
                .map((l) => l.id);
            return { id: sec.id, items: secItems };
        });

        setContainers([...sectionContainers, {id: "no-section", items: noSectionItems}]);
    }, [links, sections]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

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
        try {
            const res = await fetch(`${API_URL}/api/links?landingId=${landingId}`, {
                method: "POST",
                headers: createAuthHeaders(),
                body: JSON.stringify(dummyLink),
            });
            const data = await res.json();
            if (res.ok) {
                setLinks((prev) => [...prev, data]);
                onLinksReordered?.(); // Refresh
            } else {
                console.error("Error creando link:", data.error);
            }
        } catch (error) {
            console.error("Error creando link:", error);
        }
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
        setShowOverlay(false);
    }

    function handleDragOver(event: DragOverEvent) {
        const {active, over} = event;
        if (!over) return;

        const activeContainer = containers.find((c) => c.items.includes(active.id as string));
        const overContainer =
            containers.find((c) => c.items.includes(over.id as string)) ||
            containers.find((c) => c.id === (over.id as string));

        if (!activeContainer || !overContainer) {
            setShowOverlay(false);
            return;
        }
        setShowOverlay(activeContainer.id !== overContainer.id);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        setShowOverlay(false);
        if (!over) return;

        const activeContainer = containers.find((c) => c.items.includes(active.id as string));
        const overContainer =
            containers.find((c) => c.items.includes(over.id as string)) ||
            containers.find((c) => c.id === (over.id as string));

        if (!activeContainer || !overContainer) return;
        if (activeContainer.id === overContainer.id && active.id === over.id) {
            return;
        }

        const newContainers = structuredClone(containers);
        const fromIndex = newContainers.findIndex((c) => c.id === activeContainer.id);
        const toIndex = newContainers.findIndex((c) => c.id === overContainer.id);

        const fromItems = newContainers[fromIndex].items;
        const toItems = newContainers[toIndex].items;

        const oldIndex = fromItems.indexOf(active.id as string);
        let newIndex = toItems.indexOf(over.id as string);
        if (newIndex === -1) {
            newIndex = toItems.length;
        }

        if (activeContainer.id === overContainer.id) {
            // reorder in same container
            const reordered = arrayMove(fromItems, oldIndex, newIndex);
            newContainers[fromIndex].items = reordered;
            reorderLinksInContainer(reordered);
        } else {
            // move to another container
            fromItems.splice(oldIndex, 1);
            toItems.splice(newIndex, 0, active.id as string);
            updateLinkContainer(active.id as string, overContainer.id);
            reorderLinksInContainer(toItems);
            reorderLinksInContainer(fromItems);
        }
        setContainers(newContainers);
        onLinksReordered?.(); // Refresh
    }

    async function updateLinkContainer(linkId: string, containerId: string) {
        const newSectionId = containerId === "no-section" ? null : containerId;
        setLinks((prev) => {
            const newLinks = structuredClone(prev);
            const link = newLinks.find((l) => l.id === linkId);
            if (link) {
                link.section_id = newSectionId;
            }
            return newLinks;
        });
        await fetch(`${API_URL}/api/links?landingId=${landingId}`, {
            method: "PATCH",
            headers: createAuthHeaders(),
            body: JSON.stringify({id: linkId, section_id: newSectionId}),
        });
    }

    async function reorderLinksInContainer(itemIds: string[]) {
        setLinks((prev) => {
            const newLinks = structuredClone(prev);
            itemIds.forEach((id, idx) => {
                const link = newLinks.find((l) => l.id === id);
                if (link) {
                    link.position = idx;
                }
            });
            return newLinks;
        });

        const updates = itemIds.map((id, idx) => ({ id, position: idx }));
        await fetch(`${API_URL}/api/links?landingId=${landingId}`, {
            method: "PATCH",
            headers: createAuthHeaders(),
            body: JSON.stringify(updates),
        });
    }

    function moveSectionUp(sectionId: string) {
        setSections((prev) => {
            const idx = prev.findIndex((s) => s.id === sectionId);
            if (idx <= 0) return prev;
            const newArr = [...prev];
            [newArr[idx], newArr[idx - 1]] = [newArr[idx - 1], newArr[idx]];
            newArr.forEach((sec, i) => {
                sec.position = i;
            });
            patchSections(newArr);
            onLinksReordered?.(); // Refresh
            return newArr;
        });
    }

    function moveSectionDown(sectionId: string) {
        setSections((prev) => {
            const idx = prev.findIndex((s) => s.id === sectionId);
            if (idx < 0 || idx >= prev.length - 1) return prev;
            const newArr = [...prev];
            [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
            newArr.forEach((sec, i) => {
                sec.position = i;
            });
            patchSections(newArr);
            onLinksReordered?.(); // Refresh
            return newArr;
        });
    }

    async function patchSections(finalArr: SectionData[]) {
        const body = finalArr.map((sec) => ({
            id: sec.id,
            position: sec.position,
        }));
        await fetch(`${API_URL}/api/sections?landingId=${landingId}`, {
            method: "PATCH",
            headers: createAuthHeaders(),
            body: JSON.stringify(body),
        });
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={containers.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-6">
                    {containers.map((container, idx) => (
                        <MultiSectionsContainer
                            key={container.id}
                            containerId={container.id}
                            items={container.items}
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
                        />
                    ))}
                    {/* Botón crear sección */}
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={async () => {
                                const dummySection = {
                                    title: "Sección Nueva",
                                    position: sections.length,
                                };
                                try {
                                    const res = await fetch(`${API_URL}/api/sections?landingId=${landingId}`, {
                                        method: "POST",
                                        headers: createAuthHeaders(),
                                        body: JSON.stringify(dummySection),
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        setSections((prev) => [...prev, data]);
                                        onLinksReordered?.(); // Refresh
                                    } else {
                                        console.error("Error creando sección:", data.error);
                                    }
                                } catch (error) {
                                    console.error("Error creando sección:", error);
                                }
                            }}
                            className="border border-white bg-black text-white px-4 py-2 rounded flex flex-col items-center"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                            </svg>
                            <span className="mt-1 text-sm">Nueva Sección</span>
                        </button>
                    </div>
                </div>
            </SortableContext>

            <DragOverlay dropAnimation={null}>
                {showOverlay && activeId ? (
                    <OverlayItem link={links.find((l) => l.id === activeId)!}/>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function OverlayItem({link}: { link: LinkData }) {
    return (
        <div className="cursor-grab text-sm text-gray-300 bg-gray-700 rounded px-2 p-2">
            <div className="font-semibold">{link.title}</div>
            <div className="text-xs text-gray-400">{link.url}</div>
        </div>
    );
}
