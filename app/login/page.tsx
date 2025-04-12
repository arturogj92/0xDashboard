'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
// Importar componentes de Google Login
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
// Importar la función de API
import { loginWithGoogle } from '@/lib/api';
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
      init: (params: { 
        appId: string; 
        cookie: boolean; 
        xfbml: boolean; 
        version: string;
        config_id?: string;
      }) => void;
      login: (
        callback: (response: any) => void, 
        options: { 
          scope: string;
          config_id?: string;
          auth_type?: string;
        }
      ) => void;
      api: (path: string, params: { fields: string; }, callback: (response: any) => void) => void;
      getLoginStatus: (callback: (response: any) => void) => void;
    };
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFbLoading, setIsFbLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isFbSdkReady, setIsFbSdkReady] = useState(false);
  const { login, loginWithToken } = useAuth();
  const router = useRouter();

  const NEXT_PUBLIC_FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const NEXT_PUBLIC_FACEBOOK_API_VERSION = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v17.0';
  const NEXT_PUBLIC_FACEBOOK_CONFIG_ID = process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID;

  useEffect(() => {
    console.log('NEXT_PUBLIC_FACEBOOK_APP_ID:', NEXT_PUBLIC_FACEBOOK_APP_ID);
    console.log('NEXT_PUBLIC_FACEBOOK_CONFIG_ID:', NEXT_PUBLIC_FACEBOOK_CONFIG_ID);
    console.log('NEXT_PUBLIC_FACEBOOK_APP_ID (original):', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID);
    
    if (!NEXT_PUBLIC_FACEBOOK_APP_ID) {
        console.error('Facebook App ID no configurado en variables de entorno.');
        // No establecer error general aquí, solo para FB
        // setError('La configuración de inicio de sesión con Facebook no está completa.');
        return;
    }

    if (!NEXT_PUBLIC_FACEBOOK_CONFIG_ID) {
        console.error('Facebook Config ID no configurado. Es necesario para el login de Facebook Business.');
        // No establecer error general aquí, solo para FB
       // setError('La configuración de inicio de sesión con Facebook Business no está completa.');
        return;
    }

    if (window.FB) {
      setIsFbSdkReady(true);
      return;
    }

    window.fbAsyncInit = function() {
      window.FB?.init({
        appId: NEXT_PUBLIC_FACEBOOK_APP_ID!,
        cookie: true,
        xfbml: true,
        version: NEXT_PUBLIC_FACEBOOK_API_VERSION,
        config_id: NEXT_PUBLIC_FACEBOOK_CONFIG_ID
      });
      console.log('Facebook SDK initialized with Business configuration.');
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

  }, [NEXT_PUBLIC_FACEBOOK_APP_ID, NEXT_PUBLIC_FACEBOOK_API_VERSION, NEXT_PUBLIC_FACEBOOK_CONFIG_ID]);

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
      // La redirección ahora la maneja el AuthContext
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
        // Usar la variable específica para la URL del backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
        if (!apiUrl) {
          console.error('Error: NEXT_PUBLIC_API_URL no está configurado en .env.local');
          setError('La configuración de la aplicación está incompleta (API URL). Contacta al administrador.');
          setIsFbLoading(false);
          return;
        }
        console.log('Intentando conectar con el backend en:', apiUrl);
        
        // La ruta correcta debe incluir /api
        const res = await fetch(`${apiUrl}/api/auth/facebook/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Importante para CORS
          body: JSON.stringify({
            userID: userData.id,
            email: userData.email,
            name: userData.name,
            accessToken: accessToken,
            picture: userData.picture
          }),
        });

        if (!res.ok) {
          console.error('Error en la respuesta del servidor:', res.status, res.statusText);
          const errorData = await res.text();
          console.error('Detalles del error:', errorData);
          throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('Backend response:', data);

        if (res.ok && data.success && data.data.token) {
          loginWithToken(data.data.token, data.data.user);
          console.log('Login con Facebook exitoso, redirigiendo...');
           // La redirección ahora la maneja el AuthContext
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
    // Asegurarse de que isFbLoading se ponga a false aquí también
    setIsFbLoading(false);
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
      setIsFbLoading(false); // Poner loading a false si falla la autenticación inicial
    }
    //setIsFbLoading(false); // Se movió a processFacebookUserData y al else
  };
  // --- Fin de las nuevas funciones auxiliares ---

  const handleFacebookLogin = () => {
    if (!isFbSdkReady || !window.FB) {
      setError('El SDK de Facebook no está listo. Inténtalo de nuevo en un momento.');
      return;
    }
    setIsFbLoading(true);
    setError(null);

    window.FB.login((loginResponse) => {
      // No usar void directamente aquí, llamar a la función
      processFacebookLoginResponse(loginResponse);
    }, { 
      config_id: NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
      scope: 'public_profile,email,business_management,instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_manage_metadata,pages_show_list,pages_messaging,pages_manage_engagement',
      auth_type: 'rerequest'
    });
  };

  // Función para detectar si es un dispositivo móvil
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    
    // Mejor detección de dispositivos móviles usando userAgent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileByUA = Boolean(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
      (userAgent.includes('Mobi') || userAgent.includes('Android'))
    );
    
    // Algunos navegadores en tablets pueden reportar false negatives, agregamos detección por tamaño
    const isMobileBySize = typeof window !== 'undefined' && window.innerWidth < 768;
    
    console.log(`Detección móvil: UA=${isMobileByUA}, Size=${isMobileBySize}, Final=${isMobileByUA || isMobileBySize}`);
    
    return isMobileByUA || isMobileBySize;
  };

  // Función para iniciar login con Google
  const initiateGoogleLogin = () => {
    setError(null);
    setIsLoadingGoogle(true);
    
    try {
      // Verificar si estamos en un dispositivo móvil
      const mobile = isMobile();
      console.log(`Iniciando login con Google. Dispositivo móvil: ${mobile}`);
      
      if (mobile) {
        // Construir la URL del callback basada en el origin actual
        const origin = window.location.origin;
        const redirectUri = `https://0xreplyer-production.up.railway.app/api/auth/google/mobile-callback`;
        console.log(`Redirect URI: ${redirectUri}`);
        
        // Client ID debe estar disponible
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID no está configurado');
          setError('Error en la configuración de autenticación. Contacte al administrador.');
          setIsLoadingGoogle(false);
          return;
        }
        
        // Construir URL de autenticación Google con parámetros más seguros
        const googleLoginUrl = 
          `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(clientId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent('email profile')}` +
          `&prompt=select_account` +
          `&access_type=online`;
        
        console.log(`Redirigiendo a: ${googleLoginUrl}`);
        
        // Redireccionar a la URL de autenticación de Google
        window.location.href = googleLoginUrl;
        return;
      }
      
      // Si no es móvil, usar el método de popup como antes
      console.log('Usando método popup para escritorio');
      const googleLoginButton = document.getElementById('google-login-button');
      if (googleLoginButton) {
        const clickableButton = googleLoginButton.querySelector('div[role="button"]');
        if (clickableButton) {
          (clickableButton as HTMLElement).click();
        } else {
          throw new Error('No se encontró el botón clickeable de Google');
        }
      } else {
        throw new Error('No se encontró el elemento #google-login-button');
      }
    } catch (error) {
      console.error('Error al iniciar login con Google:', error);
      setError("No se pudo iniciar el login con Google. Inténtalo de nuevo.");
      setIsLoadingGoogle(false);
    }
  };

  // --- Funciones para Google Login ---
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError(null);
    setIsLoadingGoogle(true);
    console.log("Google Login Success (credentialResponse):", credentialResponse);

    if (!credentialResponse.credential) {
      console.error("No se recibió credential (idToken) de Google.");
      setError("Error al obtener credenciales de Google.");
      setIsLoadingGoogle(false);
      return;
    }

    try {
      const response = await loginWithGoogle(credentialResponse.credential);
      console.log("Respuesta del backend (Google):");
      console.log(response);

      if (response.success && response.data) {
        console.log("Login con Google exitoso via backend:", response.data);
        loginWithToken(response.data.token, response.data.user);
        // La redirección ahora la maneja el AuthContext
      } else {
        setError(response.message || 'Error al iniciar sesión con Google desde el backend.');
      }
    } catch (err) {
      console.error("Error llamando al backend con Google Token:", err);
      setError('Ocurrió un error inesperado durante el login con Google. Inténtalo de nuevo.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    setError('Fallo al iniciar sesión con Google. Inténtalo de nuevo.');
    setIsLoadingGoogle(false); // Asegurarse de resetear el loading
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
                  disabled={isLoading || isFbLoading || isLoadingGoogle}
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
                  disabled={isLoading || isFbLoading || isLoadingGoogle}
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
                disabled={isLoading || isFbLoading || isLoadingGoogle}
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

            {/* Botón de Facebook */}
            <Button
              variant="outline"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-700 flex items-center justify-center space-x-2 mb-4"
              onClick={handleFacebookLogin}
              disabled={!isFbSdkReady || isLoading || isFbLoading || isLoadingGoogle}
            >
              {isFbLoading ? (
                <span>Conectando con Facebook...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" clipRule="evenodd" /></svg>
                  <span>Iniciar sesión con Facebook</span>
                </>
              )}
            </Button>

            {/* Botón personalizado para Google Login */}
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 flex items-center justify-center space-x-2 mb-4 shadow-sm"
              onClick={initiateGoogleLogin}
              disabled={isLoading || isFbLoading || isLoadingGoogle}
            >
              {isLoadingGoogle ? (
                <span className="text-gray-500">Verificando con Google...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Iniciar sesión con Google</span>
                </>
              )}
            </Button>

            {/* Botón original de Google oculto para ser activado programáticamente */}
            <div 
              id="google-login-button" 
              className="hidden"
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
              />
            </div>

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