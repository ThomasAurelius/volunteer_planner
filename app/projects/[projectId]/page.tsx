import { notFound } from "next/navigation";

import { Navigation } from "@/components/navigation";
import { formatDateRange, getOrganizationBySlug, getProjectDetail } from "@/lib/mvp-data";

type PageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ org?: string }>;
};

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const [{ projectId }, { org }] = await Promise.all([params, searchParams]);
  const organization = getOrganizationBySlug(org);
  const detail = getProjectDetail(projectId);

  if (!detail || detail.project.organizationId !== organization.id) {
    notFound();
  }

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold">{detail.project.name}</h2>
          <p className="mt-2 text-zinc-600">{detail.project.description}</p>
          <p className="text-sm text-zinc-600">Location: {detail.project.location}</p>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h3 className="font-semibold">Roles</h3>
          <ul className="mt-3 grid gap-2">
            {detail.roles.map((role) => (
              <li key={role.id} className="rounded bg-zinc-100 px-3 py-2 text-sm">
                {role.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h3 className="font-semibold">Upcoming Shifts</h3>
          <ul className="mt-3 grid gap-3">
            {detail.shifts.map((shift) => (
              <li key={shift.id} className="rounded-lg border border-zinc-200 p-3">
                <p className="font-medium">{shift.title}</p>
                <p className="text-sm text-zinc-600">{formatDateRange(shift.startAt, shift.endAt)}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
