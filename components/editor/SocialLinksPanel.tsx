"use client";

import {useEffect, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy,} from "@dnd-kit/sortable";
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
    /** Called when social links are updated (optional) */
    onUpdate?: (socialLinks: SocialLinkData[]) => void;
}

export default function SocialLinksPanel({landingId, onUpdate}: SocialLinksPanelProps) {
    const t = useTranslations('social');
    const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>(initialPlaceholders);
    const [isDragging, setIsDragging] = useState(false);

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
                // No llamar onUpdate aquí para evitar bucle infinito
                // El componente padre ya maneja su propia carga de datos
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

    function handleDragStart(event: DragStartEvent) {
        setIsDragging(true);
    }

    async function handleDragEnd(event: DragEndEvent) {
        setIsDragging(false);
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        
        const oldIndex = socialLinks.findIndex((s) => s.id === active.id);
        const newIndex = socialLinks.findIndex((s) => s.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        
        // Crear nueva lista reordenada manualmente para mejor control
        const newOrder = [...socialLinks];
        const [movedItem] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, movedItem);
        
        // Actualizar posiciones
        const updatedLinks = newOrder.map((s, idx) => ({ ...s, position: idx }));
        
        // Actualización optimista local
        setSocialLinks(updatedLinks);
        // Notificar al componente padre inmediatamente
        onUpdate?.(updatedLinks);
        
        // Actualizar en servidor sin callback adicional
        const payload = updatedLinks.map((item, idx) => ({ id: item.id, position: idx }));
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
                // Si falla, podrías revertir el estado aquí si es necesario
            }
        } catch(err){
            console.error('Error reordering social links:', err);
            // Si falla, podrías revertir el estado aquí si es necesario
        }
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
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                // Habilitar scroll automático durante el arrastre
                autoScroll={true}
            >
                <SortableContext
                    items={socialLinks.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2" style={{ position: 'relative' }}>
                        <AnimatePresence>
                            {socialLinks.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout={!isDragging}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ 
                                        opacity: 1, 
                                        y: 0, 
                                        scale: 1,
                                        transition: isDragging ? { duration: 0 } : {
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
                                        layout: isDragging ? { duration: 0 } : {
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 25,
                                            duration: 0.4
                                        }
                                    }}
                                >
                                    <SortableSocialItem
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
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
