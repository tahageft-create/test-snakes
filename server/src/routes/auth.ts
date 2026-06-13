import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { queryOne, queryAll, run } from "../db/index.js";
import {
  authMiddleware,
  requireRole,
  AuthRequest,
  JWT_SECRET,
} from "../middleware/auth.js";

const router = Router();
const TOKEN_EXPIRY = "1h";
const REFRESH_EXPIRY_DAYS = 30;

function sanitize(str: string): string {
  return str.replace(/[<>"'&]/g, "");
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  return null;
}

// Register
router.post("/register", (req: Request, res: Response) => {
  const { username: rawUsername, password, email: rawEmail } = req.body;
  const username = sanitize(rawUsername || "").trim();
  const email = sanitize(rawEmail || "").trim();

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (username.length < 3 || username.length > 30) {
    return res
      .status(400)
      .json({ message: "Username must be 3-30 characters" });
  }

  const pwError = validatePassword(password);
  if (pwError) {
    return res.status(400).json({ message: pwError });
  }

  const existing = queryOne("SELECT id FROM users WHERE username = ?", [
    username,
  ]);
  if (existing) {
    return res.status(409).json({ message: "Username already taken" });
  }

  if (email) {
    const emailExists = queryOne("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (emailExists) {
      return res.status(409).json({ message: "Email already registered" });
    }
  }

  const hashedPassword = bcrypt.hashSync(password, 12);
  const result = run(
    "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
    [username, hashedPassword, email || "", "member"],
  );

  const token = jwt.sign(
    { id: result.lastInsertRowid, username, role: "member" },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  run(
    "INSERT INTO sessions (user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?)",
    [result.lastInsertRowid, token, refreshToken, expiresAt],
  );

  const newUser = queryOne(
    "SELECT id, username, email, role, avatar, avatar_decoration FROM users WHERE id = ?",
    [result.lastInsertRowid],
  );
  res.status(201).json({
    token,
    refreshToken,
    user: {
      id: result.lastInsertRowid,
      username,
      role: "member",
      email: email || "",
      language: "en",
      avatar: newUser?.avatar || "",
      avatar_decoration: newUser?.avatar_decoration || "",
    },
  });
});

// Login
router.post("/login", (req: Request, res: Response) => {
  const { username: rawUsername, password } = req.body;
  const username = sanitize(rawUsername || "").trim();

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const user = queryOne("SELECT * FROM users WHERE username = ?", [username]);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.banned) {
    return res.status(403).json({ message: "This account has been banned" });
  }

  const valid = bcrypt.compareSync(password, user.password as string);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  run(
    "INSERT INTO sessions (user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?)",
    [user.id, token, refreshToken, expiresAt],
  );

  res.json({
    token,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email || "",
      language: user.language || "en",
      avatar: user.avatar || "",
      avatar_decoration: user.avatar_decoration || "",
    },
  });
});

// Refresh token
router.post("/refresh", (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  const session = queryOne(
    "SELECT s.*, u.username, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.refresh_token = ? AND s.expires_at > datetime(?)",
    [refreshToken, new Date().toISOString()],
  ) as any;
  if (!session) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }

  const token = jwt.sign(
    { id: session.user_id, username: session.username, role: session.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );

  const newRefreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  run(
    "UPDATE sessions SET token = ?, refresh_token = ?, expires_at = ? WHERE id = ?",
    [token, newRefreshToken, expiresAt, session.id],
  );

  res.json({ token, refreshToken: newRefreshToken });
});

// Verify token
router.get("/verify", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = queryOne(
    "SELECT id, username, email, role, language, banned, created_at, avatar, avatar_decoration FROM users WHERE id = ?",
    [req.user!.id],
  );
  if (!user || user.banned) {
    return res.status(401).json({ message: "Invalid or banned user" });
  }
  res.json({ valid: true, user });
});

// Logout
router.post("/logout", authMiddleware, (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.slice(7) || "";
  run("DELETE FROM sessions WHERE token = ?", [token]);
  res.json({ message: "Logged out" });
});

// Forgot password
router.post("/forgot-password", (req: Request, res: Response) => {
  const { username, email } = req.body;

  if (!username && !email) {
    return res.status(400).json({ message: "Username or email required" });
  }

  let user: any;
  if (username) {
    user = queryOne("SELECT * FROM users WHERE username = ?", [username]);
  } else {
    user = queryOne("SELECT * FROM users WHERE email = ?", [email]);
  }

  if (!user) {
    // Don't reveal if user exists
    return res.json({
      message: "If the account exists, a reset link has been generated.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  run("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?", [
    resetToken,
    resetExpires,
    user.id,
  ]);

  // In production, send email. For now, return the token.
  res.json({
    message: "If the account exists, a reset link has been generated.",
    // Dev mode: include token in response
    resetToken: process.env.NODE_ENV !== "production" ? resetToken : undefined,
  });
});

// Reset password
router.post("/reset-password", (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password required" });
  }

  const pwError = validatePassword(newPassword);
  if (pwError) {
    return res.status(400).json({ message: pwError });
  }

  const user = queryOne(
    "SELECT * FROM users WHERE reset_token = ? AND reset_expires > datetime(?)",
    [token, new Date().toISOString()],
  );
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  run(
    "UPDATE users SET password = ?, reset_token = ?, reset_expires = ? WHERE id = ?",
    [hashedPassword, "", "", user.id],
  );

  res.json({ message: "Password reset successful" });
});

// Update profile (language preference)
router.put("/profile", authMiddleware, (req: AuthRequest, res: Response) => {
  const { language } = req.body;
  if (language && ["en", "ar"].includes(language)) {
    run("UPDATE users SET language = ? WHERE id = ?", [language, req.user!.id]);
  }
  const user = queryOne(
    "SELECT id, username, email, role, language, created_at FROM users WHERE id = ?",
    [req.user!.id],
  );
  res.json({ user });
});

// === Member Management (Admin+) ===

// List all users
router.get(
  "/users",
  authMiddleware,
  requireRole("owner", "developer", "admin"),
  (req: AuthRequest, res: Response) => {
    const search = (req.query.search as string) || "";
    let users: any[];
    if (search) {
      users = queryAll(
        "SELECT id, username, email, role, language, banned, created_at FROM users WHERE username LIKE ? ORDER BY created_at DESC",
        [`%${search}%`],
      );
    } else {
      users = queryAll(
        "SELECT id, username, email, role, language, banned, created_at FROM users ORDER BY created_at DESC",
      );
    }
    res.json(users);
  },
);

// Update user role
router.put(
  "/users/:id/role",
  authMiddleware,
  requireRole("owner", "developer"),
  (req: AuthRequest, res: Response) => {
    const { role } = req.body;
    const validRoles = [
      "owner",
      "developer",
      "admin",
      "staff",
      "member",
      "guest",
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent changing own role
    if (parseInt(req.params.id) === req.user!.id) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const targetUser = queryOne("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    run("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
    run("INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)", [
      req.user!.username,
      "Changed role",
      `${targetUser.username} to ${role}`,
    ]);

    res.json({ message: "Role updated" });
  },
);

// Ban/unban user
router.put(
  "/users/:id/ban",
  authMiddleware,
  requireRole("owner", "developer", "admin"),
  (req: AuthRequest, res: Response) => {
    const { banned } = req.body;
    const targetUser = queryOne("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cannot ban owner or self
    if (parseInt(req.params.id) === req.user!.id) {
      return res.status(400).json({ message: "Cannot ban yourself" });
    }
    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot ban the owner" });
    }

    run("UPDATE users SET banned = ? WHERE id = ?", [
      banned ? 1 : 0,
      req.params.id,
    ]);
    run("INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)", [
      req.user!.username,
      banned ? "Banned user" : "Unbanned user",
      targetUser.username,
    ]);

    // Delete sessions if banning
    if (banned) {
      run("DELETE FROM sessions WHERE user_id = ?", [req.params.id]);
    }

    res.json({ message: banned ? "User banned" : "User unbanned" });
  },
);

// Delete user
router.delete(
  "/users/:id",
  authMiddleware,
  requireRole("owner"),
  (req: AuthRequest, res: Response) => {
    const targetUser = queryOne("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot delete the owner" });
    }

    run("DELETE FROM sessions WHERE user_id = ?", [req.params.id]);
    run("DELETE FROM users WHERE id = ?", [req.params.id]);
    run("INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)", [
      req.user!.username,
      "Deleted user",
      targetUser.username,
    ]);

    res.json({ message: "User deleted" });
  },
);

export default router;
