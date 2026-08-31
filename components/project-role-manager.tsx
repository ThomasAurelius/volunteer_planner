"use client";

import { FormEvent, useEffect, useState } from "react";

type Role = {
  id: string;
  projectId: string;
  name: string;
  description: string;
};

type EditDraft = {
  name: string;
  description: string;
};

const emptyDraft = (): EditDraft => ({ name: "", description: "" });

type Props = {
  projectId: string;
};

export function ProjectRoleManager({ projectId }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [newDraft, setNewDraft] = useState<EditDraft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>(emptyDraft());

  async function loadRoles(options?: { resetMessage?: boolean }) {
    if (options?.resetMessage !== false) setMessage(null);
    try {
      const response = await fetch(
        `/api/roles?projectId=${encodeURIComponent(projectId)}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        setMessage("Failed to load roles.");
        setLoading(false);
        return;
      }
      const data = (await response.json()) as { roles: Role[] };
      setRoles(data.roles);
    } catch {
      setMessage("Failed to load roles.");
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadRoles();
  }, [projectId]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newDraft, projectId }),
    });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to create role.");
      setSubmitting(false);
      return;
    }

    setNewDraft(emptyDraft());
    setMessage("Role added.");
    await loadRoles({ resetMessage: false });
    setSubmitting(false);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/roles/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft),
    });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to update role.");
      setSubmitting(false);
      return;
    }

    setEditingId(null);
    setMessage("Role updated.");
    await loadRoles({ resetMessage: false });
    setSubmitting(false);
  }

  async function handleDelete(roleId: string) {
    if (!window.confirm("Delete this role?")) return;
    setSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/roles/${roleId}`, { method: "DELETE" });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to delete role.");
      setSubmitting(false);
      return;
    }

    setMessage("Role deleted.");
    await loadRoles({ resetMessage: false });
    setSubmitting(false);
  }

  function startEditing(role: Role) {
    setEditingId(role.id);
    setEditDraft({ name: role.name, description: role.description });
  }

  return (
    <div className="mt-4">
      <h3 className="font-semibold text-indigo-900">Manage Roles</h3>

      {message ? (
        <p className="mt-2 rounded bg-indigo-50 px-3 py-2 text-sm text-indigo-800">{message}</p>
      ) : null}

      {/* Add role form */}
      <form
        onSubmit={handleCreate}
        className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4"
      >
        <p className="mb-3 text-sm font-semibold text-indigo-900">Add Role</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Role Name</label>
            <input
              required
              className="rounded border border-indigo-200 bg-white px-2 py-2 text-sm"
              placeholder="e.g. Team Lead"
              value={newDraft.name}
              onChange={(e) => setNewDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Description (optional)</label>
            <input
              className="rounded border border-indigo-200 bg-white px-2 py-2 text-sm"
              placeholder="Short description"
              value={newDraft.description}
              onChange={(e) => setNewDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-indigo-700 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
            >
              Add Role
            </button>
          </div>
        </div>
      </form>

      {/* Role list */}
      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : roles.length === 0 ? (
          <p className="text-sm text-slate-500">No roles yet.</p>
        ) : (
          <ul className="grid gap-2">
            {roles.map((role) =>
              editingId === role.id ? null : (
                <li
                  key={role.id}
                  className="flex items-center justify-between rounded-lg border border-indigo-100 bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-indigo-900">{role.name}</p>
                    {role.description ? (
                      <p className="text-sm text-slate-600">{role.description}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => startEditing(role)}
                      className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleDelete(role.id)}
                      className="rounded bg-rose-600 px-3 py-1 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      {/* Edit form */}
      {editingId ? (
        <form
          onSubmit={handleUpdate}
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-amber-900">Edit Role</p>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Role Name</label>
              <input
                required
                className="rounded border border-amber-200 bg-white px-2 py-2 text-sm"
                value={editDraft.name}
                onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Description (optional)</label>
              <input
                className="rounded border border-amber-200 bg-white px-2 py-2 text-sm"
                value={editDraft.description}
                onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
