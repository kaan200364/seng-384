'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile', label: 'Profile' },
    { href: '/meetings', label: 'Meetings' },
    { href: '/admin', label: 'Admin' },
];

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

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
                    <div className="border-b border-slate-200 px-6 py-6">
                        <h1 className="text-2xl font-bold">Health AI</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Co-Creation Platform
                        </p>
                    </div>

                    <nav className="flex-1 space-y-2 px-4 py-6">
                        {navItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${active
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-slate-200 px-4 py-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm font-semibold">Mockup Mode</p>
                            <p className="mt-1 text-xs text-slate-500">
                                UI screens for SRS screenshots
                            </p>
                        </div>
                    </div>
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-between px-6 py-5">
                            <div>
                                <h2 className="text-2xl font-bold">{title}</h2>
                                {subtitle && (
                                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 md:block">
                                    Search collaborations...
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                    KT
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6">{children}</main>
                </div>
            </div>
        </div>
    );
}