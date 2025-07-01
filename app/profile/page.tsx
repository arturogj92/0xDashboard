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
import { PageHeader } from '@/components/ui/PageHeader';

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
      <PageHeader
        icon={<UserIcon className="w-14 h-14" style={{ color: '#d08216' }} />}
        title={t('title')}
        description={t('accountDescription')}
      />

        <div className="mb-16 relative mx-2 sm:mx-4 md:mx-6 flex flex-col items-center overflow-visible">
          <div className="relative w-full max-w-2xl rounded-xl border border-white/10 bg-[#0e0b15]/70 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
            <div className="relative z-10">
              {/* Profile header con epic effects */}
              <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center mb-4 md:mb-0 md:mr-8 border border-white/10">
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
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {user?.name || user?.username}
                  </h2>
                  <p className="text-md text-gray-300">{user?.email}</p>
                  <p className="text-sm text-purple-400 mt-1 font-medium">
                    <span className="text-gray-400">{t('userSince')}</span> {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid gap-8">
                {/* Account Info Section con glow */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                      {t('accountInfo')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                          {t('labelUsername')}
                        </label>
                        <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg text-white font-medium backdrop-blur-sm">
                          {user?.username}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                          {t('labelEmail')}
                        </label>
                        <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg text-white font-medium backdrop-blur-sm">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuración del Slug de Usuario */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      {t('slugConfiguration')}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      {t('slugConfigurationDescription')}
                    </p>
                    <UserSlugConfiguration
                      variant="profile"
                      showTitle={false}
                      autoLoad={true}
                    />
                  </div>
                </div>

                {/* Language Settings con epic style */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                      {t('language')}
                    </h3>
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
                      className="w-full p-4 bg-black/50 border border-blue-500/30 rounded-lg text-white font-medium backdrop-blur-sm focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                    >
                      <option value="es" className="bg-gray-900 text-white">{t('languageSpanish')}</option>
                      <option value="en" className="bg-gray-900 text-white">{t('languageEnglish')}</option>
                    </select>
                  </div>
                </div>

                {/* Instagram Section con MEGA GLOW */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-red-600 rounded-lg blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 bg-clip-text text-transparent mb-4">
                      {t('instagram')}
                    </h3>
                    {(!user?.isInstagramLinked || !user?.isInstagramTokenValid) ? (
                      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-pink-500/30 backdrop-blur-sm">
                        <InstagramConnect reconnect={Boolean(user?.isInstagramLinked && !user?.isInstagramTokenValid)} />
                        {user?.isInstagramLinked && !user?.isInstagramTokenValid && user?.instagram_username && (
                          <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-black/30 rounded-lg">
                            <FaInstagram className="text-pink-400 w-6 h-6" />
                            {user.instagram_profile_pic_url && (
                              <img
                                src={user.instagram_profile_pic_url}
                                alt={user.instagram_username}
                                className="w-10 h-10 rounded-full object-cover border-2 border-pink-400"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <span className="text-white font-bold text-lg">{user.instagram_username}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      user.instagram_username && (
                        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-pink-500/30 backdrop-blur-sm">
                          <InstagramConnect reconnect />
                          <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-black/30 rounded-lg">
                            <FaInstagram className="text-pink-400 w-6 h-6" />
                            {user.instagram_profile_pic_url && (
                              <img
                                src={user.instagram_profile_pic_url}
                                alt={user.instagram_username}
                                className="w-8 h-8 rounded-full object-cover border border-pink-400"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <span className="text-white font-bold">{user.instagram_username}</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Action Buttons con MEGA STYLE */}
                <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row gap-4 justify-between">
                  <Button
                    variant="outline"
                    className="group relative overflow-hidden border-red-500/50 text-red-400 hover:text-white transition-all duration-300"
                    onClick={logout}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 font-bold">{t('logout')}</span>
                  </Button>
                  <Button
                    className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transition-all duration-300"
                    onClick={() => router.push('/')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">{t('goToDashboard')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </ProtectedRoute>
  );
} 