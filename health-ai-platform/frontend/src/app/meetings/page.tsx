import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';

const requests = [
    {
        name: 'Dr. Elif Kaya',
        topic: 'AI Diagnostic Assistant',
        status: 'Pending NDA',
        slot: 'March 15, 10:00',
    },
    {
        name: 'Dr. Mehmet Arslan',
        topic: 'Radiology Support Tool',
        status: 'Meeting Scheduled',
        slot: 'March 16, 14:30',
    },
];

export default function MeetingsPage() {
    return (
        <AppShell
            title="Meetings"
            subtitle="Review requests, NDA state, and planned collaboration meetings."
        >
            <SectionCard
                title="Meeting Requests"
                subtitle="Mockup list for SRS and live demo planning."
            >
                <div className="space-y-4">
                    {requests.map((item) => (
                        <div
                            key={`${item.name}-${item.topic}`}
                            className="rounded-2xl border border-slate-200 p-5"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold">{item.topic}</h3>
                                    <p className="mt-1 text-sm text-slate-500">{item.name}</p>
                                </div>
                                <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">
                                    {item.status}
                                </span>
                            </div>

                            <p className="mt-4 text-sm text-slate-600">
                                Proposed slot: {item.slot}
                            </p>

                            <div className="mt-4 flex gap-2">
                                <button className="rounded-lg bg-green-600 px-4 py-2 text-white">
                                    Accept
                                </button>
                                <button className="rounded-lg bg-slate-300 px-4 py-2">
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </AppShell>
    );
}