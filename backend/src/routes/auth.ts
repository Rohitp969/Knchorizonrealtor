import { Router } from "express";
import bcrypt from "bcryptjs";
import { authenticate, requireAdmin, type AuthenticatedRequest } from "../lib/auth";
import { getDb, serializeDocument } from "../lib/mongodb";
import type { UserDoc } from "../lib/models";

const router = Router();

router.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const result = await authenticate(email, password);
    if (!result) return res.status(401).json({ message: "Invalid admin credentials." });
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
    const users = getDb().collection<UserDoc>("users");
    if (await users.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    const user: Omit<UserDoc, "_id"> = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role: "user",
      createdAt: new Date(),
    };
    const result = await users.insertOne(user);
    return res.status(201).json({ user: serializeDocument({ ...user, _id: result.insertedId } as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.get("/auth/me", requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;