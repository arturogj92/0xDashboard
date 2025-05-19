"use client";

import {CSS} from "@dnd-kit/utilities";
import {useSortable} from "@dnd-kit/sortable";
import React, {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Toggle} from "@/components/ui/toggle";
import {LinkData} from "./types";

// shadcn/ui + Recharts
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";

// Interfaz de los datos diarios
interface DailyStat {
    date: string;
    count: number;
    countries: Record<string, number>;
}

// Interfaz para la respuesta de stats
interface StatsData {
    selected: number;
    global: number;
    variation: number;
    dailyStats: DailyStat[];
    byCountry: Record<string, number>;
}

// Interfaz para el payload del tooltip Recharts
interface TooltipItem {
    name: string;
    value: number;
    color: string;
    payload: {
        date: string;
        count: number;
        countries: Record<string, number>;
    };
}

function HandleIcon() {
    return (
        <svg
            width="16"
            height="16px"
            viewBox="0 0 25 25"
            fill="none"
            stroke="white"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.5 8C10.3284 8 11 7.32843 11 6.5C11 5.67157 10.3284 5 9.5 5C8.67157 5 8 5.67157 8 6.5C8 7.32843 8.67157 8 9.5 8ZM9.5 14C10.3284 14 11 13.3284 11 12.5C11 11.67157 10.3284 11 9.5 11C8.67157 11 8 11.67157 8 12.5C8 13.3284 8.67157 14 9.5 14ZM11 18.5C11 19.3284 10.3284 20 9.5 20C8.67157 20 8 19.3284 8 18.5C8 17.67157 8.67157 17 9.5 17C10.3284 17 11 17.67157 11 18.5ZM15.5 8C16.3284 8 17 7.32843 17 6.5C17 5.67157 16.3284 5 15.5 5C14.6716 5 14 5.67157 14 6.5C14 7.32843 14.6716 8 15.5 8ZM17 12.5C17 13.3284 16.3284 14 15.5 14C14.6716 14 14 13.3284 14 12.5C14 11.67157 14.6716 11 15.5 11C16.3284 11 17 11.67157 17 12.5ZM15.5 20C16.3284 20 17 19.3284 17 18.5C17 17.67157 16.3284 17 15.5 17C14.6716 17 14 17.67157 14 18.5C14 19.3284 14.6716 20 15.5 20Z"
                fill="#121923"
            />
        </svg>
    );
}

function StatsIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
        >
            <path
                d="M12 9a1 1 0 0 1-1-1V3c0-.552.45-1.007.997-.93a7.004 7.004 0 0 1 5.933 5.933c.078.547-.378.997-.93.997h-5Z"/>
            <path
                d="M8.003 4.07C8.55 3.994 9 4.449 9 5v5a1 1 0 0 0 1 1h5c.552 0 1.008.45.93.997A7.001 7.001 0 0 1 2 11a7.002 7.002 0 0 1 6.003-6.93Z"/>
        </svg>
    );
}

function EyeIcon() {
    return (
        <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223C5.75 5.546 8.473
           3.75 12 3.75s6.25 1.796 8.02
           4.473a12.082 12.082 0 0
           1 1.845 3.152.75.75 0
           0 1 0 .75c-.47 1.016-1.1
           1.996-1.845 3.152C18.25
           18.454 15.527 20.25 12
           20.25s-6.25-1.796-8.02-4.473a12.082
           12.082 0 0 1-1.845-3.152.75.75
           0 0 1 0-.75 12.082 12.082 0
           0 1 1.845-3.152z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1
           1-6 0 3 3 0 0 1 6 0z"
            />
        </svg>
    );
}

function EyeSlashIcon() {
    return (
        <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223C5.75 5.546
           8.473 3.75 12 3.75c1.467
           0 2.84.254 4.084.718M20.02
           8.223c.745 1.156 1.375
           2.136 1.845 3.152a.75.75
           0 0 1 0 .75 12.082 12.082
           0 0 1-1.845 3.152c-1.77
           2.677-4.493 4.473-8.02
           4.473-1.45 0-2.82-.25-4.06-.708
           M9.53 9.53l4.94 4.94
           M9.53 14.47l4.94-4.94"
            />
        </svg>
    );
}

function TitleIcon() {
    return (
        <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 8.25h15M4.5 12h9m-9
           3.75h15"
            />
        </svg>
    );
}

function LinkIcon() {
    return (
        <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6.75h3.75a2.25
           2.25 0 0 1 2.25 2.25v6a2.25
           2.25 0 0 1-2.25 2.25H13.5m-3
           0H6.75a2.25 2.25 0 0
           1-2.25-2.25v-6a2.25 2.25
           0 0 1 2.25-2.25H10.5"
            />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788
           0L9.26 9m9.968-3.21c.342.052.682.107
           1.022.166m-1.022-.165L18.16
           19.673A2.25 2.25 0 0 1
           15.916 21H8.084a2.25 2.25 0 0 1
           -2.244-2.077L4.772 5.79m14.456
           0a48.108 48.108 0 0 0-3.478-.397M4.75
           5.75h14.5"
            />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
        </svg>
    );
}

// Banderas (por si necesitas más)
const countryFlags: Record<string, string> = {
    US: "🇺🇸",
    RU: "🇷🇺",
    ES: "🇪🇸",
    MX: "🇲🇽",
    PL: "🇵🇱",
    KR: "🇰🇷",
    VN: "🇻🇳",
    IE: "🇮🇪",
    AR: "🇦🇷",
    TW: "🇹🇼",
    FR: "🇫🇷",
    DK: "🇩🇰",
    CO: "🇨🇴",
    VE: "🇻🇪",
    PE: "🇵🇪",
    SE: "🇸🇪",
    PT: "🇵🇹",
    IT: "🇮🇹",
    SG: "🇸🇬",
    RO: "🇷🇴",
    BO: "🇧🇴",
};

// Helper para extraer el nombre de archivo
function getFileNameFromUrl(url: string): string | null {
    try {
        const parts = url.split("/");
        return parts[parts.length - 1];
    } catch {
        return null;
    }
}

// Tooltip Recharts con tipado
function CustomTooltip({
                           active,
                           payload,
                           label,
                       }: {
    active?: boolean;
    label?: string;
    payload?: TooltipItem[];
}) {
    if (active && payload && payload.length) {
        const dateObj = new Date(label || "");
        const dateStr = dateObj.toLocaleDateString("es-ES", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        return (
            <div
                style={{
                    backgroundColor: "black",
                    padding: "6px 8px",
                    borderRadius: "4px",
                    color: "white",
                    fontSize: "0.8rem",
                }}
            >
                <p className="mb-1">{dateStr}</p>
                <div className="flex items-center gap-2">
                    {/* Cuadro color */}
                    <span
                        style={{
                            backgroundColor: "hsl(var(--chart-1))",
                            width: "8px",
                            height: "8px",
                            display: "inline-block",
                        }}
                    />
                    <span>Page Views: {payload[0].value}</span>
                </div>
            </div>
        );
    }
    return null;
}

interface MultiSectionsItemProps {
    link: LinkData;
    onUpdateLink: (id: string, updates: Partial<LinkData>) => void;
    onDeleteLink: (id: string) => void;
}

export default function MultiSectionsItem({
                                              link,
                                              onUpdateLink,
                                              onDeleteLink,
                                          }: MultiSectionsItemProps) {
    const {
        setNodeRef,
        setActivatorNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({id: link.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDragging ? "rgba(128,90,213,0.3)" : "transparent",
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [title, setTitle] = useState(link.title);
    const [url, setUrl] = useState(link.url);
    const [image, setImage] = useState(link.image ?? "");

    // Nuevo: url_link_id para stats
    const [urlLinkId, setUrlLinkId] = useState<number | null>(link.url_link_id ?? null);

    const [stats7, setStats7] = useState<StatsData | null>(null);
    const [stats28, setStats28] = useState<StatsData | null>(null);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [statsError, setStatsError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Bloquear scroll al abrir modal
    useEffect(() => {
        if (statsModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [statsModalOpen]);

    function handleTitleChange(val: string) {
        setTitle(val);
        onUpdateLink(link.id, {title: val});
    }

    function handleUrlChange(val: string) {
        setUrl(val);
        onUpdateLink(link.id, {url: val});
    }

    // Actualizar url_link_id
    function handleLinkIdChange(val: string) {
        const parsed = parseInt(val, 10);
        // Si está vacío o no es número => null
        const newId = Number.isNaN(parsed) ? null : parsed;
        setUrlLinkId(newId);
        onUpdateLink(link.id, {url_link_id: newId});
    }

    function toggleVisible(pressed: boolean) {
        onUpdateLink(link.id, {visible: pressed});
    }

    // Subir imagen
    async function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async () => {
            const fullBase64 = reader.result as string;
            const splitted = fullBase64.split(",");
            const pureBase64 = splitted[1];

            try {
                const res = await fetch("/api/images", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({base64: pureBase64}),
                });
                const data = await res.json();
                if (!res.ok) {
                    console.error("Error al subir imagen:", data.error);
                    return;
                }
                setImage(data.url);
                onUpdateLink(link.id, {image: data.url});
            } catch (error) {
                console.error("Error al subir imagen:", error);
            }
        };
        reader.readAsDataURL(file);
    }

    function handleUploadClick() {
        fileInputRef.current?.click();
    }

    async function handleRemoveImage() {
        if (image) {
            const fileName = getFileNameFromUrl(image);
            if (fileName) {
                try {
                    const res = await fetch(`/api/images?fileName=${fileName}`, {
                        method: "DELETE",
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        console.error("Error al borrar imagen del servidor:", data.error);
                    }
                } catch (error) {
                    console.error("Error al borrar imagen:", error);
                }
            }
        }
        setImage("");
        onUpdateLink(link.id, {image: ""});
    }

    function handleDeleteClick() {
        setShowDeleteModal(true);
    }

    function confirmDelete() {
        setShowDeleteModal(false);
        onDeleteLink(link.id);
    }

    function cancelDelete() {
        setShowDeleteModal(false);
    }

    // Llamadas a stats
    async function handleShowStats() {
        if (!urlLinkId) {
            setStatsError("Este link no tiene url_link_id asignado");
            setStats7(null);
            setStats28(null);
            setStatsModalOpen(true);
            return;
        }
        setStatsError(null);
        setStats7(null);
        setStats28(null);
        setLoadingStats(true);
        setStatsModalOpen(true);

        try {
            // 7d
            const res7 = await fetch(
                `https://www.art0x.link/api/url/visitStats?url_id=${urlLinkId}&range=7d`,
                {
                    method: "GET",
                    headers: {"Content-Type": "application/json"},
                }
            );
            if (!res7.ok) {
                const errJson = await res7.json();
                throw new Error(errJson?.message || "Error al obtener stats (7d)");
            }
            const data7 = await res7.json();
            setStats7(data7.stats);

            // 28d
            const res28 = await fetch(
                `https://www.art0x.link/api/url/visitStats?url_id=${urlLinkId}&range=28d`,
                {
                    method: "GET",
                    headers: {"Content-Type": "application/json"},
                }
            );
            if (!res28.ok) {
                const errJson = await res28.json();
                throw new Error(errJson?.message || "Error al obtener stats (28d)");
            }
            const data28 = await res28.json();
            setStats28(data28.stats);
        } catch (err: unknown) {
            const errorObj = err instanceof Error ? err : new Error("Unknown error");
            setStatsError(errorObj.message);
        } finally {
            setLoadingStats(false);
        }
    }

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        // Cerrar modal al hacer click fuera del Card
        if (e.target === e.currentTarget) {
            setStatsModalOpen(false);
        }
    }

    return (
        <li
            ref={setNodeRef}
            style={style}
            className="
        relative
        border border-gray-500
        p-4
        rounded-2xl
        bg-black
        text-white
        min-h-[5rem]
      "
        >
            {/* Drag handle => top-left */}
            <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className="
          absolute
          top-2
          left-2
          cursor-grab
          px-2
          text-sm
          text-white
          rounded
        "
            >
                <HandleIcon/>
            </div>

            {/* Botones => top-right */}
            <div className="absolute top-2 right-2 flex items-center gap-2">
                <Button
                    variant="destructive"
                    className="text-xs px-2 py-1 hover:bg-purple-900"
                    onClick={handleShowStats}
                >
                    <StatsIcon/>
                </Button>

                <Button
                    variant="destructive"
                    className="text-xs px-2 py-1 hover:bg-purple-900"
                    onClick={handleDeleteClick}
                >
                    <TrashIcon/>
                </Button>

                <Toggle
                    className="
            w-12 h-6
            flex items-center justify-center
            hover:bg-purple-900
          "
                    pressed={link.visible}
                    onPressedChange={toggleVisible}
                >
                    {link.visible ? <EyeIcon/> : <EyeSlashIcon/>}
                </Toggle>
            </div>

            {/* Contenido => Título + URL + Imagen + ID */}
            <div className="mt-5 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1">
                    {/* Título */}
                    <div className="relative">
            <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
              <TitleIcon/>
            </span>
                        <Input
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Título"
                            className="
                w-full text-sm
                pl-8 pr-2 py-1
                rounded-[100px]
                hover:bg-purple-950/40
                focus:bg-purple-950/40
                bg-black/50
                border-gray-400
                focus-visible:ring-0
              "
                        />
                    </div>

                    {/* Fila => URL + ID */}
                    <div className="flex items-center gap-2">
                        {/* URL con icon */}
                        <div className="relative w-full">
              <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                <LinkIcon/>
              </span>
                            <Input
                                value={url}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                placeholder="URL"
                                className="
                  w-full text-sm
                  pl-8 pr-2 py-1
                  rounded-[100px]
                  hover:bg-purple-950/40
                  focus:bg-purple-950/40
                  bg-black/50
                  border-gray-400
                  focus-visible:ring-0
                "
                            />
                        </div>

                        {/* ID */}
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-300">ID:</span>
                            <Input
                                type="number"
                                value={urlLinkId?.toString() || ""}
                                onChange={(e) => handleLinkIdChange(e.target.value)}
                                placeholder="LinkID"
                                className="
                  w-16 text-sm
                  rounded-[100px]
                  hover:bg-purple-950/40
                  focus:bg-purple-950/40
                  bg-black/50
                  border-gray-400
                  focus-visible:ring-0
                "
                            />
                        </div>
                    </div>
                </div>

                {/* Imagen */}
                <div className="relative w-20 h-20 flex-shrink-0">
                    {image ? (
                        <>
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="
                  absolute
                  top-1
                  right-1
                  bg-black/60
                  text-white
                  rounded-full
                  p-1
                  hover:bg-black/80
                "
                            >
                                <CloseIcon/>
                            </button>
                        </>
                    ) : (
                        <div
                            className="
                w-full
                h-full
                border-2 border-gray-400 border-dashed
                rounded-xl
                flex
                flex-col
                items-center
                justify-center
                text-xs
                text-gray-500
                gap-1
              "
                        >
                            <span>Sin imagen</span>
                            <button
                                onClick={handleUploadClick}
                                className="
                  text-[10px]
                  bg-white/10
                  px-2
                  py-1
                  rounded
                  hover:bg-white/20
                "
                            >
                                Subir
                            </button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleSelectFile}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Modal confirm delete link */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-black w-full max-w-sm mx-auto p-4 rounded shadow-lg">
                        <p className="mb-4">¿Seguro que deseas borrar este enlace?</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={cancelDelete}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Borrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de estadísticas */}
            {statsModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={handleOverlayClick}
                >
                    <Card
                        className="relative w-full max-w-screen-xl max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botón cerrar */}
                        <button
                            onClick={() => setStatsModalOpen(false)}
                            className="absolute top-2 right-2 text-black dark:text-white text-xl"
                        >
                            &times;
                        </button>

                        <CardHeader>
                            <CardTitle>Estadísticas</CardTitle>
                            <CardDescription>
                                Resumen de clics y países (7 y 28 días)
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {loadingStats ? (
                                <p className="text-sm text-gray-700 dark:text-gray-200">
                                    Cargando stats...
                                </p>
                            ) : statsError ? (
                                <p className="text-sm text-red-400">{statsError}</p>
                            ) : stats28 ? (
                                <>
                                    {/* Fila de 4 items con emojis */}
                                    <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
                                        {stats7 && (
                                            <p className="flex items-center gap-1">
                                                🔎 <strong>7d:</strong> {stats7.selected}
                                            </p>
                                        )}
                                        <p className="flex items-center gap-1">
                                            📅 <strong>28d:</strong> {stats28.selected}
                                        </p>
                                        <p className="flex items-center gap-1">
                                            🌍 <strong>Global:</strong> {stats28.global}
                                        </p>
                                        <p className="flex items-center gap-1">
                                            🚀 <strong>Var:</strong> {stats28.variation}%
                                        </p>
                                    </div>

                                    {/* Chart responsivo => 28 días */}
                                    <div className="w-full mb-4">
                                        <ResponsiveContainer width="100%" height={320}>
                                            <BarChart data={stats28.dailyStats}>
                                                <CartesianGrid stroke="none"/>
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(val) => {
                                                        const d = new Date(val);
                                                        return d.toLocaleDateString("es-ES", {
                                                            month: "short",
                                                            day: "numeric",
                                                        });
                                                    }}
                                                />
                                                <YAxis/>
                                                <RechartsTooltip
                                                    content={<CustomTooltip/>}
                                                    cursor={{fill: "gray", fillOpacity: 0.5}}
                                                />
                                                <Bar dataKey="count">
                                                    {/* Mapeamos para hover gris */}
                                                    {stats28.dailyStats.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="hsl(var(--chart-1))"
                                                            onMouseOver={(e) =>
                                                                e.currentTarget.setAttribute(
                                                                    "fill",
                                                                    "hsl(var(--chart-2))"
                                                                )
                                                            }
                                                            onMouseOut={(e) =>
                                                                e.currentTarget.setAttribute(
                                                                    "fill",
                                                                    "hsl(var(--chart-1))"
                                                                )
                                                            }
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* 4 columnas para países */}
                                    <div className="mt-4 text-sm">
                                        <p className="font-semibold mb-4">Visitas por país (28d):</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                            {Object.entries(stats28.byCountry)
                                                // Ordenamos por número de visitas (c) en orden descendente
                                                .sort(([, c1], [, c2]) => c2 - c1)
                                                .map(([country, c]) => (
                                                    <div key={country}>
                                                        {countryFlags[country] || "🏳️"} {country}: {c}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-200">No se han cargado datos.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </li>
    );
}
