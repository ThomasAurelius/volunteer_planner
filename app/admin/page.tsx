import { Navigation } from "@/components/navigation";
import { AdminOrganizationsManager } from "@/components/admin-organizations-manager";
import { getOrganizationBySlug } from "@/lib/mvp-data";

type PageProps = {
  searchParams: Promise<{ org?: string }>;
};

export default async function AdminPage({ searchParams }: PageProps) {
  const { org } = await searchParams;
  const organization = getOrganizationBySlug(org);

  return (
    <div>
      <Navigation organizationSlug={organization.slug} />
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <section className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Admin</h2>
          <p className="mt-2 text-slate-700">Manage organizations.</p>
          <AdminOrganizationsManager />
        </section>
      </main>
    </div>
  );
}
