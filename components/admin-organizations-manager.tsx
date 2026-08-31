"use client";

import { FormEvent, useEffect, useState } from "react";

type Organization = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  createdAt: string;
};

type Draft = {
  name: string;
  slug: string;
  timezone: string;
};

const emptyDraft: Draft = { name: "", slug: "", timezone: "UTC" };

export function AdminOrganizationsManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [newOrganization, setNewOrganization] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchOrganizations() {
    const response = await fetch("/api/organizations", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as { organizations: Organization[] };
  }

  function applyOrganizations(organizationList: Organization[]) {
    setOrganizations(organizationList);
    setDrafts(
      Object.fromEntries(
        organizationList.map((organization) => [
          organization.id,
          {
            name: organization.name,
            slug: organization.slug,
            timezone: organization.timezone,
          },
        ]),
      ),
    );
  }

  async function loadOrganizations(options?: { setLoadingState?: boolean; resetMessage?: boolean }) {
    const setLoadingState = options?.setLoadingState ?? true;
    const resetMessage = options?.resetMessage ?? true;

    if (setLoadingState) {
      setLoading(true);
    }
    if (resetMessage) {
      setMessage(null);
    }

    const data = await fetchOrganizations();
    if (!data) {
      setMessage("Failed to load organizations.");
      setLoading(false);
      return;
    }

    applyOrganizations(data.organizations);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function loadInitialOrganizations() {
      const data = await fetchOrganizations();
      if (!active) return;
      if (!data) {
        setMessage("Failed to load organizations.");
        setLoading(false);
        return;
      }

      applyOrganizations(data.organizations);
      setLoading(false);
    }

    void loadInitialOrganizations();

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrganization),
    });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to create organization.");
      setSubmitting(false);
      return;
    }

    setNewOrganization(emptyDraft);
    setMessage("Organization created.");
    await loadOrganizations({ setLoadingState: false, resetMessage: false });
    setSubmitting(false);
  }

  async function handleUpdate(organizationId: string) {
    const draft = drafts[organizationId];
    if (!draft) return;

    setSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/organizations/${organizationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to update organization.");
      setSubmitting(false);
      return;
    }

    setMessage("Organization updated.");
    await loadOrganizations({ setLoadingState: false, resetMessage: false });
    setSubmitting(false);
  }

  async function handleDelete(organizationId: string) {
    const confirmed = window.confirm("Delete this organization?");
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/organizations/${organizationId}`, {
      method: "DELETE",
    });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to delete organization.");
      setSubmitting(false);
      return;
    }

    setMessage("Organization deleted.");
    await loadOrganizations({ setLoadingState: false, resetMessage: false });
    setSubmitting(false);
  }

  return (
    <div className="mt-6 grid gap-6">
      <form onSubmit={handleCreate} className="grid gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
        <h3 className="font-semibold text-indigo-900">Add organization</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="rounded border border-indigo-200 bg-white px-3 py-2 text-sm"
            aria-label="New organization name"
            placeholder="Organization name"
            value={newOrganization.name}
            onChange={(event) => setNewOrganization((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            className="rounded border border-indigo-200 bg-white px-3 py-2 text-sm"
            aria-label="New organization slug"
            placeholder="Slug (optional)"
            value={newOrganization.slug}
            onChange={(event) => setNewOrganization((current) => ({ ...current, slug: event.target.value }))}
          />
          <input
            className="rounded border border-indigo-200 bg-white px-3 py-2 text-sm"
            aria-label="New organization timezone"
            placeholder="Timezone"
            value={newOrganization.timezone}
            onChange={(event) => setNewOrganization((current) => ({ ...current, timezone: event.target.value }))}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-fit rounded bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
        >
          Add organization
        </button>
      </form>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-600">Loading organizations...</p>
      ) : (
        <ul className="grid gap-3">
          {organizations.map((organization) => {
            const draft = drafts[organization.id] ?? emptyDraft;

            return (
              <li key={organization.id} className="rounded-lg border border-slate-200 p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    aria-label="Organization name"
                    value={draft.name}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [organization.id]: { ...draft, name: event.target.value },
                      }))
                    }
                  />
                  <input
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    aria-label="Organization slug"
                    value={draft.slug}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [organization.id]: { ...draft, slug: event.target.value },
                      }))
                    }
                  />
                  <input
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                    aria-label="Organization timezone"
                    value={draft.timezone}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [organization.id]: { ...draft, timezone: event.target.value },
                      }))
                    }
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleUpdate(organization.id)}
                    className="rounded bg-indigo-700 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDelete(organization.id)}
                    className="rounded bg-rose-700 px-3 py-2 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
