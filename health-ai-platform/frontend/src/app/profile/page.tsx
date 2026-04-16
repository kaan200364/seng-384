import AppShell from '@/components/AppShell';
import SectionCard from '@/components/SectionCard';

export default function ProfilePage() {
    return (
        <AppShell
            title="Profile"
            subtitle="Manage personal, academic, and collaboration profile details."
        >
            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard
                    title="Personal Information"
                    subtitle="Editable profile data for public collaboration visibility."
                >
                    <div className="grid gap-4">
                        <input
                            placeholder="Full Name"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            defaultValue="Kaan Turkay"
                        />
                        <input
                            placeholder="Academic Email"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            defaultValue="kaanturkay@gmail.com"
                        />
                        <input
                            placeholder="Institution"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3"
                            defaultValue="Hacettepe University"
                        />
                        <button className="w-fit rounded-xl bg-slate-900 px-5 py-3 text-white">
                            Save Changes
                        </button>
                    </div>
                </SectionCard>

                <SectionCard
                    title="Professional Summary"
                    subtitle="Short summary shown in collaboration matching screens."
                >
                    <textarea
                        className="min-h-[220px] w-full rounded-xl border border-slate-200 px-4 py-3"
                        defaultValue="Machine learning engineer focused on healthcare AI validation, model workflows, and clinical collaboration opportunities."
                    />
                </SectionCard>
            </div>
        </AppShell>
    );
}