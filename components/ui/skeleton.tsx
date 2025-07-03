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

export function EditorSkeleton() {
  return (
    <div className="min-h-screen bg-grid-background">
      {/* Page Header */}
      <div className="relative z-10">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 p-3 rounded-lg">
              <Skeleton className="w-14 h-14" />
            </div>
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex flex-col md:flex-row min-h-screen relative">
        {/* Background blur effects - matching the actual editor */}
        <div className="hidden md:block fixed left-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none">
          <div className="absolute left-1/4 -top-24 -bottom-24 right-1/4 bg-[radial-gradient(circle,_rgba(88,28,135,0.45)_0%,_rgba(17,24,39,0)_80%)] blur-[250px] pointer-events-none"></div>
          <div className="absolute left-1/4 -top-32 -bottom-32 right-1/4 bg-[radial-gradient(circle,_rgba(17,24,39,0)_60%,_rgba(88,28,135,0.35)_100%)] blur-[300px] opacity-50 pointer-events-none"></div>
        </div>

        {/* Preview Panel (right side on desktop) */}
        <div className="order-first md:order-last w-full md:w-1/2 p-4 md:p-8 bg-transparent flex flex-col items-center justify-center z-0">
          <div className="relative w-[50vw] sm:w-[40vw] md:w-[35vw] lg:w-[350px] xl:w-[400px] 2xl:w-[450px] max-w-[450px] aspect-[9/19.5]">
            {/* iPhone Frame skeleton */}
            <Skeleton className="absolute w-full h-full z-20 rounded-[40px] opacity-10" />
            
            {/* Phone Screen content */}
            <div className="absolute inset-[4%] z-10 rounded-[20px] md:rounded-[24px] lg:rounded-[30px] xl:rounded-[36px] 2xl:rounded-[40px] overflow-hidden bg-black/30">
              <div className="h-full p-6 space-y-4 flex flex-col items-center justify-center">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-48" />
                
                <div className="space-y-3 mt-8 w-full">
                  <Skeleton className="h-12 w-full rounded-full" />
                  <Skeleton className="h-12 w-full rounded-full" />
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>

                {/* Social icons */}
                <div className="flex gap-3 mt-6">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Preview Badge */}
          <div className="w-full text-center mt-2">
            <Skeleton className="h-7 w-28 rounded-full mx-auto" />
          </div>
        </div>

        {/* Editor Panel (left side) */}
        <div className="relative w-full md:w-1/2 order-last md:order-first p-4 sm:p-6">
          <div className="rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6">
            {/* Editor Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 p-2 rounded-lg">
                  <Skeleton className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-4 w-full max-w-md mx-auto" />
            </div>

            {/* Style Customization Section */}
            <div className="mb-6">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Custom Domain Section */}
            <div className="mb-6">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Form Fields */}
            <div className="space-y-6 mb-8">
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="mt-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 