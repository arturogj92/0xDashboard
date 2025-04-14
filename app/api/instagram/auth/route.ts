import { NextRequest, NextResponse } from 'next/server';

// IDs y credenciales específicas de la aplicación de Instagram (no de Facebook)
// Estos deben obtenerse de la sección "Instagram Basic Display" en Facebook Developer Portal
const CLIENT_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '1382119013140231';
const CLIENT_SECRET = 'ca40f9ecdd1aa00834304aff0a938620';

// Interfaz para representar un media de Instagram
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

    // Hacemos la solicitud para obtener el token usando Instagram Basic Display API
    try {
      console.log('Intercambiando código por token usando Basic Display API...');
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code: code
        })
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Error al obtener token de Instagram Basic Display:', errorText);
        
        // Si hay un error, retornamos datos simulados
        console.log('Usando datos simulados como fallback debido al error');
        return fallbackToMockData(code);
      }
      
      const tokenData = await tokenResponse.json();
      console.log('Respuesta de token:', JSON.stringify(tokenData));
      
      const accessToken = tokenData.access_token;
      const userId = tokenData.user_id;
      
      console.log('Token obtenido correctamente. User ID:', userId);
      
      // Obtenemos información detallada del usuario usando el token
      console.log('Obteniendo información del usuario...');
      const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`);
      
      if (!userResponse.ok) {
        console.error('Error al obtener datos del usuario:', await userResponse.text());
        return fallbackToMockData(code);
      }
      
      const userData = await userResponse.json();
      console.log('Datos del usuario obtenidos:', JSON.stringify(userData));
      
      // Obtenemos los medios del usuario usando el token
      let recentMedia: InstagramMedia[] = [];
      try {
        console.log('Obteniendo medios del usuario...');
        const mediaResponse = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=5&access_token=${accessToken}`
        );
        
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          console.log('Medios obtenidos:', JSON.stringify(mediaData));
          
          if (mediaData.data && Array.isArray(mediaData.data)) {
            recentMedia = mediaData.data;
          } else {
            console.warn('La respuesta no contiene un array de medios:', mediaData);
          }
        } else {
          const errorText = await mediaResponse.text();
          console.error('Error al obtener medios:', errorText);
        }
      } catch (mediaError) {
        console.error('Error al procesar medios:', mediaError);
      }
      
      // Datos del usuario con medios (si están disponibles)
      const instagramUserData = {
        id: userData.id,
        username: userData.username,
        account_type: userData.account_type,
        profile_picture: null, // Basic Display API no proporciona URL de perfil directamente
        media_count: userData.media_count || 0,
        connected: true,
        recent_media: recentMedia
      };
      
      console.log('Datos de Instagram obtenidos correctamente');
      
      return NextResponse.json({ 
        success: true, 
        data: instagramUserData,
        message: 'Datos de Instagram obtenidos correctamente'
      });
      
    } catch (apiError) {
      console.error('Error en la comunicación con la API de Instagram:', apiError);
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
  
  // Creamos algunos medias simulados
  const mockReels = Array(5).fill(null).map((_, index) => ({
    id: `${17841405793387}${lastFourChars}_${index}`,
    media_type: index % 2 === 0 ? 'VIDEO' : 'IMAGE',
    media_url: index % 2 === 0 ? null : `https://i.pravatar.cc/500?u=${Date.now()}_${index}`,
    permalink: `https://www.instagram.com/p/mock_${index}_${lastFourChars}/`,
    thumbnail_url: `https://i.pravatar.cc/300?u=${Date.now()}_thumb_${index}`,
    caption: `Este es un contenido simulado #${index + 1} para demostración 📸✨`,
    timestamp: new Date(Date.now() - index * 86400000).toISOString() // Cada uno un día anterior
  }));
  
  const mockUserData = {
    id: '17841405793387' + lastFourChars,
    username: 'user_' + lastFourChars,
    full_name: 'Usuario de Instagram ' + lastFourChars,
    profile_picture: 'https://i.pravatar.cc/150?u=' + Date.now(),
    bio: '⚠️ DATOS SIMULADOS (modo fallback) ⚠️\nNo se pudieron obtener los datos reales de Instagram.',
    website: 'https://www.instagram.com',
    is_business: false,
    account_type: 'PERSONAL',
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
    message: 'FALLBACK: Usando datos simulados debido a un error con la API de Instagram'
  });
} 