"use client";

import React, { useEffect, useRef, useState } from "react";
import { Reorder, PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { LinkData } from "./types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

/* ───────── ICONOS ───────── */
function HandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 25 25" fill="none" stroke="white">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 8c.828 0 1.5-.672 1.5-1.5S10.328 5 9.5 5 8 5.672 8 6.5 8.672 8 9.5 8Zm0 6c.828 0 1.5-.672 1.5-1.5S10.328 11 9.5 11 8 11.672 8 12.5 8.672 14 9.5 14Zm1.5 4.5c0 .828-.672 1.5-1.5 1.5S8 19.328 8 18.5 8.672 17 9.5 17s1.5.672 1.5 1.5ZM15.5 8c.828 0 1.5-.672 1.5-1.5S16.328 5 15.5 5 14 5.672 14 6.5s.672 1.5 1.5 1.5ZM17 12.5c0 .828-.672 1.5-1.5 1.5S14 13.328 14 12.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5Zm-1.5 7.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5S14 17.672 14 18.5s.672 1.5 1.5 1.5Z"
        fill="#121923"
      />
    </svg>
  );
}
function StatsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path d="M12 9a1 1 0 0 1-1-1V3c0-.552.45-1.007.997-.93a7.004 7.004 0 0 1 5.933 5.933c.078.547-.378.997-.93.997h-5Z" />
      <path d="M8.003 4.07C8.55 3.994 9 4.449 9 5v5a1 1 0 0 0 1 1h5c.552 0 1.008.45.93.997A7.001 7.001 0 0 1 2 11a7.002 7.002 0 0 1 6.003-6.93Z" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223C5.75 5.546 8.473 3.75 12 3.75s6.25 1.796 8.02 4.473a12.082 12.082 0 0 1 1.845 3.152.75.75 0 0 1 0 .75c-.47 1.016-1.1 1.996-1.845 3.152C18.25 18.454 15.527 20.25 12 20.25s-6.25-1.796-8.02-4.473a12.082 12.082 0 0 1-1.845-3.152.75.75 0 0 1 0-.75 12.082 12.082 0 0 1 1.845-3.152z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}
function EyeSlashIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223C5.75 5.546 8.473 3.75 12 3.75c1.467 0 2.84.254 4.084.718M20.02 8.223c.745 1.156 1.375 2.136 1.845 3.152a.75.75 0 0 1 0 .75 12.082 12.082 0 0 1-1.845 3.152c-1.77 2.677-4.493 4.473-8.02 4.473-1.45 0-2.82-.25-4.06-.708M9.53 9.53l4.94 4.94M9.53 14.47l4.94-4.94" />
    </svg>
  );
}
function TitleIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 8.25h15M4.5 12h9m-9 3.75h15" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.75h3.75a2.25 2.25 0 0 1 2.25 2.25v6a2.25 2.25 0 0 1-2.25 2.25H13.5m-3 0H6.75a2.25 2.25 0 0 1-2.25-2.25v-6a2.25 2.25 0 0 1 2.25-2.25H10.5" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1 -2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397M4.75 5.75h14.5" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

/* ───────── BANDERAS ───────── */
const countryFlags: Record<string, string> = {
  US: "🇺🇸", RU: "🇷🇺", ES: "🇪🇸", MX: "🇲🇽", PL: "🇵🇱", KR: "🇰🇷",
  VN: "🇻🇳", IE: "🇮🇪", AR: "🇦🇷", TW: "🇹🇼", FR: "🇫🇷", DK: "🇩🇰",
  CO: "🇨🇴", VE: "🇻🇪", PE: "🇵🇪", SE: "🇸🇪", PT: "🇵🇹", IT: "🇮🇹",
  SG: "🇸🇬", RO: "🇷🇴", BO: "🇧🇴",
};

/* ───────── TIPOS ───────── */
interface DailyStat {
  date: string;
  count: number;
  countries: Record<string, number>;
}
interface StatsData {
  selected: number;
  global: number;
  variation: number;
  dailyStats: DailyStat[];
  byCountry: Record<string, number>;
}
interface TooltipItem {
  name: string;
  value: number;
  color: string;
  payload: { date: string; count: number; countries: Record<string, number> };
}
interface MultiSectionsItemProps {
  link: LinkData;
  onUpdateLink: (id: string, updates: Partial<LinkData>) => void;
  onDeleteLink: (id: string) => void;
  onDropLink?: (id: string, newSectionId: string) => void;
}

/* ───────── HELPERS ───────── */
function getFileNameFromUrl(url: string): string | null {
  try { return url.split("/").pop() ?? null; } catch { return null; }
}
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
      <div style={{ backgroundColor: "black", padding: "6px 8px", borderRadius: 4, color: "white", fontSize: "0.8rem" }}>
        <p className="mb-1">{dateStr}</p>
        <div className="flex items-center gap-2">
          <span style={{ backgroundColor: "hsl(var(--chart-1))", width: 8, height: 8, display: "inline-block" }} />
          <span>Page Views: {payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
}

/* ───────── COMPONENTE ───────── */
export default function MultiSectionsItem({
  link,
  onUpdateLink,
  onDeleteLink,
  onDropLink,
}: MultiSectionsItemProps) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [image, setImage] = useState(link.image ?? "");
  const [urlLinkId, setUrlLinkId] = useState<number | null>(link.url_link_id ?? null);

  const [stats7, setStats7] = useState<StatsData | null>(null);
  const [stats28, setStats28] = useState<StatsData | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    document.body.style.overflow = statsModalOpen ? "hidden" : "";
  }, [statsModalOpen]);

  function handleTitleChange(val: string) {
    setTitle(val);
    onUpdateLink(link.id, { title: val });
  }
  function handleUrlChange(val: string) {
    setUrl(val);
    onUpdateLink(link.id, { url: val });
  }
  function handleLinkIdChange(val: string) {
    const p = parseInt(val, 10);
    const newId = Number.isNaN(p) ? null : p;
    setUrlLinkId(newId);
    onUpdateLink(link.id, { url_link_id: newId });
  }
  function toggleVisible(v: boolean) {
    onUpdateLink(link.id, { visible: v });
  }

  async function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const pureBase64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64: pureBase64 }),
        });
        const data = await res.json();
        if (!res.ok) return console.error("Error:", data.error);
        setImage(data.url);
        onUpdateLink(link.id, { image: data.url });
      } catch (err) {
        console.error("Upload err:", err);
      }
    };
    reader.readAsDataURL(file);
  }
  function handleUploadClick() { fileInputRef.current?.click(); }

  async function handleRemoveImage() {
    if (image) {
      const name = getFileNameFromUrl(image);
      if (name) {
        try {
          await fetch(`/api/images?fileName=${name}`, { method: "DELETE" });
        } catch (err) { console.error("Del err:", err); }
      }
    }
    setImage(""); onUpdateLink(link.id, { image: "" });
  }

  function confirmDelete() { setShowDeleteModal(false); onDeleteLink(link.id); }
  function cancelDelete() { setShowDeleteModal(false); }

  async function handleShowStats() {
    if (!urlLinkId) { setStatsError("Este link no tiene url_link_id"); setStatsModalOpen(true); return; }
    setLoadingStats(true); setStatsModalOpen(true); setStatsError(null);
    try {
      const d7 = await (await fetch(`https://www.art0x.link/api/url/visitStats?url_id=${urlLinkId}&range=7d`)).json();
      const d28 = await (await fetch(`https://www.art0x.link/api/url/visitStats?url_id=${urlLinkId}&range=28d`)).json();
      setStats7(d7.stats); setStats28(d28.stats);
    } catch (e) { setStatsError("Error al obtener stats"); }
    finally { setLoadingStats(false); }
  }

  return (
    <Reorder.Item
      value={link.id}
      as="li"
      layout
      className="list-none"
      whileDrag={{ zIndex: 50 }}
      onDrag={(event: MouseEvent | TouchEvent, info: PanInfo) => { dragPosRef.current = { x: info.point.x, y: info.point.y }; }}
      onDragEnd={() => {
        if (onDropLink) {
          const { x, y } = dragPosRef.current;
          const elements = document.elementsFromPoint(x, y) as HTMLElement[];
          const containerEl = elements.find((el) => el.hasAttribute('data-section-id')) ?? null;
          const newSectionId = containerEl?.getAttribute('data-section-id');
          if (newSectionId && newSectionId !== (link.section_id ?? 'no-section')) {
            onDropLink(link.id, newSectionId);
          }
        }
      }}
    >
      <div className="relative border border-gray-500 p-4 rounded-2xl bg-black text-white min-h-[5rem]">
        <div className="absolute top-2 left-2 px-2 text-sm text-white">
          <HandleIcon />
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-2">
          <Button variant="destructive" className="text-xs px-2 py-1 hover:bg-purple-900" onClick={handleShowStats}>
            <StatsIcon />
          </Button>
          <Button variant="destructive" className="text-xs px-2 py-1 hover:bg-purple-900" onClick={() => setShowDeleteModal(true)}>
            <TrashIcon />
          </Button>
          <Toggle className="w-12 h-6 flex items-center justify-center hover:bg-purple-900" pressed={link.visible} onPressedChange={toggleVisible}>
            {link.visible ? <EyeIcon /> : <EyeSlashIcon />}
          </Toggle>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none"><TitleIcon /></span>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Título"
                className="w-full text-sm pl-8 pr-2 py-1 rounded-[100px] hover:bg-purple-950/40 focus:bg-purple-950/40 bg-black/50 border-gray-400 focus-visible:ring-0" />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none"><LinkIcon /></span>
                <Input value={url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="URL"
                  className="w-full text-sm pl-8 pr-2 py-1 rounded-[100px] hover:bg-purple-950/40 focus:bg-purple-950/40 bg-black/50 border-gray-400 focus-visible:ring-0" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-300">ID:</span>
                <Input type="number" value={urlLinkId ?? ""} onChange={(e) => handleLinkIdChange(e.target.value)} placeholder="LinkID"
                  className="w-16 text-sm rounded-[100px] hover:bg-purple-950/40 focus:bg-purple-950/40 bg-black/50 border-gray-400 focus-visible:ring-0" />
              </div>
            </div>
          </div>

          <div className="relative w-20 h-20 flex-shrink-0">
            {image ? (
              <>
                <img src={image} alt={title} className="w-full h-full object-cover rounded-xl" />
                <button type="button" onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                  <CloseIcon />
                </button>
              </>
            ) : (
              <div className="w-full h-full border-2 border-gray-400 border-dashed rounded-xl flex flex-col items-center justify-center text-xs text-gray-500 gap-1">
                <span>Sin imagen</span>
                <button onClick={handleUploadClick} className="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20">Subir</button>
              </div>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleSelectFile} className="hidden" />
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-black w-full max-w-sm mx-auto p-4 rounded shadow-lg">
              <p className="mb-4">¿Seguro que deseas borrar este enlace?</p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={cancelDelete}>Cancelar</Button>
                <Button variant="destructive" onClick={confirmDelete}>Borrar</Button>
              </div>
            </div>
          </div>
        )}

        {statsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={(e) => e.target === e.currentTarget && setStatsModalOpen(false)}>
            <Card className="relative w-full max-w-screen-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setStatsModalOpen(false)} className="absolute top-2 right-2 text-black dark:text-white text-xl">&times;</button>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>Resumen de clics y países (7 y 28 días)</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <p className="text-sm text-gray-200">Cargando stats…</p>
                ) : statsError ? (
                  <p className="text-sm text-red-400">{statsError}</p>
                ) : stats28 ? (
                  <>
                    <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
                      {stats7 && <p className="flex items-center gap-1">🔎 <strong>7d:</strong> {stats7.selected}</p>}
                      <p className="flex items-center gap-1">📅 <strong>28d:</strong> {stats28.selected}</p>
                      <p className="flex items-center gap-1">🌍 <strong>Global:</strong> {stats28.global}</p>
                      <p className="flex items-center gap-1">🚀 <strong>Var:</strong> {stats28.variation}%</p>
                    </div>
                    <div className="w-full mb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={stats28.dailyStats}>
                          <CartesianGrid stroke="none" />
                          <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString("es-ES", { month: "short", day: "numeric" })} />
                          <YAxis />
                          <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "gray", fillOpacity: 0.5 }} />
                          <Bar dataKey="count">
                            {stats28.dailyStats.map((_, i) => (
                              <Cell key={i} fill="hsl(var(--chart-1))"
                                onMouseOver={(e) => e.currentTarget.setAttribute("fill", "hsl(var(--chart-2))")}
                                onMouseOut={(e) => e.currentTarget.setAttribute("fill", "hsl(var(--chart-1))")} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-sm">
                      <p className="font-semibold mb-4">Visitas por país (28d):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {Object.entries(stats28.byCountry).sort(([, a], [, b]) => b - a).map(([c, n]) => (
                          <div key={c}>{countryFlags[c] ?? "🏳️"} {c}: {n}</div>
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
      </div>
    </Reorder.Item>
  );
}
