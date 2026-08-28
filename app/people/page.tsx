import Link from "next/link";

import { Navigation } from "@/components/navigation";
import { getOrganizationBySlug, getPeopleForOrganization } from "@/lib/mvp-data";

type PageProps = {
  searchParams: Promise<{ org?: string; query?: string }>;
};

export default async function PeoplePage({ searchParams }: PageProps) {
  const { org, query } = await searchParams;
  const organization = getOrganizationBySlug(org);

  const normalizedQuery = query?.toLowerCase().trim();
  const orgPeople = getPeopleForOrganization(organization.id).filter((person) => {
    if (!normalizedQuery) return true;

    const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
    return fullName.includes(normalizedQuery) || person.email.toLowerCase().includes(normalizedQuery);
  });

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">People</h2>
          <p className="mt-2 text-sm text-slate-600">Search: append <code>?query=name</code> to this URL.</p>
          <ul className="mt-4 grid gap-3">
            {orgPeople.map((person) => (
              <li key={person.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium">
                  {person.firstName} {person.lastName}
                </p>
                <p className="text-sm text-slate-600">{person.email}</p>
                <Link href={`/people/${person.id}?org=${organization.slug}`} className="mt-2 inline-flex text-sm font-medium text-indigo-700 underline hover:text-indigo-900">
                  Person detail
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
