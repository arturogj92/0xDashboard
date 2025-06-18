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
import { useTranslations } from 'next-intl';

export function UserNav() {
  const { user, logout, isAuthenticated } = useAuth();
  const t = useTranslations('app.userNav');

  if (!isAuthenticated) {
    return (
      <div className="flex items-center">
        <Link 
          href="/login" 
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white hover:text-white bg-white/5 hover:bg-white/15 transition-all duration-200 rounded-lg border border-white/10 hover:border-white/30"
        >
          <span>{t('login')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <Link 
        href="/automations" 
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white hover:text-white bg-white/5 hover:bg-white/15 transition-all duration-200 rounded-lg border border-white/10 hover:border-white/30"
      >
        <div className="relative w-5 h-5 mr-2">
          <Image 
            src="/images/icons/automation-icon.png"
            alt="Automation Icon"
            fill
            className="object-contain"
          />
        </div>
        <span className="hidden md:inline">{t('yourAutomations')}</span>
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center px-1.5 py-1 bg-indigo-900/40 rounded-full hover:bg-indigo-900/60 transition-colors cursor-pointer md:px-2 md:gap-1.5 outline-none">
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-indigo-900/60 flex items-center justify-center">
            {user?.avatar_url ? (
              <Image 
                src={user.avatar_url} 
                alt={user.name || user.username} 
                fill 
                className="object-cover"
                unoptimized
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="h-3 w-3 text-white/60" />
            )}
          </div>
          <div className="hidden md:flex md:flex-col">
            <p className="text-xs font-medium text-white">{user?.name || user?.username}</p>
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48 bg-[#120724] border border-indigo-900/30">
          <DropdownMenuItem asChild>
            <Link 
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-white hover:bg-indigo-900/40 transition-colors cursor-pointer"
            >
              <UserCircle className="h-4 w-4 mr-2 text-indigo-400" />
              {t('profile')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={logout}
            className="flex items-center px-4 py-2 text-sm text-white hover:bg-indigo-900/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2 text-red-400" />
            {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 