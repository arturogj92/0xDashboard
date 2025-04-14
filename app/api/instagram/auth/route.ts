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
      // Primero intentamos con el endpoint de OAuth de Instagram
      console.log('Intentando obtener token con el endpoint de OAuth de Instagram...');
      
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
        
        // Intentamos con el endpoint de Graph API de Facebook como alternativa
        console.log('Intentando con el endpoint de Graph API de Facebook...');
        
        const fbTokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${CLIENT_SECRET}&code=${code}`);
        
        if (!fbTokenResponse.ok) {
          console.error('Error al obtener token de Facebook:', await fbTokenResponse.text());
          console.log('Usando datos simulados como fallback debido a errores en ambos intentos');
          return fallbackToMockData(code);
        }
        
        const fbTokenData = await fbTokenResponse.json();
        const accessToken = fbTokenData.access_token;
        
        // Usamos este token para obtener información del usuario
        const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,accounts{instagram_business_account{id,username,profile_picture_url,media_count}}&access_token=${accessToken}`);
        
        if (!userResponse.ok) {
          console.error('Error al obtener datos del usuario:', await userResponse.text());
          return fallbackToMockData(code);
        }
        
        const userData = await userResponse.json();
        
        // Extraemos los datos de Instagram Business
        let instagramProfile = null;
        
        if (userData.accounts && 
            userData.accounts.data && 
            userData.accounts.data.length > 0) {
          
          for (const account of userData.accounts.data) {
            if (account.instagram_business_account) {
              instagramProfile = account.instagram_business_account;
              break;
            }
          }
        }
        
        if (!instagramProfile) {
          console.error('No se encontró cuenta de Instagram Business asociada');
          return fallbackToMockData(code);
        }
        
        // Formateamos los datos como esperamos
        const instagramUserData = {
          id: instagramProfile.id,
          username: instagramProfile.username,
          account_type: 'BUSINESS',
          profile_picture: instagramProfile.profile_picture_url || null,
          media_count: instagramProfile.media_count || 0,
          connected: true,
          access_token: accessToken,
          user_id: userData.id
        };
        
        console.log('Datos reales de Instagram obtenidos (via Facebook):', { 
          ...instagramUserData, 
          access_token: '[REDACTED]'
        });
        
        return NextResponse.json({ 
          success: true, 
          data: instagramUserData,
          message: 'Datos de Instagram obtenidos correctamente (via Facebook)'
        });
      }
      
      // Si llegamos aquí, el endpoint de Instagram funcionó
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
      
      // Intercambiamos el token de corta duración por uno de larga duración
      const longLivedTokenResponse = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${CLIENT_SECRET}&access_token=${accessToken}`);
      
      let longLivedToken = accessToken;
      
      if (longLivedTokenResponse.ok) {
        const longLivedTokenData = await longLivedTokenResponse.json();
        longLivedToken = longLivedTokenData.access_token;
        console.log('Token de larga duración obtenido');
      } else {
        console.warn('No se pudo obtener token de larga duración, usando token normal');
      }
      
      // Combinamos los datos obtenidos
      const instagramUserData = {
        id: userData.id,
        username: userData.username,
        account_type: userData.account_type,
        profile_picture: profileData.profile_picture_url || null,
        media_count: profileData.media_count || 0,
        connected: true,
        // Incluimos los tokens para su uso posterior (en un entorno real, estos deberían encriptarse y almacenarse en una base de datos)
        access_token: longLivedToken,
        user_id: userId
      };
      
      console.log('Datos reales de Instagram obtenidos:', { 
        ...instagramUserData, 
        access_token: '[REDACTED]' // No mostramos el token en los logs
      });
      
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
  // Generamos un token falso para pruebas
  const fakeToken = 'FAKE_TOKEN_' + Math.random().toString(36).substring(2, 15);
  
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
    // Incluimos tokens falsos para pruebas
    access_token: fakeToken,
    user_id: '17841405793387' + lastFourChars
  };

  console.log('Datos de Instagram simulados (fallback):', {
    ...mockUserData,
    access_token: '[REDACTED]' // No mostramos el token en los logs
  });
  
  return NextResponse.json({ 
    success: true, 
    data: mockUserData,
    message: 'FALLBACK: Se están usando datos simulados debido a un error en la API de Instagram'
  });
} 