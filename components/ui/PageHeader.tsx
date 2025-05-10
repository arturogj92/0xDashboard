'use client';

import React from 'react';
import Image from 'next/image';

export interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export function PageHeader({ icon, title, description, imageSrc, imageAlt }: PageHeaderProps) {
  return (
    <div className="mb-12 relative px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center mb-6 md:mb-0">
          <div className="text-[#eea015] mr-3">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-sm text-gray-400">
              {description}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={200}
            height={120}
            className="object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </div>
    </div>
  );
} 