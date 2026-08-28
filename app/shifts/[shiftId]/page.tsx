import { notFound } from "next/navigation";

import { Navigation } from "@/components/navigation";
import { formatDateRange, getOrganizationBySlug, getShiftDetail } from "@/lib/mvp-data";

type PageProps = {
  params: Promise<{ shiftId: string }>;
  searchParams: Promise<{ org?: string }>;
};

export default async function ShiftDetailPage({ params, searchParams }: PageProps) {
  const [{ shiftId }, { org }] = await Promise.all([params, searchParams]);
  const organization = getOrganizationBySlug(org);
  const detail = getShiftDetail(shiftId);

  if (!detail || detail.project.organizationId !== organization.id) {
    notFound();
  }

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold">{detail.shift.title}</h2>
          <p className="text-sm text-zinc-600">{detail.project.name}</p>
          <p className="text-sm text-zinc-600">{formatDateRange(detail.shift.startAt, detail.shift.endAt)}</p>
          <p className="mt-2 text-sm font-medium">Coverage: {detail.coverage.assigned}/{detail.coverage.positions} assigned</p>
        </section>

        <section className="grid gap-4">
          {detail.grouped.map((item) => (
            <article key={item.requirement.id} className="rounded-xl border border-zinc-200 bg-white p-6">
              <h3 className="text-lg font-semibold">{item.role?.name ?? "Role"}</h3>
              <p className="text-sm text-zinc-600">{item.assignedPeople.length}/{item.requirement.quantity} assigned</p>
              <ul className="mt-3 grid gap-2">
                {item.assignedPeople.map(({ person, assignment }) => (
                  <li key={assignment.id} className="rounded bg-zinc-100 px-3 py-2 text-sm">
                    ✓ {person.firstName} {person.lastName} · {assignment.status}
                  </li>
                ))}
                {Array.from({ length: item.openSlots }).map((_, index) => (
                  <li key={index} className="rounded border border-dashed border-zinc-300 px-3 py-2 text-sm">
                    OPEN SLOT
                  </li>
                ))}
              </ul>

              {item.openSlots > 0 ? (
                <div className="mt-4 rounded-lg border border-zinc-200 p-4">
                  <p className="text-sm font-semibold">Suggested volunteers</p>
                  <ul className="mt-2 grid gap-2 text-sm">
                    {item.suggestions.map((suggestion) => (
                      <li key={suggestion.person.id} className="rounded bg-zinc-100 px-3 py-2">
                        {suggestion.person.firstName} {suggestion.person.lastName} · {suggestion.availabilityStatus}
                        {suggestion.conflict ? " · conflict" : " · no conflicts"}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
