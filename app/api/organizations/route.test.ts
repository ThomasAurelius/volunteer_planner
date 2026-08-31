import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const findOneMock = vi.fn();
  const insertOneMock = vi.fn();
  const toArrayMock = vi.fn();
  const sortMock = vi.fn(() => ({ toArray: toArrayMock }));
  const findMock = vi.fn(() => ({ sort: sortMock }));
  const collectionMock = vi.fn(() => ({ findOne: findOneMock, insertOne: insertOneMock, find: findMock }));
  const getDbMock = vi.fn(async () => ({ collection: collectionMock }));

  return {
    findOneMock,
    insertOneMock,
    toArrayMock,
    sortMock,
    findMock,
    collectionMock,
    getDbMock,
  };
});

vi.mock("@/lib/mongodb", () => ({ getDb: mocks.getDbMock }));

import { GET, POST } from "./route";

describe("organizations collection route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findOneMock.mockResolvedValue(null);
    mocks.insertOneMock.mockResolvedValue({ insertedId: { toString: () => "507f1f77bcf86cd799439011" } });
    mocks.toArrayMock.mockResolvedValue([
      {
        _id: { toString: () => "507f1f77bcf86cd799439011" },
        name: "Austin Mutual Aid",
        slug: "austin-mutual-aid",
        timezone: "America/Chicago",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("lists organizations", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      organizations: [
        {
          id: "507f1f77bcf86cd799439011",
          name: "Austin Mutual Aid",
          slug: "austin-mutual-aid",
          timezone: "America/Chicago",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
  });

  it("returns 400 when name is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/organizations", {
        method: "POST",
        body: JSON.stringify({ slug: "abc", timezone: "UTC" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Organization name is required" });
  });

  it("returns 409 when slug already exists", async () => {
    mocks.findOneMock.mockResolvedValue({ _id: "existing" });

    const response = await POST(
      new Request("http://localhost/api/organizations", {
        method: "POST",
        body: JSON.stringify({ name: "Austin Mutual Aid", slug: "austin-mutual-aid", timezone: "America/Chicago" }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "Organization slug already exists" });
  });

  it("creates an organization", async () => {
    const response = await POST(
      new Request("http://localhost/api/organizations", {
        method: "POST",
        body: JSON.stringify({ name: "New Org", timezone: "UTC" }),
      }),
    );

    expect(response.status).toBe(201);
    const body = (await response.json()) as { organization: { slug: string } };
    expect(body.organization.slug).toBe("new-org");
    expect(mocks.insertOneMock).toHaveBeenCalled();
  });
});
