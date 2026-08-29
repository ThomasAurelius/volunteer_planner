import { PrismaClient } from "@prisma/client";
import "dotenv/config";


const globalForPrisma = globalThis as unknown as { _prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma._prisma) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    globalForPrisma._prisma = new PrismaClient();
  }
  return globalForPrisma._prisma;
}
