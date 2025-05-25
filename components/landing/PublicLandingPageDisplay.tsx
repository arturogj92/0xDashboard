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

  useEffect(() => {
    // Los datos ya vienen incluidos desde el endpoint /api/landings/slug/${slug}
    if (landing.links) setLinks(landing.links);
    if (landing.sections) setSections(landing.sections);
    if (landing.socialLinks) setSocialLinks(landing.socialLinks);
    setLoading(false);
  }, [landing]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4">
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