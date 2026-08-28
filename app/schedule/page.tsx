import Link from "next/link";

import { Navigation } from "@/components/navigation";
import { formatDateRange, getOrganizationBySlug, getShiftCoverage, getShiftsForOrganization, projects } from "@/lib/mvp-data";

type PageProps = {
  searchParams: Promise<{ org?: string; coverage?: string; project?: string }>;
};

export default async function SchedulePage({ searchParams }: PageProps) {
  const { org, coverage, project } = await searchParams;
  const organization = getOrganizationBySlug(org);

  let orgShifts = getShiftsForOrganization(organization.id);

  if (project) {
    orgShifts = orgShifts.filter((shift) => shift.projectId === project);
  }

  if (coverage === "understaffed") {
    orgShifts = orgShifts.filter((shift) => getShiftCoverage(shift.id).open > 0);
  }

  const orgProjects = projects.filter((item) => item.organizationId === organization.id);

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Schedule</h2>
            <div className="flex gap-2 text-sm">
              <Link className="rounded bg-zinc-100 px-3 py-1" href={`/schedule?org=${organization.slug}`}>
                All shifts
              </Link>
              <Link
                className="rounded bg-zinc-100 px-3 py-1"
                href={`/schedule?org=${organization.slug}&coverage=understaffed`}
              >
                Understaffed only
              </Link>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {orgProjects.map((item) => (
              <Link key={item.id} className="rounded-full bg-zinc-100 px-3 py-1" href={`/schedule?org=${organization.slug}&project=${item.id}`}>
                {item.name}
              </Link>
            ))}
          </div>

          <ul className="mt-4 grid gap-3">
            {orgShifts.map((shift) => {
              const projectName = projects.find((projectItem) => projectItem.id === shift.projectId)?.name ?? "Project";
              const coverageSummary = getShiftCoverage(shift.id);

              return (
                <li key={shift.id} className="rounded-lg border border-zinc-200 p-4">
                  <p className="font-medium">{shift.title}</p>
                  <p className="text-sm text-zinc-600">{projectName}</p>
                  <p className="text-sm text-zinc-600">{formatDateRange(shift.startAt, shift.endAt)}</p>
                  <p className="mt-1 text-sm">{coverageSummary.assigned}/{coverageSummary.positions} assigned</p>
                  <Link className="mt-2 inline-flex text-sm underline" href={`/shifts/${shift.id}?org=${organization.slug}`}>
                    Shift detail
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
