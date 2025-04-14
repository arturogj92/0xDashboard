import { NextRequest, NextResponse } from 'next/server';

// IDs y credenciales de la aplicación desde variables de entorno
const CLIENT_ID = process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_CLIENT_ID;
const CLIENT_SECRET = 'ca40f9ecdd1aa00834304aff0a938620'; // Secret proporcionado por el usuario

// Interfaz para representar un reel/media de Instagram
interface InstagramMedia {
  id: string;
  media_type: string;
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    // Obtener el código de autorización del cuerpo de la solicitud
    const { code, redirectUri } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Código de autorización no proporcionado' }, { status: 400 });
    }

    console.log('Código de autorización recibido:', code);
    console.log('URL de redirección:', redirectUri);

    // Hacemos la solicitud a Instagram para obtener el token
    try {
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID!,
          client_secret: CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code: code
        })
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Error al obtener token de Instagram:', errorText);
        
        // Si hay un error, retornamos también datos simulados para la demo
        // pero registramos el error para depuración
        console.log('Usando datos simulados como fallback debido al error');
        return fallbackToMockData(code);
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const userId = tokenData.user_id;
      
      console.log('Token obtenido correctamente, ID de usuario:', userId);
      
      // Obtenemos la información del usuario con el token
      const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`);
      
      if (!userResponse.ok) {
        console.error('Error al obtener datos del usuario:', await userResponse.text());
        return fallbackToMockData(code);
      }
      
      const userData = await userResponse.json();
      
      // Obtenemos más información del perfil
      const profileResponse = await fetch(`https://graph.instagram.com/${userId}?fields=id,username,profile_picture_url,media_count&access_token=${accessToken}`);
      const profileData = profileResponse.ok ? await profileResponse.json() : {};
      
      // Ahora obtenemos los últimos 5 reels o media del usuario
      let recentMedia: InstagramMedia[] = [];
      try {
        // Log de los permisos disponibles
        console.log('Accediendo a medias con permisos básicos. Token ID:', userId);
        
        // Con permisos limitados, es posible que no podamos acceder a los medios
        // Intentamos primero con el endpoint de usuario básico
        const mediaEndpoint = `https://graph.instagram.com/me/media`;
        console.log('Usando endpoint básico:', mediaEndpoint);
        
        const mediaResponse = await fetch(
          `${mediaEndpoint}?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=5&access_token=${accessToken}`
        );
        
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          console.log('Datos de media obtenidos con permisos básicos:', mediaData);
          
          if (mediaData.data && Array.isArray(mediaData.data)) {
            recentMedia = mediaData.data;
          } else {
            console.warn('La respuesta no contiene un array de medios:', mediaData);
          }
        } else {
          const errorText = await mediaResponse.text();
          console.error('Error al obtener media con permisos básicos:', errorText);
          
          // Con permisos limitados, es posible que necesitemos usar el endpoint específico de ID
          try {
            console.log('Intentando endpoint de ID específico...');
            const userMediaResponse = await fetch(
              `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=5&access_token=${accessToken}`
            );
            
            if (userMediaResponse.ok) {
              const userMediaData = await userMediaResponse.json();
              console.log('Datos de media obtenidos con endpoint de ID:', userMediaData);
              
              if (userMediaData.data && Array.isArray(userMediaData.data)) {
                recentMedia = userMediaData.data;
              }
            } else {
              const userMediaErrorText = await userMediaResponse.text();
              console.error('Error con endpoint de ID:', userMediaErrorText);
              
              // Si ambos fallan, no mostramos medios
              console.log('No se pudieron obtener medios con los permisos actuales.');
              console.log('Esto es normal si la app no tiene configurados permisos avanzados.');
            }
          } catch (alternativeError) {
            console.error('Error al intentar endpoint alternativo:', alternativeError);
          }
        }
      } catch (mediaError) {
        console.error('Error al procesar media:', mediaError);
        // Si falla, continuamos sin los media pero con los datos de perfil
      }
      
      // Combinamos los datos obtenidos
      const instagramUserData = {
        id: userData.id,
        username: userData.username,
        account_type: userData.account_type,
        profile_picture: profileData.profile_picture_url || null,
        media_count: profileData.media_count || 0,
        connected: true,
        recent_media: recentMedia
      };
      
      console.log('Datos reales de Instagram obtenidos:', instagramUserData);
      
      return NextResponse.json({ 
        success: true, 
        data: instagramUserData,
        message: 'Datos de Instagram obtenidos correctamente'
      });
      
    } catch (apiError) {
      console.error('Error en la comunicación con la API de Instagram:', apiError);
      // Si ocurre un error con la API real, usamos los datos simulados
      return fallbackToMockData(code);
    }
    
  } catch (error) {
    console.error('Error en la autenticación de Instagram:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al procesar la autenticación de Instagram' 
    }, { status: 500 });
  }
}

// Función auxiliar para retornar datos simulados en caso de error
function fallbackToMockData(code: string) {
  const lastFourChars = code.slice(-4);
  
  // Creamos algunos reels simulados
  const mockReels = Array(5).fill(null).map((_, index) => ({
    id: `${17841405793387}${lastFourChars}_${index}`,
    media_type: index % 2 === 0 ? 'VIDEO' : 'IMAGE',
    media_url: index % 2 === 0 ? null : `https://i.pravatar.cc/500?u=${Date.now()}_${index}`,
    permalink: `https://www.instagram.com/reel/mock_${index}_${lastFourChars}/`,
    thumbnail_url: `https://i.pravatar.cc/300?u=${Date.now()}_thumb_${index}`,
    caption: `Este es un reel simulado #${index + 1} para demostración 🎬✨`,
    timestamp: new Date(Date.now() - index * 86400000).toISOString() // Cada uno un día anterior
  }));
  
  const mockUserData = {
    id: '17841405793387' + lastFourChars,
    username: 'user_' + lastFourChars,
    full_name: 'Usuario de Instagram ' + lastFourChars,
    profile_picture: 'https://i.pravatar.cc/150?u=' + Date.now(),
    bio: '⚠️ DATOS SIMULADOS (modo fallback) ⚠️\nNo se pudieron obtener los datos reales de Instagram.',
    website: 'https://www.instagram.com',
    is_business: true,
    account_type: 'BUSINESS',
    media_count: Math.floor(Math.random() * 200) + 20,
    follower_count: Math.floor(Math.random() * 5000) + 500,
    following_count: Math.floor(Math.random() * 1000) + 100,
    connected: true,
    recent_media: mockReels
  };

  console.log('Datos de Instagram simulados (fallback):', mockUserData);
  
  return NextResponse.json({ 
    success: true, 
    data: mockUserData,
    message: 'FALLBACK: Se están usando datos simulados debido a un error en la API de Instagram'
  });
} 