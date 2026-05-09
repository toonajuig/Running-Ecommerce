'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();       // ป้องกัน browser reload หน้าตาม default form behavior
    setError('');
    setLoading(true);

    try {
      const res = await api.post<{ token: string; user: { id: number; name: string; email: string; role: string } }>(
        '/users/login',
        { email, password },
      );
      login(res.token, res.user);
      router.push('/');        // redirect กลับหน้าแรกหลัง login สำเร็จ
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl bg-surface-card p-8">

        <h1 className="mb-1 text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mb-8 text-sm text-ink-muted">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-ink underline-offset-4 hover:underline">
            สมัครสมาชิก
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-ink-faint">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-deep px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-white/30 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-ink-faint">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-deep px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-white/30 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-ink py-3 text-sm font-medium text-surface-card transition hover:bg-ink-muted disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  );
}
