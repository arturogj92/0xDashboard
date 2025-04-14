import { NextRequest, NextResponse } from 'next/server';

// Credenciales
const CLIENT_SECRET = 'ca40f9ecdd1aa00834304aff0a938620';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, userId, limit = 10 } = await request.json();

    if (!accessToken || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Se requiere token de acceso y ID de usuario' 
      }, { status: 400 });
    }

    console.log(`Obteniendo reels para el usuario ${userId}, límite: ${limit}`);

    try {
      // Primero intentamos obtener directamente los medios de usuario
      // Esta aproximación funciona si el token es de Instagram directamente
      console.log('Intentando obtener medios directamente...');
      
      const directMediaResponse = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&limit=${limit}&access_token=${accessToken}`
      );
      
      if (directMediaResponse.ok) {
        const directMediaData = await directMediaResponse.json();
        
        // Filtramos para obtener solo los reels (tipo VIDEO)
        const reels = directMediaData.data.filter((media: any) => 
          media.media_type === 'VIDEO'
        ).map((reel: any) => ({
          id: reel.id,
          caption: reel.caption || '',
          media_type: reel.media_type,
          media_url: reel.media_url,
          permalink: reel.permalink,
          thumbnail_url: reel.thumbnail_url,
          timestamp: reel.timestamp,
          username: reel.username
        }));
        
        console.log(`Se encontraron ${reels.length} reels directamente`);
        
        return NextResponse.json({
          success: true,
          data: reels,
          message: 'Reels obtenidos correctamente (método directo)'
        });
      } else {
        console.log('No se pudieron obtener medios directamente, intentando método de Facebook...');
      }
      
      // Si no funciona el método directo, intentamos a través de la cuenta de Facebook
      // Primero obtenemos el ID del negocio de Instagram asociado con el usuario
      const accountsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${userId}/accounts?access_token=${accessToken}`
      );

      if (!accountsResponse.ok) {
        console.error('Error al obtener cuentas:', await accountsResponse.text());
        
        // Si falla esto también, intentamos obtener directamente la información de Instagram business
        console.log('Intentando obtener información directamente de Facebook...');
        
        const meResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=accounts{instagram_business_account{id}}&access_token=${accessToken}`
        );
        
        if (!meResponse.ok) {
          return NextResponse.json({ 
            success: false, 
            error: 'No se pudieron obtener las cuentas ni con OAuth ni con Graph API' 
          }, { status: 500 });
        }
        
        const meData = await meResponse.json();
        let instagramBusinessAccountId = null;
        
        if (meData.accounts && 
            meData.accounts.data && 
            meData.accounts.data.length > 0) {
          
          for (const account of meData.accounts.data) {
            if (account.instagram_business_account) {
              instagramBusinessAccountId = account.instagram_business_account.id;
              break;
            }
          }
        }
        
        if (!instagramBusinessAccountId) {
          return NextResponse.json({ 
            success: false, 
            error: 'No se encontró cuenta de Instagram Business asociada en datos del usuario' 
          }, { status: 404 });
        }
        
        // Continuamos con el ID de Instagram Business encontrado
        return getMediaFromInstagramBusinessAccount(instagramBusinessAccountId, accessToken, limit);
      }

      const accountsData = await accountsResponse.json();
      
      if (!accountsData.data || accountsData.data.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'No se encontraron páginas de Facebook asociadas' 
        }, { status: 404 });
      }

      // Obtenemos el ID de Instagram Business asociado a la página de Facebook
      let instagramBusinessAccountId = null;
      
      for (const account of accountsData.data) {
        const pageId = account.id;
        
        const pageResponse = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
        );
        
        if (pageResponse.ok) {
          const pageData = await pageResponse.json();
          if (pageData.instagram_business_account) {
            instagramBusinessAccountId = pageData.instagram_business_account.id;
            break;
          }
        }
      }

      if (!instagramBusinessAccountId) {
        return NextResponse.json({ 
          success: false, 
          error: 'No se encontró cuenta de Instagram Business asociada' 
        }, { status: 404 });
      }
      
      return getMediaFromInstagramBusinessAccount(instagramBusinessAccountId, accessToken, limit);
      
    } catch (error) {
      console.error('Error al obtener reels de Instagram:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error al procesar la solicitud de reels de Instagram: ' + (error as Error).message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error general al obtener reels:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al procesar la solicitud de reels de Instagram' 
    }, { status: 500 });
  }
}

// Función auxiliar para obtener medios de una cuenta de Instagram Business
async function getMediaFromInstagramBusinessAccount(instagramBusinessAccountId: string, accessToken: string, limit: number) {
  console.log(`ID de Instagram Business encontrado: ${instagramBusinessAccountId}`);

  // Obtenemos los medios (incluyendo reels) de la cuenta de Instagram Business
  const mediaResponse = await fetch(
    `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{media_url,media_type,thumbnail_url}&limit=${limit}&access_token=${accessToken}`
  );

  if (!mediaResponse.ok) {
    console.error('Error al obtener medios:', await mediaResponse.text());
    return NextResponse.json({ 
      success: false, 
      error: 'No se pudieron obtener los medios de Instagram' 
    }, { status: 500 });
  }

  const mediaData = await mediaResponse.json();
  
  // Filtramos para obtener solo los reels (tipo VIDEO o REELS)
  const reels = mediaData.data.filter((media: any) => 
    media.media_type === 'VIDEO' || 
    media.media_type === 'REELS'
  ).map((reel: any) => ({
    id: reel.id,
    caption: reel.caption || '',
    media_type: reel.media_type,
    media_url: reel.media_url,
    permalink: reel.permalink,
    thumbnail_url: reel.thumbnail_url,
    timestamp: reel.timestamp,
    username: reel.username
  }));

  console.log(`Se encontraron ${reels.length} reels a través de Instagram Business`);

  return NextResponse.json({
    success: true,
    data: reels,
    message: 'Reels obtenidos correctamente (método Business)'
  });
} 