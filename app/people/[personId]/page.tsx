import { notFound } from "next/navigation";

import { Navigation } from "@/components/navigation";
import { formatDateRange, getOrganizationBySlug, getPersonDetail } from "@/lib/mvp-data";

type PageProps = {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ org?: string }>;
};

export default async function PersonDetailPage({ params, searchParams }: PageProps) {
  const [{ personId }, { org }] = await Promise.all([params, searchParams]);
  const organization = getOrganizationBySlug(org);
  const detail = getPersonDetail(personId, organization.id);

  if (!detail) {
    notFound();
  }

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            {detail.person.firstName} {detail.person.lastName}
          </h2>
          <p className="text-sm text-slate-600">{detail.person.email}</p>
          <p className="mt-2 text-sm">Role: {detail.membership?.role ?? "Unknown"}</p>
        </section>

        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Assignments</h3>
          <ul className="mt-3 grid gap-2">
            {detail.assignments.map(({ assignment, shift, project, role }) => (
              <li key={assignment.id} className="rounded bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                {project.name} · {shift.title} · {role.name} · {assignment.status} · {formatDateRange(shift.startAt, shift.endAt)}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold">Availability</h3>
          <ul className="mt-3 grid gap-2">
            {detail.availability.map((item) => (
              <li key={item.id} className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-700">
                {item.status} · {formatDateRange(item.startAt, item.endAt)}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
