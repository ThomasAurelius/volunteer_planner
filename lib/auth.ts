import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "auth_token";
const TOKEN_TTL = "7d";
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecretKey(): Uint8Array {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(JWT_SECRET);
}

export type JwtPayload = {
  sub: string;
  email: string;
};

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return { sub: payload.sub as string, email: payload["email"] as string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
