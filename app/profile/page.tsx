'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import { User as UserIcon, Instagram, Facebook, VideoIcon } from 'lucide-react';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { getFacebookConnectionStatus, getInstagramUserReels, importInstagramReel, connectFacebookAccount, disconnectFacebookAccount } from '@/lib/api';
import { InstagramMedia } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Facebook SDK se cargará de forma dinámica; no usamos la declaración global
// para evitar conflictos con otros tipos

export default function ProfilePage() {
  const { user, logout, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [fbStatus, setFbStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [instagramReels, setInstagramReels] = useState<InstagramMedia[]>([]);
  const [isLoadingReels, setIsLoadingReels] = useState(false);
  const [importingReelId, setImportingReelId] = useState<string | null>(null);

  useEffect(() => {
    // Simulación de carga y carga del estado de conexión de Facebook
    const loadData = async () => {
      try {
        const fbStatusResponse = await getFacebookConnectionStatus();
        if (fbStatusResponse.success && fbStatusResponse.data) {
          setFbStatus(fbStatusResponse.data.status === 'connected' ? 'connected' : 'disconnected');
          
          // Si Facebook está conectado, intentamos obtener los reels de Instagram
          if (fbStatusResponse.data.status === 'connected') {
            loadInstagramReels();
          }
        }
      } catch (error) {
        console.error('Error al cargar datos de conexión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadData();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const loadInstagramReels = async () => {
    setIsLoadingReels(true);
    try {
      const reelsResponse = await getInstagramUserReels();
      if (reelsResponse.success) {
        setInstagramReels(reelsResponse.data);
      }
    } catch (error) {
      console.error('Error al cargar reels de Instagram:', error);
    } finally {
      setIsLoadingReels(false);
    }
  };

  const loadFacebookSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (typeof window !== 'undefined' && (window as any).FB) {
        resolve();
        return;
      }

      // Cargar el SDK
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/es_ES/sdk.js";
      script.onload = () => {
        // Inicializar el SDK
        (window as any).FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '123456789',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const handleConnectFacebook = async () => {
    try {
      // Cargar el SDK de Facebook si no está cargado
      await loadFacebookSDK();
      
      // Iniciar proceso de login
      (window as any).FB.login(function(response: any) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          handleFacebookToken(accessToken);
        } else {
          console.log('El usuario canceló el inicio de sesión o no autorizó la aplicación.');
        }
      }, {scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,public_profile'});
      
    } catch (error) {
      console.error('Error al cargar/inicializar Facebook SDK:', error);
    }
  };

  const handleFacebookToken = async (accessToken: string) => {
    try {
      const response = await connectFacebookAccount(accessToken);
      if (response.success) {
        setFbStatus('connected');
        await refreshUserProfile(); // Actualizar datos del usuario
        loadInstagramReels(); // Cargar reels después de conectar
      } else {
        console.error('Error al conectar con Facebook:', response.message);
      }
    } catch (error) {
      console.error('Error al procesar token de Facebook:', error);
    }
  };

  const handleDisconnectFacebook = async () => {
    try {
      const response = await disconnectFacebookAccount();
      if (response.success) {
        setFbStatus('disconnected');
        setInstagramReels([]);
        await refreshUserProfile(); // Actualizar datos del usuario
      }
    } catch (error) {
      console.error('Error al desconectar Facebook:', error);
    }
  };

  const handleImportReel = async (reelId: string) => {
    setImportingReelId(reelId);
    try {
      const response = await importInstagramReel(reelId);
      if (response.success) {
        // Marcar visualmente que se importó correctamente
        // Opcionalmente, podríamos redirigir al usuario a la página del reel importado
        const remainingReels = instagramReels.filter(reel => reel.id !== reelId);
        setInstagramReels(remainingReels);
      }
    } catch (error) {
      console.error('Error al importar reel:', error);
    } finally {
      setImportingReelId(null);
    }
  };

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
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">Perfil de Usuario</h1>
            <p className="text-gray-400 mt-2">Información de tu cuenta</p>
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
                <p className="text-sm text-gray-500 mt-1">Usuario desde {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Información de la cuenta</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nombre de usuario
                    </label>
                    <div className="p-3 bg-[#1c1033] border border-indigo-900/50 rounded-md text-white">
                      {user?.username}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Correo electrónico
                    </label>
                    <div className="p-3 bg-[#1c1033] border border-indigo-900/50 rounded-md text-white">
                      {user?.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nombre completo
                    </label>
                    <div className="p-3 bg-[#1c1033] border border-indigo-900/50 rounded-md text-white">
                      {user?.name || "No establecido"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Conexión con Redes Sociales */}
              <div className="border-t border-indigo-900/50 pt-6">
                <h3 className="text-lg font-medium text-white mb-3">Conexión con Redes Sociales</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Facebook className="text-blue-500 h-6 w-6" />
                      <div>
                        <p className="text-white">Facebook</p>
                        <p className="text-xs text-gray-400">
                          {fbStatus === 'connected' 
                            ? 'Conectado' 
                            : 'No conectado'}
                        </p>
                      </div>
                    </div>
                    
                    {fbStatus === 'connected' ? (
                      <Button 
                        variant="outline"
                        className="border-red-700/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                        onClick={handleDisconnectFacebook}
                      >
                        Desconectar
                      </Button>
                    ) : (
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                        onClick={handleConnectFacebook}
                      >
                        Conectar
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Instagram className="text-pink-500 h-6 w-6" />
                      <div>
                        <p className="text-white">Instagram</p>
                        <p className="text-xs text-gray-400">
                          {user?.instagram_connected 
                            ? `Conectado como ${user.instagram_username}` 
                            : 'No conectado'}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant={user?.instagram_connected ? "success" : "outline"}>
                      {user?.instagram_connected ? "Conectado" : "Vinculado a Facebook"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Lista de Reels de Instagram */}
              {fbStatus === 'connected' && (
                <div className="border-t border-indigo-900/50 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Tus Reels de Instagram</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadInstagramReels}
                      disabled={isLoadingReels}
                    >
                      {isLoadingReels ? "Cargando..." : "Actualizar"}
                    </Button>
                  </div>

                  {isLoadingReels ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                      <p className="text-gray-400 mt-2">Cargando reels...</p>
                    </div>
                  ) : instagramReels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {instagramReels.map((reel) => (
                        <Card key={reel.id} className="bg-[#1c1033] border border-indigo-900/50 overflow-hidden">
                          <div className="p-3 space-y-2">
                            <div className="aspect-video relative bg-black/50 rounded-md overflow-hidden">
                              {reel.thumbnail_url ? (
                                <Image 
                                  src={reel.thumbnail_url} 
                                  alt={reel.caption || 'Reel thumbnail'} 
                                  fill 
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <VideoIcon className="h-12 w-12 text-indigo-500/50" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-2">
                              {reel.caption || "Sin descripción"}
                            </p>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-400">
                                {new Date(reel.timestamp).toLocaleDateString()}
                              </p>
                              <Button 
                                size="sm"
                                disabled={importingReelId === reel.id}
                                onClick={() => handleImportReel(reel.id)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              >
                                {importingReelId === reel.id ? 'Importando...' : 'Importar'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-indigo-900/50 rounded-lg">
                      <VideoIcon className="h-12 w-12 text-indigo-500/50 mx-auto mb-2" />
                      <p className="text-gray-400">No se encontraron reels en tu cuenta de Instagram</p>
                      <p className="text-gray-500 text-sm mt-1">Publica reels en Instagram para importarlos aquí</p>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-indigo-900/50 pt-6 flex justify-between">
                <Button
                  variant="outline"
                  className="border-red-700/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  onClick={logout}
                >
                  Cerrar sesión
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  onClick={() => router.push('/')}
                >
                  Ir al Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 