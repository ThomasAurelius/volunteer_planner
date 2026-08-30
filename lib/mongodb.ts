import { MongoClient, Db } from "mongodb";

const globalForMongo = globalThis as unknown as { _mongoClientPromise?: Promise<MongoClient> };

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const client = new MongoClient(process.env.DATABASE_URL);
    globalForMongo._mongoClientPromise = client.connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db();
}
