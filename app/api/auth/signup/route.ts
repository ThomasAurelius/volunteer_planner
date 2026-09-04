import { hash } from "bcryptjs";
import { MongoServerError } from "mongodb";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { signToken, COOKIE_NAME, TOKEN_MAX_AGE } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password, displayName, realName, phone, organizationId, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);
    const now = new Date();
    const result = await users.insertOne({
      email: email.trim().toLowerCase(),
      passwordHash,
      displayName: typeof displayName === "string" && displayName.trim() ? displayName.trim() : email.split("@")[0],
      realName: typeof realName === "string" ? realName.trim() : "",
      phone: typeof phone === "string" ? phone.trim() : "",
      createdAt: now,
      updatedAt: now,
    });
    if (typeof organizationId === "string" && organizationId.trim()) {
      await db.collection("memberships").createIndex({ organizationId: 1, personId: 1 }, { unique: true });
      await db.collection("memberships").insertOne({
        organizationId: organizationId.trim(),
        personId: result.insertedId.toString(),
        role: role === "manager" || role === "admin" ? role : "volunteer",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    const token = await signToken({ sub: result.insertedId.toString(), email });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    console.error("[signup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
