import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { _prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma._prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    globalForPrisma._prisma = new PrismaClient();
  }
  return globalForPrisma._prisma;
}
