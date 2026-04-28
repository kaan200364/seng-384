'use client';

import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';

const issues = [
  {
    title: 'Page is not loading',
    cause: 'The backend may be offline or your connection may be interrupted.',
    solution:
      'Check that the frontend runs on localhost:3001 and the backend runs on localhost:3000, then refresh the page.',
  },
  {
    title: 'Session closed unexpectedly',
    cause: 'Your session may have expired or local session data may have been cleared.',
    solution:
      'Log in again. If needed, use the Clear session action and authenticate once more.',
  },
  {
    title: 'Filters return no results',
    cause: 'No posts match the selected query, city, or status filters.',
    solution:
      'Clear some filters or broaden the search criteria to see more results.',
  },
  {
    title: 'Cannot submit meeting request',
    cause: 'The post may no longer be active, or the NDA checkbox may be required.',
    solution:
      'Reload the post detail page, confirm the post is active, and accept the NDA if the post is confidential.',
  },
];

export default function HelpPage() {
  return (
    <AppShell
      title="Help & Support"
      subtitle="Troubleshooting tips and contact information for common platform issues."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Troubleshooting"
          subtitle="Use these quick checks before escalating an issue."
        >
          <div className="space-y-4">
            {issues.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Possible cause:</span> {item.cause}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Suggested solution:</span> {item.solution}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Contact"
          subtitle="Use the support channel below for questions, bug reports, or demo issues."
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Support email</p>
              <a
                href="mailto:support@healthai.edu"
                className="mt-2 inline-block font-semibold text-slate-900 underline"
              >
                support@healthai.edu
              </a>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Feedback</p>
              <p className="mt-2">
                Use the Feedback button in the footer to open a pre-filled support email.
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="font-semibold text-slate-900">Demo note</p>
              <p className="mt-2">
                Email verification is intentionally simulated in this demo environment.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
