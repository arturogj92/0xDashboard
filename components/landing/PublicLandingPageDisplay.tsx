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
    theme_id?: string;
    links?: LinkData[];
    sections?: SectionData[];
    socialLinks?: SocialLinkData[];
  };
}

export default function PublicLandingPageDisplay({ landing }: PublicLandingPageDisplayProps) {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug: Log del theme_id
  console.log('[PublicLandingPageDisplay] Landing data:', { 
    name: landing.name, 
    theme_id: landing.theme_id 
  });

  useEffect(() => {
    // Los datos ya vienen incluidos desde el endpoint /api/landings/slug/${slug}
    if (landing.links) setLinks(landing.links);
    if (landing.sections) setSections(landing.sections);
    if (landing.socialLinks) setSocialLinks(landing.socialLinks);
    setLoading(false);

  }, [landing]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex: 9999 }}
    >
      <LandingPreview 
        name={landing.name} 
        description={landing.description}
        links={links}
        sections={sections}
        socialLinks={socialLinks}
        isPreview={false}
        themeId={landing.theme_id || 'gradient-purple'}
      />
    </div>
  );
} 