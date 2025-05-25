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
import { useTranslations } from 'next-intl';
import { ShareIcon } from '@heroicons/react/24/outline';

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
    /** Called when social links are updated (optional) */
    onUpdate?: (socialLinks: SocialLinkData[]) => void;
}

export default function SocialLinksPanel({landingId, onReorder, onUpdate}: SocialLinksPanelProps) {
    const t = useTranslations('social');
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
                const sortedLinks = merged.sort((a,b)=>a.position-b.position);
                setSocialLinks(sortedLinks);
                onUpdate?.(sortedLinks);
            })
            .catch((err) => console.error("Error fetching social links:", err));
    }, [landingId, onUpdate]);

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
            
            setSocialLinks((prev) => {
                const updatedSocialLinks = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
                // Notificar al componente padre de los cambios
                onUpdate?.(updatedSocialLinks);
                return updatedSocialLinks;
            });
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
        const updatedLinks = newOrder.map((s, idx)=>({...s, position: idx}));
        setSocialLinks(updatedLinks);
        onUpdate?.(updatedLinks);
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

    // Funciones para mover social links arriba/abajo
    async function moveSocialLinkUp(id: string) {
        const currentIndex = socialLinks.findIndex(s => s.id === id);
        if (currentIndex <= 0) return; // Ya está en la primera posición

        // Intercambiar posiciones
        const newLinks = [...socialLinks];
        [newLinks[currentIndex], newLinks[currentIndex - 1]] = [newLinks[currentIndex - 1], newLinks[currentIndex]];
        
        // Actualizar posiciones
        newLinks.forEach((link, index) => {
            link.position = index;
        });

        // Actualizar estado local
        setSocialLinks(newLinks);
        onUpdate?.(newLinks);

        // Actualizar en el servidor
        const payload = newLinks.map((item, idx) => ({ id: item.id, position: idx }));
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
                console.error('Move up failed', res.status);
            }
        } catch(err){
            console.error('Error moving social link up:', err);
        }
        onReorder?.();
    }

    async function moveSocialLinkDown(id: string) {
        const currentIndex = socialLinks.findIndex(s => s.id === id);
        if (currentIndex >= socialLinks.length - 1) return; // Ya está en la última posición

        // Intercambiar posiciones
        const newLinks = [...socialLinks];
        [newLinks[currentIndex], newLinks[currentIndex + 1]] = [newLinks[currentIndex + 1], newLinks[currentIndex]];
        
        // Actualizar posiciones
        newLinks.forEach((link, index) => {
            link.position = index;
        });

        // Actualizar estado local
        setSocialLinks(newLinks);
        onUpdate?.(newLinks);

        // Actualizar en el servidor
        const payload = newLinks.map((item, idx) => ({ id: item.id, position: idx }));
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
                console.error('Move down failed', res.status);
            }
        } catch(err){
            console.error('Error moving social link down:', err);
        }
        onReorder?.();
    }

    return (
        <div className="border border-indigo-900/30 p-4 my-8 border-dashed rounded-md bg-[#120724] hover:bg-indigo-950/20">
            <div className="text-center mb-4 w-full">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg">
                        <ShareIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">{t('title')}</h2>
                </div>
                <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                    {t('description')}
                </p>
            </div>
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
                        {socialLinks.map((item, index) => (
                            <SortableSocialItem
                                key={item.id}
                                id={item.id}
                                data={item}
                                onToggleVisibility={(visible) =>
                                    handleUpdate(item.id, {visible})
                                }
                                onUrlChange={(url) => handleUpdate(item.id, {url})}
                                onMoveUp={moveSocialLinkUp}
                                onMoveDown={moveSocialLinkDown}
                                isFirst={index === 0}
                                isLast={index === socialLinks.length - 1}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
