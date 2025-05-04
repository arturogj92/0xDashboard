'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { validateResetToken, resetPassword } from '@/lib/api';
import { useTranslations } from 'next-intl';

// Componente cliente interno que usa useSearchParams
function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const tReset = useTranslations('resetPassword');
  const token = params.get('token') || '';
  const [valid, setValid] = useState<boolean | null>(null);
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    validateResetToken(token)
      .then(res => setValid(res.success))
      .catch(() => setValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd1 !== pwd2) return alert(tReset('passwordMismatch'));
    setLoading(true);
    try {
      const res = await resetPassword(token, pwd1);
      if (res.success) {
        setDone(true);
        setTimeout(() => router.push('/login'), 2500);
      } else alert(res.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (valid === null) return <p className="text-center mt-10 text-gray-300">{tReset('checkingLink')}</p>;
  if (!valid) return <p className="text-center mt-10 text-red-500">{tReset('invalidLink')}</p>;

  return (
    <div className="max-w-md mx-auto mt-16 bg-[#120724] p-8 rounded-lg shadow-lg border border-indigo-900/50">
      {done ? (
        <p className="text-center text-green-400">{tReset('successMessage')}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold text-center text-white mb-6">{tReset('newPassword')}</h1>
          <Input
            type="password"
            placeholder={tReset('placeholderPassword')}
            value={pwd1}
            onChange={e => setPwd1(e.target.value)}
            className="bg-[#1c1033] border-indigo-900/50 text-white mb-4"
            required
          />
          <Input
            type="password"
            placeholder={tReset('placeholderConfirmPassword')}
            value={pwd2}
            onChange={e => setPwd2(e.target.value)}
            className="bg-[#1c1033] border-indigo-900/50 text-white mb-4"
            required
          />
          <Button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? tReset('buttonSaving') : tReset('buttonSave')}
          </Button>
        </form>
      )}
    </div>
  );
}

// Componente principal envuelto en Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10 text-gray-300">{useTranslations('resetPassword')('loading')}</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
} 