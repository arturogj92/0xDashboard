"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import React, { useState, useEffect } from "react";
import { SocialLinkData } from "./types";
 // Cambiado de Toggle a Switch
import { Input } from "@/components/ui/input";
import { FaGithub, FaInstagram, FaLinkedin, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { Bars2Icon, EyeIcon as HeroEyeIcon, EyeSlashIcon as HeroEyeSlashIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline"; // Usar Heroicons para los ojos
import { Button } from "@/components/ui/button"; // Importar Button

function getSocialIcon(name: string) {
    switch (name) {
        case "instagram":
            return <FaInstagram className="text-2xl"/>;
        case "twitter":
            return <FaXTwitter className="text-2xl"/>;
        case "youtube":
            return <FaYoutube className="text-2xl"/>;
        case "tiktok":
            return <FaTiktok className="text-2xl"/>;
        case "github":
            return <FaGithub className="text-2xl"/>;
        case "linkedin":
            return <FaLinkedin className="text-2xl"/>;
        default:
            return null;
    }
}

// Interfaces actualizadas para coincidir con cómo se llama desde SocialLinksPanel
interface SortableSocialItemProps {
    id: string;
    data: SocialLinkData;
    onToggleVisibility: (visible: boolean) => void;
    onUrlChange: (url: string) => void;
    onMoveUp?: (id: string) => void;
    onMoveDown?: (id: string) => void;
    isFirst?: boolean;
    isLast?: boolean;
}

export function SortableSocialItem({id, data, onToggleVisibility, onUrlChange, onMoveUp, onMoveDown, isFirst = false, isLast = false}: SortableSocialItemProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        animateLayoutChanges: () => false, // Previene animaciones adicionales durante cambios de layout
    }); 

    // Estado local de URL editable
    const [draftUrl, setDraftUrl] = useState<string>(data.url);
    useEffect(() => { setDraftUrl(data.url); }, [data.url]);
    // Normalizar y validar URL (añade https si falta)
    const trimmedUrl = draftUrl.trim();
    const normalizedUrl = trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")
        ? trimmedUrl
        : `https://${trimmedUrl}`;
    const isValidUrl = trimmedUrl !== "" && (() => { try { new URL(normalizedUrl); return true; } catch { return false; } })();

    // Estilos específicos para el arrastre con mejor rendimiento
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        zIndex: isDragging ? 1000 : 1,
    };

    const SocialIcon = getSocialIcon(data.name);

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`list-none flex items-center gap-3 p-3 rounded-lg text-card-foreground
                        ${isDragging ? 'bg-muted ring-2 ring-primary shadow-md opacity-95' : 'hover:bg-muted/50'}`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
                aria-label="Arrastrar para reordenar"
            >
                <Bars2Icon className="h-5 w-5" />
            </div>

            {SocialIcon && <div className="text-xl text-muted-foreground">{SocialIcon}</div>}

            <div className="flex-1 relative flex items-center">
                <Input
                    value={draftUrl}
                    onChange={(e) => setDraftUrl(e.target.value)}
                    onBlur={() => { if (isValidUrl) onUrlChange(normalizedUrl); else if(draftUrl.trim() === "") onUrlChange(""); }}
                    onKeyDown={(e) => { 
                        if (e.key === 'Enter') { 
                            if (isValidUrl) onUrlChange(normalizedUrl); else if(draftUrl.trim() === "") onUrlChange("");
                        } 
                    }}
                    placeholder={`URL de ${data.name}`}
                    className="w-full pr-10"
                    aria-label={`URL para ${data.name}`}
                />
                {draftUrl.trim() !== "" && isValidUrl && (
                    <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" title="URL válida" />
                )}
            </div>

            {/* Botones de movimiento */}
            <div className="flex flex-col gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveUp?.(id)}
                    disabled={isFirst}
                    aria-label="Mover arriba"
                    className={`h-6 w-6 p-0 text-muted-foreground hover:text-foreground ${isFirst ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Mover arriba"
                >
                    <ChevronUpIcon className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveDown?.(id)}
                    disabled={isLast}
                    aria-label="Mover abajo"
                    className={`h-6 w-6 p-0 text-muted-foreground hover:text-foreground ${isLast ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Mover abajo"
                >
                    <ChevronDownIcon className="h-3 w-3" />
                </Button>
            </div>

            {/* Botón de Visibilidad */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleVisibility(!data.visible)}
                aria-label={data.visible ? "Ocultar enlace" : "Mostrar enlace"}
                className="text-muted-foreground hover:text-foreground"
            >
                {data.visible ? <HeroEyeIcon className="h-5 w-5" /> : <HeroEyeSlashIcon className="h-5 w-5" />}
            </Button>
        </li>
    );
}
