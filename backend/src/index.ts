import "dotenv/config";
import app from "./app.ts";
import { logger } from "./lib/logger.ts";
import { connectToPostgres } from "./lib/postgres.ts";
import { bootstrapDatabase } from "./lib/bootstrap.ts";
import { cloudinaryStatus } from "./lib/cloudinary.ts";

/*
 * Render assigns the port through PORT and the service must listen on it, so that always
 * wins. Locally there is usually no PORT set, and 6000 is what the dev proxy expects.
 */
const rawPort = process.env["PORT"] ?? "6000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  // Names only, never values: on Render this line says at a glance whether uploads can work.
  const cloudinary = cloudinaryStatus();
  if (cloudinary.configured) logger.info({ cloudName: cloudinary.cloudName }, "Cloudinary image uploads are configured");
  else logger.warn({ missing: cloudinary.missing }, "Cloudinary is not configured: admin image uploads will be refused until these are set");
  await connectToPostgres();
  await bootstrapDatabase();
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

start().catch((error) => {
  logger.error({ err: error }, "Unable to start KNC API");
  process.exit(1);
});
