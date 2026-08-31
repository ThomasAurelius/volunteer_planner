import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const updateOneMock = vi.fn();
  const deleteOneMock = vi.fn();
  const collectionMock = vi.fn(() => ({ updateOne: updateOneMock, deleteOne: deleteOneMock }));
  const getDbMock = vi.fn(async () => ({ collection: collectionMock }));

  return { updateOneMock, deleteOneMock, collectionMock, getDbMock };
});

vi.mock("@/lib/mongodb", () => ({ getDb: mocks.getDbMock }));

import { DELETE, PUT } from "./route";

const VALID_ID = "507f1f77bcf86cd799439011";

function makeContext(roleId: string) {
  return { params: Promise.resolve({ roleId }) };
}

describe("role item route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateOneMock.mockResolvedValue({ matchedCount: 1 });
    mocks.deleteOneMock.mockResolvedValue({ deletedCount: 1 });
  });

  it("returns 400 for invalid role id on PUT", async () => {
    const response = await PUT(
      new Request("http://localhost/api/roles/bad-id", {
        method: "PUT",
        body: JSON.stringify({ name: "Volunteer" }),
      }),
      makeContext("bad-id"),
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 when name is missing on PUT", async () => {
    const response = await PUT(
      new Request(`http://localhost/api/roles/${VALID_ID}`, {
        method: "PUT",
        body: JSON.stringify({}),
      }),
      makeContext(VALID_ID),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when role not found on PUT", async () => {
    mocks.updateOneMock.mockResolvedValue({ matchedCount: 0 });
    const response = await PUT(
      new Request(`http://localhost/api/roles/${VALID_ID}`, {
        method: "PUT",
        body: JSON.stringify({ name: "Volunteer" }),
      }),
      makeContext(VALID_ID),
    );
    expect(response.status).toBe(404);
  });

  it("updates a role successfully", async () => {
    const response = await PUT(
      new Request(`http://localhost/api/roles/${VALID_ID}`, {
        method: "PUT",
        body: JSON.stringify({ name: "Updated Role", description: "Updated desc" }),
      }),
      makeContext(VALID_ID),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns 400 for invalid role id on DELETE", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/roles/bad-id", { method: "DELETE" }),
      makeContext("bad-id"),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when role not found on DELETE", async () => {
    mocks.deleteOneMock.mockResolvedValue({ deletedCount: 0 });
    const response = await DELETE(
      new Request(`http://localhost/api/roles/${VALID_ID}`, { method: "DELETE" }),
      makeContext(VALID_ID),
    );
    expect(response.status).toBe(404);
  });

  it("deletes a role successfully", async () => {
    const response = await DELETE(
      new Request(`http://localhost/api/roles/${VALID_ID}`, { method: "DELETE" }),
      makeContext(VALID_ID),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
