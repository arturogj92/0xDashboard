'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { UserNav } from "@/components/auth/UserNav";
import { useTranslations } from 'next-intl';
import Footer from "@/app/components/Footer";

export default function RootLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('app');
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-navbar shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12">
            <div className="flex">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Image 
                  src="/images/logo.png" 
                  alt={t('logoAlt')}
                  width={26} 
                  height={26} 
                  className="mr-1" 
                />
                <h1 className="text-lg font-bold bg-gradient-to-tr from-blue-300 to-purple-400 bg-clip-text text-transparent">{">"} Replyer</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {!isAuthenticated && (
                <Link 
                  href="/precios" 
                  className="flex items-center px-2 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-md shadow-indigo-900/30"
                >
                  {t('pricing')}
                </Link>
              )}
              <UserNav />
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
} 