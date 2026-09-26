import { Router } from "express";
import bcrypt from "bcryptjs";
import { authenticate, requireConsoleUser, type AuthenticatedRequest } from "../lib/auth.ts";
import { queryOne } from "../lib/postgres.ts";
import { insertRow, toApi } from "../lib/repositories.ts";

const router = Router();

router.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const result = await authenticate(email, password);
    if (!result) return res.status(401).json({ message: "Invalid admin credentials." });
    if (result === "disabled") return res.status(403).json({ message: "This account has been disabled. Please contact the administrator." });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.post("/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return res.status(400).json({ message: "Name, email, and a password of at least 8 characters are required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await queryOne("select id from users where lower(email) = $1", [normalizedEmail]);
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });
    const row = await insertRow("users", {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role: "user",
      createdAt: new Date(),
    });
    const user = toApi("users", row) as Record<string, unknown> | undefined;
    if (user) delete user.passwordHash;
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
});

// The console's session check: administrators, agents and SEO managers, read from the database.
router.get("/auth/me", requireConsoleUser, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
