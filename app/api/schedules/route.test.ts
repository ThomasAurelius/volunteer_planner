import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const insertOneMock = vi.fn();
  const toArrayMock = vi.fn();
  const sortMock = vi.fn(() => ({ toArray: toArrayMock }));
  const findMock = vi.fn(() => ({ sort: sortMock }));
  const collectionMock = vi.fn(() => ({ insertOne: insertOneMock, find: findMock }));
  const getDbMock = vi.fn(async () => ({ collection: collectionMock }));

  return { insertOneMock, toArrayMock, sortMock, findMock, collectionMock, getDbMock };
});

vi.mock("@/lib/mongodb", () => ({ getDb: mocks.getDbMock }));

import { GET, POST } from "./route";

describe("schedules collection route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.insertOneMock.mockResolvedValue({ insertedId: { toString: () => "507f1f77bcf86cd799439033" } });
    mocks.toArrayMock.mockResolvedValue([
      {
        _id: { toString: () => "507f1f77bcf86cd799439033" },
        projectId: "proj_abc",
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "13:00",
        title: "Morning block",
        notes: "",
      },
    ]);
  });

  it("returns 400 when projectId is missing on GET", async () => {
    const response = await GET(new Request("http://localhost/api/schedules"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "projectId is required" });
  });

  it("returns schedules filtered by projectId", async () => {
    const response = await GET(new Request("http://localhost/api/schedules?projectId=proj_abc"));
    expect(response.status).toBe(200);
    expect(mocks.findMock).toHaveBeenCalledWith({ projectId: "proj_abc" });
    const body = (await response.json()) as { schedules: { id: string; dayOfWeek: number }[] };
    expect(body.schedules).toHaveLength(1);
    expect(body.schedules[0].dayOfWeek).toBe(1);
  });

  it("returns 400 when required fields are missing on POST", async () => {
    const response = await POST(
      new Request("http://localhost/api/schedules", {
        method: "POST",
        body: JSON.stringify({ projectId: "proj_abc" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when dayOfWeek is out of range on POST", async () => {
    const response = await POST(
      new Request("http://localhost/api/schedules", {
        method: "POST",
        body: JSON.stringify({ projectId: "proj_abc", dayOfWeek: 7, startTime: "09:00", endTime: "17:00" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("creates a schedule", async () => {
    const response = await POST(
      new Request("http://localhost/api/schedules", {
        method: "POST",
        body: JSON.stringify({
          projectId: "proj_abc",
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "13:00",
          title: "Morning block",
        }),
      }),
    );
    expect(response.status).toBe(201);
    const body = (await response.json()) as { schedule: { id: string; dayOfWeek: number } };
    expect(body.schedule.id).toBe("507f1f77bcf86cd799439033");
    expect(body.schedule.dayOfWeek).toBe(1);
  });
});
