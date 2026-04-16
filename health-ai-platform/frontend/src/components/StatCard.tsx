export default function StatCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{hint}</p>
        </div>
    );
}