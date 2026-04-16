'use client';

import { useState } from 'react';

export default function HomePage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ENGINEER',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Bir hata oluştu');
      } else {
        setMessage('Kayıt başarılı ✅');
        setForm({
          fullName: '',
          email: '',
          password: '',
          role: 'ENGINEER',
        });
      }
    } catch {
      setMessage('Sunucuya bağlanılamadı');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Health AI Register</h1>

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
            name="email"
            type="email"
            placeholder="Email"
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
            <option value="ENGINEER">Engineer</option>
            <option value="HEALTHCARE_PROFESSIONAL">Healthcare Professional</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 text-white"
          >
            {loading ? 'Kaydediliyor...' : 'Register'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium">{message}</p>
        )}
      </div>
    </main>
  );
}