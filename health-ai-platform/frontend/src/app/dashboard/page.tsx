'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';
import StatCard from '@/components/StatCard';

type MeResponse = {
    userId: number;
    email: string;
    role: string;
};

type PostItem = {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    authorId: number;
    author: {
        id: number;
        email: string;
        fullName: string;
        role: string;
    };
};

export default function Dashboard() {
    const router = useRouter();

    const [user, setUser] = useState<MeResponse | null>(null);
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [creating, setCreating] = useState(false);

    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    async function loadData(token: string) {
        const [meRes, postsRes] = await Promise.all([
            fetch('http://localhost:3000/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            fetch('http://localhost:3000/posts'),
        ]);

        if (!meRes.ok) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        const meData = await meRes.json();
        const postsData = await postsRes.json();

        setUser(meData);
        setPosts(postsData);
        setLoading(false);
    }

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/login');
            return;
        }

        loadData(token);
    }, [router]);

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');

            const res = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || 'Post oluşturulamadı');
                return;
            }

            setMessage('Post oluşturuldu ✅');
            setTitle('');
            setDescription('');

            if (token) {
                await loadData(token);
            }
        } catch {
            setMessage('Sunucuya bağlanılamadı');
        } finally {
            setCreating(false);
        }
    }

    async function handleDeletePost(postId: number) {
        const confirmed = window.confirm('Bu postu silmek istediğine emin misin?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('token');

            const res = await fetch(`http://localhost:3000/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || 'Post silinemedi');
                return;
            }

            setMessage('Post silindi ✅');

            if (token) {
                await loadData(token);
            }
        } catch {
            setMessage('Sunucuya bağlanılamadı');
        }
    }

    function startEdit(post: PostItem) {
        setEditingPostId(post.id);
        setEditTitle(post.title);
        setEditDescription(post.description);
    }

    async function handleUpdatePost(postId: number) {
        try {
            const token = localStorage.getItem('token');

            const res = await fetch(`http://localhost:3000/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.message || 'Güncellenemedi');
                return;
            }

            setMessage('Post güncellendi ✅');
            setEditingPostId(null);

            if (token) {
                await loadData(token);
            }
        } catch {
            setMessage('Sunucu hatası');
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        router.push('/login');
    }

    if (loading) {
        return <p className="p-10">Loading...</p>;
    }

    if (!user) return null;

    return (
        <AppShell
            title="Dashboard"
            subtitle="Manage your collaboration posts and view recent activity."
        >
            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        label="My Role"
                        value={user.role}
                        hint="Current account role"
                    />
                    <StatCard
                        label="Total Posts"
                        value={String(posts.length)}
                        hint="Posts currently visible on the platform"
                    />
                    <StatCard
                        label="Account"
                        value={`#${user.userId}`}
                        hint={user.email}
                    />
                </section>

                <section className="rounded-3xl bg-slate-900 p-8 text-white">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                        Welcome back
                    </p>
                    <h2 className="mt-3 text-4xl font-bold">Build healthcare partnerships faster.</h2>
                    <p className="mt-3 max-w-2xl text-slate-300">
                        Create research and innovation posts, connect with domain experts,
                        and prepare collaboration flows for the platform demo.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-900">
                            New Collaboration
                        </button>
                        <button
                            onClick={handleLogout}
                            className="rounded-xl border border-slate-600 px-5 py-3 font-semibold text-white"
                        >
                            Logout
                        </button>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
                    <SectionCard
                        title="Create Post"
                        subtitle="Share a collaboration opportunity with healthcare professionals."
                    >
                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Post title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                                required
                            />

                            <textarea
                                placeholder="Describe the project, goals, and expertise you need."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                                rows={6}
                                required
                            />

                            <button
                                type="submit"
                                disabled={creating}
                                className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
                            >
                                {creating ? 'Creating...' : 'Create Post'}
                            </button>
                        </form>

                        {message && (
                            <p className="mt-4 text-sm font-medium text-slate-700">{message}</p>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Recent Posts"
                        subtitle="Review active posts and manage your own entries."
                    >
                        <div className="space-y-4">
                            {posts.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                                    No posts yet.
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="rounded-2xl border border-slate-200 p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                {editingPostId === post.id ? (
                                                    <div className="space-y-3">
                                                        <input
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 px-3 py-2"
                                                        />

                                                        <textarea
                                                            value={editDescription}
                                                            onChange={(e) => setEditDescription(e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 px-3 py-2"
                                                            rows={4}
                                                        />

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleUpdatePost(post.id)}
                                                                className="rounded-lg bg-green-600 px-4 py-2 text-white"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingPostId(null)}
                                                                className="rounded-lg bg-slate-400 px-4 py-2 text-white"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3 className="text-xl font-bold">{post.title}</h3>
                                                        <p className="mt-2 text-slate-600">{post.description}</p>
                                                    </>
                                                )}
                                            </div>

                                            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">
                                                {post.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-1 text-sm text-slate-500">
                                            <p>
                                                <span className="font-semibold text-slate-700">Author:</span>{' '}
                                                {post.author.fullName}
                                            </p>
                                            <p>
                                                <span className="font-semibold text-slate-700">Email:</span>{' '}
                                                {post.author.email}
                                            </p>
                                            <p>
                                                <span className="font-semibold text-slate-700">Role:</span>{' '}
                                                {post.author.role}
                                            </p>
                                        </div>

                                        {post.author.id === user.userId && (
                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    onClick={() => startEdit(post)}
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="rounded-lg bg-red-600 px-4 py-2 text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AppShell>
    );
}