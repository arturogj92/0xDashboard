'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, refreshUserProfile } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Si ya está autenticado, no es necesario hacer nada
      if (isAuthenticated) {
        setIsCheckingAuth(false);
        return;
      }

      // Si todavía está cargando el estado inicial, esperar
      if (isLoading) {
        return;
      }

      // Intentar refrescar el perfil para verificar si hay un token válido
      try {
        await refreshUserProfile();
        // El estado de isAuthenticated se actualizará en el contexto
      } catch (error) {
        console.error('Error verificando autenticación:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, refreshUserProfile]);

  useEffect(() => {
    // Solo redirigir cuando se ha completado la verificación y no está autenticado
    if (!isCheckingAuth && !isLoading && !isAuthenticated) {
      console.log('Redirigiendo a /login, usuario no autenticado');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isCheckingAuth, router]);

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Mostrar el contenido protegido solo si está autenticado
  return isAuthenticated ? <>{children}</> : null;
}; 