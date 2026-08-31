import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function parseRolePayload(payload: {
  projectId?: unknown;
  name?: unknown;
  description?: unknown;
}) {
  const projectId = typeof payload.projectId === "string" ? payload.projectId.trim() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";

  if (!projectId || !name) {
    return null;
  }

  return { projectId, name, description } as const;
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
      .collection("roles")
      .find({ projectId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({
      roles: docs.map((doc) => ({
        id: doc._id.toString(),
        projectId: doc.projectId as string,
        name: doc.name as string,
        description: (doc.description as string | undefined) ?? "",
      })),
    });
  } catch (err) {
    console.error("[roles:list]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = parseRolePayload((await request.json()) as Record<string, unknown>);
    if (!payload) {
      return NextResponse.json({ error: "projectId and name are required" }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();
    const result = await db.collection("roles").insertOne({
      projectId: payload.projectId,
      name: payload.name,
      description: payload.description,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        role: {
          id: result.insertedId.toString(),
          projectId: payload.projectId,
          name: payload.name,
          description: payload.description,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[roles:create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
