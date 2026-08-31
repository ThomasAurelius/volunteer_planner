"use client";

import { FormEvent, useEffect, useState } from "react";

type Organization = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  createdAt: string;
};

type Project = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  location: string;
  status: string;
};

type NewProject = {
  name: string;
  description: string;
  location: string;
};

const emptyNewProject: NewProject = { name: "", description: "", location: "" };

type Props = {
  organization: Organization;
};

export function AdminOrganizationDetail({ organization }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<NewProject>(emptyNewProject);

  async function fetchProjects() {
    const response = await fetch(`/api/projects?organizationId=${encodeURIComponent(organization.id)}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as { projects: Project[] };
  }

  async function loadProjects(options?: { setLoadingState?: boolean; resetMessage?: boolean }) {
    const setLoadingState = options?.setLoadingState ?? true;
    const resetMessage = options?.resetMessage ?? true;

    if (setLoadingState) setLoading(true);
    if (resetMessage) setMessage(null);

    const data = await fetchProjects();
    if (!data) {
      setMessage("Failed to load projects.");
      setLoading(false);
      return;
    }

    setProjects(data.projects);
    setLoading(false);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const response = await fetch(
        `/api/projects?organizationId=${encodeURIComponent(organization.id)}`,
        { cache: "no-store", signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      if (!response.ok) {
        setMessage("Failed to load projects.");
        setLoading(false);
        return;
      }
      const data = (await response.json()) as { projects: Project[] };
      if (controller.signal.aborted) return;
      setProjects(data.projects);
      setLoading(false);
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [organization.id]);

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newProject, organizationId: organization.id }),
    });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to create project.");
      setSubmitting(false);
      return;
    }

    setNewProject(emptyNewProject);
    setMessage("Project created.");
    await loadProjects({ setLoadingState: false, resetMessage: false });
    setSubmitting(false);
  }

  async function handleDeleteProject(projectId: string) {
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) return;

    setSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to delete project.");
      setSubmitting(false);
      return;
    }

    setMessage("Project deleted.");
    await loadProjects({ setLoadingState: false, resetMessage: false });
    setSubmitting(false);
  }

  return (
    <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
      <h4 className="font-semibold text-indigo-900">Organization Details</h4>
      <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-medium text-slate-600">Name</dt>
          <dd className="text-slate-800">{organization.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-600">Slug</dt>
          <dd className="text-slate-800">{organization.slug}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-600">Timezone</dt>
          <dd className="text-slate-800">{organization.timezone}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <h5 className="font-semibold text-indigo-900">Projects</h5>

        <form onSubmit={handleCreateProject} className="mt-2 grid gap-2 sm:grid-cols-4">
          <input
            className="rounded border border-indigo-200 bg-white px-3 py-2 text-sm"
            aria-label="New project name"
            placeholder="Project name"
            value={newProject.name}
            onChange={(event) => setNewProject((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            className="rounded border border-indigo-200 bg-white px-3 py-2 text-sm"
            aria-label="New project description"
            placeholder="Description (optional)"
            value={newProject.description}
            onChange={(event) => setNewProject((current) => ({ ...current, description: event.target.value }))}
          />
          <input
            className="rounded border border-indigo-200 bg-white px-3 py-2 text-sm"
            aria-label="New project location"
            placeholder="Location (optional)"
            value={newProject.location}
            onChange={(event) => setNewProject((current) => ({ ...current, location: event.target.value }))}
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-indigo-700 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
          >
            Add project
          </button>
        </form>

        {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}

        {loading ? (
          <p className="mt-2 text-sm text-slate-600">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No projects yet.</p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {projects.map((project) => (
              <li key={project.id} className="flex items-start justify-between gap-3 rounded border border-slate-200 bg-white p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{project.name}</p>
                  {project.description ? <p className="text-xs text-slate-600">{project.description}</p> : null}
                  {project.location ? <p className="text-xs text-slate-500">{project.location}</p> : null}
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${project.status === "archived" ? "bg-slate-100 text-slate-600" : "bg-green-100 text-green-700"}`}>
                    {project.status}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDeleteProject(project.id)}
                  className="shrink-0 rounded bg-rose-700 px-2 py-1 text-xs font-medium text-white hover:bg-rose-800 disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
