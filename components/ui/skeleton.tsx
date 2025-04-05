'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-indigo-900/20",
        className
      )}
      {...props}
    />
  );
}

export function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Skeleton className="w-full h-full rounded-none" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-r-transparent"></div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="relative">
      <div className="border-2 border-b-dashed border-l-dashed border-r-dashed border-indigo-900/30 border-t-indigo-900/50 bg-[#12072f] rounded-xl shadow-lg p-5">
        <div className="flex">
          {/* Miniatura a la izquierda */}
          <Skeleton className="w-20 h-20 md:w-28 md:h-28 mr-2 md:mr-5 flex-shrink-0 rounded-lg border border-indigo-900/20" />

          {/* Contenido principal */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 md:gap-2 mb-1.5">
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              
              <Skeleton className="h-4 w-36 md:w-64 mb-2 md:mb-4" />
              
              {/* Indicadores de estadísticas */}
              <div className="flex flex-wrap gap-2 mb-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>

          {/* Controles de acción a la derecha */}
          <div className="ml-1 md:ml-2 flex flex-col space-y-1.5 md:space-y-2.5 justify-center">
            <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
            <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
            <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="mb-12 relative px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center mb-6 md:mb-0">
          <Skeleton className="w-10 h-10 mr-3 rounded-full" />
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="hidden md:block w-40 h-20" />
      </div>
    </div>
  );
}

export function SectionHeaderSkeleton() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center">
        <Skeleton className="w-9 h-9 mr-3 rounded-lg" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-8 w-32 rounded-full" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-[#1c1033] p-8 rounded-xl border border-indigo-900/30">
        <div className="flex items-center mb-6">
          <Skeleton className="w-16 h-16 mr-4 rounded-full" />
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <Skeleton className="h-5 w-36 mb-1" />
          <Skeleton className="h-10 w-full rounded-md" />
          
          <Skeleton className="h-5 w-44 mb-1" />
          <Skeleton className="h-10 w-full rounded-md" />
          
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        
        <div className="flex justify-between pt-4">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function NavbarSkeleton() {
  return (
    <div className="bg-navbar shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12 items-center">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Skeleton className="w-6 h-6 mr-1" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Skeleton className="w-8 h-6 md:w-24 md:h-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-fadeIn">
      <NavbarSkeleton />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <HeaderSkeleton />
        
        <div className="mb-8">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
        
        <div className="mb-8">
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
} 