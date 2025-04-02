'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  User as UserIcon,
  Settings,
  ZapIcon
} from 'lucide-react';

export function UserNav() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Link 
          href="/login" 
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-white hover:text-indigo-300 transition-colors md:px-3"
        >
          <span>Iniciar sesión</span>
        </Link>
        <Link 
          href="/register" 
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-indigo-600/50 hover:bg-indigo-700/60 rounded-full transition-colors md:px-3"
        >
          <span>Crear cuenta</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <Link 
        href="/" 
        className="inline-flex items-center px-2 py-1 text-xs font-medium text-white hover:text-purple-300 transition-colors bg-indigo-600/50 hover:bg-indigo-700/60 rounded-full md:px-3"
      >
        <Image 
          src="/images/icons/automation-icon.png" 
          alt="Automatizaciones" 
          width={14} 
          height={14} 
          className="mr-1" 
        />
        <span>Tus automatizaciones</span>
      </Link>
      
      <Button 
        variant="ghost" 
        size="sm"
        className="h-7 px-1.5 text-xs text-white/80 hover:text-white hover:bg-indigo-900/60 md:px-2"
        onClick={logout}
        title="Cerrar sesión"
      >
        <LogOut className="h-3 w-3 md:mr-1" />
        <span className="hidden md:inline">Cerrar sesión</span>
      </Button>
      
      <Link href="/profile" title="Perfil">
        <div className="flex items-center px-1.5 py-1 bg-indigo-900/40 rounded-full hover:bg-indigo-900/60 transition-colors cursor-pointer md:px-2 md:gap-1.5">
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
      </Link>
    </div>
  );
} 