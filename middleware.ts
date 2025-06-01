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
      const response = NextResponse.next();
      response.headers.set('x-middleware-debug', 'subdomain-passthrough');
      return response;
    }
    
    // Reescribir a /landing/[subdomain]
    url.pathname = `/landing/${subdomain}`;
    console.log(`[VPS Middleware] Subdominio ${subdomain} → ${url.pathname}`);
    const response = NextResponse.rewrite(url);
    response.headers.set('x-middleware-debug', 'subdomain-rewrite');
    return response;
  }
  
  // Para dominios personalizados (ej: elcaminodelprogramador.com)
  if (isCustomDomain(hostname)) {
    const url = request.nextUrl.clone();
    
    if (!url.pathname.startsWith('/landing/')) {
      try {
        // Consultar al backend para resolver el dominio
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log(`[VPS Middleware] Consultando: ${backendUrl}/api/custom-domains/resolve/${hostname}`);
        
        const response = await fetch(`${backendUrl}/api/custom-domains/resolve/${hostname}`, {
          headers: {
            'User-Agent': 'VPS-Middleware/1.0'
          }
        });
        
        console.log(`[VPS Middleware] Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[VPS Middleware] Response data:`, data);
          
          if (data.success && data.slug) {
            url.pathname = `/landing/${data.slug}`;
            console.log(`[VPS Middleware] Dominio personalizado ${hostname} → ${url.pathname}`);
            const response = NextResponse.rewrite(url);
            response.headers.set('x-middleware-debug', 'custom-domain-rewrite');
            response.headers.set('x-resolved-slug', data.slug);
            return response;
          }
        } else {
          const errorText = await response.text();
          console.error(`[VPS Middleware] Error response: ${errorText}`);
        }
        
        console.warn(`[VPS Middleware] No se encontró landing activa para ${hostname}`);
        const response = NextResponse.next();
        response.headers.set('x-middleware-debug', 'custom-domain-not-found');
        return response;
        
      } catch (error) {
        console.error(`[VPS Middleware] Error consultando dominio ${hostname}:`, error);
        const response = NextResponse.next();
        response.headers.set('x-middleware-debug', 'custom-domain-error');
        return response;
      }
    }
  }
  
  // Si llegamos aquí sin subdominio ni dominio personalizado,
  // probablemente sea un error de configuración
  console.warn(`[VPS Middleware] No se pudo procesar: ${hostname}`);
  const response = NextResponse.next();
  response.headers.set('x-middleware-debug', 'unprocessed');
  return response;
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