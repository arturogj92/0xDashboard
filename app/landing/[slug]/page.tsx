import { notFound } from 'next/navigation';
import PublicLandingPageDisplay from '@/components/landing/PublicLandingPageDisplay';
import { API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  console.log(`[Landing Page] Fetching landing for slug: ${slug}`);
  console.log(`[Landing Page] API URL: ${API_URL}/api/landings/slug/${slug}`);
  
  const res = await fetch(`${API_URL}/api/landings/slug/${slug}`, { cache: 'no-store' });

  console.log(`[Landing Page] Response status: ${res.status}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[Landing Page] Error response: ${errorText}`);
    
    if (res.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch landing: ${res.status} ${errorText}`);
  }

  const { data: landing } = await res.json();
  console.log(`[Landing Page] Successfully loaded landing: ${landing?.name}`);

  return <PublicLandingPageDisplay landing={landing} />;
}