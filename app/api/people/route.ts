import { MongoServerError, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { parsePersonPayload, parseRole } from "../../../lib/people";

export const dynamic = "force-dynamic";

function personResponse(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    displayName: (doc.displayName as string) ?? "",
    realName: (doc.realName as string) ?? "",
    email: (doc.email as string) ?? "",
    phone: (doc.phone as string) ?? "",
  };
}

export async function GET(request: Request) {
  try {
    const organizationId = new URL(request.url).searchParams.get("organizationId");
    if (!organizationId) return NextResponse.json({ error: "organizationId is required" }, { status: 400 });

    const db = await getDb();
    const memberships = await db.collection("memberships").find({ organizationId, status: "active" }).toArray();
    const ids = memberships.map((membership) => membership.personId);
    const objectIds = ids.filter((id) => ObjectId.isValid(String(id))).map((id) => new ObjectId(String(id)));
    const people = objectIds.length ? await db.collection("users").find({ _id: { $in: objectIds } }).toArray() : [];
    const roleByPerson = new Map(memberships.map((membership) => [String(membership.personId), membership.role]));

    return NextResponse.json({
      people: people.map((person) => ({ ...personResponse(person), role: parseRole(roleByPerson.get(String(person._id))) })),
    });
  } catch (err) {
    console.error("[people:list]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parsePersonPayload(body);
    const organizationId = typeof body.organizationId === "string" ? body.organizationId.trim() : "";
    if (!payload || !organizationId) {
      return NextResponse.json({ error: "displayName, realName, email, and organizationId are required" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("memberships").createIndex({ organizationId: 1, personId: 1 }, { unique: true });
    const existing = await db.collection("users").findOne({ email: payload.email });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const now = new Date();
    const result = await db.collection("users").insertOne({ ...payload, createdAt: now, updatedAt: now });
    await db.collection("memberships").insertOne({
      organizationId,
      personId: result.insertedId.toString(),
      role: parseRole(body.role),
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ person: { ...personResponse({ ...payload, _id: result.insertedId }), role: parseRole(body.role) } }, { status: 201 });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    console.error("[people:create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
