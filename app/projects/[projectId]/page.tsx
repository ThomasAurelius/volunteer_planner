import { notFound } from "next/navigation";

import { Navigation } from "@/components/navigation";
import { ProjectScheduleManager } from "@/components/project-schedule-manager";
import { formatDateRange } from "@/lib/mvp-data";
import { getProjectPageData } from "@/lib/project-page-data";

type PageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ org?: string }>;
};

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const [{ projectId }, { org }] = await Promise.all([params, searchParams]);
  const detail = await getProjectPageData(projectId, org);

  if (!detail) {
    notFound();
  }

  return (
    <div>
      <Navigation organizationSlug={detail.organizationSlug} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{detail.project.name}</h2>
          {detail.project.description ? (
            <p className="mt-2 text-slate-700">{detail.project.description}</p>
          ) : (
            <p className="mt-2 text-slate-500">No description yet.</p>
          )}
          <p className="text-sm text-slate-600">
            Location: {detail.project.location || "Not set"}
          </p>
        </section>

        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Roles</h3>
          {detail.roles.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No roles yet.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {detail.roles.map((role) => (
                <li key={role.id} className="rounded bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                  {role.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Upcoming Shifts</h3>
          {detail.shifts.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No upcoming shifts yet.</p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {detail.shifts.map((shift) => (
                <li key={shift.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium">{shift.title}</p>
                  <p className="text-sm text-slate-600">{formatDateRange(shift.startAt, shift.endAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <ProjectScheduleManager projectId={projectId} projectName={detail.project.name} />
        </section>
      </main>
    </div>
  );
}
