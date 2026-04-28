'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiJson } from '@/lib/api';
import { ROLE_OPTIONS } from '@/lib/platform';

export default function HomePage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    institution: '',
    role: 'ENGINEER',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = await apiJson<{ email: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setPendingVerificationEmail(data.email);
      setMessage('Registration completed. Use the verify button below to simulate email confirmation.');
      setForm({
        fullName: '',
        email: '',
        password: '',
        institution: '',
        role: 'ENGINEER',
      });
    } catch {
      setMessage('Registration failed. Use a valid .edu or .edu.tr email address.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmail() {
    if (!pendingVerificationEmail) {
      return;
    }

    try {
      await apiJson('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: pendingVerificationEmail }),
      });
      setMessage(`Email verified for ${pendingVerificationEmail}. You can now log in.`);
      setPendingVerificationEmail('');
    } catch {
      setMessage('Email verification could not be completed.');
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fef9f2,_#f5efe6_48%,_#eed8c2)] p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-center rounded-[2rem] bg-[#1d293d] p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Health AI</p>
          <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight">
            Build healthcare partnerships with a demo that actually works.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-200">
            Register, verify email, create draft and active posts, request meetings,
            manage profile data, and review admin logs in one flow.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-bold">6</p>
              <p className="mt-2 text-sm text-slate-200">Demo scenarios covered</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-bold">3</p>
              <p className="mt-2 text-sm text-slate-200">Seed accounts included</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-bold">Live</p>
              <p className="mt-2 text-sm text-slate-200">Meetings and admin flow</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-slate-200">
            <p className="font-semibold text-white">Demo login accounts</p>
            <p className="mt-2">Engineer: engineer@metu.edu / demo123</p>
            <p>Healthcare: doctor@hacettepe.edu / demo123</p>
            <p>Admin: admin@healthai.edu / demo123</p>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-lg rounded-[2rem] bg-white/90 p-8 shadow-xl ring-1 ring-orange-100 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Create Account</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Institutional email required. Email verification is simulated for the demo.
                </p>
              </div>
              <Link href="/login" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Login
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="fullName"
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
                required
              />

              <input
                name="institution"
                type="text"
                placeholder="Institution"
                value={form.institution}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Institutional Email (.edu / .edu.tr)"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
                required
              />

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#ba4a2f] py-3 text-white"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            {pendingVerificationEmail && (
              <button
                onClick={handleVerifyEmail}
                className="mt-4 w-full rounded-lg border border-[#ba4a2f] py-3 font-semibold text-[#ba4a2f]"
              >
                Verify Email for {pendingVerificationEmail}
              </button>
            )}

            {message && (
              <p className="mt-4 text-center text-sm font-medium text-slate-700">{message}</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
