'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';
import { apiJson, getStoredUser } from '@/lib/api';
import { PostItem } from '@/lib/platform';

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);
  const currentUser = getStoredUser();
  const [post, setPost] = useState<PostItem | null>(null);
  const [message, setMessage] = useState('');
  const [meetingMessage, setMeetingMessage] = useState(
    'I can support this project with domain knowledge and would like to schedule a meeting.',
  );
  const [slot, setSlot] = useState('2026-05-01 14:00');
  const [ndaAccepted, setNdaAccepted] = useState(false);

  useEffect(() => {
    void loadPost();
  }, [postId]);

  async function loadPost() {
    try {
      const data = await apiJson<PostItem>(`/posts/${postId}`);
      setPost(data);
      setNdaAccepted(data.confidentialityLevel === 'PUBLIC');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not load post');
    }
  }

  async function requestMeeting() {
    try {
      await apiJson('/meetings', {
        method: 'POST',
        body: JSON.stringify({
          postId,
          message: meetingMessage,
          ndaAccepted,
          proposedSlot: slot,
        }),
      });
      setMessage('Meeting request sent. Switch accounts to review it from the Meetings page.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Meeting request failed');
    }
  }

  if (!post) {
    return <p className="p-10">Loading post...</p>;
  }

  const isOwner = currentUser?.id === post.author.id;

  return (
    <AppShell
      title="Post Detail"
      subtitle="Use this screen for the Express Interest / Request Meeting demo scenario."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title={post.title} subtitle={`${post.domain} • ${post.city} • ${post.status}`}>
          <div className="space-y-4 text-slate-700">
            <p>{post.description}</p>
            <p><span className="font-semibold text-slate-900">Required Expertise:</span> {post.requiredExpertise}</p>
            <p><span className="font-semibold text-slate-900">Project Stage:</span> {post.projectStage}</p>
            <p><span className="font-semibold text-slate-900">Confidentiality:</span> {post.confidentialityLevel}</p>
            <p><span className="font-semibold text-slate-900">Owner:</span> {post.author.fullName}</p>
          </div>
        </SectionCard>

        <SectionCard
          title={isOwner ? 'Owner View' : 'Request Meeting'}
          subtitle={isOwner ? 'Switch to a different account for the meeting request demo.' : 'Express interest, accept NDA, and propose a time slot.'}
        >
          {isOwner ? (
            <p className="text-slate-600">
              This is your own post. Log in as the healthcare professional account to demonstrate the request flow.
            </p>
          ) : (
            <div className="space-y-4">
              <textarea
                value={meetingMessage}
                onChange={(event) => setMeetingMessage(event.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />
              <input
                value={slot}
                onChange={(event) => setSlot(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />
              {post.confidentialityLevel === 'CONFIDENTIAL' && (
                <label className="flex items-center gap-3 rounded-xl bg-orange-50 p-4 text-sm text-slate-700">
                  <input
                    checked={ndaAccepted}
                    onChange={(event) => setNdaAccepted(event.target.checked)}
                    type="checkbox"
                  />
                  I accept the NDA terms for this confidential collaboration post.
                </label>
              )}
              <button
                onClick={() => void requestMeeting()}
                className="w-full rounded-xl bg-[#ba4a2f] px-5 py-3 font-semibold text-white"
              >
                Express Interest / Request Meeting
              </button>
              {message && <p className="text-sm font-medium text-slate-700">{message}</p>}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
