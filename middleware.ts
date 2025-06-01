import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      return NextResponse.next();
    }
    
    // Reescribir a /landing/[subdomain]
    url.pathname = `/landing/${subdomain}`;
    console.log(`[VPS Middleware] Subdominio ${subdomain} → ${url.pathname}`);
    return NextResponse.rewrite(url);
  }
  
  // Para dominios personalizados (ej: elcaminodelprogramador.com)
  if (isCustomDomain(hostname)) {
    const url = request.nextUrl.clone();
    
    if (!url.pathname.startsWith('/landing/')) {
      try {
        // Buscar en la base de datos qué landing corresponde a este dominio
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: customDomain } = await supabase
          .from('custom_domains')
          .select(`
            landing_id,
            landings!inner(slug)
          `)
          .eq('domain', hostname)
          .eq('status', 'active')
          .single();
        
        if (customDomain?.landings?.slug) {
          url.pathname = `/landing/${customDomain.landings.slug}`;
          console.log(`[VPS Middleware] Dominio personalizado ${hostname} → ${url.pathname}`);
          return NextResponse.rewrite(url);
        } else {
          console.warn(`[VPS Middleware] No se encontró landing activa para ${hostname}`);
          // Fallback: mostrar página de error o página principal
          return NextResponse.next();
        }
      } catch (error) {
        console.error(`[VPS Middleware] Error consultando dominio ${hostname}:`, error);
        return NextResponse.next();
      }
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
  matcher: '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};