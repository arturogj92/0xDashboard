import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middlewarele condicional - Solo se activa en el VPS
export async function middleware(request: NextRequest) {
  // Si no estamos en el VPS, no hacer nada
  if (process.env.NEXT_PUBLIC_IS_VPS !== 'true') {
    return NextResponse.next();
  }

  const hostname = request.headers.get('host') || '';
  
  // Extraer subdominio
  const subdomain = getSubdomain(hostname);
  
  // Si hay subdominio (ej: art0xdev.creator0x.com)
  if (subdomain && subdomain !== 'www') {
    const url = request.nextUrl.clone();
    
    // Si ya está en /landing/, no reescribir
    if (url.pathname.startsWith('/landing/')) {
      const passThroughResponse = NextResponse.next();
      passThroughResponse.headers.set('x-middleware-debug', 'subdomain-passthrough');
      return passThroughResponse;
    }
    
    // NUEVO: Verificar si es una URL acortada (ej: art0xdev.creator0x.com/mi-enlace)
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    console.log(`[VPS Middleware] Path parts:`, pathParts, `Length: ${pathParts.length}`);
    
    if (pathParts.length === 1) {
      const slug = pathParts[0];
      
      // Intentar redirigir como URL acortada
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log(`[VPS Middleware] Intentando URL acortada: ${subdomain}/${slug}`);
        console.log(`[VPS Middleware] Backend URL: ${backendUrl}`);
        
        const redirectResponse = await fetch(`${backendUrl}/api/url-redirect/${slug}?username=${subdomain}`, {
          method: 'GET',
          redirect: 'manual', // No seguir redirects automáticamente
          headers: {
            'User-Agent': request.headers.get('user-agent') || 'VPS-Middleware/1.0',
            'X-Forwarded-For': request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            'X-Original-URL': `${hostname}${url.pathname}`
          }
        });
        
        console.log(`[VPS Middleware] URL redirect response status: ${redirectResponse.status}`);
        
        // Si es un redirect 302, seguir la redirección
        if (redirectResponse.status === 302) {
          const location = redirectResponse.headers.get('location');
          if (location) {
            console.log(`[VPS Middleware] ✅ Redirigiendo URL acortada ${subdomain}/${slug} → ${location}`);
            return NextResponse.redirect(location);
          }
        }
        
        // Log more details about non-redirect response
        const responseText = await redirectResponse.text();
        console.log(`[VPS Middleware] No es URL acortada válida. Status: ${redirectResponse.status}, Response: ${responseText.substring(0, 200)}`);
        
      } catch (error) {
        console.warn(`[VPS Middleware] Error verificando URL acortada: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continuar con lógica de landing en caso de error
      }
    } else {
      console.log(`[VPS Middleware] No es una URL de un solo segmento, saltando verificación de URL acortada`);
    }
    
    // Reescribir a /landing/[subdomain] (comportamiento original)
    url.pathname = `/landing/${subdomain}`;
    console.log(`[VPS Middleware] Subdominio ${subdomain} → ${url.pathname}`);
    const subdomainResponse = NextResponse.rewrite(url);
    subdomainResponse.headers.set('x-middleware-debug', 'subdomain-rewrite');
    return subdomainResponse;
  }
  
  // Para dominios personalizados (ej: elcaminodelprogramador.com o art0x.link)
  if (isCustomDomain(hostname)) {
    const url = request.nextUrl.clone();
    
    if (!url.pathname.startsWith('/landing/')) {
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      
      // NUEVO: Verificar si es una URL acortada con dominio personalizado (ej: art0x.link/mi-enlace)
      if (pathParts.length === 1) {
        const slug = pathParts[0];
        
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          console.log(`[VPS Middleware] Intentando URL acortada con dominio personalizado: ${hostname}/${slug}`);
          
          const redirectResponse = await fetch(`${backendUrl}/api/url-redirect/${slug}?domain=${hostname}`, {
            method: 'GET',
            redirect: 'manual',
            headers: {
              'User-Agent': request.headers.get('user-agent') || 'VPS-Middleware/1.0',
              'X-Forwarded-For': request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
              'X-Original-URL': `${hostname}${url.pathname}`
            }
          });
          
          console.log(`[VPS Middleware] URL redirect response status: ${redirectResponse.status}`);
          
          // Si es un redirect 302, seguir la redirección
          if (redirectResponse.status === 302) {
            const location = redirectResponse.headers.get('location');
            if (location) {
              console.log(`[VPS Middleware] Redirigiendo URL acortada ${hostname}/${slug} → ${location}`);
              return NextResponse.redirect(location);
            }
          }
          
          console.log(`[VPS Middleware] No es URL acortada válida para dominio personalizado, continuando con landing`);
          
        } catch (error) {
          console.warn(`[VPS Middleware] Error verificando URL acortada en dominio personalizado: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      // Si no es URL acortada, intentar resolver como landing page
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log(`[VPS Middleware] Consultando landing page: ${backendUrl}/api/custom-domains/resolve/${hostname}`);
        
        const response = await fetch(`${backendUrl}/api/custom-domains/resolve/${hostname}`, {
          headers: {
            'User-Agent': 'VPS-Middleware/1.0'
          }
        });
        
        console.log(`[VPS Middleware] Landing response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[VPS Middleware] Landing response data:`, data);
          
          if (data.success && data.slug) {
            url.pathname = `/landing/${data.slug}`;
            console.log(`[VPS Middleware] Dominio personalizado ${hostname} → ${url.pathname}`);
            const rewriteResponse = NextResponse.rewrite(url);
            rewriteResponse.headers.set('x-middleware-debug', 'custom-domain-rewrite');
            rewriteResponse.headers.set('x-resolved-slug', data.slug);
            return rewriteResponse;
          }
        } else {
          const errorText = await response.text();
          console.error(`[VPS Middleware] Error response: ${errorText}`);
        }
        
        console.warn(`[VPS Middleware] No se encontró landing activa para ${hostname}`);
        const notFoundResponse = NextResponse.next();
        notFoundResponse.headers.set('x-middleware-debug', 'custom-domain-not-found');
        return notFoundResponse;
        
      } catch (error) {
        console.error(`[VPS Middleware] Error consultando dominio ${hostname}:`, error);
        const errorResponse = NextResponse.next();
        errorResponse.headers.set('x-middleware-debug', 'custom-domain-error');
        return errorResponse;
      }
    }
  }
  
  // Si llegamos aquí sin subdominio ni dominio personalizado,
  // probablemente sea un error de configuración
  console.warn(`[VPS Middleware] No se pudo procesar: ${hostname}`);
  const unprocessedResponse = NextResponse.next();
  unprocessedResponse.headers.set('x-middleware-debug', 'unprocessed');
  return unprocessedResponse;
}

function getSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0];
  const parts = host.split('.');
  
  // Verificar si es subdominio de creator0x.com
  if (parts.length >= 3) {
    const baseDomain = parts.slice(-2).join('.');
    if (baseDomain === 'creator0x.com') {
      return parts[0];
    }
  }
  
  return null;
}

function isCustomDomain(hostname: string): boolean {
  // En el VPS, cualquier dominio que NO sea *.creator0x.com
  // se considera dominio personalizado
  return !hostname.includes('creator0x.com');
}

export const config = {
  matcher: '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};