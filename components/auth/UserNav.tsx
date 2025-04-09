'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LogOut, 
  User as UserIcon,
  UserCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';

export function UserNav() {
  const { user, logout, isAuthenticated } = useAuth();
  const [avatarError, setAvatarError] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center">
        <Link 
          href="/login" 
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600/70 hover:bg-indigo-700 rounded-full transition-colors"
        >
          <span>Acceder</span>
        </Link>
      </div>
    );
  }

  // Verificar si la URL de avatar es válida para next/image
  const hasValidAvatar = user?.avatar_url && !avatarError;
  const avatarUrl = user?.avatar_url || '';
  const userName = user?.name || user?.username || 'Usuario';
  
  // Verificar si es una URL de Facebook
  const isFacebookImage = avatarUrl.includes('fbcdn.net');

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <Link 
        href="/" 
        className="inline-flex items-center px-1.5 py-0.5 text-[10px] md:text-xs font-medium text-white hover:text-purple-300 transition-colors bg-indigo-600/50 hover:bg-indigo-700/60 rounded-full md:px-3 md:py-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-amber-400 mr-1 md:mr-1.5">
          <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
        </svg>
        <span className="hidden md:inline">Tus automatizaciones</span>
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center px-1.5 py-1 bg-indigo-900/40 rounded-full hover:bg-indigo-900/60 transition-colors cursor-pointer md:px-2 md:gap-1.5 outline-none">
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-indigo-900/60 flex items-center justify-center">
            {hasValidAvatar ? (
              <Image 
                src={avatarUrl} 
                alt={userName} 
                width={24}
                height={24}
                className="object-cover w-full h-full"
                onError={() => setAvatarError(true)}
                unoptimized={isFacebookImage} // No optimizar imágenes de Facebook
              />
            ) : (
              <UserIcon className="h-3 w-3 text-white/60" />
            )}
          </div>
          <div className="hidden md:flex md:flex-col">
            <p className="text-xs font-medium text-white">{userName}</p>
            <p className="text-[10px] text-gray-400">{user?.email}</p>
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48 bg-[#120724] border border-indigo-900/30">
          <DropdownMenuItem asChild>
            <Link 
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-white hover:bg-indigo-900/40 transition-colors cursor-pointer"
            >
              <UserCircle className="h-4 w-4 mr-2 text-indigo-400" />
              Tu Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={logout}
            className="flex items-center px-4 py-2 text-sm text-white hover:bg-indigo-900/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2 text-red-400" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 