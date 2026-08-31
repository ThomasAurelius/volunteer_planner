"use client";

import { Fragment, FormEvent, useEffect, useState } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

function formatTime(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${period}`;
}

type Schedule = {
  id: string;
  projectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  notes: string;
};

type EditDraft = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  notes: string;
};

const emptyDraft = (): EditDraft => ({
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "17:00",
  title: "",
  notes: "",
});

type Props = {
  projectId: string;
  projectName: string;
};

export function ProjectScheduleManager({ projectId, projectName }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [newDraft, setNewDraft] = useState<EditDraft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>(emptyDraft());

  async function fetchSchedules(signal?: AbortSignal): Promise<{ schedules: Schedule[] } | null> {
    try {
      const response = await fetch(
        `/api/schedules?projectId=${encodeURIComponent(projectId)}`,
        { cache: "no-store", signal },
      );
      if (signal?.aborted) return null;
      if (!response.ok) return null;
      return (await response.json()) as { schedules: Schedule[] };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return null;
      return null;
    }
  }

  async function loadSchedules(options?: { resetMessage?: boolean }) {
    if (options?.resetMessage !== false) setMessage(null);
    const data = await fetchSchedules();
    if (!data) {
      setMessage("Failed to load schedules.");
      setLoading(false);
      return;
    }
    setSchedules(data.schedules);
    setLoading(false);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const data = await fetchSchedules(controller.signal);
      if (controller.signal.aborted) return;
      if (!data) {
        setMessage("Failed to load schedules.");
        setLoading(false);
        return;
      }
      setSchedules(data.schedules);
      setLoading(false);
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [projectId]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newDraft, projectId }),
    });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to create schedule.");
      setSubmitting(false);
      return;
    }

    setNewDraft(emptyDraft());
    setMessage("Schedule added.");
    await loadSchedules({ resetMessage: false });
    setSubmitting(false);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/schedules/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft),
    });

    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to update schedule.");
      setSubmitting(false);
      return;
    }

    setEditingId(null);
    setMessage("Schedule updated.");
    await loadSchedules({ resetMessage: false });
    setSubmitting(false);
  }

  async function handleDelete(scheduleId: string) {
    if (!window.confirm("Delete this schedule entry?")) return;
    setSubmitting(true);
    setMessage(null);

    const response = await fetch(`/api/schedules/${scheduleId}`, { method: "DELETE" });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(body.error ?? "Failed to delete schedule.");
      setSubmitting(false);
      return;
    }

    setMessage("Schedule deleted.");
    await loadSchedules({ resetMessage: false });
    setSubmitting(false);
  }

  function startEditing(schedule: Schedule) {
    setEditingId(schedule.id);
    setEditDraft({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      title: schedule.title,
      notes: schedule.notes,
    });
  }

  const schedulesByDay = DAYS.map((_, dayIndex) =>
    schedules.filter((s) => s.dayOfWeek === dayIndex),
  );

  return (
    <div className="mt-4">
      <h3 className="font-semibold text-indigo-900">
        Weekly Schedule — <span className="font-normal text-slate-700">{projectName}</span>
      </h3>

      {message ? (
        <p className="mt-2 rounded bg-indigo-50 px-3 py-2 text-sm text-indigo-800">{message}</p>
      ) : null}

      {/* Add new schedule form */}
      <form
        onSubmit={handleCreate}
        className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4"
      >
        <p className="mb-3 text-sm font-semibold text-indigo-900">Add Schedule Block</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Day of Week</label>
            <select
              className="rounded border border-indigo-200 bg-white px-2 py-2 text-sm"
              value={newDraft.dayOfWeek}
              onChange={(e) => setNewDraft((d) => ({ ...d, dayOfWeek: Number(e.target.value) }))}
            >
              {DAYS.map((day, i) => (
                <option key={day} value={i}>{day}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Start Time</label>
            <select
              className="rounded border border-indigo-200 bg-white px-2 py-2 text-sm"
              value={newDraft.startTime}
              onChange={(e) => setNewDraft((d) => ({ ...d, startTime: e.target.value }))}
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">End Time</label>
            <select
              className="rounded border border-indigo-200 bg-white px-2 py-2 text-sm"
              value={newDraft.endTime}
              onChange={(e) => setNewDraft((d) => ({ ...d, endTime: e.target.value }))}
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Title (optional)</label>
            <input
              className="rounded border border-indigo-200 bg-white px-2 py-2 text-sm"
              placeholder="e.g. Morning shift"
              value={newDraft.title}
              onChange={(e) => setNewDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-indigo-700 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
            >
              Add Block
            </button>
          </div>
        </div>
      </form>

      {/* Weekly grid view */}
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className="rounded-t bg-indigo-700 px-2 py-2 text-center text-xs font-semibold text-white"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{DAY_SHORT[i]}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day, dayIndex) => (
              <div
                key={day}
                className="min-h-32 rounded-b border border-indigo-100 bg-white p-1"
              >
                {loading ? (
                  <p className="text-center text-xs text-slate-400 pt-4">…</p>
                ) : schedulesByDay[dayIndex].length === 0 ? (
                  <p className="text-center text-xs text-slate-300 pt-4">—</p>
                ) : (
                  <ul className="grid gap-1">
                    {schedulesByDay[dayIndex].map((schedule) =>
                      editingId === schedule.id ? null : (
                        <li
                          key={schedule.id}
                          className="rounded bg-indigo-100 px-2 py-1.5 text-xs"
                        >
                          <p className="font-semibold text-indigo-900">
                            {formatTime(schedule.startTime)}–{formatTime(schedule.endTime)}
                          </p>
                          {schedule.title ? (
                            <p className="truncate text-indigo-700">{schedule.title}</p>
                          ) : null}
                          <div className="mt-1 flex gap-1">
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => startEditing(schedule)}
                              className="rounded bg-indigo-600 px-1.5 py-0.5 text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() => handleDelete(schedule.id)}
                              className="rounded bg-rose-600 px-1.5 py-0.5 text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              Del
                            </button>
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit form (shown when editing) */}
      {editingId ? (
        <form
          onSubmit={handleUpdate}
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-amber-900">Edit Schedule Block</p>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Day of Week</label>
              <select
                className="rounded border border-amber-200 bg-white px-2 py-2 text-sm"
                value={editDraft.dayOfWeek}
                onChange={(e) => setEditDraft((d) => ({ ...d, dayOfWeek: Number(e.target.value) }))}
              >
                {DAYS.map((day, i) => (
                  <option key={day} value={i}>{day}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Start Time</label>
              <select
                className="rounded border border-amber-200 bg-white px-2 py-2 text-sm"
                value={editDraft.startTime}
                onChange={(e) => setEditDraft((d) => ({ ...d, startTime: e.target.value }))}
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">End Time</label>
              <select
                className="rounded border border-amber-200 bg-white px-2 py-2 text-sm"
                value={editDraft.endTime}
                onChange={(e) => setEditDraft((d) => ({ ...d, endTime: e.target.value }))}
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Title (optional)</label>
              <input
                className="rounded border border-amber-200 bg-white px-2 py-2 text-sm"
                value={editDraft.title}
                onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
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

      {/* Time reference table */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-indigo-700 hover:text-indigo-900">
          View half-hour time reference
        </summary>
        <div className="mt-2 overflow-x-auto rounded border border-indigo-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-indigo-50">
                <th className="border-b border-indigo-100 px-3 py-1.5 text-left font-semibold text-slate-600">24h</th>
                <th className="border-b border-indigo-100 px-3 py-1.5 text-left font-semibold text-slate-600">12h</th>
                <th className="border-b border-indigo-100 px-3 py-1.5 text-left font-semibold text-slate-600">24h</th>
                <th className="border-b border-indigo-100 px-3 py-1.5 text-left font-semibold text-slate-600">12h</th>
                <th className="border-b border-indigo-100 px-3 py-1.5 text-left font-semibold text-slate-600">24h</th>
                <th className="border-b border-indigo-100 px-3 py-1.5 text-left font-semibold text-slate-600">12h</th>
                <th className="border-b border-indigo-100 px-3 py-1.5 text-left font-semibold text-slate-600">24h</th>
                <th className="border-b border-indigo-100 px-3 py-1.5 text-left font-semibold text-slate-600">12h</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, row) => (
                <tr key={row} className={row % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  {[0, 1, 2, 3].map((col) => {
                    const slotIndex = col * 12 + row * 2;
                    const slot1 = TIME_SLOTS[slotIndex];
                    const slot2 = TIME_SLOTS[slotIndex + 1];
                    if (!slot1) return <td key={col} colSpan={2} />;
                    return (
                      <Fragment key={col}>
                        <td className="border-r border-indigo-50 px-3 py-1 text-slate-500">{slot1}</td>
                        <td className="border-r border-indigo-100 px-3 py-1 font-medium text-slate-700">{formatTime(slot1)}</td>
                        {slot2 ? (
                          <>
                            <td className="border-r border-indigo-50 px-3 py-1 text-slate-500">{slot2}</td>
                            <td className="border-r border-indigo-100 px-3 py-1 font-medium text-slate-700">{formatTime(slot2)}</td>
                          </>
                        ) : <td colSpan={2} />}
                      </Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
