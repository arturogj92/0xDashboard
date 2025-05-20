"use client";

import {useEffect, useState} from "react";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {arrayMove, SortableContext, verticalListSortingStrategy,} from "@dnd-kit/sortable";
import {SocialLinkData} from "./types";
import {SortableSocialItem} from "./SortableSocialItem";
import { API_URL, createAuthHeaders } from "@/lib/api";

const SUPPORTED_SOCIALS: SocialLinkData["name"][] = [
    "youtube",
    "instagram",
    "tiktok",
    "twitter",
    "linkedin",
    "github",
];

const initialPlaceholders: SocialLinkData[] = SUPPORTED_SOCIALS.map((name, idx) => ({
    id: name,
    name,
    url: "",
    visible: false,
    position: idx,
}));

interface SocialLinksPanelProps {
    landingId: string;
    /** Called when a social link is reordered (optional) */
    onReorder?: () => void;
}

export default function SocialLinksPanel({landingId, onReorder}: SocialLinksPanelProps) {
    const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>(initialPlaceholders);

    useEffect(() => {
        fetch(`${API_URL}/api/social-links?landingId=${landingId}`, {
            headers: createAuthHeaders(),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Social links received:", data);
                const apiLinks: SocialLinkData[] = Array.isArray(data) ? data : [];
                // Fusionar con lista fija para asegurar que exista cada red social
                const merged: SocialLinkData[] = SUPPORTED_SOCIALS.map((name, idx) => {
                    const found = apiLinks.find((s) => s.name === name);
                    if (found) return found;
                    const maxPos = apiLinks.reduce((m, l) => Math.max(m, l.position ?? 0), -1);
                    return {
                        id: name,
                        name,
                        url: "",
                        visible: false,
                        position: maxPos + idx + 1,
                    };
                });
                setSocialLinks(merged.sort((a,b)=>a.position-b.position));
            })
            .catch((err) => console.error("Error fetching social links:", err));
    }, [landingId]);

    async function handleUpdate(id: string, updates: Partial<SocialLinkData>) {
        try {
            console.log("Updating social link:", id, updates);
            console.log("Auth headers:", createAuthHeaders());
            
            const res = await fetch(`${API_URL}/api/social-links?landingId=${landingId}`, {
                method: "PATCH",
                headers: {
                    ...createAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, ...updates }),
            });
            
            if (!res.ok) {
                console.error("Error response:", res.status, res.statusText);
                const text = await res.text();
                console.error("Error body:", text);
                return;
            }
            
            const data = await res.json();
            console.log("Social link updated:", data);
            
            setSocialLinks((prev) =>
                prev.map((s) => (s.id === id ? { ...s, ...data } : s))
            );
        } catch (error) {
            console.error("Error updating social link:", error);
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Configuraciones para mejorar la sensibilidad y fluidez
            activationConstraint: {
                // El puntero debe moverse 4px antes de activar el drag (valor más bajo para mayor sensibilidad)
                distance: 4,
                // Añadir delay para prevenir activaciones accidentales
                delay: 50,
                // Tolerar pequeños movimientos no intencionales
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = socialLinks.findIndex((s) => s.id === active.id);
        const newIndex = socialLinks.findIndex((s) => s.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const newOrder = arrayMove(socialLinks, oldIndex, newIndex);
        const payload = newOrder.map((item, idx) => ({ id: item.id, position: idx }));
        // Optimistic update
        setSocialLinks(newOrder.map((s, idx)=>({...s, position: idx})));
        try {
            const res = await fetch(`${API_URL}/api/social-links?landingId=${landingId}`, {
                method: "PATCH",
                headers: {
                    ...createAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });
            if(!res.ok){
                console.error('Reorder failed', res.status);
            }
        } catch(err){
            console.error('Error reordering social links:', err);
        }
        onReorder?.();
    }

    return (
        <div className="border p-4 my-8 border-blue-900 border-dashed">
            <h2 className="text-lg font-semibold">Social Accounts </h2>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                // Habilitar scroll automático durante el arrastre
                autoScroll={true}
            >
                <SortableContext
                    items={socialLinks.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2" style={{ position: 'relative' }}>
                        {socialLinks.map((item) => (
                            <SortableSocialItem
                                key={item.id}
                                id={item.id}
                                data={item}
                                onToggleVisibility={(visible) =>
                                    handleUpdate(item.id, {visible})
                                }
                                onUrlChange={(url) => handleUpdate(item.id, {url})}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
