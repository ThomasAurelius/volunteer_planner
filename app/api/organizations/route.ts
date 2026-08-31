import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type OrganizationPayload = {
  name?: string;
  slug?: string;
  timezone?: string;
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

function parseOrganizationPayload(payload: OrganizationPayload) {
  const name = normalize(payload.name);
  const timezone = normalize(payload.timezone);
  const rawSlug = normalize(payload.slug);
  const slug = toSlug(rawSlug || name);

  if (!name) {
    return { error: "Organization name is required" } as const;
  }

  if (!timezone) {
    return { error: "Organization timezone is required" } as const;
  }

  if (!slug) {
    return { error: "Organization slug is required" } as const;
  }

  return { name, slug, timezone } as const;
}

export async function GET() {
  try {
    const db = await getDb();
    const organizations = await db
      .collection("organizations")
      .find({})
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({
      organizations: organizations.map((organization) => ({
        id: organization._id.toString(),
        name: organization.name,
        slug: organization.slug,
        timezone: organization.timezone,
        createdAt: organization.createdAt,
      })),
    });
  } catch (err) {
    console.error("[organizations:list]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = parseOrganizationPayload((await request.json()) as OrganizationPayload);
    if ("error" in payload) {
      return NextResponse.json({ error: payload.error }, { status: 400 });
    }

    const db = await getDb();
    const organizations = db.collection("organizations");
    await organizations.createIndex({ slug: 1 }, { unique: true });

    const existing = await organizations.findOne({ slug: payload.slug });
    if (existing) {
      return NextResponse.json({ error: "Organization slug already exists" }, { status: 409 });
    }

    const now = new Date();
    const result = await organizations.insertOne({
      name: payload.name,
      slug: payload.slug,
      timezone: payload.timezone,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        organization: {
          id: result.insertedId.toString(),
          name: payload.name,
          slug: payload.slug,
          timezone: payload.timezone,
          createdAt: now.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return NextResponse.json({ error: "Organization slug already exists" }, { status: 409 });
    }

    console.error("[organizations:create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
