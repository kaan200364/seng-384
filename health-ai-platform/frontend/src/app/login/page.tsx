'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiJson, setSession } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    try {
      const data = await apiJson<{
        access_token: string;
        user: { id: number; email: string; fullName: string; role: string };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setSession(data.access_token, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,_#1d293d,_#344763_45%,_#ba4a2f)] p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 rounded-[2rem] bg-white p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Login</h1>
            <p className="mt-2 text-sm text-slate-500">Use a verified account or one of the demo users.</p>
          </div>
          <Link href="/" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">
            Register
          </Link>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border p-3"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border p-3"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button className="w-full rounded-xl bg-black p-3 text-white">Login</button>

        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Demo accounts</p>
          <p className="mt-2">engineer@metu.edu / demo123</p>
          <p>doctor@hacettepe.edu / demo123</p>
          <p>admin@healthai.edu / demo123</p>
        </div>
      </form>
    </main>
  );
}
