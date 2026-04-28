'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { clearSession, getStoredUser } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/meetings', label: 'Meetings' },
  { href: '/admin', label: 'Admin' },
  { href: '/help', label: 'Help' },
];

const supportEmail = 'support@healthai.edu';

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = getStoredUser();
  const userName = user?.fullName || user?.email || 'Demo User';
  const role = user?.role || 'USER';

  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff9f1,_#f5efe6_55%,_#efe4d4)] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-orange-200/70 bg-[#fffaf2] lg:flex">
          <div className="border-b border-orange-200/70 px-6 py-6">
            <h1 className="text-2xl font-bold text-slate-900">Health AI</h1>
            <p className="mt-1 text-sm text-slate-600">Co-Creation Platform</p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active ? 'bg-[#ba4a2f] text-white' : 'text-slate-700 hover:bg-orange-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-orange-200/70 px-4 py-4">
            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Demo accounts</p>
              <p className="mt-1 text-xs text-slate-600">engineer@metu.edu / demo123</p>
              <p className="text-xs text-slate-600">doctor@hacettepe.edu / demo123</p>
              <p className="text-xs text-slate-600">admin@healthai.edu / demo123</p>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="border-b border-orange-200/70 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-slate-600 md:block">
                  {role}
                </div>

                <div className="hidden text-right md:block">
                  <p className="text-sm font-semibold">{userName}</p>
                  <button onClick={clearSession} className="text-xs text-slate-500 underline">
                    Clear session
                  </button>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ba4a2f] text-sm font-bold text-white">
                  {initials || 'HA'}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>

          <footer className="border-t border-orange-200/70 bg-white/70 px-6 py-4">
            <div className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p>
                Support: <a href={`mailto:${supportEmail}`} className="font-semibold text-slate-900 underline">{supportEmail}</a>
              </p>
              <a
                href={`mailto:${supportEmail}?subject=Health%20AI%20Platform%20Feedback`}
                className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 font-semibold text-slate-900"
              >
                Feedback
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
