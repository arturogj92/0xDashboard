"use client";
import React, { useState, useEffect } from 'react';
import { LandingPreview } from '@/components/landing/LandingPreview';
import { LinkData, SectionData, SocialLinkData } from '@/components/editor/types';
import { API_URL } from '@/lib/api';

export interface PublicLandingPageDisplayProps {
  landing: {
    id: string;
    name: string;
    description: string;
    settings: any;
    slug: string;
  };
}

export default function PublicLandingPageDisplay({ landing }: PublicLandingPageDisplayProps) {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [linksResponse, sectionsResponse, socialLinksResponse] = await Promise.all([
          fetch(`${API_URL}/api/links/public?landingId=${landing.id}`, { cache: 'no-store' }),
          fetch(`${API_URL}/api/sections/public?landingId=${landing.id}`, { cache: 'no-store' }),
          fetch(`${API_URL}/api/social-links/public?landingId=${landing.id}`, { cache: 'no-store' })
        ]);

        if (linksResponse.ok) {
          const linksData = await linksResponse.json();
          if (Array.isArray(linksData)) setLinks(linksData);
        }

        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json();
          if (Array.isArray(sectionsData)) setSections(sectionsData);
        }

        if (socialLinksResponse.ok) {
          const socialLinksData = await socialLinksResponse.json();
          if (Array.isArray(socialLinksData)) setSocialLinks(socialLinksData);
        }
      } catch (error) {
        console.error('Error fetching landing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, [landing.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#230447] to-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#230447] to-black">
      <div className="max-w-md mx-auto">
        <LandingPreview 
          name={landing.name} 
          description={landing.description}
          links={links}
          sections={sections}
          socialLinks={socialLinks}
        />
      </div>
    </div>
  );
} 