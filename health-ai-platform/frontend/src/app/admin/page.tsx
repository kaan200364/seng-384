'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';
import StatCard from '@/components/StatCard';
import { apiFetch, apiJson } from '@/lib/api';
import { PostItem, UserProfile } from '@/lib/platform';

type LogItem = {
  id: number;
  userName: string;
  userRole: string;
  actionType: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [postStatus, setPostStatus] = useState('ALL');
  const [logAction, setLogAction] = useState('ALL');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadAdminData();
  }, [roleFilter, postStatus, logAction]);

  async function loadAdminData() {
    try {
      const [usersData, postsData, logsData] = await Promise.all([
        apiJson<UserProfile[]>(`/admin/users?role=${roleFilter}`),
        apiJson<PostItem[]>(`/admin/posts?status=${postStatus}`),
        apiJson<LogItem[]>(`/admin/logs?actionType=${logAction}`),
      ]);
      setUsers(usersData);
      setPosts(postsData);
      setLogs(logsData);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Admin data could not be loaded');
    }
  }

  async function suspendUser(id: number) {
    try {
      await apiJson(`/admin/users/${id}/suspend`, { method: 'PATCH' });
      setMessage('User suspended.');
      await loadAdminData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Suspend failed');
    }
  }

  async function removePost(id: number) {
    try {
      await apiJson(`/admin/posts/${id}`, { method: 'DELETE' });
      setMessage('Post removed by admin.');
      await loadAdminData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Remove failed');
    }
  }

  async function exportLogs() {
    try {
      const response = await apiFetch(`/admin/logs/export?actionType=${logAction}`);
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'activity-logs.csv';
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage('CSV export downloaded.');
    } catch {
      setMessage('CSV export failed');
    }
  }

  return (
    <AppShell
      title="Admin Dashboard"
      subtitle="Manage users, remove posts, inspect logs, and export CSV."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Users" value={String(users.length)} hint="Filtered user count" />
          <StatCard label="Posts" value={String(posts.length)} hint="Filtered post count" />
          <StatCard label="Logs" value={String(logs.length)} hint="Visible activity records" />
          <StatCard label="Role Filter" value={roleFilter} hint="Current admin view" />
        </section>

        {message && <p className="text-sm font-medium text-slate-700">{message}</p>}

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="User Management" subtitle="Filter by role and suspend an account.">
            <div className="space-y-4">
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              >
                <option value="ALL">All Roles</option>
                <option value="ENGINEER">Engineer</option>
                <option value="HEALTHCARE_PROFESSIONAL">Healthcare Professional</option>
                <option value="ADMIN">Admin</option>
              </select>

              {users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{user.fullName}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <p className="mt-1 text-sm text-slate-600">{user.role} • {user.city}</p>
                  <button
                    onClick={() => void suspendUser(user.id)}
                    className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-white"
                  >
                    Suspend Account
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Post Management" subtitle="Remove an inappropriate post or filter by status.">
            <div className="space-y-4">
              <select
                value={postStatus}
                onChange={(event) => setPostStatus(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
                <option value="PARTNER_FOUND">Partner Found</option>
              </select>

              {posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{post.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{post.status} • {post.domain}</p>
                  <p className="mt-2 text-sm text-slate-600">{post.description}</p>
                  <button
                    onClick={() => void removePost(post.id)}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white"
                  >
                    Remove Post
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Activity Logs" subtitle="Filter by action type and export CSV.">
            <div className="space-y-4">
              <select
                value={logAction}
                onChange={(event) => setLogAction(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              >
                <option value="ALL">All Actions</option>
                <option value="login">login</option>
                <option value="register">register</option>
                <option value="post_create">post_create</option>
                <option value="meeting_request">meeting_request</option>
                <option value="meeting_status_change">meeting_status_change</option>
                <option value="admin_remove_post">admin_remove_post</option>
              </select>

              <button onClick={() => void exportLogs()} className="w-full rounded-xl bg-[#ba4a2f] px-4 py-3 text-white">
                Export CSV
              </button>

              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{log.actionType}</p>
                  <p className="mt-1 text-sm text-slate-600">{log.userName} • {log.userRole}</p>
                  <p className="mt-2 text-sm text-slate-500">{log.details}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
