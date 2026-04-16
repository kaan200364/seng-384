import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';
import StatCard from '@/components/StatCard';

export default function AdminPage() {
    return (
        <AppShell
            title="Admin Dashboard"
            subtitle="Mock administrative monitoring panel for moderation and audit flow."
        >
            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-4">
                    <StatCard label="Users" value="128" hint="Registered platform members" />
                    <StatCard label="Active Posts" value="34" hint="Visible collaboration posts" />
                    <StatCard label="Meetings" value="12" hint="Scheduled meeting requests" />
                    <StatCard label="Flags" value="3" hint="Pending moderation actions" />
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <SectionCard
                        title="Recent Activity Logs"
                        subtitle="Audit trail preview for admin monitoring."
                    >
                        <div className="space-y-3 text-sm">
                            <div className="rounded-xl bg-slate-50 p-4">
                                User #12 created a new collaboration post.
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4">
                                User #18 accepted NDA for meeting request #5.
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4">
                                Admin removed an expired post from listing.
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Moderation Actions"
                        subtitle="Quick actions mockup for the SRS admin interface."
                    >
                        <div className="space-y-3">
                            <button className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white">
                                Export Logs CSV
                            </button>
                            <button className="w-full rounded-xl bg-slate-200 px-4 py-3">
                                Review User Reports
                            </button>
                            <button className="w-full rounded-xl bg-slate-200 px-4 py-3">
                                Manage Suspended Accounts
                            </button>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AppShell>
    );
}