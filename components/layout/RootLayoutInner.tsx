'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { UserNav } from "@/components/auth/UserNav";
import { useTranslations } from 'next-intl';
import Footer from "@/app/components/Footer";
import { Settings, Menu, X, User, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function RootLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useAuth();
  const t = useTranslations('app');
  const tMobile = useTranslations('app.mobileNav');
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Detectar si estamos en una landing pública
  const isPublicLanding = pathname?.startsWith('/landing/') && pathname !== '/landing';
  
  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Si es una landing pública, renderizar solo el children sin navbar/footer
  if (isPublicLanding) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Main Navigation */}
      <nav className="mt-2 bg-navbar shadow-sm relative z-50">
        {/* Desktop & Mobile Header */}
        <div className="flex items-center h-12 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image 
              src="/images/logo.png" 
              alt={t('logoAlt')}
              width={120} 
              height={40} 
              className="mr-1 max-h-8 w-auto" 
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center space-x-4 justify-end">
            {!isAuthenticated && (
              <Link 
                href="/precios" 
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white hover:text-white bg-white/5 hover:bg-white/15 transition-all duration-200 rounded-lg border border-white/10 hover:border-white/30"
              >
                {t('pricing')}
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/caption-generator"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white hover:text-white bg-white/5 hover:bg-white/15 transition-all duration-200 rounded-lg border border-white/10 hover:border-white/30"
              >
                <div className="relative w-5 h-5 mr-2">
                  <Image 
                    src="/images/icons/caption-generator-icon.png"
                    alt="Caption Generator Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                {t('captionGenerator')}
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/landing"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white hover:text-white bg-white/5 hover:bg-white/15 transition-all duration-200 rounded-lg border border-white/10 hover:border-white/30"
              >
                <Settings className="w-5 h-5 mr-2" style={{ color: '#d08216' }} />
                {t('myLanding')}
              </Link>
            )}
            <UserNav />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex-grow flex items-center justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
              aria-label="Toggle mobile menu"
            >
              <div className={`transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className={`px-4 py-4 space-y-3 transform transition-all duration-300 ease-in-out ${
              isMobileMenuOpen 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-4 opacity-0'
            }`}>
              
              {/* Navigation Links */}
              {!isAuthenticated && (
                <Link 
                  href="/precios"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200 transform ${
                    isMobileMenuOpen 
                      ? 'translate-x-0 opacity-100' 
                      : 'translate-x-4 opacity-0'
                  }`}
                  style={{ transitionDelay: '100ms' }}
                >
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <span className="font-medium">{t('pricing')}</span>
                </Link>
              )}
              
              {isAuthenticated && (
                <Link
                  href="/caption-generator"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200 transform ${
                    isMobileMenuOpen 
                      ? 'translate-x-0 opacity-100' 
                      : 'translate-x-4 opacity-0'
                  }`}
                  style={{ transitionDelay: '100ms' }}
                >
                  <div className="relative w-6 h-6 mr-3">
                    <Image 
                      src="/images/icons/caption-generator-icon.png"
                      alt="Caption Generator Icon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{t('captionGenerator')}</div>
                    <div className="text-xs text-gray-400">{tMobile('captionGeneratorDesc')}</div>
                  </div>
                </Link>
              )}
              
              {isAuthenticated && (
                <Link
                  href="/landing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200 transform ${
                    isMobileMenuOpen 
                      ? 'translate-x-0 opacity-100' 
                      : 'translate-x-4 opacity-0'
                  }`}
                  style={{ transitionDelay: '150ms' }}
                >
                  <Settings className="w-6 h-6 mr-3" style={{ color: '#d08216' }} />
                  <div>
                    <div className="font-medium">{t('myLanding')}</div>
                    <div className="text-xs text-gray-400">{tMobile('myLandingDesc')}</div>
                  </div>
                </Link>
              )}

              {/* User Navigation in Mobile */}
              {isAuthenticated && (
                <div>
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200 transform ${
                      isMobileMenuOpen 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: '200ms' }}
                  >
                    <div className="w-6 h-6 mr-3 flex items-center justify-center">
                      <span className="text-lg">⚡</span>
                    </div>
                    <div>
                      <div className="font-medium">{t('userNav.yourAutomations')}</div>
                      <div className="text-xs text-gray-400">{tMobile('automationsDesc')}</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200 transform ${
                      isMobileMenuOpen 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: '250ms' }}
                  >
                    <div className="relative w-6 h-6 mr-3 rounded-full overflow-hidden bg-indigo-900/60 flex items-center justify-center">
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
                        <User className="h-3 w-3 text-white/60" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{t('userNav.profile')}</div>
                      <div className="text-xs text-gray-400">{tMobile('profileDesc')}</div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Login/Logout */}
              {!isAuthenticated ? (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200 transform ${
                      isMobileMenuOpen 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: '300ms' }}
                  >
                    <div className="w-6 h-6 mr-3 flex items-center justify-center">
                      <span className="text-lg">🔑</span>
                    </div>
                    <span className="font-medium">{t('userNav.login')}</span>
                  </Link>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all duration-200 transform ${
                      isMobileMenuOpen 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-4 opacity-0'
                    }`}
                    style={{ transitionDelay: '300ms' }}
                  >
                    <LogOut className="w-6 h-6 mr-3 text-red-400" />
                    <span className="font-medium">{t('userNav.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow w-full py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
} 