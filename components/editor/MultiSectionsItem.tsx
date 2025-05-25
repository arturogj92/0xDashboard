"use client";

import React, { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
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

/* ═════════ ICONOS COMPLETOS ═════════ */
function StatsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path d="M12 9a1 1 0 0 1-1-1V3c0-.552.45-1.007.997-.93a7.004 7.004 0 0 1 5.933 5.933c.078.547-.378.997-.93.997h-5Z"/>
      <path d="M8.003 4.07C8.55 3.994 9 4.449 9 5v5a1 1 0 0 0 1 1h5c.552 0 1.008-.45.93-.997A7.001 7.001 0 0 1 2 11a7.002 7.002 0 0 1 6.003-6.93Z"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M3.98 8.223C5.75 5.546 8.473 3.75 12 3.75s6.25 1.796 8.02 4.473a12.082 12.082 0 0 1 1.845 3.152.75.75 0 0 1 0 .75c-.47 1.016-1.1 1.996-1.845 3.152C18.25 18.454 15.527 20.25 12 20.25s-6.25-1.796-8.02-4.473a12.082 12.082 0 0 1-1.845-3.152.75.75 0 0 1 0-.75 12.082 12.082 0 0 1 1.845-3.152z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M3.98 8.223C5.75 5.546 8.473 3.75 12 3.75c1.467 0 2.84.254 4.084.718M20.02 8.223c.745 1.156 1.375 2.136 1.845 3.152a.75.75 0 0 1 0 .75 12.082 12.082 0 0 1-1.845 3.152c-1.77 2.677-4.493 4.473-8.02 4.473-1.45 0-2.82-.25-4.06-.708M9.53 9.53l4.94 4.94M9.53 14.47l4.94-4.94"/>
    </svg>
  );
}

function TitleIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 8.25h15M4.5 12h9m-9 3.75h15"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M13.5 6.75h3.75A2.25 2.25 0 0 1 19.5 9v6a2.25 2.25 0 0 1-2.25 2.25H13.5m-3 0H6.75A2.25 2.25 0 0 1 4.5 15V9A2.25 2.25 0 0 1 6.75 6.75H10.5"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.1 48.1 0 0 0-3.478-.397M4.75 5.75h14.5"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
    </svg>
  );
}

/* ═════════ BANDERAS, TIPOS, HELPERS ═════════ */
const countryFlags: Record<string, string> = {
  US:"🇺🇸", RU:"🇷🇺", ES:"🇪🇸", MX:"🇲🇽", PL:"🇵🇱", KR:"🇰🇷", VN:"🇻🇳", IE:"🇮🇪",
  AR:"🇦🇷", TW:"🇹🇼", FR:"🇫🇷", DK:"🇩🇰", CO:"🇨🇴", VE:"🇻🇪", PE:"🇵🇪", SE:"🇸🇪",
  PT:"🇵🇹", IT:"🇮🇹", SG:"🇸🇬", RO:"🇷🇴", BO:"🇧🇴",
};

interface DailyStat{date:string;count:number;countries:Record<string,number>; }
interface StatsData{selected:number;global:number;variation:number;dailyStats:DailyStat[];byCountry:Record<string,number>; }
interface TooltipItem{name:string;value:number;color:string;payload:{date:string;count:number;countries:Record<string,number>;}; }
interface Props{
  link: LinkData;
  onUpdateLink: (id: string, u: Partial<LinkData>) => void;
  onDeleteLink: (id: string) => void;
  onMoveToSection: (id: string, newSectionId: string) => void;
  availableSections: Array<{id: string; name: string}>;
  isTransitioning?: boolean;
  activeId?: string | null;
}

const fileName=(url:string)=>{try{return url.split("/").pop()??"";}catch{return"";}};
function CustomTooltip({active,payload,label}:{active?:boolean;payload?:TooltipItem[];label?:string;}){
  if(active&&payload&&payload.length){
    const d=new Date(label!);
    return(
      <div style={{background:"black",padding:"6px 8px",borderRadius:4,color:"white",fontSize:"0.8rem"}}>
        <p className="mb-1">{d.toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"})}</p>
        <div className="flex items-center gap-2">
          <span style={{background:"hsl(var(--chart-1))",width:8,height:8,display:"inline-block"}}/>
          <span>Page Views: {payload[0].value}</span>
        </div>
      </div>
    );
  } return null;
}

/* ═════════ COMPONENTE ═════════ */
export default function MultiSectionsItem({
  link,onUpdateLink,onDeleteLink,onMoveToSection,availableSections,isTransitioning = false,activeId,
}:Props){

  const t = useTranslations('linkItem');
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const [title,setTitle]=useState(link.title);
  const [url,setUrl]=useState(link.url);
  const [image,setImage]=useState(link.image??"");
  const [urlId,setUrlId]=useState<number|null>(link.url_link_id??null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [stats7,setStats7]=useState<StatsData|null>(null);
  const [stats28,setStats28]=useState<StatsData|null>(null);
  const [statsModal,setStatsModal]=useState(false);
  const [loadingStats,setLoadingStats]=useState(false);
  const [statsErr,setStatsErr]=useState<string|null>(null);

  const fileRef=useRef<HTMLInputElement>(null);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  
  const upd=(u:Partial<LinkData>)=>onUpdateLink(link.id,u);
  
  const otherSections = availableSections.filter(s => s.id !== (link.section_id ?? "no-section"));

  async function selectFile(e:React.ChangeEvent<HTMLInputElement>){
    if(!e.target.files?.length) return;
    
    const file = e.target.files[0];
    
    // Limpiar errores previos y resetear el input
    setUploadError(null);
    if (e.target) {
      e.target.value = '';
    }

    // Validaciones básicas en el frontend
    if (!file.type.startsWith('image/')) {
      setUploadError('El archivo debe ser una imagen');
      // Limpiar error después de 5 segundos
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      setUploadError('La imagen no puede ser mayor a 50MB');
      // Limpiar error después de 5 segundos
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    // Crear FormData para enviar la imagen
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      
      // Obtener token de autorización
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch("/api/images", {
        method: "POST",
        headers,
        body: formData // No establecer Content-Type, el navegador lo hace automáticamente
      });
      
      const j = await res.json();
      
      if (!res.ok) {
        setUploadError(j.error || 'Error al subir la imagen');
        console.error('Error al subir imagen:', j.error);
        // Limpiar error después de 5 segundos
        setTimeout(() => setUploadError(null), 5000);
        return;
      }
      
      setImage(j.url); 
      upd({image: j.url});
    } catch (error) {
      setUploadError('Error de conexión al subir la imagen');
      console.error('Error al subir imagen:', error);
      // Limpiar error después de 5 segundos
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploadingImage(false);
    }
  }
  async function removeImg(){
    if(image) await fetch(`/api/images?fileName=${fileName(image)}`,{method:"DELETE"});
    setImage(""); upd({image:""});
  }

  async function openStats(){
    if(!urlId){setStatsErr("Sin url_link_id");setStatsModal(true);return;}
    setStatsModal(true); setLoadingStats(true); setStatsErr(null);
    try{
      const s7=await(await fetch(`https://www.art0x.link/api/url/visitStats?url_id=${urlId}&range=7d`)).json();
      const s28=await(await fetch(`https://www.art0x.link/api/url/visitStats?url_id=${urlId}&range=28d`)).json();
      setStats7(s7.stats); setStats28(s28.stats);
    }catch{setStatsErr("Error obteniendo stats");}
    finally{setLoadingStats(false);}
  }

  const handleMoveToSection = (sectionId: string) => {
    onMoveToSection(link.id, sectionId);
    setShowSectionDropdown(false);
  };

  return(
    <div
      ref={setNodeRef}
      style={style}
      data-section-item-id={link.id}
      className={`relative list-none ${
        isDragging ? 'z-50 scale-105 opacity-75' : ''
      } ${
        isTransitioning ? 'opacity-70 scale-95' : ''
      } ${
        activeId === link.id ? 'ring-2 ring-purple-500' : ''
      }
      transition-all duration-200 ease-out`}
    >
      <div className="relative border border-indigo-900/30 p-4 rounded-lg bg-[#120724] text-white min-h-[5rem]">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-2 cursor-grab active:cursor-grabbing hover:bg-purple-900/30 rounded transition-colors"
        >
          <div className="w-3 h-3 grid grid-cols-2 gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pl-8">
          <div className="flex flex-col gap-2 flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none"><TitleIcon/></span>
              <Input value={title} onChange={e=>{setTitle(e.target.value);upd({title:e.target.value});}}
                     placeholder="Título"
                     className="w-full text-sm pl-8 pr-2 py-1 rounded-md bg-transparent text-white placeholder:text-muted-foreground hover:bg-[#1c1033]/80 focus:bg-[#1c1033] border border-slate-600/50 focus:border-indigo-500 focus:outline-none"/>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none"><LinkIcon/></span>
                <Input value={url} onChange={e=>{setUrl(e.target.value);upd({url:e.target.value});}}
                       placeholder="URL"
                       className="w-full text-sm pl-8 pr-2 py-1 rounded-md bg-transparent text-white placeholder:text-muted-foreground hover:bg-[#1c1033]/80 focus:bg-[#1c1033] border border-slate-600/50 focus:border-indigo-500 focus:outline-none"/>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs text-gray-300">ID:</span>
                <Input type="number" value={urlId??""} onChange={e=>{const n=parseInt(e.target.value,10);const id=isNaN(n)?null:n;setUrlId(id);upd({url_link_id:id});}}
                       placeholder="LinkID"
                       className="w-20 text-sm rounded-md bg-transparent text-white placeholder:text-muted-foreground hover:bg-[#1c1033]/80 focus:bg-[#1c1033] border border-slate-600/50 focus:border-indigo-500 focus:outline-none"/>
              </div>
            </div>
          </div>

          <div className="relative w-16 h-16 flex-shrink-0">
            {image?(
              <>
                <img src={image} alt={title} className="w-full h-full object-cover rounded-md"/>
                <button onClick={removeImg}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"><CloseIcon/></button>
              </>
            ):(
              <div className={`w-full h-full border-2 border-indigo-600/40 border-dashed rounded-md flex flex-col items-center justify-center text-xs text-gray-500 gap-1 cursor-pointer hover:border-indigo-400 transition-colors bg-[#1c1033]/40 ${uploadingImage ? 'opacity-50' : ''}`}
                   onClick={()=>{
                     if (!uploadingImage) {
                       setUploadError(null); // Limpiar error cuando se intente de nuevo
                       fileRef.current?.click();
                     }
                   }}>
                <div className="text-center">
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-1"></div>
                      <div className="text-xs font-medium">Subiendo...</div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-medium">{t('noImage')}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{t('uploadImage')}</div>
                    </>
                  )}
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={selectFile}/>
          </div>

          {/* Panel de iconos en matriz 2x2 */}
          <div className="grid grid-cols-2 gap-1">
            <div className="relative">
              <Button 
                variant="destructive" 
                className="text-xs p-1 w-8 h-8 hover:bg-purple-900" 
                onClick={() => setShowSectionDropdown(!showSectionDropdown)}
              >
                <MoveIcon/>
              </Button>
              
              {showSectionDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 min-w-48">
                  <div className="p-2">
                    <div className="text-xs text-gray-400 mb-2 text-center">Mover a sección:</div>
                    {otherSections.length > 0 ? (
                      otherSections.map(section => (
                        <button
                          key={section.id}
                          onClick={() => handleMoveToSection(section.id)}
                          className="w-full text-center px-3 py-2 text-sm rounded-sm hover:bg-gray-700 transition-colors"
                        >
                          {section.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No hay otras secciones disponibles
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {showSectionDropdown && (
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSectionDropdown(false)}
                />
              )}
            </div>
            
            <Button variant="destructive" className="text-xs p-1 w-8 h-8 hover:bg-purple-900" onClick={openStats}>
              <StatsIcon/>
            </Button>
            
            <Button variant="destructive" className="text-xs p-1 w-8 h-8 hover:bg-purple-900" onClick={()=>onDeleteLink(link.id)}>
              <TrashIcon/>
            </Button>
            
            <Toggle pressed={link.visible} onPressedChange={v=>upd({visible:v})}
                    className="w-8 h-8 flex items-center justify-center hover:bg-purple-900">
              {link.visible?<EyeIcon/>:<EyeSlashIcon/>}
            </Toggle>
          </div>
        </div>

        {/* Error de subida de imagen */}
        {uploadError && (
          <div className="mt-2 text-red-400 text-xs bg-red-900/20 rounded px-2 py-1 border border-red-700/30 flex items-center justify-between">
            <span className="flex-1 text-center">{uploadError}</span>
            <button 
              onClick={() => setUploadError(null)}
              className="ml-2 text-red-300 hover:text-red-100 transition-colors"
              title="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* ───────── Modal Stats (sin recortes) ───────── */}
        {statsModal&&(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
               onClick={e=>e.target===e.currentTarget&&setStatsModal(false)}>
            <Card className="relative w-full max-w-screen-xl max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setStatsModal(false)}
                      className="absolute top-2 right-2 text-black dark:text-white text-xl">&times;</button>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>Resumen de clics y países (7 y 28 días)</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStats?(
                  <p className="text-sm text-gray-200">Cargando stats…</p>
                ):statsErr?(
                  <p className="text-sm text-red-400">{statsErr}</p>
                ):stats28?(
                  <>
                    <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
                      {stats7&&<p className="flex items-center gap-1">🔎 <strong>7d:</strong> {stats7.selected}</p>}
                      <p className="flex items-center gap-1">📅 <strong>28d:</strong> {stats28.selected}</p>
                      <p className="flex items-center gap-1">🌍 <strong>Global:</strong> {stats28.global}</p>
                      <p className="flex items-center gap-1">🚀 <strong>Var:</strong> {stats28.variation}%</p>
                    </div>
                    <div className="w-full mb-4">
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={stats28.dailyStats}>
                          <CartesianGrid stroke="none"/>
                          <XAxis dataKey="date" tickFormatter={v=>new Date(v).toLocaleDateString("es-ES",{month:"short",day:"numeric"})}/>
                          <YAxis/>
                          <RechartsTooltip content={<CustomTooltip/>} cursor={{fill:"gray",fillOpacity:0.5}}/>
                          <Bar dataKey="count">
                            {stats28.dailyStats.map((_,i)=>(
                              <Cell key={i} fill="hsl(var(--chart-1))"
                                    onMouseOver={e=>e.currentTarget.setAttribute("fill","hsl(var(--chart-2))")}
                                    onMouseOut={e=>e.currentTarget.setAttribute("fill","hsl(var(--chart-1))")}/>
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-sm">
                      <p className="font-semibold mb-4">Visitas por país (28d):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {Object.entries(stats28.byCountry).sort(([,a],[,b])=>b-a).map(([c,n])=>(
                          <div key={c}>{countryFlags[c]??"🏳️"} {c}: {n}</div>
                        ))}
                      </div>
                    </div>
                  </>
                ):(
                  <p className="text-sm text-gray-200">No se han cargado datos.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}