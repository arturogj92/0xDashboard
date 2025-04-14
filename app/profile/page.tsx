'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import { User as UserIcon, Instagram, Loader2, Video, Image as ImageIcon, ExternalLink, Clock } from 'lucide-react';
import { ProfileSkeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Esta interfaz representa la estructura de datos real que devolvería la API de Instagram
interface InstagramMedia {
  id: string;
  media_type: string;
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
}

interface InstagramProfile {
  id: string;
  username: string;
  full_name?: string;
  profile_picture?: string;
  bio?: string;
  website?: string;
  is_business?: boolean;
  account_type?: string;
  media_count?: number;
  follower_count?: number;
  following_count?: number;
  connected: boolean;
  recent_media?: InstagramMedia[];
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [igConnected, setIgConnected] = useState(false);
  const [igUsername, setIgUsername] = useState('');
  const [igProfile, setIgProfile] = useState<InstagramProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Simulación de carga
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Verificar si hay datos de Instagram en localStorage o en la URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      // Si hay un código en la URL, iniciamos el proceso de autenticación
      setIsAuthenticating(true);
      handleInstagramCallback(code);
      
      // Limpiamos la URL para evitar reconexiones en recargas
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Verificar si ya hay una conexión guardada
      const savedIgData = localStorage.getItem('instagram_data');
      if (savedIgData) {
        try {
          const parsedData = JSON.parse(savedIgData);
          setIgConnected(true);
          setIgUsername(parsedData.username);
          setIgProfile(parsedData);
        } catch (error) {
          console.error("Error al cargar datos de Instagram:", error);
          localStorage.removeItem('instagram_data');
        }
      }
    }
    
    return () => clearTimeout(timer);
  }, []);

  const connectInstagram = () => {
    // Usar el ID específico de la aplicación de Instagram, no el de Facebook
    // Debes obtener este ID en la sección "Instagram Basic Display" en el Facebook Developer Portal
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '1382119013140231';
    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/profile` : '/profile';
    
    // Permisos básicos para Instagram Basic Display API
    const scopes = [
      'user_profile',          // Para ver el perfil
      'user_media'             // Para ver los medios
    ].join('%2C');
    
    // URL de autorización para Instagram Basic Display API (no Graph API)
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
    
    // Copiar la URL al portapapeles
    navigator.clipboard.writeText(authUrl)
      .then(() => {
        alert(`URL copiada al portapapeles: ${authUrl}`);
        window.location.href = authUrl;
      })
      .catch(err => {
        alert(`No se pudo copiar al portapapeles: ${err}`);
        window.location.href = authUrl;
      });
  };

  const handleInstagramCallback = async (code: string) => {
    try {
      setIsAuthenticating(true);
      
      // Usamos el endpoint de API que acabamos de crear
      const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/profile` : '/profile';
      
      const response = await fetch('/api/instagram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          redirectUri 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', response.status, errorData);
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error al obtener datos de Instagram');
      }
      
      console.log('Datos de Instagram recibidos:', data);
      
      // Guardar datos en localStorage
      localStorage.setItem('instagram_data', JSON.stringify(data.data));
      
      // Actualizar estado con los datos recibidos
      setIgConnected(true);
      setIgUsername(data.data.username);
      setIgProfile(data.data);
      
    } catch (error) {
      console.error('Error al procesar la autenticación de Instagram:', error);
      alert('Hubo un error al conectar tu cuenta de Instagram. Por favor, intenta nuevamente.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const disconnectInstagram = () => {
    // En un entorno real, también revocaríamos el token en el backend
    localStorage.removeItem('instagram_data');
    setIgConnected(false);
    setIgUsername('');
    setIgProfile(null);
  };

  // Renderiza un ítem de media individual
  const renderMediaItem = (media: InstagramMedia) => {
    const isVideo = media.media_type === 'VIDEO';
    const imageSrc = isVideo ? (media.thumbnail_url || '') : (media.media_url || '');
    const formattedDate = media.timestamp ? 
      format(new Date(media.timestamp), 'dd MMM yyyy', { locale: es }) : '';
    
    return (
      <div key={media.id} className="bg-indigo-900/20 rounded-lg overflow-hidden border border-indigo-700/40">
        <div className="relative aspect-[4/5] bg-black/20">
          {imageSrc ? (
            <Image 
              src={imageSrc}
              alt={media.caption || 'Instagram media'} 
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-900/50">
              {isVideo ? (
                <Video className="h-10 w-10 text-indigo-300/70" />
              ) : (
                <ImageIcon className="h-10 w-10 text-indigo-300/70" />
              )}
            </div>
          )}
          {isVideo && (
            <div className="absolute top-2 right-2 bg-pink-500/80 text-white px-2 py-1 rounded-lg text-xs font-medium">
              VIDEO
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="line-clamp-2 text-sm text-gray-300 mb-2">
            {media.caption || 'Sin descripción'}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {formattedDate}
            </div>
            <a 
              href={media.permalink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 text-xs flex items-center"
            >
              Ver en Instagram
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    );
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
              
              {/* Sección de conexión con Instagram */}
              <div className="mt-6 border-t border-indigo-900/50 pt-6">
                <h3 className="text-lg font-medium text-white mb-3">Cuenta de Instagram</h3>
                
                {isAuthenticating ? (
                  <div className="bg-indigo-900/20 p-6 rounded-lg border border-indigo-700/50 mb-4 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-pink-500 animate-spin mb-3" />
                    <p className="text-white font-medium">Conectando con Instagram...</p>
                    <p className="text-gray-400 text-sm mt-1">Procesando autenticación y obteniendo datos de tu perfil</p>
                  </div>
                ) : igConnected ? (
                  <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-700/50 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Instagram className="h-5 w-5 text-pink-500" />
                      <span className="text-white font-medium">Cuenta conectada: @{igUsername}</span>
                    </div>
                    {igProfile && (
                      <div className="flex items-center mb-3 bg-indigo-900/30 p-3 rounded-lg">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                          {igProfile.profile_picture && (
                            <Image 
                              src={igProfile.profile_picture} 
                              alt={igProfile.username} 
                              width={48} 
                              height={48} 
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">@{igProfile.username}</p>
                          {igProfile.full_name && (
                            <p className="text-gray-400 text-sm">{igProfile.full_name}</p>
                          )}
                          {igProfile.follower_count && (
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                              <span>{igProfile.media_count} publicaciones</span>
                              <span>{igProfile.follower_count} seguidores</span>
                              <span>{igProfile.following_count} seguidos</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {igProfile?.bio && (
                      <div className="text-sm text-gray-300 mb-3 p-2 bg-indigo-900/20 rounded">
                        {igProfile.bio}
                      </div>
                    )}

                    {/* Sección de contenido reciente */}
                    {igProfile?.recent_media && igProfile.recent_media.length > 0 ? (
                      <div className="mt-4">
                        <h4 className="text-white font-medium mb-3">Contenido reciente</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {igProfile.recent_media.slice(0, 5).map(renderMediaItem)}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 bg-indigo-900/20 p-4 rounded-lg border border-indigo-700/50">
                        <h4 className="text-white font-medium mb-2">Contenido reciente</h4>
                        <div className="text-gray-400 text-sm">
                          <p>No se ha podido obtener el contenido reciente de tu cuenta de Instagram.</p>
                          <p className="mt-2">Posibles motivos:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Tu cuenta no está configurada como cuenta Business o Creator</li>
                            <li>No has concedido los permisos necesarios</li>
                            <li>No tienes publicaciones en tu cuenta</li>
                            <li>Error temporal en la API de Instagram</li>
                          </ul>
                          <p className="mt-3">
                            <Button 
                              variant="link" 
                              className="text-pink-400 hover:text-pink-300 p-0 h-auto"
                              onClick={disconnectInstagram}
                            >
                              Prueba a desconectar tu cuenta
                            </Button> y volver a conectarla concediendo todos los permisos solicitados.
                          </p>
                        </div>
                      </div>
                    )}

                    <p className="text-gray-400 text-sm mt-4 mb-3">Tu cuenta de Instagram está conectada y puedes gestionar tus reels directamente desde nuestra plataforma.</p>
                    <Button 
                      variant="outline" 
                      className="text-sm text-red-400 hover:text-red-300"
                      onClick={disconnectInstagram}
                    >
                      Desconectar cuenta
                    </Button>
                  </div>
                ) : (
                  <div className="bg-[#1c1033] p-5 rounded-lg border border-indigo-900/50 mb-4">
                    <div className="text-center mb-4">
                      <Instagram className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                      <h4 className="text-white font-medium mb-1">Conecta tu cuenta de Instagram</h4>
                      <p className="text-gray-400 text-sm">Conecta tu cuenta para gestionar tus reels y respuestas automáticas.</p>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                      onClick={connectInstagram}
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      Conectar con Instagram
                    </Button>
                  </div>
                )}
              </div>

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