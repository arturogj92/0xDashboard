'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { 
  LogOut, 
  User as UserIcon,
  Settings,
  UserCircle
} from 'lucide-react';

export function UserNav() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

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
      
      <div className="relative group">
        <div 
          className="flex items-center px-1.5 py-1 bg-indigo-900/40 rounded-full hover:bg-indigo-900/60 transition-colors cursor-pointer md:px-2 md:gap-1.5"
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-indigo-900/60 flex items-center justify-center">
            {user?.avatar_url ? (
              <Image 
                src={user.avatar_url} 
                alt={user.name || user.username} 
                fill 
                className="object-cover"
              />
            ) : (
              <UserIcon className="h-3 w-3 text-white/60" />
            )}
          </div>
          <div className="hidden md:flex md:flex-col">
            <p className="text-xs font-medium text-white">{user?.name || user?.username}</p>
            <p className="text-[10px] text-gray-400">{user?.email}</p>
          </div>
        </div>
        
        {/* Menú desplegable */}
        <div 
          className={`absolute right-0 mt-1 w-48 bg-card border border-color rounded-md shadow-lg overflow-hidden z-10 transition-all duration-200 origin-top-right ${
            showMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          <div className="py-1">
            <Link 
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-button-hover transition-colors"
            >
              <UserCircle className="h-4 w-4 mr-2 text-primary" />
              Tu Perfil
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-button-hover transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2 text-red-400" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 