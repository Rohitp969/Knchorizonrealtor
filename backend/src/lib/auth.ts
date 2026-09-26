import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { isId, queryOne } from "./postgres.ts";
import type { UserRole, UserRow } from "./models.ts";

export type AuthenticatedRequest = Request & {
  user?: { id: string; email: string; role: UserRole; name?: string | null; canPublishArticles?: boolean };
};

function jwtSecret() {
  const secret = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be set for authentication.");
  return secret;
}

/** Signs in with the stored bcrypt hash. A disabled account is refused even with the right password. */
export async function authenticate(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await queryOne<UserRow>("select * from users where lower(email) = $1", [normalizedEmail]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return null;
  if (user.is_active === false) return "disabled" as const;
  const id = user.id;
  if (!id) return null;
  return {
    token: jwt.sign({ sub: id, email: user.email, role: user.role }, jwtSecret(), { expiresIn: "7d" }),
    user: { id, name: user.name, email: user.email, role: user.role },
  };
}

function bearerToken(req: Request) {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : undefined;
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ message: "Authentication required." });
  try {
    const payload = jwt.verify(token, jwtSecret()) as { sub: string; email: string; role: UserRole };
    if (!["admin", "agent"].includes(payload.role) || !isId(payload.sub)) return res.status(403).json({ message: "Admin access required." });
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Your session has expired." });
  }
}

/*
 * Role-checked access for the SEO console and the SEO manager accounts.
 *
 * Unlike requireAdmin, this reads the account from the database on every request, so the
 * role comes from the users table rather than from the token, and disabling or deleting an
 * SEO manager takes effect immediately instead of when their 7-day token runs out.
 */
export function requireRoles(roles: readonly UserRole[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = bearerToken(req);
    if (!token) return res.status(401).json({ message: "Authentication required." });
    let payload: { sub?: string };
    try {
      payload = jwt.verify(token, jwtSecret()) as { sub?: string };
    } catch {
      return res.status(401).json({ message: "Your session has expired." });
    }
    if (!isId(payload.sub)) return res.status(401).json({ message: "Your session has expired." });
    try {
      const account = await queryOne<Pick<UserRow, "id" | "email" | "name" | "role" | "is_active" | "can_publish_articles">>(
        "select id, email, name, role, is_active, can_publish_articles from users where id = $1",
        [payload.sub],
      );
      if (!account || account.is_active === false) {
        return res.status(401).json({ message: "This account is no longer active." });
      }
      if (!roles.includes(account.role)) return res.status(403).json({ message: "You do not have access to this section." });
      req.user = {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
        // Administrators always publish; an SEO manager only when a super admin allowed it.
        canPublishArticles: account.role === "seo_manager" ? account.can_publish_articles === true : true,
      };
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/** Anyone who may use the console: administrators, agents and SEO managers. */
export const requireConsoleUser = requireRoles(["admin", "agent", "seo_manager"]);
/** The SEO section: the same people, since administrators manage SEO too. */
export const requireSeoAccess = requireConsoleUser;
/** Account management for SEO managers: administrators only (not agents). */
export const requireSuperAdmin = requireRoles(["admin"]);
