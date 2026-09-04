import { MongoServerError, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { parseRole } from "../../../../../lib/people";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ organizationId: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { organizationId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const personId = typeof body.personId === "string" ? body.personId.trim() : "";
    if (!personId) return NextResponse.json({ error: "personId is required" }, { status: 400 });

    const db = await getDb();
    const person = ObjectId.isValid(personId) ? await db.collection("users").findOne({ _id: new ObjectId(personId) }) : null;
    if (!person) return NextResponse.json({ error: "Person not found" }, { status: 404 });
    const now = new Date();
    await db.collection("memberships").createIndex({ organizationId: 1, personId: 1 }, { unique: true });
    await db.collection("memberships").insertOne({
      organizationId,
      personId,
      role: parseRole(body.role),
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return NextResponse.json({ error: "Person is already a member" }, { status: 409 });
    }
    console.error("[members:add]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
