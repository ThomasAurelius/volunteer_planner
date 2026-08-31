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

describe("projects collection route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.insertOneMock.mockResolvedValue({ insertedId: { toString: () => "507f1f77bcf86cd799439022" } });
    mocks.toArrayMock.mockResolvedValue([
      {
        _id: { toString: () => "507f1f77bcf86cd799439022" },
        organizationId: "org_ama",
        name: "Food Distribution",
        description: "Weekly pantry support.",
        location: "Central Food Pantry",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("lists projects without organizationId filter", async () => {
    const response = await GET(new Request("http://localhost/api/projects"));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { projects: { id: string }[] };
    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].id).toBe("507f1f77bcf86cd799439022");
  });

  it("lists projects with organizationId filter", async () => {
    const response = await GET(new Request("http://localhost/api/projects?organizationId=org_ama"));
    expect(response.status).toBe(200);
    expect(mocks.findMock).toHaveBeenCalledWith({ organizationId: "org_ama" });
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({ description: "no name given" }),
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "organizationId and name are required" });
  });

  it("creates a project", async () => {
    const response = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({ organizationId: "org_ama", name: "New Project", description: "Desc", location: "Loc" }),
      }),
    );
    expect(response.status).toBe(201);
    const body = (await response.json()) as { project: { id: string; name: string } };
    expect(body.project.id).toBe("507f1f77bcf86cd799439022");
    expect(body.project.name).toBe("New Project");
  });
});
