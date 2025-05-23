"use client";
import React from 'react';
import { LandingPreview } from '@/components/landing/LandingPreview';

export interface PublicLandingPageDisplayProps {
  landing: {
    name: string;
    description: string;
    settings: any;
  };
}

export default function PublicLandingPageDisplay({ landing }: PublicLandingPageDisplayProps) {
  return (
    <div className="flex justify-center p-8 bg-gray-100 min-h-screen">
      <LandingPreview name={landing.name} description={landing.description} />
    </div>
  );
} 