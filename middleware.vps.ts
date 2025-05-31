import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware para VPS - Solo maneja subdominios y dominios personalizados
// NO necesita redirigir a Vercel porque el DNS ya lo maneja
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Extraer subdominio
  const subdomain = getSubdomain(hostname);
  
  // Si hay subdominio (ej: art0xdev.creator0x.com)
  if (subdomain && subdomain !== 'www') {
    const url = request.nextUrl.clone();
    
    // Si ya está en /landing/, no reescribir
    if (url.pathname.startsWith('/landing/')) {
      return NextResponse.next();
    }
    
    // Reescribir a /landing/[subdomain]
    url.pathname = `/landing/${subdomain}${pathname}`;
    console.log(`[VPS Middleware] Subdominio ${subdomain} → ${url.pathname}`);
    return NextResponse.rewrite(url);
  }
  
  // Para dominios personalizados (ej: art0x.dev)
  // Nginx puede pasar un header con el slug correcto
  const customSlug = request.headers.get('x-custom-domain-slug');
  
  if (customSlug || isCustomDomain(hostname)) {
    const url = request.nextUrl.clone();
    const slug = customSlug || hostname.split('.')[0];
    
    if (!url.pathname.startsWith('/landing/')) {
      url.pathname = `/landing/${slug}${pathname}`;
      console.log(`[VPS Middleware] Dominio personalizado ${hostname} → ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
  }
  
  // Si llegamos aquí sin subdominio ni dominio personalizado,
  // probablemente sea un error de configuración
  console.warn(`[VPS Middleware] No se pudo procesar: ${hostname}`);
  return NextResponse.next();
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
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};