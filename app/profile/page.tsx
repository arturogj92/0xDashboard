'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import { User as UserIcon, Loader2, Video } from 'lucide-react';
import { ProfileSkeleton } from '@/components/ui/skeleton';

// Añadir declaración global para FB (para evitar errores de TypeScript)
declare global {
  interface Window {
    FB: any; // Puedes ser más específico si tienes los tipos del SDK
    fbAsyncInit: () => void;
  }
}

// Interfaz para los datos de un Reel (simplificada)
interface Reel {
  id: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
}

export default function ProfilePage() {
  const { user, logout/*, updateAuthUser */ } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectingFb, setIsConnectingFb] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [fbConnected, setFbConnected] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);
  const [isFetchingReels, setIsFetchingReels] = useState(false);
  const [reelsError, setReelsError] = useState<string | null>(null);

  useEffect(() => {
    // Simulación de carga
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleFacebookConnect = () => {
    if (!window.FB) {
      console.error("Facebook SDK not loaded.");
      setFbError("Error al cargar el SDK de Facebook. Inténtalo de nuevo.");
      return;
    }

    setIsConnectingFb(true);
    setFbError(null);

    window.FB.login(
      function (response: any) {
        setIsConnectingFb(false);
        if (response.authResponse) {
          console.log('¡Bienvenido! Obteniendo tu información.... ', response);
          alert('¡Conexión con Facebook exitosa! (Simulado) AccessToken: ' + response.authResponse.accessToken);
          setFbConnected(true);
        } else {
          console.log('El usuario canceló el inicio de sesión o no lo autorizó completamente.', response);
          setFbError('La conexión con Facebook fue cancelada o falló.');
        }
      },
      {
        scope: 'public_profile,email,instagram_basic,pages_show_list',
      }
    );
  };

  // --- Función para llamar a la API de Facebook --- 
  const fbApi = (path: string, params: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        return reject(new Error("Facebook SDK no cargado."));
      }
      window.FB.api(path, params, (response: any) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          console.error('Error en llamada FB API:', response?.error);
          reject(response?.error || new Error('Error desconocido en API de Facebook'));
        }
      });
    });
  };

  // --- Función para obtener Reels --- 
  const fetchInstagramReels = async () => {
    console.log('Iniciando búsqueda de Reels...');
    setIsFetchingReels(true);
    setReelsError(null);
    setReels([]);

    try {
      // 1. Obtener las cuentas (Páginas) del usuario y sus IG Business Accounts vinculadas
      // Pedimos explícitamente el token de acceso de la página
      const accountsResponse = await fbApi('/me/accounts', {
        fields: 'name,access_token,instagram_business_account{id,username,name,profile_picture_url}'
      });
      console.log('Cuentas de Facebook:', accountsResponse);

      if (!accountsResponse.data || accountsResponse.data.length === 0) {
        throw new Error('No se encontraron Páginas de Facebook administradas por el usuario.');
      }

      // 2. Encontrar la primera cuenta de Instagram vinculada
      // (Podrías necesitar lógica más compleja si el usuario tiene varias)
      let igAccount = null;
      let pageAccessToken = null;
      for (const page of accountsResponse.data) {
        if (page.instagram_business_account) {
          igAccount = page.instagram_business_account;
          pageAccessToken = page.access_token; // Guardamos el token de la página
          console.log('Cuenta de Instagram encontrada:', igAccount);
          break;
        }
      }

      if (!igAccount || !igAccount.id) {
        throw new Error('No se encontró una cuenta de Instagram Business vinculada a las Páginas de Facebook.');
      }

      if (!pageAccessToken) {
         console.warn('No se obtuvo Token de Acceso de la Página, intentando con token de usuario...');
         // Si no obtenemos page token, FB.api usará el token de usuario por defecto
         // pero podría fallar por permisos.
      }

      // 3. Obtener los media de la cuenta de Instagram
      console.log(`Buscando media para la cuenta IG: ${igAccount.id}`);
      const mediaResponse = await fbApi(`/${igAccount.id}/media`, {
        fields: 'id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count',
        limit: 50, // Ajusta el límite según necesites
        access_token: pageAccessToken || undefined // ¡Importante! Usar el token de la página si lo tenemos
      });
      console.log('Media de Instagram:', mediaResponse);

      // 4. Filtrar para obtener solo Reels
      const fetchedReels = mediaResponse.data
        .filter((item: any) => item.media_product_type === 'REELS')
        .map((item: any) => ({ // Mapear a nuestra interfaz Reel
           id: item.id,
           media_url: item.media_url,
           thumbnail_url: item.thumbnail_url,
           permalink: item.permalink,
           caption: item.caption
        }));
      console.log('Reels filtrados:', fetchedReels);

      if (fetchedReels.length === 0) {
         setReelsError('No se encontraron Reels en la cuenta de Instagram vinculada.');
      } else {
          setReels(fetchedReels);
      }

    } catch (error: any) {
      console.error('Error al obtener Reels:', error);
      setReelsError(error.message || 'Ocurrió un error al buscar los Reels.');
    } finally {
      setIsFetchingReels(false);
    }
  };

  // --- Efecto para buscar Reels cuando se conecta a FB --- 
  useEffect(() => {
    // Comprobamos si fbConnected es true y si NO estamos ya buscando reels
    if (fbConnected && !isFetchingReels && reels.length === 0 && !reelsError) {
       // Pequeño retraso para asegurar que FB.api esté listo después del login
       const timer = setTimeout(() => {
           fetchInstagramReels();
       }, 500); 
       return () => clearTimeout(timer);
    }
  // Dependencia en fbConnected para que se ejecute cuando cambie a true
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [fbConnected]); 

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

              {/* Sección para conectar Facebook */}
              <div className="border-t border-indigo-900/50 pt-6">
                <h3 className="text-lg font-medium text-white mb-3">Conectar con Redes Sociales</h3>
                
                {!fbConnected ? (
                  <>
                    <p className="text-sm text-gray-400 mb-4">
                      Conecta tu cuenta de Facebook para poder acceder a tus Reels de Instagram.
                    </p>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3 disabled:opacity-50"
                      onClick={handleFacebookConnect}
                      disabled={isConnectingFb}
                    >
                      {isConnectingFb ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isConnectingFb ? 'Conectando...' : 'Conectar cuenta de Facebook'}
                    </Button>
                    {fbError && (
                      <p className="text-sm text-red-500 mt-2">{fbError}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-green-500 mb-4">¡Cuenta de Facebook conectada!</p>
                )}
              </div>

              {/* --- Nueva Sección para Mostrar Reels --- */}
              {fbConnected && (
                <div className="border-t border-indigo-900/50 pt-6">
                  <h3 className="text-lg font-medium text-white mb-3">Tus Reels de Instagram</h3>
                  {isFetchingReels && (
                    <div className="flex items-center justify-center text-gray-400">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Buscando Reels...</span>
                    </div>
                  )}
                  {reelsError && !isFetchingReels && (
                    <p className="text-sm text-red-500">Error: {reelsError}</p>
                  )}
                  {!isFetchingReels && !reelsError && reels.length === 0 && (
                     <p className="text-sm text-gray-500">No se encontraron Reels o aún no se han buscado.</p>
                  )}
                  {!isFetchingReels && reels.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {reels.map((reel) => (
                        <a 
                          key={reel.id} 
                          href={reel.permalink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="relative aspect-video rounded-md overflow-hidden group bg-gray-800"
                        >
                          {reel.thumbnail_url ? (
                            <Image 
                              src={reel.thumbnail_url} 
                              alt={reel.caption || 'Instagram Reel'} 
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Video className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
                          {/* Podrías añadir info como caption o likes aquí si lo deseas */}
                        </a>
                      ))}
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