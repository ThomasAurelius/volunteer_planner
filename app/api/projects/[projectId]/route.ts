import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

function parseProjectId(projectId: string) {
  if (!ObjectId.isValid(projectId)) {
    return null;
  }
  return new ObjectId(projectId);
}

function parseProjectPayload(payload: {
  name?: unknown;
  description?: unknown;
  location?: unknown;
  status?: unknown;
}) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : undefined;
  const location = typeof payload.location === "string" ? payload.location.trim() : undefined;
  const status = payload.status === "archived" ? "archived" : "active";

  if (!name) {
    return null;
  }

  return { name, description, location, status } as const;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const objectId = parseProjectId(projectId);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const payload = parseProjectPayload((await request.json()) as Record<string, unknown>);
    if (!payload) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();
    const updateResult = await db.collection("projects").updateOne(
      { _id: objectId },
      {
        $set: {
          name: payload.name,
          description: payload.description ?? "",
          location: payload.location ?? "",
          status: payload.status,
          updatedAt: now,
        },
      },
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[projects:update]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const objectId = parseProjectId(projectId);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("projects").deleteOne({ _id: objectId });

    if (!result.deletedCount) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[projects:delete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
