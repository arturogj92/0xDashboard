import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el hostname de la request
  const hostname = request.headers.get('host') || '';
  
  // Verificar si estamos en desarrollo local
  const isLocalhost = hostname.includes('localhost');
  
  // Definir los dominios base permitidos
  const baseDomains = [
    'creator0x.com',
    'www.creator0x.com',
    // Añadir aquí otros dominios base si es necesario
  ];
  
  // Si es localhost o un dominio base, continuar normal
  if (isLocalhost || baseDomains.some(domain => hostname === domain)) {
    return NextResponse.next();
  }
  
  // Extraer el subdominio
  const subdomain = getSubdomain(hostname);
  
  // Si hay un subdominio y no es 'www'
  if (subdomain && subdomain !== 'www') {
    // Redirigir internamente a /landing/[slug]
    const url = request.nextUrl.clone();
    
    // Si la URL ya incluye /landing/, evitar redirección infinita
    if (url.pathname.startsWith('/landing/')) {
      return NextResponse.next();
    }
    
    // Reescribir la URL para que vaya a /landing/[subdomain]
    url.pathname = `/landing/${subdomain}${url.pathname}`;
    console.log(`[Middleware] Rewriting ${hostname} to ${url.pathname}`);
    
    return NextResponse.rewrite(url);
  }
  
  // Para dominios personalizados (ej: art0x.dev)
  // Si no es un dominio base ni tiene subdominio, asumimos que es un dominio personalizado
  const isCustomDomain = !baseDomains.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
  
  if (isCustomDomain) {
    // Para dominios personalizados, buscar el slug en el header personalizado
    // que Nginx puede configurar
    const customSlug = request.headers.get('x-custom-domain-slug');
    
    const url = request.nextUrl.clone();
    
    // Evitar redirección infinita
    if (url.pathname.startsWith('/landing/')) {
      return NextResponse.next();
    }
    
    // Si tenemos un slug personalizado del header, usarlo
    // Si no, intentar derivarlo del dominio
    const slug = customSlug || hostname.split('.')[0];
    url.pathname = `/landing/${slug}${url.pathname}`;
    
    console.log(`[Middleware] Custom domain ${hostname} -> ${url.pathname} (slug: ${slug})`);
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

// Función helper para extraer el subdominio
function getSubdomain(hostname: string): string | null {
  // Remover puerto si existe
  const host = hostname.split(':')[0];
  
  // Separar por puntos
  const parts = host.split('.');
  
  // Si tiene 3 o más partes y termina con un dominio conocido
  if (parts.length >= 3) {
    // Verificar si es un dominio base conocido
    const baseDomain = parts.slice(-2).join('.');
    if (['creator0x.com'].includes(baseDomain)) {
      return parts[0];
    }
  }
  
  return null;
}

// Configurar en qué rutas NO debe ejecutarse el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};