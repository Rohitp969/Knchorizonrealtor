import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { getDb, objectId } from "./mongodb";
import type { UserDoc } from "./models";

export type AuthenticatedRequest = Request & {
  user?: { id: string; email: string; role: "admin" | "agent" | "user" };
};

function jwtSecret() {
  const secret = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be set for authentication.");
  return secret;
}

export async function authenticate(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await getDb().collection<UserDoc>("users").findOne({ email: normalizedEmail });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  const id = user._id?.toHexString();
  if (!id) return null;
  return {
    token: jwt.sign({ sub: id, email: user.email, role: user.role }, jwtSecret(), { expiresIn: "7d" }),
    user: { id, name: user.name, email: user.email, role: user.role },
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ message: "Authentication required." });
  try {
     const payload = jwt.verify(token, jwtSecret()) as { sub: string; email: string; role: "admin" | "agent" | "user" };
     if (!["admin", "agent"].includes(payload.role) || !objectId(payload.sub)) return res.status(403).json({ message: "Admin access required." });
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Your session has expired." });
  }
}