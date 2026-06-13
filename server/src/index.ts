import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { createServer } from "http";
import { fileURLToPath } from "url";
import "dotenv/config";

import { initDatabase } from "./db/index.js";
import { initSocketIO } from "./services/notificationService.js";
import authRoutes from "./routes/auth.js";
import statsRoutes from "./routes/stats.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import eventsRoutes from "./routes/events.js";
import announcementsRoutes from "./routes/announcements.js";
import logsRoutes from "./routes/logs.js";
import ranksRoutes from "./routes/ranks.js";
import gamesRoutes from "./routes/games.js";
import tournamentsRoutes from "./routes/tournaments.js";
import giveawaysRoutes from "./routes/giveaways.js";
import teamRoutes from "./routes/team.js";
import faqRoutes from "./routes/faq.js";
import applicationsRoutes from "./routes/applications.js";
import discordRoutes from "./routes/discord.js";
import uploadRoutes from "./routes/upload.js";
import analyticsRoutes from "./routes/analytics.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Input sanitization
app.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].replace(/[<>]/g, "");
      }
    }
  }
  next();
});

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", statsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/ranks", ranksRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/tournaments", tournamentsRoutes);
app.use("/api/giveaways", giveawaysRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/discord", discordRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Serve static files in production
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// Initialize database then start server
initDatabase()
  .then(() => {
    initSocketIO(httpServer);
    httpServer.listen(PORT, () => {
      console.log(`SNAKES server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
