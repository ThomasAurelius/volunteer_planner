import { Navigation } from "@/components/navigation";
import { getOrganizationBySlug, memberships } from "@/lib/mvp-data";

type PageProps = {
  searchParams: Promise<{ org?: string }>;
};

export default async function OrganizationSettingsPage({ searchParams }: PageProps) {
  const { org } = await searchParams;
  const organization = getOrganizationBySlug(org);

  const roleSummary = memberships
    .filter((membership) => membership.organizationId === organization.id)
    .reduce(
      (summary, membership) => {
        summary[membership.role] += 1;
        return summary;
      },
      { volunteer: 0, coordinator: 0, admin: 0 },
    );

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Organization Settings</h2>
          <p className="mt-2 text-slate-700">{organization.name}</p>
          <p className="text-sm text-slate-600">Timezone: {organization.timezone}</p>

          <h3 className="mt-6 font-semibold">Permission model</h3>
          <ul className="mt-2 grid gap-2 text-sm">
            <li className="rounded bg-indigo-50 px-3 py-2 text-indigo-800">Volunteer · View/claim own shifts ({roleSummary.volunteer})</li>
            <li className="rounded bg-indigo-50 px-3 py-2 text-indigo-800">Coordinator · Manage projects, shifts, people ({roleSummary.coordinator})</li>
            <li className="rounded bg-indigo-50 px-3 py-2 text-indigo-800">Admin · Full organization administration ({roleSummary.admin})</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
