"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Organization = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
};

type Project = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  location: string;
  status: string;
};

type OrgWithProjects = {
  organization: Organization;
  projects: Project[];
  loading: boolean;
};

export function ProjectsOrgBrowser({ organizationSlug }: { organizationSlug: string }) {
  const [orgsWithProjects, setOrgsWithProjects] = useState<OrgWithProjects[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAll() {
      try {
        const orgResponse = await fetch("/api/organizations", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!orgResponse.ok) {
          setError("Failed to load organizations.");
          setLoadingOrgs(false);
          return;
        }
        const orgData = (await orgResponse.json()) as { organizations: Organization[] };
        if (controller.signal.aborted) return;

        const initial: OrgWithProjects[] = orgData.organizations.map((org) => ({
          organization: org,
          projects: [],
          loading: true,
        }));
        setOrgsWithProjects(initial);
        setLoadingOrgs(false);

        await Promise.all(
          orgData.organizations.map(async (org, index) => {
            try {
              const projResponse = await fetch(
                `/api/projects?organizationId=${encodeURIComponent(org.id)}`,
                { cache: "no-store", signal: controller.signal },
              );
              if (controller.signal.aborted) return;
              if (!projResponse.ok) return;
              const projData = (await projResponse.json()) as { projects: Project[] };
              if (controller.signal.aborted) return;
              setOrgsWithProjects((prev) =>
                prev.map((item, i) =>
                  i === index ? { ...item, projects: projData.projects, loading: false } : item,
                ),
              );
            } catch {
              if (controller.signal.aborted) return;
              setOrgsWithProjects((prev) =>
                prev.map((item, i) =>
                  i === index ? { ...item, loading: false } : item,
                ),
              );
            }
          }),
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Failed to load data.");
        setLoadingOrgs(false);
      }
    }

    void loadAll();

    return () => {
      controller.abort();
    };
  }, []);

  if (loadingOrgs) {
    return <p className="mt-4 text-sm text-slate-600">Loading organizations…</p>;
  }

  if (error) {
    return <p className="mt-4 text-sm text-rose-600">{error}</p>;
  }

  if (orgsWithProjects.length === 0) {
    return <p className="mt-4 text-sm text-slate-600">No organizations found.</p>;
  }

  return (
    <div className="mt-4 grid gap-8">
      {orgsWithProjects.map(({ organization, projects, loading }) => (
        <section key={organization.id} className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-indigo-900">{organization.name}</h2>
              <p className="text-sm text-slate-500">{organization.timezone}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${organization.slug === organizationSlug ? "bg-indigo-700 text-white" : "bg-indigo-100 text-indigo-700"}`}
            >
              {organization.slug}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">Projects</h3>

            {loading ? (
              <p className="mt-2 text-sm text-slate-500">Loading projects…</p>
            ) : projects.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No projects yet.</p>
            ) : (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <li key={project.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-800">{project.name}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${project.status === "archived" ? "bg-slate-100 text-slate-600" : "bg-green-100 text-green-700"}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    {project.description ? (
                      <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                    ) : null}
                    {project.location ? (
                      <p className="mt-0.5 text-xs text-slate-500">{project.location}</p>
                    ) : null}
                    <Link
                      href={`/projects/${project.id}?org=${organization.slug}`}
                      className="mt-3 inline-flex items-center gap-1 rounded bg-indigo-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-800"
                    >
                      Manage Schedules →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
