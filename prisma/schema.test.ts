import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const prismaDir = path.dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(path.join(prismaDir, "schema.prisma"), "utf8");
const config = readFileSync(path.join(prismaDir, "..", "prisma7.config.ts"), "utf8");

describe("Prisma MongoDB configuration", () => {
  it("uses a MongoDB datasource configured from prisma7.config.ts", () => {
    expect(schema).toContain('provider = "mongodb"');
    expect(schema).not.toContain('url      = env("DATABASE_URL")');
    expect(config).toContain('loadEnvConfig(process.cwd())');
    expect(config).toContain('url: process.env["DATABASE_URL"]');
  });

  it("maps model ids to MongoDB _id fields", () => {
    const idLines = schema.match(/^\s*id\s+String.*@id.*$/gm) ?? [];

    expect(idLines.length).toBeGreaterThan(0);

    for (const idLine of idLines) {
      expect(idLine).toContain('@map("_id")');
    }
  });
});
