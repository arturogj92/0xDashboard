import { notFound } from 'next/navigation';
import PublicLandingPageDisplay from '@/components/landing/PublicLandingPageDisplay';
import { API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetch(`${API_URL}/api/landings/slug/${slug}`, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch landing');
  }

  const { data: landing } = await res.json();

  return <PublicLandingPageDisplay landing={landing} />;
}