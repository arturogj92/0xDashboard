'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  User as UserIcon,
  Settings
} from 'lucide-react';

export function UserNav() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Link 
          href="/login" 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:text-indigo-300 transition-colors"
        >
          Iniciar sesión
        </Link>
        <Link 
          href="/register" 
          className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-indigo-600/50 hover:bg-indigo-700/60 rounded-full transition-colors"
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link 
        href="/" 
        className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white hover:text-purple-300 transition-colors bg-indigo-600/50 hover:bg-indigo-700/60 rounded-full"
      >
        <Image 
          src="/images/icons/automation-icon.png" 
          alt="Automatizaciones" 
          width={16} 
          height={16} 
          className="mr-1.5" 
        />
        Tus automatizaciones
      </Link>
      
      <Button 
        variant="ghost" 
        size="sm"
        className="text-white/80 hover:text-white hover:bg-indigo-900/60"
        onClick={logout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar sesión
      </Button>
      
      <Link href="/profile">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/40 rounded-full hover:bg-indigo-900/60 transition-colors cursor-pointer">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-indigo-900/60 flex items-center justify-center">
            {user?.avatar_url ? (
              <Image 
                src={user.avatar_url} 
                alt={user.name || user.username} 
                fill 
                className="object-cover"
              />
            ) : (
              <UserIcon className="h-4 w-4 text-white/60" />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-white">{user?.name || user?.username}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </Link>
    </div>
  );
} 