'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import { User as UserIcon } from 'lucide-react';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { InstagramConnect } from '@/components/auth/InstagramConnect';
import { FaInstagram, FaPlug } from 'react-icons/fa';
import { useLocale } from '@/contexts/I18nContext';
import { useTranslations } from 'next-intl';
import { updatePreference } from '@/lib/api';
import { UserSlugConfiguration } from '@/components/auth/UserSlugConfiguration';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const t = useTranslations('app.profile');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    // Simulación de carga
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <ProfileSkeleton />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
            <p className="text-gray-400 mt-2">{t('accountDescription')}</p>
          </div>

          <div className="bg-[#120724] p-8 rounded-xl shadow-lg border border-indigo-900/30">
            <div className="flex flex-col md:flex-row items-center mb-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-indigo-900/60 flex items-center justify-center mb-4 md:mb-0 md:mr-8">
                {user?.avatar_url ? (
                  <Image 
                    src={user.avatar_url} 
                    alt={user.name || user.username} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <UserIcon className="h-12 w-12 text-white/60" />
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-white">{user?.name || user?.username}</h2>
                <p className="text-md text-gray-400">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">{t('userSince')} {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">{t('accountInfo')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {t('labelUsername')}
                    </label>
                    <div className="p-3 bg-[#1c1033] border border-indigo-900/50 rounded-md text-white">
                      {user?.username}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {t('labelEmail')}
                    </label>
                    <div className="p-3 bg-[#1c1033] border border-indigo-900/50 rounded-md text-white">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuración del Slug de Usuario */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">{t('slugConfiguration')}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {t('slugConfigurationDescription')}
                </p>
                <UserSlugConfiguration
                  variant="profile"
                  showTitle={false}
                  autoLoad={true}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3">{t('language')}</h3>
                <select
                  value={locale}
                  onChange={async (e) => {
                    const newLocale = e.target.value as 'es' | 'en';
                    setLocale(newLocale);
                    try {
                      const success = await updatePreference('language', newLocale);
                      if (!success) console.error('Error guardando preferencia de idioma');
                    } catch (err) {
                      console.error('Error calling updatePreference:', err);
                    }
                  }}
                  className="p-3 bg-[#1c1033] border border-indigo-900/50 rounded-md text-white w-full"
                >
                  <option value="es">{t('languageSpanish')}</option>
                  <option value="en">{t('languageEnglish')}</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3">{t('instagram')}</h3>
                {(!user?.isInstagramLinked || !user?.isInstagramTokenValid) ? (
                  <InstagramConnect reconnect={Boolean(user?.isInstagramLinked && !user?.isInstagramTokenValid)} />
                ) : (
                  user.instagram_username && (
                    <div className="mt-4 border border-indigo-900/50 rounded-lg p-4 bg-[#1c1033]">
                      <InstagramConnect reconnect />
                      <div className="flex items-center justify-center gap-3 mt-4">
                        <FaInstagram className="text-pink-500 w-6 h-6" />
                        {user.instagram_profile_pic_url && (
                          <img
                            src={user.instagram_profile_pic_url}
                            alt={user.instagram_username}
                            className="w-8 h-8 rounded-full object-cover border border-pink-500"
                          />
                        )}
                        <span className="text-white font-medium">{user.instagram_username}</span>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="border-t border-indigo-900/50 pt-6 flex justify-between">
                <Button
                  variant="outline"
                  className="border-red-700/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  onClick={logout}
                >
                  {t('logout')}
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  onClick={() => router.push('/')}
                >
                  {t('goToDashboard')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 