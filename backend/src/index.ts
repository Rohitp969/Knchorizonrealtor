import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { connectToMongo } from "./lib/mongodb";
import { seedDatabase } from "./lib/seed";

/*
 * Render assigns the port through PORT and the service must listen on it, so that always
 * wins. Locally there is usually no PORT set, and 5000 is what the dev proxy expects.
 */
const rawPort = process.env["PORT"] ?? "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  await connectToMongo();
  await seedDatabase();
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
