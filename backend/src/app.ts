import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "node:path";
import { uploadDir } from "./routes/admin";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
/*
 * CORS.
 * The two front ends that call this API are the local dev server and the live site, so both
 * are allowed by default and Render needs no extra configuration to keep working. CLIENT_URL
 * adds to that list rather than replacing it, which is how a preview or staging origin gets
 * in. Origins are named explicitly rather than reflected with "*", because credentials are
 * enabled for the Authorization header the admin console sends.
 * A request with no Origin header (curl, health checks, server to server) is allowed through.
 */
const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://www.knchorizonrealtor.com",
    "https://knchorizonrealtor.com",
    ...(process.env.CLIENT_URL?.split(",") ?? []),
  ]
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) return callback(null, true);
      logger.warn({ origin }, "Blocked a cross-origin request from an unlisted origin");
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/uploads", express.static(uploadDir));

app.use("/api", router);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err: error }, "Unhandled API error");
  res.status(500).json({ message: "Something went wrong while processing your request." });
});

export default app;
