import type { NextFunction, Request, Response } from "express";

/*
 * A limit on how often one visitor may call a route, kept in memory.
 *
 * It protects the three doors anyone on the internet can knock on: the admin sign-in (password
 * guessing) and the enquiry and newsletter forms (spam, and one alert email per enquiry). The
 * limits are far above what a real visitor does, so nobody using the site normally meets them.
 *
 * In memory is enough here: the API runs as one process, and a restart simply starts the
 * counts again.
 */

/**
 * The visitor's address. Render sits behind Cloudflare, which puts the real address in
 * CF-Connecting-IP; without it the first entry of X-Forwarded-For is the visitor.
 */
export function clientAddress(req: Request) {
  const fromCloudflare = req.headers["cf-connecting-ip"];
  if (typeof fromCloudflare === "string" && fromCloudflare.trim()) return fromCloudflare.trim();
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.socket.remoteAddress || "unknown";
}

type Options = {
  /** How many calls are allowed in one window. */
  max: number;
  windowMs: number;
  message: string;
};

const MAX_TRACKED = 5000;

export function rateLimit({ max, windowMs, message }: Options) {
  const calls = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const id = clientAddress(req);
    const entry = calls.get(id);
    if (!entry || entry.resetAt <= now) {
      if (calls.size >= MAX_TRACKED) {
        for (const [name, value] of calls) if (value.resetAt <= now) calls.delete(name);
        if (calls.size >= MAX_TRACKED) calls.clear();
      }
      calls.set(id, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ message });
    }
    return next();
  };
}
