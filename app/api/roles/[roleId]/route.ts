import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ roleId: string }>;
};

function parseRoleId(roleId: string) {
  if (!ObjectId.isValid(roleId)) {
    return null;
  }
  return new ObjectId(roleId);
}

function parseRolePayload(payload: {
  name?: unknown;
  description?: unknown;
}) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";

  if (!name) {
    return null;
  }

  return { name, description } as const;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { roleId } = await context.params;
    const objectId = parseRoleId(roleId);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid role id" }, { status: 400 });
    }

    const payload = parseRolePayload((await request.json()) as Record<string, unknown>);
    if (!payload) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();
    const updateResult = await db.collection("roles").updateOne(
      { _id: objectId },
      {
        $set: {
          name: payload.name,
          description: payload.description,
          updatedAt: now,
        },
      },
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[roles:update]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { roleId } = await context.params;
    const objectId = parseRoleId(roleId);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid role id" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("roles").deleteOne({ _id: objectId });

    if (!result.deletedCount) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[roles:delete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
