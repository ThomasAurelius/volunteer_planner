import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const findOneMock = vi.fn();
  const updateOneMock = vi.fn();
  const deleteOneMock = vi.fn();
  const createIndexMock = vi.fn();
  const collectionMock = vi.fn(() => ({ findOne: findOneMock, updateOne: updateOneMock, deleteOne: deleteOneMock, createIndex: createIndexMock }));
  const getDbMock = vi.fn(async () => ({ collection: collectionMock }));

  return {
    findOneMock,
    updateOneMock,
    deleteOneMock,
    createIndexMock,
    collectionMock,
    getDbMock,
  };
});

vi.mock("@/lib/mongodb", () => ({ getDb: mocks.getDbMock }));

import { DELETE, PUT } from "./route";

describe("organization detail route", () => {
  const organizationId = "507f1f77bcf86cd799439011";

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findOneMock.mockResolvedValue(null);
    mocks.updateOneMock.mockResolvedValue({ matchedCount: 1 });
    mocks.deleteOneMock.mockResolvedValue({ deletedCount: 1 });
    mocks.createIndexMock.mockResolvedValue("slug_1");
  });

  it("returns 400 for invalid organization id on update", async () => {
    const response = await PUT(
      new Request("http://localhost/api/organizations/bad-id", {
        method: "PUT",
        body: JSON.stringify({ name: "Name", slug: "name", timezone: "UTC" }),
      }),
      { params: Promise.resolve({ organizationId: "bad-id" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid organization id" });
  });

  it("returns 409 when another organization already uses the slug", async () => {
    mocks.findOneMock.mockResolvedValue({ _id: { toString: () => "507f1f77bcf86cd799439012" } });

    const response = await PUT(
      new Request(`http://localhost/api/organizations/${organizationId}`, {
        method: "PUT",
        body: JSON.stringify({ name: "Name", slug: "name", timezone: "UTC" }),
      }),
      { params: Promise.resolve({ organizationId }) },
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "Organization slug already exists" });
  });

  it("returns 404 when organization does not exist on update", async () => {
    mocks.updateOneMock.mockResolvedValue({ matchedCount: 0 });

    const response = await PUT(
      new Request(`http://localhost/api/organizations/${organizationId}`, {
        method: "PUT",
        body: JSON.stringify({ name: "Name", slug: "name", timezone: "UTC" }),
      }),
      { params: Promise.resolve({ organizationId }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Organization not found" });
  });

  it("updates an organization", async () => {
    const response = await PUT(
      new Request(`http://localhost/api/organizations/${organizationId}`, {
        method: "PUT",
        body: JSON.stringify({ name: "Updated Name", slug: "updated-name", timezone: "UTC" }),
      }),
      { params: Promise.resolve({ organizationId }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.updateOneMock).toHaveBeenCalled();
  });

  it("returns 404 when organization does not exist on delete", async () => {
    mocks.deleteOneMock.mockResolvedValue({ deletedCount: 0 });

    const response = await DELETE(new Request(`http://localhost/api/organizations/${organizationId}`), {
      params: Promise.resolve({ organizationId }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Organization not found" });
  });

  it("deletes an organization", async () => {
    const response = await DELETE(new Request(`http://localhost/api/organizations/${organizationId}`), {
      params: Promise.resolve({ organizationId }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.deleteOneMock).toHaveBeenCalled();
  });
});
