import { Navigation } from "@/components/navigation";
import { ProjectsOrgBrowser } from "@/components/projects-org-browser";
import { getOrganizationBySlug } from "@/lib/mvp-data";

type PageProps = {
  searchParams: Promise<{ org?: string }>;
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { org } = await searchParams;
  const organization = getOrganizationBySlug(org);

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Organizations &amp; Projects</h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse all organizations and their projects. Click <strong>Manage Schedules</strong> to add, edit, or remove weekly schedule blocks for a project.
          </p>
        </div>
        <ProjectsOrgBrowser organizationSlug={organization.slug} />
      </main>
    </div>
  );
}
