import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const toArrayMock = vi.fn();
  const sortMock = vi.fn(() => ({ toArray: toArrayMock }));
  const findMock = vi.fn(() => ({ sort: sortMock, toArray: toArrayMock }));
  const collectionMock = vi.fn(() => ({ find: findMock, createIndex: vi.fn(), findOne: vi.fn(), insertOne: vi.fn() }));
  const getDbMock = vi.fn(async () => ({ collection: collectionMock }));
  return { toArrayMock, findMock, collectionMock, getDbMock };
});

vi.mock("@/lib/mongodb", () => ({ getDb: mocks.getDbMock }));

import { GET } from "./route";

describe("people collection route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.toArrayMock
      .mockResolvedValueOnce([{ personId: "507f1f77bcf86cd799439011", role: "manager", status: "active" }])
      .mockResolvedValueOnce([
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          displayName: "Sam",
          realName: "Sam Example",
          email: "sam@example.com",
          phone: "555-0100",
        },
      ]);
  });

  it("lists real people for an organization", async () => {
    const response = await GET(new Request("http://localhost/api/people?organizationId=org-1"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      people: [
        {
          id: "507f1f77bcf86cd799439011",
          displayName: "Sam",
          realName: "Sam Example",
          email: "sam@example.com",
          phone: "555-0100",
          role: "manager",
        },
      ],
    });
  });
});
