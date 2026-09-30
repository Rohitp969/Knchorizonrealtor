import { Router } from "express";
import { authenticate, requireConsoleUser, type AuthenticatedRequest } from "../lib/auth.ts";
import { rateLimit } from "../lib/rate-limit.ts";

const router = Router();

/*
 * Password guessing is slowed down per visitor. Twenty tries in fifteen minutes is far more
 * than a person mistyping. It is not counted per account, so nobody can lock the owner out
 * by guessing at the owner's email address.
 */
const loginLimit = rateLimit({ max: 20, windowMs: 15 * 60_000, message: "Too many sign-in attempts. Please wait 15 minutes and try again." });

router.post("/auth/login", loginLimit, async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    console.log(email, password);
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const result = await authenticate(email, password);
    if (!result) return res.status(401).json({ message: "Invalid admin credentials." });
    if (result === "disabled") return res.status(403).json({ message: "This account has been disabled. Please contact the administrator." });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

/*
 * Accounts are created by an administrator in the console (Admin > SEO Managers) or come from
 * ADMIN_EMAIL. The website has no sign-up page, so this address only says so: left open, it
 * let anyone on the internet add rows to the users table.
 */
router.post("/auth/register", (_req, res) => {
  res.status(403).json({ message: "Registration is closed. Accounts are created by the administrator." });
});

// The console's session check: administrators, agents and SEO managers, read from the database.
router.get("/auth/me", requireConsoleUser, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
