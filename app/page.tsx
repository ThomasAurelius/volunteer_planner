import Link from "next/link";

import { Navigation } from "@/components/navigation";
import { formatDateRange, getDashboardData, getOrganizationBySlug } from "@/lib/mvp-data";

type PageProps = {
  searchParams: Promise<{ org?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { org } = await searchParams;
  const organization = getOrganizationBySlug(org);
  const dashboard = getDashboardData(organization.id);

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
        <section className="grid gap-4 rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">This Week</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Shifts" value={dashboard.shifts} />
            <Stat label="Positions" value={dashboard.positions} />
            <Stat label="Assigned" value={dashboard.assigned} />
            <Stat label="Coverage" value={`${dashboard.percentage}%`} />
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Needs Attention</h2>
          {dashboard.needsAttention.length === 0 ? (
            <p className="text-slate-600">All shifts are fully staffed.</p>
          ) : (
            <ul className="grid gap-3">
              {dashboard.needsAttention.map(({ shift, coverage }) => (
                <li key={shift.id} className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                  <p className="font-medium">{shift.title}</p>
                  <p className="text-sm text-slate-700">{formatDateRange(shift.startAt, shift.endAt)}</p>
                  <p className="mt-2 text-sm font-medium text-amber-800">{coverage.open} volunteers needed</p>
                  <Link href={`/shifts/${shift.id}?org=${organization.slug}`} className="mt-2 inline-flex text-sm font-medium text-indigo-700 underline hover:text-indigo-900">
                    Open shift detail
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid gap-4 rounded-xl border border-indigo-200 bg-white p-6 shadow-sm sm:grid-cols-3">
          <Stat label="Today" value={`${dashboard.upcoming.today} shifts`} />
          <Stat label="Tomorrow" value={`${dashboard.upcoming.tomorrow} shifts`} />
          <Stat label="Weekend" value={`${dashboard.upcoming.weekend} shifts`} />
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-100">
      <p className="text-sm font-medium text-indigo-700">{label}</p>
      <p className="text-2xl font-semibold text-indigo-900">{value}</p>
    </div>
  );
}
