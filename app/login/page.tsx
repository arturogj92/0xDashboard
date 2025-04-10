'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
// TODO: Ejecutar `npm install react-icons` o `yarn add react-icons` para usar el icono
// import { FaFacebook } from "react-icons/fa"; 

// Definir tipo para la respuesta de la API /me de Facebook
type FacebookUserData = {
  id: string;
  name: string;
  email: string;
  picture: {
    data: {
      url: string;
    };
  };
};

// Definir tipo para la ventana global para acceder a FB
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB?: {
      init: (params: { appId: string; cookie: boolean; xfbml: boolean; version: string; }) => void;
      login: (callback: (response: any) => void, options: { scope: string; }) => void;
      api: (path: string, params: { fields: string; }, callback: (response: any) => void) => void;
      getLoginStatus: (callback: (response: any) => void) => void; // Opcional: útil para verificar estado inicial
    };
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFbLoading, setIsFbLoading] = useState(false);
  const [isFbSdkReady, setIsFbSdkReady] = useState(false);
  const { login, loginWithToken } = useAuth();
  const router = useRouter();

  const NEXT_PUBLIC_FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  useEffect(() => {
    if (!NEXT_PUBLIC_FACEBOOK_APP_ID) {
        console.error('Facebook App ID no configurado en variables de entorno.');
        setError('La configuración de inicio de sesión con Facebook no está completa.');
        return;
    }

    if (window.FB) {
      setIsFbSdkReady(true);
      return;
    }

    window.fbAsyncInit = function() {
      window.FB?.init({
        appId      : NEXT_PUBLIC_FACEBOOK_APP_ID!,
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
      console.log('Facebook SDK initialized.');
      setIsFbSdkReady(true); 
    };

    // Cargador del SDK - Corregido con const y tipado
    (function(d, s, id){
       const fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       // Declarar y asignar con const aquí para satisfacer al linter
       const js = d.createElement(s) as HTMLScriptElement; 
       js.id = id;
       js.src = "https://connect.facebook.net/es_ES/sdk.js"; 
       if (fjs && fjs.parentNode) {
         fjs.parentNode.insertBefore(js, fjs);
       }
     }(document, 'script', 'facebook-jssdk'));

  }, [NEXT_PUBLIC_FACEBOOK_APP_ID]);

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

  // --- Inicio de las nuevas funciones auxiliares ---
  const processFacebookUserData = async (userResponse: any, accessToken: string) => {
    if (userResponse && !userResponse.error) {
      const userData: FacebookUserData = {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email,
        picture: userResponse.picture
      };
      
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; 
        const res = await fetch(`${backendUrl}/api/auth/facebook/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userID: userData.id,
            email: userData.email,
            name: userData.name,
            accessToken: accessToken,
            picture: userData.picture
          }),
        });

        const data = await res.json();
        console.log('Backend response:', data);

        if (res.ok && data.success && data.data.token) {
          loginWithToken(data.data.token, data.data.user);
          console.log('Login con Facebook exitoso, redirigiendo...');
        } else {
          setError(data.message || 'Error del servidor al procesar login de Facebook');
        }
      } catch (err: any) {
        console.error('Error al llamar al backend:', err);
        setError('Error de conexión al intentar iniciar sesión con Facebook');
      }

    } else {
      console.error('Error obteniendo datos de usuario de Facebook:', userResponse.error);
      setError('No se pudieron obtener los datos de usuario de Facebook.');
    }
  };

  const processFacebookLoginResponse = (loginResponse: any) => {
    console.log('Facebook login response:', loginResponse);
    if (loginResponse.authResponse) {
      console.log('¡Autenticación de Facebook exitosa!');
      const accessToken = loginResponse.authResponse.accessToken;
      window.FB?.api('/me', { fields: 'id,name,email,picture' }, (userResponse) => {
        // Llamada a la función auxiliar async usando void
        void processFacebookUserData(userResponse, accessToken); 
      });
    } else {
      console.log('El usuario canceló el inicio de sesión o no autorizó completamente.');
      setError('Inicio de sesión con Facebook cancelado o no autorizado.');
    }
    setIsFbLoading(false); // Mover esto aquí para que se ejecute después de iniciar la llamada a FB.api
  };
  // --- Fin de las nuevas funciones auxiliares ---

  const handleFacebookLogin = () => {
    if (!isFbSdkReady || !window.FB) {
      setError('El SDK de Facebook no está listo. Inténtalo de nuevo en un momento.');
      return;
    }
    setIsFbLoading(true); // Mover setIsFbLoading(true) aquí
    setError(null);

    window.FB.login((loginResponse) => {
       // Llamada a la función auxiliar usando void
      void processFacebookLoginResponse(loginResponse);
    }, { scope: 'email,public_profile' });
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
                  disabled={isLoading || isFbLoading}
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
                  disabled={isLoading || isFbLoading}
                />
              </div>

              <div className="text-xs text-gray-400 text-center">
                Al iniciar sesión, aceptas nuestros{' '}
                <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline">
                  Términos de Servicio
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                disabled={isLoading || isFbLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-indigo-800/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#120724] px-2 text-gray-500">O continúa con</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-700 flex items-center justify-center space-x-2"
              onClick={handleFacebookLogin}
              disabled={!isFbSdkReady || isLoading || isFbLoading}
            >
              {isFbLoading ? (
                <span>Conectando con Facebook...</span>
              ) : (
                <>
                  {/* <FaFacebook className="w-5 h-5" /> Icono comentado hasta instalar react-icons */}
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" clipRule="evenodd" /></svg>
                  <span>Iniciar sesión con Facebook</span>
                </>
              )}
            </Button>

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