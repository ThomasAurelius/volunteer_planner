import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { ensureSlugUniqueIndex, parseOrganizationPayload } from "../../../lib/organizations";
import type { OrganizationPayload } from "../../../lib/organizations";

export const dynamic = "force-dynamic";

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
    if (!payload) {
      return NextResponse.json({ error: "Name, slug, and timezone are required" }, { status: 400 });
    }

    const db = await getDb();
    const organizations = db.collection("organizations");
    await ensureSlugUniqueIndex(organizations);

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
