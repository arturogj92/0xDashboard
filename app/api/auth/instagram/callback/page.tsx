"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaInstagram } from "react-icons/fa";

export default function InstagramCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) {
      setStatus('error');
      setMessage("No se recibió el código de autorización de Instagram.");
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setStatus('error');
      setMessage("Debes iniciar sesión para vincular tu cuenta de Instagram.");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
    fetch(`${apiUrl}/api/auth/link-instagram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      credentials: "include",
      body: JSON.stringify({ code })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
          setMessage("¡Cuenta de Instagram vinculada correctamente!");
          setTimeout(() => {
            router.replace("/");
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.message || "No se pudo vincular la cuenta de Instagram.");
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage("Error de red al vincular la cuenta de Instagram.");
      });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#120724] px-4">
      <div className="bg-[#1c1033] border border-indigo-900/50 rounded-xl p-8 max-w-md w-full flex flex-col items-center shadow-lg">
        <FaInstagram className="text-pink-500 text-4xl mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Vinculando cuenta de Instagram…</h1>
        {status === 'loading' && (
          <p className="text-gray-300 text-center">Procesando la vinculación, por favor espera…</p>
        )}
        {status === 'success' && (
          <p className="text-green-400 text-center font-semibold">{message}</p>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-400 text-center font-semibold mb-4">{message}</p>
            <Button className="bg-indigo-700 hover:bg-indigo-600 text-white" onClick={() => router.replace("/")}>Volver al inicio</Button>
          </>
        )}
      </div>
    </div>
  );
} 