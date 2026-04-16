'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        const res = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message);
            return;
        }

        localStorage.setItem('token', data.access_token);

        router.push('/dashboard');
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-xl shadow w-96 space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="w-full bg-black text-white p-3 rounded">
                    Login
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}
            </form>
        </main>
    );
}