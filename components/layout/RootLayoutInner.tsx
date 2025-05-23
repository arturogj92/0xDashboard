'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { UserNav } from "@/components/auth/UserNav";
import { useTranslations } from 'next-intl';
import Footer from "@/app/components/Footer";
import { FileText } from 'lucide-react';

export default function RootLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('app');
  
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <nav className="mt-2 bg-navbar shadow-sm flex items-center h-12">
        <Link href="/" className="flex-shrink-0 flex items-center px-4 sm:px-6 lg:px-8">
          <Image 
            src="/images/logo.png" 
            alt={t('logoAlt')}
            width={120} 
            height={40} 
            className="mr-1 max-h-8 w-auto" 
            priority
          />
        </Link>
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 md:space-x-4 justify-end">
          {!isAuthenticated && (
            <Link 
              href="/precios" 
              className="flex items-center px-2 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-md shadow-indigo-900/30"
            >
              {t('pricing')}
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/caption-generator"
              className="inline-flex items-center px-1.5 py-0.5 text-[10px] md:text-xs font-medium text-white hover:text-purple-300 transition-colors bg-indigo-600/50 hover:bg-indigo-700/60 rounded-full md:px-3 md:py-1"
            >
              <div className="relative w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-1.5">
                <Image 
                  src="/images/icons/caption-generator-icon.png"
                  alt="Caption Generator Icon"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="hidden md:inline">{t('captionGenerator')}</span>
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/landing"
              className="inline-flex items-center px-1.5 py-0.5 text-[10px] md:text-xs font-medium text-white hover:text-purple-300 transition-colors bg-indigo-600/50 hover:bg-indigo-700/60 rounded-full md:px-3 md:py-1"
            >
              <FileText className="w-4 h-4 md:w-5 md:h-5 mr-1" />
              <span className="hidden md:inline">{t('myLanding')}</span>
            </Link>
          )}
          <UserNav />
        </div>
      </nav>
      <main className="flex-grow w-full py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
} 