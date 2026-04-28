'use client';

import Link from 'next/link';
import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';
import StatCard from '@/components/StatCard';
import { apiJson, clearSession } from '@/lib/api';
import { NotificationItem, PostItem, PostStatus } from '@/lib/platform';

type SessionInfo = {
  userId: number;
  email: string;
  role: string;
};

type PostForm = {
  title: string;
  domain: string;
  requiredExpertise: string;
  projectStage: string;
  confidentialityLevel: 'PUBLIC' | 'CONFIDENTIAL';
  city: string;
  description: string;
};

const emptyForm: PostForm = {
  title: '',
  domain: 'Cardiology',
  requiredExpertise: 'Machine Learning Engineer',
  projectStage: 'Idea',
  confidentialityLevel: 'PUBLIC',
  city: 'Ankara',
  description: '',
};

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [filters, setFilters] = useState({
    query: '',
    domain: 'ALL',
    city: 'ALL',
    status: 'ALL',
  });
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  async function loadScreen(nextFilters = filters) {
    try {
      const me = await apiJson<SessionInfo>('/auth/me');
      const query = new URLSearchParams();

      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value && value !== 'ALL') {
          query.set(key, value);
        }
      });

      const [postsData, notificationsData] = await Promise.all([
        apiJson<PostItem[]>(`/posts${query.size ? `?${query.toString()}` : ''}`),
        apiJson<NotificationItem[]>('/users/me/notifications'),
      ]);

      setSession(me);
      setPosts(postsData);
      setNotifications(notificationsData);
      setLoading(false);
    } catch {
      clearSession();
      router.push('/login');
    }
  }

  async function submitPost(status: PostStatus) {
    try {
      const path = editingPostId ? `/posts/${editingPostId}` : '/posts';
      const method = editingPostId ? 'PUT' : 'POST';

      await apiJson(path, {
        method,
        body: JSON.stringify({ ...form, status }),
      });

      setForm(emptyForm);
      setEditingPostId(null);
      setMessage(editingPostId ? 'Post updated successfully.' : `Post saved as ${status}.`);
      await loadScreen();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Post action failed');
    }
  }

  async function deletePost(postId: number) {
    try {
      await apiJson(`/posts/${postId}`, { method: 'DELETE' });
      setMessage('Post removed.');
      await loadScreen();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function updateStatus(postId: number, status: PostStatus) {
    try {
      await apiJson(`/posts/${postId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage(`Status changed to ${status}.`);
      await loadScreen();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Status update failed');
    }
  }

  const ownPosts = useMemo(
    () => posts.filter((post) => post.author.id === session?.userId),
    [posts, session],
  );

  const syncDashboard = useEffectEvent(() => {
    void loadScreen();
  });

  useEffect(() => {
    syncDashboard();
  }, []);

  if (loading || !session) {
    return <p className="p-10">Loading dashboard...</p>;
  }

  return (
    <AppShell
      title="Dashboard"
      subtitle="Create collaboration posts, apply filters, and manage the post lifecycle."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="My Role" value={session.role} hint="Current access level" />
          <StatCard label="Visible Posts" value={String(posts.length)} hint="Filtered result count" />
          <StatCard label="My Posts" value={String(ownPosts.length)} hint="Draft + active entries" />
          <StatCard label="Notifications" value={String(notifications.length)} hint="In-app updates" />
        </section>

        <section className="rounded-[2rem] bg-[#1d293d] p-8 text-white">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-200">Live demo flow</p>
          <h2 className="mt-3 text-4xl font-black">Post creation, filtering, and meeting requests in one place.</h2>
          <p className="mt-3 max-w-3xl text-slate-200">
            Save a draft first, publish it, then switch users and request a meeting from the post detail page.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/meetings" className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-900">
              Open Meetings
            </Link>
            <Link href="/profile" className="rounded-xl border border-white/30 px-5 py-3 font-semibold text-white">
              Edit Profile
            </Link>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
          <SectionCard
            title={editingPostId ? 'Edit Post' : 'Create New Post'}
            subtitle="Fill all demo-required fields, then save as draft or publish."
          >
            <div className="space-y-4">
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Title"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={form.domain}
                  onChange={(event) => setForm({ ...form, domain: event.target.value })}
                  placeholder="Working Domain"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={form.requiredExpertise}
                  onChange={(event) => setForm({ ...form, requiredExpertise: event.target.value })}
                  placeholder="Required Expertise"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={form.projectStage}
                  onChange={(event) => setForm({ ...form, projectStage: event.target.value })}
                  placeholder="Project Stage"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                  placeholder="City"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                />
              </div>
              <select
                value={form.confidentialityLevel}
                onChange={(event) =>
                  setForm({
                    ...form,
                    confidentialityLevel: event.target.value as 'PUBLIC' | 'CONFIDENTIAL',
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              >
                <option value="PUBLIC">Public</option>
                <option value="CONFIDENTIAL">Confidential</option>
              </select>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Description"
                rows={6}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => void submitPost('DRAFT')}
                  className="rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-900"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => void submitPost('ACTIVE')}
                  className="rounded-xl bg-[#ba4a2f] px-5 py-3 font-semibold text-white"
                >
                  {editingPostId ? 'Save Changes' : 'Publish Post'}
                </button>
                {editingPostId && (
                  <button
                    onClick={() => {
                      setEditingPostId(null);
                      setForm(emptyForm);
                    }}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {message && <p className="text-sm font-medium text-slate-700">{message}</p>}
            </div>
          </SectionCard>

          <SectionCard
            title="Search & Partner Discovery"
            subtitle="Use multiple filters to demonstrate dynamic results."
          >
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <input
                  value={filters.query}
                  onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                  placeholder="Search"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={filters.domain === 'ALL' ? '' : filters.domain}
                  onChange={(event) => setFilters({ ...filters, domain: event.target.value || 'ALL' })}
                  placeholder="Domain"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                />
                <input
                  value={filters.city === 'ALL' ? '' : filters.city}
                  onChange={(event) => setFilters({ ...filters, city: event.target.value || 'ALL' })}
                  placeholder="City"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                />
                <select
                  value={filters.status}
                  onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                  className="rounded-xl border border-slate-200 px-4 py-3"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
                  <option value="PARTNER_FOUND">Partner Found</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => void loadScreen(filters)}
                  className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    const reset = { query: '', domain: 'ALL', city: 'ALL', status: 'ALL' };
                    setFilters(reset);
                    void loadScreen(reset);
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold"
                >
                  Clear Filters
                </button>
              </div>

              <div className="space-y-4">
                {posts.map((post) => (
                  <article key={post.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">{post.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {post.domain} • {post.city} • {post.requiredExpertise}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">{post.status}</span>
                    </div>

                    <p className="mt-3 text-slate-700">{post.description}</p>
                    <div className="mt-4 grid gap-1 text-sm text-slate-600">
                      <p><span className="font-semibold text-slate-800">Stage:</span> {post.projectStage}</p>
                      <p><span className="font-semibold text-slate-800">Confidentiality:</span> {post.confidentialityLevel}</p>
                      <p><span className="font-semibold text-slate-800">Author:</span> {post.author.fullName}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/posts/${post.id}`} className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 ring-1 ring-slate-300">
                        View Details
                      </Link>

                      {post.author.id === session.userId && (
                        <>
                          <button
                            onClick={() => {
                              setEditingPostId(post.id);
                              setForm({
                                title: post.title,
                                domain: post.domain,
                                requiredExpertise: post.requiredExpertise,
                                projectStage: post.projectStage,
                                confidentialityLevel: post.confidentialityLevel,
                                city: post.city,
                                description: post.description,
                              });
                            }}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                          >
                            Edit
                          </button>
                          {post.status === 'DRAFT' && (
                            <button
                              onClick={() => void updateStatus(post.id, 'ACTIVE')}
                              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white"
                            >
                              Publish
                            </button>
                          )}
                          {post.status === 'MEETING_SCHEDULED' && (
                            <button
                              onClick={() => void updateStatus(post.id, 'PARTNER_FOUND')}
                              className="rounded-lg bg-purple-700 px-4 py-2 font-semibold text-white"
                            >
                              Mark Partner Found
                            </button>
                          )}
                          <button
                            onClick={() => void deletePost(post.id)}
                            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
