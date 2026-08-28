import { Navigation } from "@/components/navigation";
import { formatDateRange, getOrganizationBySlug, getVolunteerPortal } from "@/lib/mvp-data";

type PageProps = {
  searchParams: Promise<{ org?: string; person?: string }>;
};

export default async function VolunteerPortalPage({ searchParams }: PageProps) {
  const { org, person } = await searchParams;
  const organization = getOrganizationBySlug(org);
  const personId = person ?? "person_alex";
  const portal = getVolunteerPortal(personId, organization.id);

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold">My Schedule</h2>
          <ul className="mt-4 grid gap-3">
            {portal.myAssignments.map(({ assignment, shift, role, project }) => (
              <li key={assignment.id} className="rounded-lg border border-zinc-200 p-4">
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-zinc-600">{shift.title}</p>
                <p className="text-sm text-zinc-600">{formatDateRange(shift.startAt, shift.endAt)}</p>
                <p className="mt-1 text-sm">Role: {role.name}</p>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="rounded bg-emerald-100 px-3 py-1">Confirm</span>
                  <span className="rounded bg-rose-100 px-3 py-1">Decline</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h3 className="font-semibold">Open Shifts</h3>
          <ul className="mt-3 grid gap-2 text-sm">
            {portal.openShifts.map(({ shift, coverage }) => (
              <li key={shift.id} className="rounded bg-zinc-100 px-3 py-2">
                {shift.title} · {formatDateRange(shift.startAt, shift.endAt)} · {coverage.open} needed
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h3 className="font-semibold">My Availability</h3>
          <ul className="mt-3 grid gap-2 text-sm">
            {portal.availability.map((item) => (
              <li key={item.id} className="rounded bg-zinc-100 px-3 py-2">
                {item.status} · {formatDateRange(item.startAt, item.endAt)}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
