'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import { User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">Perfil de Usuario</h1>
            <p className="text-gray-400 mt-2">Información de tu cuenta</p>
          </div>

          <div className="bg-[#120724] p-8 rounded-xl shadow-lg border border-indigo-900/30">
            <div className="flex flex-col md:flex-row items-center mb-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-indigo-900/60 flex items-center justify-center mb-4 md:mb-0 md:mr-8">
                {user?.avatar_url ? (
                  <Image 
                    src={user.avatar_url} 
                    alt={user.name || user.username} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <UserIcon className="h-12 w-12 text-white/60" />
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-white">{user?.name || user?.username}</h2>
                <p className="text-md text-gray-400">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">Usuario desde {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Información de la cuenta</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nombre de usuario
                    </label>
                    <div className="p-3 bg-[#1c1033] border border-indigo-900/50 rounded-md text-white">
                      {user?.username}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Correo electrónico
                    </label>
                    <div className="p-3 bg-[#1c1033] border border-indigo-900/50 rounded-md text-white">
                      {user?.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Nombre completo
                    </label>
                    <div className="p-3 bg-[#1c1033] border border-indigo-900/50 rounded-md text-white">
                      {user?.name || "No establecido"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-indigo-900/50 pt-6 flex justify-between">
                <Button
                  variant="outline"
                  className="border-red-700/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  onClick={logout}
                >
                  Cerrar sesión
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  onClick={() => router.push('/')}
                >
                  Ir al Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 