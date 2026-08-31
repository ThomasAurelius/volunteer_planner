import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const deleteOneMock = vi.fn();
  const updateOneMock = vi.fn();
  const collectionMock = vi.fn(() => ({ deleteOne: deleteOneMock, updateOne: updateOneMock }));
  const getDbMock = vi.fn(async () => ({ collection: collectionMock }));

  return { deleteOneMock, updateOneMock, collectionMock, getDbMock };
});

vi.mock("@/lib/mongodb", () => ({ getDb: mocks.getDbMock }));

import { DELETE, PUT } from "./route";

const validId = "507f1f77bcf86cd799439011";

function makeContext(scheduleId: string) {
  return { params: Promise.resolve({ scheduleId }) };
}

describe("schedules [scheduleId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateOneMock.mockResolvedValue({ matchedCount: 1 });
    mocks.deleteOneMock.mockResolvedValue({ deletedCount: 1 });
  });

  it("returns 400 for invalid schedule id on PUT", async () => {
    const response = await PUT(
      new Request("http://localhost/api/schedules/bad-id", { method: "PUT", body: JSON.stringify({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }) }),
      makeContext("bad-id"),
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when required fields are missing on PUT", async () => {
    const response = await PUT(
      new Request(`http://localhost/api/schedules/${validId}`, { method: "PUT", body: JSON.stringify({}) }),
      makeContext(validId),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when schedule not found on PUT", async () => {
    mocks.updateOneMock.mockResolvedValue({ matchedCount: 0 });
    const response = await PUT(
      new Request(`http://localhost/api/schedules/${validId}`, {
        method: "PUT",
        body: JSON.stringify({ dayOfWeek: 2, startTime: "10:00", endTime: "14:00" }),
      }),
      makeContext(validId),
    );
    expect(response.status).toBe(404);
  });

  it("updates a schedule", async () => {
    const response = await PUT(
      new Request(`http://localhost/api/schedules/${validId}`, {
        method: "PUT",
        body: JSON.stringify({ dayOfWeek: 3, startTime: "08:00", endTime: "12:00", title: "Updated" }),
      }),
      makeContext(validId),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns 400 for invalid schedule id on DELETE", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/schedules/bad-id", { method: "DELETE" }),
      makeContext("bad-id"),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when schedule not found on DELETE", async () => {
    mocks.deleteOneMock.mockResolvedValue({ deletedCount: 0 });
    const response = await DELETE(
      new Request(`http://localhost/api/schedules/${validId}`, { method: "DELETE" }),
      makeContext(validId),
    );
    expect(response.status).toBe(404);
  });

  it("deletes a schedule", async () => {
    const response = await DELETE(
      new Request(`http://localhost/api/schedules/${validId}`, { method: "DELETE" }),
      makeContext(validId),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
