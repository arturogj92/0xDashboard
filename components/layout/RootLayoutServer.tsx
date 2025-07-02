import { headers } from 'next/headers';
import RootLayoutClient from './RootLayoutClient';

export default async function RootLayoutServer({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  
  // Detectar si es una landing pública por headers o pathname
  const isLandingHeader = headersList.get('x-is-public-landing');
  const pathname = headersList.get('x-pathname') || '';
  
  const isPublicLanding = isLandingHeader === 'true' || 
    (pathname.startsWith('/landing/') && pathname !== '/landing');
  
  // Si es una landing pública, renderizar solo el contenido
  if (isPublicLanding) {
    return <>{children}</>;
  }
  
  // Si no, renderizar con el layout completo
  return <RootLayoutClient>{children}</RootLayoutClient>;
}