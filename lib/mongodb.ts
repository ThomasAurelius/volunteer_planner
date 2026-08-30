import { MongoClient, Db } from "mongodb";

const globalForMongo = globalThis as unknown as { _mongoClientPromise?: Promise<MongoClient> };

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const client = new MongoClient(process.env.DATABASE_URL);
    const promise = client.connect().catch((err: unknown) => {
      // Reset so the next request retries rather than reusing a failed promise.
      // Only clear the cached promise if it is still the one that failed, to
      // avoid a race condition where a concurrent request already created a new
      // promise before this catch handler ran.
      if (globalForMongo._mongoClientPromise === promise) {
        globalForMongo._mongoClientPromise = undefined;
      }
      if (
        err instanceof Error &&
        (err.message.includes("Authentication failed") ||
          err.message.includes("bad auth"))
      ) {
        throw new Error(
          "MongoDB authentication failed. Check that DATABASE_URL contains the correct username and password. " +
            "If the password contains special characters, ensure they are URL-encoded.",
        );
      }
      throw err;
    });
    globalForMongo._mongoClientPromise = promise;
  }
  return globalForMongo._mongoClientPromise!;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db();
}
