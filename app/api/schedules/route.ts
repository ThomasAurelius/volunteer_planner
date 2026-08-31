import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function parseSchedulePayload(payload: {
  projectId?: unknown;
  dayOfWeek?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  title?: unknown;
  notes?: unknown;
}) {
  const projectId = typeof payload.projectId === "string" ? payload.projectId.trim() : "";
  const dayOfWeek = typeof payload.dayOfWeek === "number" ? payload.dayOfWeek : -1;
  const startTime = typeof payload.startTime === "string" ? payload.startTime.trim() : "";
  const endTime = typeof payload.endTime === "string" ? payload.endTime.trim() : "";
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const notes = typeof payload.notes === "string" ? payload.notes.trim() : undefined;

  if (!projectId || dayOfWeek < 0 || dayOfWeek > 6 || !startTime || !endTime) {
    return null;
  }

  return { projectId, dayOfWeek, startTime, endTime, title, notes } as const;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const db = await getDb();
    const docs = await db
      .collection("schedules")
      .find({ projectId })
      .sort({ dayOfWeek: 1, startTime: 1 })
      .toArray();

    return NextResponse.json({
      schedules: docs.map((doc) => ({
        id: doc._id.toString(),
        projectId: doc.projectId as string,
        dayOfWeek: doc.dayOfWeek as number,
        startTime: doc.startTime as string,
        endTime: doc.endTime as string,
        title: (doc.title as string | undefined) ?? "",
        notes: (doc.notes as string | undefined) ?? "",
      })),
    });
  } catch (err) {
    console.error("[schedules:list]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = parseSchedulePayload((await request.json()) as Record<string, unknown>);
    if (!payload) {
      return NextResponse.json(
        { error: "projectId, dayOfWeek (0–6), startTime, and endTime are required" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const now = new Date();
    const result = await db.collection("schedules").insertOne({
      projectId: payload.projectId,
      dayOfWeek: payload.dayOfWeek,
      startTime: payload.startTime,
      endTime: payload.endTime,
      title: payload.title,
      notes: payload.notes ?? "",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        schedule: {
          id: result.insertedId.toString(),
          projectId: payload.projectId,
          dayOfWeek: payload.dayOfWeek,
          startTime: payload.startTime,
          endTime: payload.endTime,
          title: payload.title,
          notes: payload.notes ?? "",
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[schedules:create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
