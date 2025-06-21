'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon, ChatBubbleLeftRightIcon, SparklesIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations('landingPage');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0e35] to-[#2d1b69]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="Creator0x"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-white">Creator0x</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-indigo-600/50 text-indigo-300 hover:bg-indigo-600/20">
                {t('header.login')}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {t('header.register')}
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t('hero.title')}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Instagram</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/automations">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg">
                {t('hero.viewAutomations')}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-indigo-600/50 text-indigo-300 hover:bg-indigo-600/20 px-8 py-4 text-lg">
                {t('hero.startFree')}
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-[#1a0e35]/50 p-8 rounded-xl border border-indigo-900/30">
              <div className="bg-indigo-600/20 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('features.autoReplies.title')}</h3>
              <p className="text-gray-400">
                {t('features.autoReplies.description')}
              </p>
            </div>

            <div className="bg-[#1a0e35]/50 p-8 rounded-xl border border-indigo-900/30">
              <div className="bg-indigo-600/20 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('features.leadGeneration.title')}</h3>
              <p className="text-gray-400">
                {t('features.leadGeneration.description')}
              </p>
            </div>

            <div className="bg-[#1a0e35]/50 p-8 rounded-xl border border-indigo-900/30">
              <div className="bg-indigo-600/20 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('features.analytics.title')}</h3>
              <p className="text-gray-400">
                {t('features.analytics.description')}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-900/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image
                src="/images/logo.png"
                alt="Creator0x"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-semibold text-white">Creator0x</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                {t('footer.terms')}
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                {t('footer.login')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}