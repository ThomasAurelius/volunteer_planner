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

describe("roles collection route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.insertOneMock.mockResolvedValue({ insertedId: { toString: () => "507f1f77bcf86cd799439011" } });
    mocks.toArrayMock.mockResolvedValue([
      {
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        projectId: "proj_abc",
        name: "Team Lead",
        description: "Leads the team",
      },
    ]);
  });

  it("returns 400 when projectId is missing on GET", async () => {
    const response = await GET(new Request("http://localhost/api/roles"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "projectId is required" });
  });

  it("returns roles filtered by projectId", async () => {
    const response = await GET(new Request("http://localhost/api/roles?projectId=proj_abc"));
    expect(response.status).toBe(200);
    expect(mocks.findMock).toHaveBeenCalledWith({ projectId: "proj_abc" });
    const body = (await response.json()) as { roles: { id: string; name: string }[] };
    expect(body.roles).toHaveLength(1);
    expect(body.roles[0].name).toBe("Team Lead");
  });

  it("returns 400 when required fields are missing on POST", async () => {
    const response = await POST(
      new Request("http://localhost/api/roles", {
        method: "POST",
        body: JSON.stringify({ projectId: "proj_abc" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when projectId is missing on POST", async () => {
    const response = await POST(
      new Request("http://localhost/api/roles", {
        method: "POST",
        body: JSON.stringify({ name: "Volunteer" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("creates a role", async () => {
    const response = await POST(
      new Request("http://localhost/api/roles", {
        method: "POST",
        body: JSON.stringify({ projectId: "proj_abc", name: "Team Lead", description: "Leads the team" }),
      }),
    );
    expect(response.status).toBe(201);
    const body = (await response.json()) as { role: { id: string; name: string } };
    expect(body.role.id).toBe("507f1f77bcf86cd799439011");
    expect(body.role.name).toBe("Team Lead");
  });
});
