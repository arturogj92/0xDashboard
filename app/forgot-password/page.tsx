'use client';
import { useState } from 'react';
import { requestPasswordReset } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-[#120724] p-8 rounded-lg shadow-lg border border-indigo-900/50">
      {sent ? (
        <p className="text-center text-gray-200">
          Si la dirección <b>{email}</b> existe, te enviamos un correo con instrucciones.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold text-center text-white mb-6">Restablecer contraseña</h1>
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-[#1c1033] border-indigo-900/50 text-white mb-4"
            required
          />
          <Button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </Button>
        </form>
      )}
    </div>
  );
} 