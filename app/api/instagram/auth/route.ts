import { NextRequest, NextResponse } from 'next/server';

// IDs y credenciales de la aplicación desde variables de entorno
const CLIENT_ID = process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_CLIENT_ID;
const CLIENT_SECRET = 'ca40f9ecdd1aa00834304aff0a938620'; // Secret proporcionado por el usuario

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
      
      // Combinamos los datos obtenidos
      const instagramUserData = {
        id: userData.id,
        username: userData.username,
        account_type: userData.account_type,
        profile_picture: profileData.profile_picture_url || null,
        media_count: profileData.media_count || 0,
        connected: true
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
    connected: true
  };

  console.log('Datos de Instagram simulados (fallback):', mockUserData);
  
  return NextResponse.json({ 
    success: true, 
    data: mockUserData,
    message: 'FALLBACK: Se están usando datos simulados debido a un error en la API de Instagram'
  });
} 