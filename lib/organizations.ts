import { Collection, Document } from "mongodb";

export type OrganizationPayload = {
  name?: string;
  slug?: string;
  timezone?: string;
};

let ensureSlugIndexPromise: Promise<string> | null = null;

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseOrganizationPayload(payload: OrganizationPayload) {
  const name = normalize(payload.name);
  const timezone = normalize(payload.timezone);
  const rawSlug = normalize(payload.slug);
  const slug = toSlug(rawSlug || name);

  if (!name || !timezone || !slug) {
    return null;
  }

  return { name, slug, timezone };
}

export function ensureSlugUniqueIndex(organizations: Collection<Document>) {
  if (!ensureSlugIndexPromise) {
    ensureSlugIndexPromise = organizations.createIndex({ slug: 1 }, { unique: true }).catch((err: unknown) => {
      ensureSlugIndexPromise = null;
      throw err;
    });
  }

  return ensureSlugIndexPromise;
}
