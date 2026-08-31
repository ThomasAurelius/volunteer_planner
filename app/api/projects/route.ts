import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function parseProjectPayload(payload: {
  organizationId?: unknown;
  name?: unknown;
  description?: unknown;
  location?: unknown;
  status?: unknown;
}) {
  const organizationId = typeof payload.organizationId === "string" ? payload.organizationId.trim() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : undefined;
  const location = typeof payload.location === "string" ? payload.location.trim() : undefined;
  const status = payload.status === "archived" ? "archived" : "active";

  if (!organizationId || !name) {
    return null;
  }

  return { organizationId, name, description, location, status } as const;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    const db = await getDb();
    const query = organizationId ? { organizationId } : {};
    const projectDocs = await db
      .collection("projects")
      .find(query)
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({
      projects: projectDocs.map((project) => ({
        id: project._id.toString(),
        organizationId: project.organizationId as string,
        name: project.name as string,
        description: (project.description as string | undefined) ?? "",
        location: (project.location as string | undefined) ?? "",
        status: (project.status as string) ?? "active",
        createdAt: project.createdAt as string,
      })),
    });
  } catch (err) {
    console.error("[projects:list]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = parseProjectPayload((await request.json()) as Record<string, unknown>);
    if (!payload) {
      return NextResponse.json({ error: "organizationId and name are required" }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();
    const result = await db.collection("projects").insertOne({
      organizationId: payload.organizationId,
      name: payload.name,
      description: payload.description ?? "",
      location: payload.location ?? "",
      status: payload.status,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        project: {
          id: result.insertedId.toString(),
          organizationId: payload.organizationId,
          name: payload.name,
          description: payload.description ?? "",
          location: payload.location ?? "",
          status: payload.status,
          createdAt: now.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[projects:create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
