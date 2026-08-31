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

function makeContext(projectId: string) {
  return { params: Promise.resolve({ projectId }) };
}

describe("projects [projectId] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateOneMock.mockResolvedValue({ matchedCount: 1 });
    mocks.deleteOneMock.mockResolvedValue({ deletedCount: 1 });
  });

  it("returns 400 for invalid project id on PUT", async () => {
    const response = await PUT(
      new Request("http://localhost/api/projects/bad-id", { method: "PUT", body: JSON.stringify({ name: "x" }) }),
      makeContext("bad-id"),
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when name is missing on PUT", async () => {
    const response = await PUT(
      new Request(`http://localhost/api/projects/${validId}`, { method: "PUT", body: JSON.stringify({}) }),
      makeContext(validId),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "name is required" });
  });

  it("returns 404 when project not found on PUT", async () => {
    mocks.updateOneMock.mockResolvedValue({ matchedCount: 0 });
    const response = await PUT(
      new Request(`http://localhost/api/projects/${validId}`, { method: "PUT", body: JSON.stringify({ name: "Updated" }) }),
      makeContext(validId),
    );
    expect(response.status).toBe(404);
  });

  it("updates a project", async () => {
    const response = await PUT(
      new Request(`http://localhost/api/projects/${validId}`, {
        method: "PUT",
        body: JSON.stringify({ name: "Updated", description: "Desc", location: "Loc" }),
      }),
      makeContext(validId),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns 400 for invalid project id on DELETE", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/projects/bad-id", { method: "DELETE" }),
      makeContext("bad-id"),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when project not found on DELETE", async () => {
    mocks.deleteOneMock.mockResolvedValue({ deletedCount: 0 });
    const response = await DELETE(
      new Request(`http://localhost/api/projects/${validId}`, { method: "DELETE" }),
      makeContext(validId),
    );
    expect(response.status).toBe(404);
  });

  it("deletes a project", async () => {
    const response = await DELETE(
      new Request(`http://localhost/api/projects/${validId}`, { method: "DELETE" }),
      makeContext(validId),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
