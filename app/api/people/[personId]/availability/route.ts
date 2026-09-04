import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ personId: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const { personId } = await context.params;
    const organizationId = new URL(request.url).searchParams.get("organizationId");
    if (!ObjectId.isValid(personId) || !organizationId) {
      return NextResponse.json({ error: "Valid personId and organizationId are required" }, { status: 400 });
    }
    const db = await getDb();
    const availability = await db.collection("availability").find({ personId, organizationId }).sort({ dayOfWeek: 1, startTime: 1 }).toArray();
    return NextResponse.json({ availability: availability.map((item) => ({ id: item._id.toString(), dayOfWeek: item.dayOfWeek, startTime: item.startTime, endTime: item.endTime, status: item.status })) });
  } catch (err) {
    console.error("[availability:list]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { personId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const organizationId = typeof body.organizationId === "string" ? body.organizationId.trim() : "";
    const dayOfWeek = typeof body.dayOfWeek === "number" ? body.dayOfWeek : -1;
    const startTime = typeof body.startTime === "string" ? body.startTime.trim() : "";
    const endTime = typeof body.endTime === "string" ? body.endTime.trim() : "";
    const status = body.status === "unavailable" ? "unavailable" : "available";
    if (!ObjectId.isValid(personId) || !organizationId || dayOfWeek < 0 || dayOfWeek > 6 || !startTime || !endTime) {
      return NextResponse.json({ error: "personId, organizationId, dayOfWeek, startTime, and endTime are required" }, { status: 400 });
    }
    const db = await getDb();
    const now = new Date();
    const result = await db.collection("availability").insertOne({ personId, organizationId, dayOfWeek, startTime, endTime, status, createdAt: now, updatedAt: now });
    return NextResponse.json({ availability: { id: result.insertedId.toString(), personId, organizationId, dayOfWeek, startTime, endTime, status } }, { status: 201 });
  } catch (err) {
    console.error("[availability:create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
