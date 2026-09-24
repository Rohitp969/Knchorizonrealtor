import { Db, MongoClient, ObjectId } from "mongodb";
import { logger } from "./logger.ts";

let database: Db | undefined;
let mongoClient: MongoClient | undefined;

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown MongoDB connection error.";
  return message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[redacted MongoDB URI]");
}

export async function connectToMongo() {
  if (database) return database;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const error = new Error("MONGODB_URI must be set before starting the KNC API.");
    logger.error(`MongoDB connection failed: ${safeErrorMessage(error)}`);
    throw error;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const connectedDatabase = client.db(process.env.MONGODB_DB ?? "knc_horizon");
    await connectedDatabase.command({ ping: 1 });
    mongoClient = client;
    database = connectedDatabase;
    logger.info("MongoDB connected successfully");
    return database;
  } catch (error) {
    await client.close().catch(() => undefined);
    logger.error(`MongoDB connection failed: ${safeErrorMessage(error)}`);
    throw error;
  }
}

export function getDb() {
  if (!database) throw new Error("MongoDB is not connected.");
  return database;
}

export function objectId(value: string | undefined) {
  return value && ObjectId.isValid(value) ? new ObjectId(value) : undefined;
}

export function serializeDocument<T extends Record<string, unknown>>(document: T) {
  const { _id, ...rest } = document;
  return { id: _id instanceof ObjectId ? _id.toHexString() : String(_id ?? ""), ...rest };
}