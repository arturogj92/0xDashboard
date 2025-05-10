'use client';

import React from 'react';
import { FaInstagram, FaPlug } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export function InstagramProfileHeader() {
  const { user } = useAuth();
  const t = useTranslations('dashboard');
  if (!user?.isInstagramLinked || !user.isInstagramTokenValid || !user.instagram_username) {
    return null;
  }
  return (
    <div className="flex items-center gap-3 mt-6 bg-[#1c1033] px-4 py-2 rounded-lg border border-indigo-900/50 w-fit">
      <FaInstagram className="text-pink-500 w-6 h-6" />
      {user.instagram_profile_pic_url && (
        <img
          src={user.instagram_profile_pic_url}
          alt={user.instagram_username}
          className="w-8 h-8 rounded-full object-cover border border-pink-500"
        />
      )}
      <span className="text-white font-medium">{user.instagram_username}</span>
      <span className="flex items-center text-xs text-green-400 ml-2 font-semibold space-x-2">
        <FaPlug className="inline-block text-green-400" />
        <span>{t('connectedText')}</span>
        <span className="relative inline-flex h-3 w-3 justify-center items-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-[ping_1s_ease-in-out_infinite]" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
      </span>
    </div>
  );
} 