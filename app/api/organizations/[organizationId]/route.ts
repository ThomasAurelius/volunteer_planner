import { MongoServerError, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type OrganizationPayload = {
  name?: string;
  slug?: string;
  timezone?: string;
};

type RouteContext = {
  params: Promise<{ organizationId: string }>;
};

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseOrganizationId(organizationId: string) {
  if (!ObjectId.isValid(organizationId)) {
    return null;
  }

  return new ObjectId(organizationId);
}

function parseOrganizationPayload(payload: OrganizationPayload) {
  const name = normalize(payload.name);
  const timezone = normalize(payload.timezone);
  const rawSlug = normalize(payload.slug);
  const slug = toSlug(rawSlug || name);

  if (!name || !timezone || !slug) {
    return null;
  }

  return { name, slug, timezone };
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { organizationId } = await context.params;
    const objectId = parseOrganizationId(organizationId);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid organization id" }, { status: 400 });
    }

    const payload = parseOrganizationPayload((await request.json()) as OrganizationPayload);
    if (!payload) {
      return NextResponse.json({ error: "Name, slug, and timezone are required" }, { status: 400 });
    }

    const db = await getDb();
    const organizations = db.collection("organizations");

    const existing = await organizations.findOne({ slug: payload.slug });
    if (existing && existing._id.toString() !== organizationId) {
      return NextResponse.json({ error: "Organization slug already exists" }, { status: 409 });
    }

    const now = new Date();
    const updateResult = await organizations.updateOne(
      { _id: objectId },
      {
        $set: {
          name: payload.name,
          slug: payload.slug,
          timezone: payload.timezone,
          updatedAt: now,
        },
      },
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return NextResponse.json({ error: "Organization slug already exists" }, { status: 409 });
    }

    console.error("[organizations:update]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { organizationId } = await context.params;
    const objectId = parseOrganizationId(organizationId);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid organization id" }, { status: 400 });
    }

    const db = await getDb();
    const organizations = db.collection("organizations");
    const result = await organizations.deleteOne({ _id: objectId });

    if (!result.deletedCount) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[organizations:delete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
