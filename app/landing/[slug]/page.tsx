import { notFound } from 'next/navigation';
import PublicLandingPageDisplay from '@/components/landing/PublicLandingPageDisplay';
import { API_URL } from '@/lib/api';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export default async function Page({ params: { slug } }: PageProps) {
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