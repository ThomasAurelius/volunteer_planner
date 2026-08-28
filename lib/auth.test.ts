import { beforeEach, describe, expect, it, vi } from "vitest";

import { signToken, verifyToken } from "./auth";

describe("auth token helpers", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  it("signs and verifies a token payload", async () => {
    const token = await signToken({ sub: "user-123", email: "test@example.com" });

    await expect(verifyToken(token)).resolves.toEqual({
      sub: "user-123",
      email: "test@example.com",
    });
  });

  it("returns null for tampered tokens", async () => {
    const token = await signToken({ sub: "user-123", email: "test@example.com" });
    const [header, body] = token.split(".");
    const tampered = `${header}.${body}.invalid-signature`;

    await expect(verifyToken(tampered)).resolves.toBeNull();
  });

  it("returns null for expired tokens", async () => {
    const nowSpy = vi.spyOn(Date, "now");
    nowSpy.mockReturnValue(0);
    const token = await signToken({ sub: "user-123", email: "test@example.com" });

    nowSpy.mockReturnValue((60 * 60 * 24 * 8) * 1000);
    await expect(verifyToken(token)).resolves.toBeNull();

    nowSpy.mockRestore();
  });
});
