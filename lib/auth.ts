const COOKIE_NAME = "auth_token";
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecretKey(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(jwtSecret);
}

export type JwtPayload = {
  sub: string;
  email: string;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let base64: string;
  if (typeof btoa === "function") {
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    base64 = btoa(binary);
  } else {
    base64 = Buffer.from(bytes).toString("base64");
  }

  return base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const padded = input.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
    if (typeof atob === "function") {
      const binary = atob(padded);
      return Uint8Array.from(binary, (char) => char.charCodeAt(0));
    }
    return new Uint8Array(Buffer.from(padded, "base64"));
  } catch {
    return null;
  }
}

async function importSigningKey() {
  return crypto.subtle.importKey("raw", getSecretKey(), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(textEncoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = toBase64Url(
    textEncoder.encode(
      JSON.stringify({
        sub: payload.sub,
        email: payload.email,
        iat: now,
        exp: now + TOKEN_MAX_AGE,
      }),
    ),
  );
  const message = `${header}.${body}`;
  const key = await importSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(message));
  return `${message}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [header, body, signature] = parts;
    if (!header || !body || !signature) {
      return null;
    }

    const headerBytes = fromBase64Url(header);
    const bodyBytes = fromBase64Url(body);
    const signatureBytes = fromBase64Url(signature);

    if (!headerBytes || !bodyBytes || !signatureBytes) {
      return null;
    }

    const parsedHeader = JSON.parse(textDecoder.decode(headerBytes)) as { alg?: string };
    if (parsedHeader.alg !== "HS256") {
      return null;
    }

    const key = await importSigningKey();
    const message = `${header}.${body}`;
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, textEncoder.encode(message));
    if (!valid) {
      return null;
    }

    const payload = JSON.parse(textDecoder.decode(bodyBytes)) as { sub?: unknown; email?: unknown; exp?: unknown };
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }

    if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
