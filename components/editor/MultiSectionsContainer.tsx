"use client";

import { useEffect, useState, useRef } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { LinkData, SectionData } from "./types";
import MultiSectionsItem from "./MultiSectionsItem";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ═════════ ICONOS COMPLETOS ═════════ */
function AddLink() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"/>
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path fillRule="evenodd" clipRule="evenodd"
            d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06l4.25-4.25Z"/>
    </svg>
  );
}
function ArrowDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path fillRule="evenodd" clipRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 13.06l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"/>
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931ZM19.5 7.125 16.862 4.487"/>
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a47.99 47.99 0 0 0-3.478-.397M4.75 5.75h14.5"/>
    </svg>
  );
}

/* ═════════ PROPS ═════════ */
interface Props{
  containerId:string;
  items:string[];
  links:LinkData[];
  sections:SectionData[];
  moveSectionUp:(id:string)=>void;
  moveSectionDown:(id:string)=>void;
  idx:number; total:number;
  onUpdateLink:(id:string,u:Partial<LinkData>)=>void;
  onDeleteLink:(id:string)=>void;
  onCreateLinkInSection:(sec:string)=>void;
  onUpdateSection:(id:string,u:Partial<SectionData>)=>void;
  onDeleteSection:(id:string)=>void;
  reorderLinksInContainer:(ids:string[])=>void;
  onMoveToSection:(id:string,newSectionId:string)=>void;
  transitioningLinks:Set<string>;
  activeId:string|null;
  highlightedLinkId:string|null;
  onMoveLinkUp?:(id:string)=>void;
  onMoveLinkDown?:(id:string)=>void;
}

export default function MultiSectionsContainer({
  containerId,items,links,sections,moveSectionUp,moveSectionDown,idx,total,
  onUpdateLink,onDeleteLink,onCreateLinkInSection,onUpdateSection,onDeleteSection,
  reorderLinksInContainer,onMoveToSection,transitioningLinks,activeId,highlightedLinkId,
  onMoveLinkUp,onMoveLinkDown,
}:Props){
  
  const { setNodeRef, isOver } = useDroppable({
    id: containerId === 'no-section' ? 'no-section' : `section-${containerId}`,
  });

  const sec=sections.find(s=>s.id===containerId);
  const isNoSec=containerId==="no-section";

  /* título */
  const [edit,setEdit]=useState(false);
  const [title,setTitle]=useState(sec?.title??"");
  const timer=useRef<NodeJS.Timeout|null>(null);
  
  /* modal de confirmación para borrar sección */
  const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);

  /* orden local con referencia estable */
  const [order,setOrder]=useState(items);
  const [lastItemsRef, setLastItemsRef] = useState(items);
  
  useEffect(() => {
    // Solo actualizar si realmente han cambiado los items
    if (JSON.stringify(items) !== JSON.stringify(lastItemsRef)) {
      setOrder(items);
      setLastItemsRef(items);
    }
  }, [items, lastItemsRef]);

  /* commit reorden */
  function commit(){ reorderLinksInContainer(order); }
  
  /* preparar secciones disponibles para los items */
  const availableSections = sections.map(s => ({id: s.id, name: s.title}));
  // Agregar la sección "no-section" si no existe
  if (!availableSections.find(s => s.id === "no-section")) {
    availableSections.push({id: "no-section", name: "Sin sección"});
  }

  return(
    <div 
      ref={setNodeRef}
      data-section-id={containerId}
      className={`w-full border-dashed border border-indigo-900/30 p-4 rounded-md bg-[#120724] hover:bg-indigo-950/20 transition-colors ${
        isOver ? 'ring-2 ring-purple-500 bg-purple-900/20' : ''
      }`}
    >
      <div className="relative flex items-center justify-center mb-2">
        {edit&&sec?(
          <input autoFocus value={title}
                 onChange={(e)=>{setTitle(e.target.value); if(timer.current)clearTimeout(timer.current);
                   timer.current=setTimeout(()=>onUpdateSection(sec.id,{title:e.target.value}),500);}}
                 onBlur={()=>{setEdit(false); if(timer.current){clearTimeout(timer.current);} onUpdateSection(sec.id,{title});}}
                 className="bg-transparent text-lg font-semibold border-b border-indigo-500 focus:border-indigo-400 focus:outline-none py-1 px-0 text-center text-white"/>
        ):(
          <h3 className="font-semibold text-lg">
            {isNoSec?"Sin Sección (no visibles)":sec?.title}
          </h3>
        )}

        {!isNoSec&&sec&&!edit&&(
          <div className="absolute right-0 flex items-center gap-2">
            {idx!==0&&<button onClick={()=>moveSectionUp(sec.id)} className="bg-[#1c1033] text-white rounded p-1 hover:bg-indigo-700 border border-indigo-900/30"><ArrowUpIcon/></button>}
            {!isNoSec && idx !== total-2 && <button onClick={()=>moveSectionDown(sec.id)} className="bg-[#1c1033] text-white rounded p-1 hover:bg-indigo-700 border border-indigo-900/30"><ArrowDownIcon/></button>}
            <button onClick={()=>onCreateLinkInSection(containerId)} className="bg-[#1c1033] text-white rounded p-1 flex items-center gap-1 hover:bg-indigo-700 border border-indigo-900/30">
              <AddLink/><span className="hidden sm:inline">Link</span>
            </button>
            <button onClick={()=>setEdit(true)} className="px-1 py-1 rounded flex items-center gap-1 hover:bg-indigo-700 bg-[#1c1033] border border-indigo-900/30"><PencilIcon/></button>
            <button onClick={()=>setShowDeleteSectionModal(true)} className="px-1 py-1 rounded flex items-center hover:bg-red-700 bg-[#1c1033] border border-indigo-900/30"><TrashIcon/></button>
          </div>
        )}
      </div>

      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {order.map((id, index)=>{
            const link=links.find(l=>l.id===id); if(!link) return null;
            return(
              <MultiSectionsItem 
                key={`${link.id}-${link.section_id || 'no-section'}`} 
                link={link}
                onUpdateLink={onUpdateLink} 
                onDeleteLink={onDeleteLink}
                onMoveToSection={onMoveToSection}
                availableSections={availableSections}
                isTransitioning={transitioningLinks.has(link.id)}
                activeId={activeId}
                highlightMoveIcon={highlightedLinkId === link.id}
                onMoveUp={onMoveLinkUp}
                onMoveDown={onMoveLinkDown}
                isFirst={index === 0}
                isLast={index === order.length - 1}
              />
            );
          })}
        </div>
      </SortableContext>

      {order.length===0&&<p className="text-sm text-gray-400">Arrastra aquí enlaces para asignar</p>}
      
      {/* Modal de confirmación para borrar sección */}
      <AlertDialog open={showDeleteSectionModal} onOpenChange={setShowDeleteSectionModal}>
        <AlertDialogContent className="bg-gray-900 border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              ¿Eliminar sección &ldquo;{sec?.title}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Esta acción no se puede deshacer. Se eliminará la sección y todos los enlaces dentro de ella se moverán a &ldquo;Sin sección&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowDeleteSectionModal(false)}
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDeleteSection(sec?.id || '');
                setShowDeleteSectionModal(false);
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
