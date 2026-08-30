import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const setCookieMock = vi.fn();
  const cookiesMock = vi.fn(async () => ({ set: setCookieMock }));
  const hashMock = vi.fn();
  const signTokenMock = vi.fn();
  const findOneMock = vi.fn();
  const insertOneMock = vi.fn();
  const collectionMock = vi.fn(() => ({ findOne: findOneMock, insertOne: insertOneMock }));
  const getDbMock = vi.fn(async () => ({ collection: collectionMock }));

  return {
    setCookieMock,
    cookiesMock,
    hashMock,
    signTokenMock,
    findOneMock,
    insertOneMock,
    collectionMock,
    getDbMock,
  };
});

vi.mock("next/headers", () => ({ cookies: mocks.cookiesMock }));
vi.mock("bcryptjs", () => ({ hash: mocks.hashMock }));
vi.mock("@/lib/auth", () => ({
  signToken: mocks.signTokenMock,
  COOKIE_NAME: "auth_token",
  TOKEN_MAX_AGE: 60,
}));
vi.mock("@/lib/mongodb", () => ({ getDb: mocks.getDbMock }));

import { MongoServerError } from "mongodb";

import { POST } from "./route";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findOneMock.mockResolvedValue(null);
    mocks.hashMock.mockResolvedValue("hashed-password");
    mocks.signTokenMock.mockResolvedValue("signed-token");
    mocks.insertOneMock.mockResolvedValue({ insertedId: { toString: () => "user-id" } });
  });

  it("returns 409 when insert hits a duplicate key race condition", async () => {
    const duplicateKeyError = new MongoServerError({
      message: "E11000 duplicate key error",
      code: 11000,
    });
    mocks.insertOneMock.mockRejectedValue(duplicateKeyError);

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email: "race@example.com", password: "password123" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({ error: "Email already registered" });
    expect(response.status).toBe(409);
    expect(mocks.signTokenMock).not.toHaveBeenCalled();
    expect(mocks.setCookieMock).not.toHaveBeenCalled();
  });

  it("keeps successful signup behavior unchanged", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email: "new@example.com", password: "password123" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.status).toBe(200);
    expect(mocks.setCookieMock).toHaveBeenCalledWith(
      "auth_token",
      "signed-token",
      expect.objectContaining({ httpOnly: true, maxAge: 60 }),
    );
  });
});
