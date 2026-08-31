import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ scheduleId: string }>;
};

function parseScheduleId(scheduleId: string) {
  if (!ObjectId.isValid(scheduleId)) {
    return null;
  }
  return new ObjectId(scheduleId);
}

function parseSchedulePayload(payload: {
  dayOfWeek?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  title?: unknown;
  notes?: unknown;
}) {
  const dayOfWeek = typeof payload.dayOfWeek === "number" ? payload.dayOfWeek : -1;
  const startTime = typeof payload.startTime === "string" ? payload.startTime.trim() : "";
  const endTime = typeof payload.endTime === "string" ? payload.endTime.trim() : "";
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const notes = typeof payload.notes === "string" ? payload.notes.trim() : undefined;

  if (dayOfWeek < 0 || dayOfWeek > 6 || !startTime || !endTime) {
    return null;
  }

  return { dayOfWeek, startTime, endTime, title, notes } as const;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { scheduleId } = await context.params;
    const objectId = parseScheduleId(scheduleId);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid schedule id" }, { status: 400 });
    }

    const payload = parseSchedulePayload((await request.json()) as Record<string, unknown>);
    if (!payload) {
      return NextResponse.json(
        { error: "dayOfWeek (0–6), startTime, and endTime are required" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const now = new Date();
    const updateResult = await db.collection("schedules").updateOne(
      { _id: objectId },
      {
        $set: {
          dayOfWeek: payload.dayOfWeek,
          startTime: payload.startTime,
          endTime: payload.endTime,
          title: payload.title,
          notes: payload.notes ?? "",
          updatedAt: now,
        },
      },
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[schedules:update]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { scheduleId } = await context.params;
    const objectId = parseScheduleId(scheduleId);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid schedule id" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("schedules").deleteOne({ _id: objectId });

    if (!result.deletedCount) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[schedules:delete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
