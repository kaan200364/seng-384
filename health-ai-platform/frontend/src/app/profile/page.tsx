'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';
import { apiJson } from '@/lib/api';
import { NotificationItem, UserProfile } from '@/lib/platform';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const [profileData, notificationData] = await Promise.all([
        apiJson<UserProfile>('/users/me/profile'),
        apiJson<NotificationItem[]>('/users/me/notifications'),
      ]);
      setProfile(profileData);
      setNotifications(notificationData);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not load profile');
    }
  }

  async function saveProfile() {
    if (!profile) {
      return;
    }

    try {
      const data = await apiJson<UserProfile>('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: profile.fullName,
          institution: profile.institution,
          expertise: profile.expertise,
          city: profile.city,
          bio: profile.bio,
        }),
      });
      setProfile(data);
      setMessage('Profile saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function exportData() {
    try {
      const data = await apiJson('/users/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'health-ai-export.json';
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage('Personal data export downloaded.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export failed');
    }
  }

  if (!profile) {
    return <p className="p-10">Loading profile...</p>;
  }

  return (
    <AppShell
      title="Profile"
      subtitle="Edit profile fields, review notifications, and demo GDPR export."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Profile Management" subtitle="Editable user information for discovery and matching.">
          <div className="grid gap-4">
            <input
              value={profile.fullName}
              onChange={(event) => setProfile({ ...profile, fullName: event.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
            <input
              value={profile.institution}
              onChange={(event) => setProfile({ ...profile, institution: event.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
            <input
              value={profile.expertise}
              onChange={(event) => setProfile({ ...profile, expertise: event.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
            <input
              value={profile.city}
              onChange={(event) => setProfile({ ...profile, city: event.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
            <textarea
              value={profile.bio}
              onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
              rows={6}
              className="rounded-xl border border-slate-200 px-4 py-3"
            />

            <div className="flex flex-wrap gap-3">
              <button onClick={() => void saveProfile()} className="rounded-xl bg-slate-900 px-5 py-3 text-white">
                Save Changes
              </button>
              <button onClick={() => void exportData()} className="rounded-xl border border-slate-300 px-5 py-3">
                Export My Data
              </button>
              <button
                onClick={() =>
                  setMessage('Delete Account warning shown. For demo safety, the account is not removed automatically.')
                }
                className="rounded-xl border border-red-300 px-5 py-3 text-red-600"
              >
                Delete Account Warning
              </button>
            </div>

            {message && <p className="text-sm font-medium text-slate-700">{message}</p>}
          </div>
        </SectionCard>

        <SectionCard title="Notifications" subtitle="At least one notification can be shown during the demo.">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-slate-500">No notifications yet.</div>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
