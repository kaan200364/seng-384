'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';
import { apiJson } from '@/lib/api';
import { MeetingItem } from '@/lib/platform';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadMeetings();
  }, []);

  async function loadMeetings() {
    try {
      const data = await apiJson<MeetingItem[]>('/meetings');
      setMeetings(data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not load meetings');
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await apiJson(`/meetings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage(`Meeting request updated to ${status}.`);
      await loadMeetings();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed');
    }
  }

  return (
    <AppShell
      title="Meetings"
      subtitle="Review meeting requests, NDA acceptance, and scheduling flow."
    >
      <SectionCard
        title="Meeting Request Workflow"
        subtitle="Owner can schedule or decline; requester can monitor the lifecycle."
      >
        <div className="space-y-4">
          {message && <p className="text-sm font-medium text-slate-700">{message}</p>}

          {meetings.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
              No meeting requests yet. Open a post detail page and request a meeting.
            </div>
          ) : (
            meetings.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">{item.post.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Requested by {item.requester.fullName} • Owner {item.owner.fullName}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">{item.status}</span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p><span className="font-semibold text-slate-800">Message:</span> {item.message}</p>
                  <p><span className="font-semibold text-slate-800">Proposed slot:</span> {item.proposedSlot}</p>
                  <p><span className="font-semibold text-slate-800">NDA accepted:</span> {item.ndaAccepted ? 'Yes' : 'No'}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => void updateStatus(item.id, 'SCHEDULED')}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
                  >
                    Schedule Meeting
                  </button>
                  <button
                    onClick={() => void updateStatus(item.id, 'DECLINED')}
                    className="rounded-lg bg-slate-300 px-4 py-2"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => void updateStatus(item.id, 'COMPLETED')}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                  >
                    Mark Completed
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </SectionCard>
    </AppShell>
  );
}
