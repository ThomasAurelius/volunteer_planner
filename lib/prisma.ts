import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { _prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma._prisma) {
    const datasourceUrl = process.env.DATABASE_URL;
    if (!datasourceUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    globalForPrisma._prisma = new PrismaClient({ datasourceUrl });
  }
  return globalForPrisma._prisma;
}
