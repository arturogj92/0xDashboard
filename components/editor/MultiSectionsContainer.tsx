"use client";

import { useEffect, useState, useRef } from "react";
import { Reorder } from "framer-motion";
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
  /** id, nueva sección, índice destino */
  onDropLink:(id:string,newSectionId:string,pos:number)=>void;
}

export default function MultiSectionsContainer({
  containerId,items,links,sections,moveSectionUp,moveSectionDown,idx,total,
  onUpdateLink,onDeleteLink,onCreateLinkInSection,onUpdateSection,onDeleteSection,
  reorderLinksInContainer,onDropLink,
}:Props){

  const sec=sections.find(s=>s.id===containerId);
  const isNoSec=containerId==="no-section";

  /* título */
  const [edit,setEdit]=useState(false);
  const [title,setTitle]=useState(sec?.title??"");
  const timer=useRef<NodeJS.Timeout|null>(null);

  /* orden local */
  const [order,setOrder]=useState(items);
  useEffect(()=>setOrder(items),[items]);

  /* commit reorden */
  function commit(){ reorderLinksInContainer(order); }

  return(
    <div data-section-id={containerId}
         className="w-full border-dashed border border-purple-900 p-4 rounded bg-black hover:bg-purple-950/10">
      <div className="flex items-center justify-between mb-2">
        {edit&&sec?(
          <input autoFocus value={title}
                 onChange={(e)=>{setTitle(e.target.value); if(timer.current)clearTimeout(timer.current);
                   timer.current=setTimeout(()=>onUpdateSection(sec.id,{title:e.target.value}),500);}}
                 onBlur={()=>{setEdit(false); if(timer.current){clearTimeout(timer.current);} onUpdateSection(sec.id,{title});}}
                 className="bg-transparent text-lg font-semibold border-b border-gray-300 focus:border-primary focus:outline-none py-1 px-0"/>
        ):(
          <h3 className="font-semibold text-lg">
            {isNoSec?"Sin Sección (no visibles)":sec?.title}
          </h3>
        )}

        {!isNoSec&&sec&&!edit&&(
          <div className="flex items-center gap-2">
            {idx!==0&&<button onClick={()=>moveSectionUp(sec.id)} className="bg-black text-white rounded p-1 hover:bg-purple-950"><ArrowUpIcon/></button>}
            {idx!==total-1&&<button onClick={()=>moveSectionDown(sec.id)} className="bg-black text-white rounded p-1 hover:bg-purple-950"><ArrowDownIcon/></button>}
            <button onClick={()=>onCreateLinkInSection(containerId)} className="bg-black text-white rounded p-1 flex items-center gap-1 hover:bg-purple-950">
              <AddLink/><span className="hidden sm:inline">Link</span>
            </button>
            <button onClick={()=>setEdit(true)} className="px-1 py-1 rounded flex items-center gap-1 hover:bg-purple-950"><PencilIcon/></button>
            <button onClick={()=>onDeleteSection(sec.id)} className="px-1 py-1 rounded flex items-center hover:bg-purple-950"><TrashIcon/></button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Reorder.Group<string> axis="y" values={order} onReorder={setOrder} as="div">
          {order.map(id=>{
            const link=links.find(l=>l.id===id); if(!link) return null;
            return(
              <MultiSectionsItem key={link.id} link={link}
                onUpdateLink={onUpdateLink} onDeleteLink={onDeleteLink}
                onDropLink={onDropLink} onDragFinish={commit}/>
            );
          })}
        </Reorder.Group>
      </div>

      {order.length===0&&<p className="text-sm text-gray-400">Arrastra aquí enlaces para asignar</p>}
    </div>
  );
}
