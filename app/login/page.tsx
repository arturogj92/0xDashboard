'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Iniciando proceso de login con:', email);
      const result = await login({ email, password });
      console.log('Resultado del login:', result);
      
      if (!result.success) {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      console.error('Error al intentar login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
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
            <h1 className="text-3xl font-bold text-white">Bienvenido de nuevo</h1>
            <p className="text-gray-400 mt-2">Inicia sesión en tu cuenta</p>
          </div>

          <div className="bg-[#120724] p-8 rounded-xl shadow-lg border border-indigo-900/30">
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="bg-[#1c1033] border-indigo-900/50 text-white"
                  disabled={isLoading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                    Contraseña
                  </label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#1c1033] border-indigo-900/50 text-white"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-400">
                ¿No tienes una cuenta?{' '}
                <Link href="/register" className="text-indigo-400 hover:text-indigo-300">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 