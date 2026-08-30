import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const setCookieMock = vi.fn();
  const cookiesMock = vi.fn(async () => ({ set: setCookieMock }));
  const compareMock = vi.fn();
  const signTokenMock = vi.fn();
  const findOneMock = vi.fn();
  const collectionMock = vi.fn(() => ({ findOne: findOneMock }));
  const getDbMock = vi.fn(async () => ({ collection: collectionMock }));

  return {
    setCookieMock,
    cookiesMock,
    compareMock,
    signTokenMock,
    findOneMock,
    collectionMock,
    getDbMock,
  };
});

vi.mock("next/headers", () => ({ cookies: mocks.cookiesMock }));
vi.mock("bcryptjs", () => ({ compare: mocks.compareMock }));
vi.mock("@/lib/auth", () => ({
  signToken: mocks.signTokenMock,
  COOKIE_NAME: "auth_token",
  TOKEN_MAX_AGE: 60,
}));
vi.mock("@/lib/mongodb", () => ({ getDb: mocks.getDbMock }));

import { POST } from "./route";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signTokenMock.mockResolvedValue("signed-token");
  });

  it("returns 400 when email or password is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "user@example.com" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({ error: "Email and password are required" });
    expect(response.status).toBe(400);
  });

  it("returns 401 when user is not found", async () => {
    mocks.findOneMock.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "noone@example.com", password: "password123" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({ error: "Invalid credentials" });
    expect(response.status).toBe(401);
    expect(mocks.compareMock).not.toHaveBeenCalled();
  });

  it("returns 401 when user has no passwordHash (legacy or corrupt record)", async () => {
    mocks.findOneMock.mockResolvedValue({ _id: { toString: () => "user-id" }, email: "user@example.com" });

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "password123" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({ error: "Invalid credentials" });
    expect(response.status).toBe(401);
    expect(mocks.compareMock).not.toHaveBeenCalled();
  });

  it("returns 401 when password does not match", async () => {
    mocks.findOneMock.mockResolvedValue({
      _id: { toString: () => "user-id" },
      email: "user@example.com",
      passwordHash: "hashed-password",
    });
    mocks.compareMock.mockResolvedValue(false);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "wrongpassword" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({ error: "Invalid credentials" });
    expect(response.status).toBe(401);
  });

  it("returns 200 and sets cookie on successful login", async () => {
    mocks.findOneMock.mockResolvedValue({
      _id: { toString: () => "user-id" },
      email: "user@example.com",
      passwordHash: "hashed-password",
    });
    mocks.compareMock.mockResolvedValue(true);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "password123" }),
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
