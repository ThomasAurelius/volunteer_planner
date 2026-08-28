import Link from "next/link";

import { Navigation } from "@/components/navigation";
import { getOrganizationBySlug, getProjectsForOrganization } from "@/lib/mvp-data";

type PageProps = {
  searchParams: Promise<{ org?: string }>;
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { org } = await searchParams;
  const organization = getOrganizationBySlug(org);
  const orgProjects = getProjectsForOrganization(organization.id);

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Projects</h2>
          <ul className="mt-4 grid gap-3">
            {orgProjects.map((project) => (
              <li key={project.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium">{project.name}</p>
                <p className="text-sm text-slate-600">{project.description}</p>
                <p className="text-sm text-slate-600">{project.location}</p>
                <Link href={`/projects/${project.id}?org=${organization.slug}`} className="mt-2 inline-flex text-sm font-medium text-indigo-700 underline hover:text-indigo-900">
                  Open project detail
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
