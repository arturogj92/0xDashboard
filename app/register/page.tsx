'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const tRegister = useTranslations('register');
  const router = useRouter();
  
  // Redireccionar a home si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username || !email || !password) {
      setError(tRegister('errorRequiredFields'));
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({ username, email, password, name });
      if (!result.success) {
        setError(result.message || tRegister('errorRegister'));
      } else {
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      setError(err.message || tRegister('errorRegister'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/images/logo.png" 
              alt="0xReplyer Logo" 
              width={64} 
              height={64} 
            />
          </div>
          <h1 className="text-3xl font-bold text-white">{tRegister('title')}</h1>
          <p className="text-gray-400 mt-2">{tRegister('subtitle')}</p>
        </div>

        <div className="bg-[#120724] p-8 rounded-xl shadow-lg border border-indigo-900/30">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                {tRegister('labelUsername')} <span className="text-red-400">*</span>
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={tRegister('placeholderUsername')}
                className="bg-[#1c1033] border-indigo-900/50 text-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                {tRegister('labelEmail')} <span className="text-red-400">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tRegister('placeholderEmail')}
                className="bg-[#1c1033] border-indigo-900/50 text-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                {tRegister('labelName')}
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tRegister('placeholderName')}
                className="bg-[#1c1033] border-indigo-900/50 text-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                {tRegister('labelPassword')} <span className="text-red-400">*</span>
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tRegister('placeholderPassword')}
                className="bg-[#1c1033] border-indigo-900/50 text-white"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white mt-6"
              disabled={isLoading}
            >
              {isLoading ? tRegister('buttonCreating') : tRegister('buttonCreate')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              {tRegister('haveAccount')}{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                {tRegister('loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 